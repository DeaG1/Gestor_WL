-- Um claim 'sending' sem essa coluna não tem como ser distinguido de um
-- envio ainda em andamento: se o isolate morrer entre reivindicar a linha e
-- concluir o POST no Discord, a linha ficava presa em 'sending' para sempre
-- e nenhum tick seguinte tentava de novo. claimed_at marca quando a linha
-- virou 'sending' pela última vez, para a Edge Function poder destravar um
-- claim mais velho que o limite (ver eligibility.ts, STALE_CLAIM_MINUTES).
alter table public.notification_log
  add column claimed_at timestamptz;
