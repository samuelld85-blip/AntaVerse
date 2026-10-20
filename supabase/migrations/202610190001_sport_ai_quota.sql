-- No prompt, response or workout data is stored. Reservations are not refunded
-- after a provider error: this bounds cost even when requests time out.
create table public.sport_ai_user_usage (
  day date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_count integer not null default 0 check (request_count >= 0),
  minute timestamptz not null,
  minute_count integer not null default 0 check (minute_count >= 0),
  primary key (day, user_id)
);
create table public.sport_ai_global_usage (
  day date primary key,
  request_count integer not null default 0 check (request_count >= 0)
);
alter table public.sport_ai_user_usage enable row level security;
alter table public.sport_ai_global_usage enable row level security;
revoke all on public.sport_ai_user_usage, public.sport_ai_global_usage from public, anon, authenticated;

create function public.consume_sport_ai_quota(
  p_user_id uuid,
  p_user_daily_limit integer default 20,
  p_global_daily_limit integer default 100,
  p_minute_limit integer default 3
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_day date := (now() at time zone 'UTC')::date;
  v_minute timestamptz := date_trunc('minute', now());
  v_user public.sport_ai_user_usage%rowtype;
  v_global integer;
begin
  if p_user_id is null or p_user_daily_limit not between 1 and 100
    or p_global_daily_limit not between 1 and 10000
    or p_minute_limit not between 1 and 10
    or p_user_daily_limit is null or p_global_daily_limit is null or p_minute_limit is null then
    raise exception 'INVALID_QUOTA_CONFIGURATION';
  end if;
  -- One lock covers both counters, including their first insert, atomically.
  perform pg_advisory_xact_lock(190019, 1);
  delete from public.sport_ai_user_usage where day < v_day - 7;
  delete from public.sport_ai_global_usage where day < v_day - 7;
  select * into v_user from public.sport_ai_user_usage where day = v_day and user_id = p_user_id;
  select request_count into v_global from public.sport_ai_global_usage where day = v_day;
  if coalesce(v_global, 0) >= p_global_daily_limit
    or coalesce(v_user.request_count, 0) >= p_user_daily_limit
    or (v_user.minute = v_minute and v_user.minute_count >= p_minute_limit) then
    return false;
  end if;
  insert into public.sport_ai_global_usage(day, request_count) values (v_day, 1)
    on conflict (day) do update set request_count = sport_ai_global_usage.request_count + 1;
  insert into public.sport_ai_user_usage(day, user_id, request_count, minute, minute_count)
    values (v_day, p_user_id, 1, v_minute, 1)
    on conflict (day, user_id) do update set
      request_count = sport_ai_user_usage.request_count + 1,
      minute = v_minute,
      minute_count = case when sport_ai_user_usage.minute = v_minute then sport_ai_user_usage.minute_count + 1 else 1 end;
  return true;
end;
$$;
revoke all on function public.consume_sport_ai_quota(uuid, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_sport_ai_quota(uuid, integer, integer, integer) to service_role;
