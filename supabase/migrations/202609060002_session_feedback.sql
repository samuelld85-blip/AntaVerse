-- Likes and comments left by accepted friends on a completed session.
-- Reuses the friendship check that gates read access to public.sport_sessions.
create function public.shares_session(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select target = auth.uid() or exists (
    select 1 from public.friendships f where f.accepted_at is not null and
    ((f.requester = auth.uid() and f.recipient = target) or (f.recipient = auth.uid() and f.requester = target))
  );
$$;

create table public.session_likes (
  owner uuid not null references public.profiles on delete cascade,
  session_id text not null,
  actor uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key(owner, session_id, actor),
  foreign key(owner, session_id) references public.sport_sessions(user_id, session_id) on delete cascade
);
alter table public.session_likes enable row level security;
create policy likes_read on public.session_likes for select to authenticated using (public.shares_session(owner));
create policy likes_add on public.session_likes for insert to authenticated
  with check (actor = auth.uid() and public.shares_session(owner));
create policy likes_remove on public.session_likes for delete to authenticated using (actor = auth.uid());
grant select, insert, delete on public.session_likes to authenticated;

create table public.session_comments (
  id bigint generated always as identity primary key,
  owner uuid not null references public.profiles on delete cascade,
  session_id text not null,
  actor uuid not null references public.profiles on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  foreign key(owner, session_id) references public.sport_sessions(user_id, session_id) on delete cascade
);
create index session_comments_thread on public.session_comments(owner, session_id, created_at);
alter table public.session_comments enable row level security;
create policy comments_read on public.session_comments for select to authenticated using (public.shares_session(owner));
create policy comments_add on public.session_comments for insert to authenticated
  with check (actor = auth.uid() and public.shares_session(owner));
-- The comment author or the session owner (moderating their own thread) can delete.
create policy comments_remove on public.session_comments for delete to authenticated
  using (actor = auth.uid() or owner = auth.uid());
grant select, insert, delete on public.session_comments to authenticated;

revoke all on function public.shares_session(uuid) from public, anon;
grant execute on function public.shares_session(uuid) to authenticated;
grant all on public.session_likes, public.session_comments to service_role;
grant usage, select on sequence public.session_comments_id_seq to service_role;
