alter table public.wl_items        enable row level security;
alter table public.user_settings   enable row level security;
alter table public.notification_log enable row level security;

-- wl_items: o dono faz tudo.
create policy wl_items_select on public.wl_items
  for select using (auth.uid() = user_id);
create policy wl_items_insert on public.wl_items
  for insert with check (auth.uid() = user_id);
create policy wl_items_update on public.wl_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy wl_items_delete on public.wl_items
  for delete using (auth.uid() = user_id);

-- user_settings: lê e altera as próprias. A linha é criada pelo trigger, nunca
-- pelo cliente, e não existe caso de apagar.
create policy user_settings_select on public.user_settings
  for select using (auth.uid() = user_id);
create policy user_settings_update on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- notification_log: o cliente só lê, para mostrar "último envio". Quem escreve
-- é a Edge Function, com a service_role key, que passa por fora da RLS.
create policy notification_log_select on public.notification_log
  for select using (auth.uid() = user_id);
