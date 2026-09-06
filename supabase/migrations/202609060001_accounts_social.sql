-- All exposed tables are RLS protected. Mutations with cross-row invariants use RPCs.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  created_at timestamptz not null default now()
);
create unique index profiles_username_unique on public.profiles(lower(username));
alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
grant select, insert, update on public.profiles to authenticated;

create table public.backups (
  user_id uuid primary key references auth.users on delete cascade,
  revision bigint not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.backups enable row level security;
create policy own_backup on public.backups for select to authenticated using (user_id = auth.uid());
grant select on public.backups to authenticated;
create table public.backup_versions (
  user_id uuid not null references auth.users on delete cascade,
  revision bigint not null,
  payload jsonb not null,
  updated_at timestamptz not null,
  primary key(user_id, revision)
);
alter table public.backup_versions enable row level security;
create policy own_versions on public.backup_versions for select to authenticated using (user_id = auth.uid());
grant select on public.backup_versions to authenticated;

create table public.friendships (
  requester uuid not null references public.profiles on delete cascade,
  recipient uuid not null references public.profiles on delete cascade,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  primary key(requester, recipient),
  check (requester <> recipient)
);
create unique index unique_friend_pair on public.friendships(least(requester, recipient), greatest(requester, recipient));
alter table public.friendships enable row level security;
create policy participants_read on public.friendships for select to authenticated using (auth.uid() in (requester, recipient));
create policy send_request on public.friendships for insert to authenticated with check (requester = auth.uid() and accepted_at is null);
create policy remove_friend on public.friendships for delete to authenticated using (auth.uid() in (requester, recipient));
grant select, insert, delete on public.friendships to authenticated;

create function public.accept_friend(friend_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.friendships set accepted_at = now()
  where requester = friend_id and recipient = auth.uid() and accepted_at is null;
  if not found then raise exception 'Request not found'; end if;
end $$;

create table public.sport_sessions (
  user_id uuid not null references public.profiles on delete cascade,
  session_id text not null,
  payload jsonb not null,
  ended_at timestamptz not null,
  primary key(user_id, session_id)
);
alter table public.sport_sessions enable row level security;
create policy sessions_friends on public.sport_sessions for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.friendships f where f.accepted_at is not null and
    ((f.requester = auth.uid() and f.recipient = user_id) or (f.recipient = auth.uid() and f.requester = user_id))
  )
);
grant select on public.sport_sessions to authenticated;

create table public.push_subscriptions (
  endpoint text primary key check (length(endpoint) < 4096),
  user_id uuid not null references auth.users on delete cascade,
  p256dh text not null check (length(p256dh) < 512),
  auth text not null check (length(auth) < 512),
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy own_push on public.push_subscriptions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- Durable outbox: offline completions are delivered after synchronization.
create table public.session_events (
  user_id uuid not null references public.profiles on delete cascade,
  session_id text not null,
  created_at timestamptz not null default now(),
  primary key(user_id, session_id)
);
alter table public.session_events enable row level security;
create table public.push_jobs (
  id bigint generated always as identity primary key,
  actor uuid not null references public.profiles on delete cascade,
  recipient uuid not null references public.profiles on delete cascade,
  session_id text not null,
  endpoint text not null references public.push_subscriptions on delete cascade,
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  delivered_at timestamptz,
  unique(actor, session_id, endpoint)
);
alter table public.push_jobs enable row level security;

create function public.save_backup(expected_revision bigint, snapshot jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); old public.backups; next_revision bigint;
  sport jsonb; item jsonb; was_new boolean;
begin
  if uid is null or not exists(select 1 from public.profiles where id = uid) then raise exception 'Profile required'; end if;
  if snapshot->>'version' is distinct from '1' or jsonb_typeof(snapshot->'history') is distinct from 'array'
     or octet_length(snapshot::text) > 5000000 then raise exception 'Invalid snapshot'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  select * into old from public.backups where user_id = uid;
  if coalesce(old.revision, 0) <> expected_revision then raise exception 'BACKUP_CONFLICT' using errcode = '40001'; end if;
  next_revision := coalesce(old.revision, 0) + 1;
  if old.revision is not null then
    insert into public.backup_versions values (uid, old.revision, old.payload, old.updated_at);
    delete from public.backup_versions where user_id = uid and revision < next_revision - 10;
  end if;
  insert into public.backups values (uid, next_revision, snapshot, now())
  on conflict(user_id) do update set revision = excluded.revision, payload = excluded.payload, updated_at = excluded.updated_at;

  sport := snapshot;
  delete from public.sport_sessions where user_id = uid and not exists (
    select 1 from jsonb_array_elements(coalesce(sport->'history', '[]'::jsonb)) s where s->>'id' = session_id
  );
  for item in select * from jsonb_array_elements(coalesce(sport->'history', '[]'::jsonb)) loop
    if item->>'endedAt' is null then raise exception 'Incomplete history session'; end if;
    insert into public.sport_sessions values(uid, item->>'id', item, (item->>'endedAt')::timestamptz)
    on conflict(user_id, session_id) do update set payload = excluded.payload, ended_at = excluded.ended_at;
    insert into public.session_events(user_id, session_id) values(uid, item->>'id') on conflict do nothing;
    was_new := found;
    -- Initial import and historical corrections do not notify all friends.
    if was_new and old.revision is not null and (item->>'endedAt')::timestamptz > old.updated_at
       and (item->>'endedAt')::timestamptz <= now() + interval '5 minutes' then
      insert into public.push_jobs(actor, recipient, session_id, endpoint)
      select uid, p.user_id, item->>'id', p.endpoint from public.push_subscriptions p
      where exists(select 1 from public.friendships f where f.accepted_at is not null and
        ((f.requester = uid and f.recipient = p.user_id) or (f.recipient = uid and f.requester = p.user_id)))
      on conflict do nothing;
    end if;
  end loop;
  return next_revision;
end $$;

create function public.claim_push_jobs() returns setof public.push_jobs
language sql security definer set search_path = '' as $$
  update public.push_jobs set attempts = attempts + 1, available_at = now() + interval '5 minutes'
  where id in (select id from public.push_jobs where delivered_at is null and attempts < 5 and available_at <= now()
    order by id for update skip locked limit 50) returning *;
$$;

create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.accept_friend(uuid), public.save_backup(bigint,jsonb), public.delete_my_account() from public, anon;
grant execute on function public.accept_friend(uuid), public.save_backup(bigint,jsonb), public.delete_my_account() to authenticated;
revoke all on function public.claim_push_jobs() from public, anon, authenticated;
grant execute on function public.claim_push_jobs() to service_role;
-- Explicitly remove default grants for data modified only through privileged RPCs.
revoke insert, update, delete on public.backups, public.backup_versions, public.sport_sessions from anon, authenticated;
revoke all on public.session_events, public.push_jobs from anon, authenticated;
grant all on public.profiles, public.backups, public.backup_versions, public.friendships,
  public.sport_sessions, public.push_subscriptions, public.session_events, public.push_jobs to service_role;
grant usage, select on sequence public.push_jobs_id_seq to service_role;
