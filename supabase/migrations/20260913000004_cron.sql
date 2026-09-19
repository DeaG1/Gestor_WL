-- Agenda o lembrete diario no projeto hospedado mnzmnxewnjcekfuhdhur. O ref
-- nao e segredo: ele ja faz parte da URL publica da API que o front usa.
--
-- Pre-requisito: a service_role key guardada no Vault com o nome
-- 'service_role_key' (`select vault.create_secret(...)`, a mao no SQL editor
-- do projeto hospedado, nunca numa migration). Detalhes em README.md, Deploy.
--
-- NAO aplicar no banco local: aqui o job chamaria o projeto hospedado a cada
-- 5 minutos. Por isso `supabase migration up` nao deve ser usado localmente.

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
    url     := 'https://mnzmnxewnjcekfuhdhur.supabase.co/functions/v1/daily-digest',
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
