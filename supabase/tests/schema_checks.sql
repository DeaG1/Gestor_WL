-- Verificação do schema. Roda contra o banco já migrado; levanta exceção no
-- primeiro problema. As constraints têm nome explícito justamente para poderem
-- ser conferidas aqui.
do $$
begin
  assert (select relrowsecurity from pg_class where oid = 'public.wl_items'::regclass),
    'RLS desligada em wl_items';
  assert (select relrowsecurity from pg_class where oid = 'public.user_settings'::regclass),
    'RLS desligada em user_settings';
  assert (select relrowsecurity from pg_class where oid = 'public.notification_log'::regclass),
    'RLS desligada em notification_log';

  assert (select count(*) from pg_policies where schemaname = 'public' and tablename = 'wl_items') = 4,
    'wl_items precisa de 4 policies (select, insert, update, delete)';
  assert (select count(*) from pg_policies where schemaname = 'public' and tablename = 'user_settings') = 2,
    'user_settings precisa de 2 policies (select, update)';
  assert (select count(*) from pg_policies where schemaname = 'public' and tablename = 'notification_log') = 1,
    'notification_log precisa da policy de select';

  assert exists (select 1 from pg_constraint where conname = 'wl_items_wallet_check'),
    'falta o check de wallet';
  assert exists (select 1 from pg_constraint where conname = 'wl_items_type_check'),
    'falta o check de type';
  assert exists (select 1 from pg_constraint where conname = 'wl_items_done_check'),
    'falta o check de done';
  assert exists (select 1 from pg_constraint where conname = 'notification_log_pkey'),
    'falta a chave composta que garante um envio por dia';

  assert exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'wl_items'
      and column_name = 'cost' and is_nullable = 'YES'),
    'cost precisa ser nulável — null significa nao registrado';

  assert exists (select 1 from pg_trigger where tgname = 'on_auth_user_created'),
    'falta o trigger que cria as settings do usuario novo';

  raise notice 'schema ok';
end $$;
