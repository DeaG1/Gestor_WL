-- ATENCAO: troque <PROJECT_REF> abaixo pelo ref do projeto hospedado no
-- Supabase (Project Settings -> General -> Reference ID) antes de aplicar
-- esta migration com `npx supabase db push`. Esta migration ainda NAO foi
-- aplicada em lugar nenhum -- o dono do projeto faz isso depois de guardar
-- a service_role key no Vault (`select vault.create_secret(...)`, a mao no
-- SQL editor do projeto hospedado, nunca numa migration) e de publicar a
-- Edge Function daily-digest. Detalhes em README.md, secao Deploy.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- Chama a Edge Function a cada 5 minutos. Ela decide quem recebe: a hora
-- configurada, o canal ligado e o log do dia. A chave sai do Vault, nunca
-- deste arquivo.
select cron.schedule(
  'gestor-wl-daily-digest',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
      )
    ),
    body    := jsonb_build_object('mode', 'cron'),
    timeout_milliseconds := 30000
  );
  $$
);
