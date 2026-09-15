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

  -- Verificação de policies: todas devem estar pinadas ao dono
  assert not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename in ('wl_items', 'user_settings', 'notification_log')
      and (qual = 'true' or with_check = 'true')),
    'Nenhuma policy pode usar true sem restricao de usuario';

  assert (
    select count(*) from pg_policies
    where schemaname = 'public'
      and tablename in ('wl_items', 'user_settings', 'notification_log')
      and qual is not null and qual not like '%auth.uid()%') = 0,
    'Todas as policies USING devem conter auth.uid()';

  assert (
    select count(*) from pg_policies
    where schemaname = 'public'
      and tablename in ('wl_items', 'user_settings', 'notification_log')
      and with_check is not null and with_check not like '%auth.uid()%') = 0,
    'Todas as policies WITH CHECK devem conter auth.uid()';

  -- Verificação de operações: wl_items precisa cobrir select, insert, update, delete
  assert (
    select count(distinct cmd) from pg_policies
    where schemaname = 'public' and tablename = 'wl_items'
      and cmd in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) = 4,
    'wl_items precisa cobrir os 4 comandos: select, insert, update, delete';

  -- Verificação do trigger: deve estar em auth.users com security definer
  assert exists (
    select 1 from pg_trigger t
    join pg_proc p on t.tgfoid = p.oid
    where t.tgname = 'on_auth_user_created'
      and t.tgrelid = 'auth.users'::regclass
      and p.proname = 'handle_new_user'
      and p.prosecdef = true),
    'Trigger on_auth_user_created deve estar em auth.users com handle_new_user como security definer';

  assert exists (
    select 1 from pg_trigger t
    join pg_proc p on t.tgfoid = p.oid
    where t.tgname = 'on_auth_user_created'
      and t.tgrelid = 'auth.users'::regclass
      and p.proname = 'handle_new_user'
      and p.pronamespace = 'public'::regnamespace
      and p.proconfig is not null
      and array_to_string(p.proconfig, ',') like '%search_path%'),
    'handle_new_user precisa ter search_path fixo no proconfig';

  -- Verificação de nulabilidade: sold é nulável
  assert exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'wl_items'
      and column_name = 'sold' and is_nullable = 'YES'),
    'sold precisa ser nulavel — null significa nao registrado';

  raise notice 'schema ok';
end $$;
