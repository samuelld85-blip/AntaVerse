-- Run once after deploying send-session-push and creating the two Vault secrets.
-- Vault secret names: antaverse_push_url (full Edge Function URL), antaverse_push_secret.
-- The latter must equal the Edge Function's PUSH_WORKER_SECRET. Do not commit values.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('antaverse-sport-push', '* * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'antaverse_push_url'),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'antaverse_push_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
$$);
