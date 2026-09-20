-- Mais redes: ZEC, BNB, SOLANA e BASE, alem das duas originais.
--
-- Recria a trava com o MESMO nome, porque supabase/tests/schema_checks.sql
-- confere wl_items_chain_check pelo nome. A string vazia continua valida:
-- ela e o "sem chain" de uma WL que ainda nao se sabe onde minta.
--
-- Para acrescentar outra rede depois: uma migration como esta, mais o nome
-- em Chain e em CHAINS (src/lib/types.ts). O campo do modal e o filtro da
-- Lista saem de CHAINS sozinhos.

alter table public.wl_items drop constraint wl_items_chain_check;

alter table public.wl_items
  add constraint wl_items_chain_check
  check (chain in ('RH', 'ARC', 'ZEC', 'BNB', 'SOLANA', 'BASE', ''));
