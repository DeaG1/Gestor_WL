-- Terceira wallet: Loculus.
--
-- A trava original só aceitava 'Blowfly' e 'MEGA', então uma WL da Loculus seria
-- recusada ao salvar. Recria o check com o MESMO nome, porque
-- supabase/tests/schema_checks.sql confere a existência de
-- wl_items_wallet_check pelo nome.
--
-- Ao acrescentar outra wallet no futuro: nova migration como esta, e o nome em
-- WALLETS (src/lib/types.ts) mais as três cores em src/lib/tokens.ts.

alter table public.wl_items drop constraint wl_items_wallet_check;

alter table public.wl_items
  add constraint wl_items_wallet_check
  check (wallet in ('Blowfly', 'MEGA', 'Loculus'));
