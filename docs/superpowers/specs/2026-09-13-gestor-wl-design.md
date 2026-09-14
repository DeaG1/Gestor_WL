# Gestor WL — design

Data: 2026-09-13
Handoff de referência: `design_handoff_gestor_wl/` (README.md, `Gestor WL.dc.html`, `styles.css`)

## 1. Objetivo

App pessoal para gerenciar whitelists (WL) de mints de NFT em duas wallets — Blowfly e MEGA —
em várias chains. Cadastrar cada WL, ver o que precisa mintar hoje, receber um lembrete diário
automático e acompanhar um dashboard de quantidade de WL e lucro por wallet.

O handoff entrega o design em alta fidelidade: cores, tipografia, espaçamento, as 5 telas, o
modelo de dados e as regras de interação são finais. **Este spec não redefine o visual** — o
README do handoff continua sendo a fonte da verdade para aparência e comportamento de tela.
O que está aqui são as decisões de implementação e os pontos onde a versão real diverge do
protótipo, que rodava 100% no navegador com `localStorage`.

## 2. Decisões

| Decisão | Escolha | Motivo |
| --- | --- | --- |
| Stack do front | Vite + React + TypeScript (SPA) | O app é todo estado de cliente: as 5 telas são recortes de uma lista de ~30 itens carregada de uma vez. SSR não traz nada (dashboard privado, sem SEO) e cobraria hidratação, cookies de auth e loop de dev mais lento. |
| Back e banco | Supabase (Postgres + Auth + RLS + Edge Functions + pg_cron) | O tier free cobre tudo. Auth, autorização e agendamento vêm prontos; escrever API própria duplicaria isso. |
| Autenticação | Supabase Auth, magic link, usuário único | Dados por `user_id` com RLS. Nasce pronto para multiusuário, mas só uma conta usa. |
| Canais de notificação | Discord (automático, server-side) + Aviso no PC (Notification API, com a aba aberta) | WhatsApp saiu do escopo: a API oficial é paga e exige conta business, e as alternativas gratuitas são não-oficiais e instáveis. |
| Dispositivos | Desktop-first, fiel ao handoff | Sem layout móvel dedicado. Os grids `auto-fit` colapsam, mas a sidebar de 232px continua fixa. |
| Gráficos | À mão (conic-gradient, divs, SVG inline) | O handoff especifica o desenho exato; nenhuma biblioteca acrescenta. |
| Hospedagem | Vercel (estático) + Supabase | Ambos no tier gratuito. |

## 3. Arquitetura

```
src/
  domain/     funções puras — sem React, sem Supabase
  data/       repos Supabase + hook de estado
  screens/    Dashboard, Hoje, Lista, Calendario, Notificacoes, ItemDialog, Sidebar, Login
  ui/         Btn, Seg, Tag, Card, Field, Dialog
  styles/     nocturne.css (tokens e classes, portados do handoff)
supabase/
  migrations/               schema, RLS, trigger, cron
  seed.sql                  as 30 WL iniciais
  functions/daily-digest/   Edge Function do lembrete
  functions/_shared/        date.ts + digest.ts — importados também pelo front
```

**Regra de dependência:** `domain/` não importa React nem Supabase. Recebe `WLItem[]` mais a
data de hoje e devolve números e rótulos prontos. Toda a regra do handoff (KPIs, ROI, série de
lucro, agrupamento de "Próximos", semanas do calendário, filtros da Lista) mora ali; os
componentes só desenham. É o que permite testar o comportamento sem montar a UI.

**`functions/_shared/`** guarda a montagem da mensagem do lembrete. O front importa para
renderizar a prévia e a Edge Function importa para enviar, então a prévia não pode divergir do
que chega no Discord. São módulos sem dependências, válidos tanto no Deno quanto no Vite; o
front os alcança por um alias `@shared` no `vite.config.ts` e no `tsconfig.json`.

## 4. Modelo de dados

### `wl_items`

```sql
create table public.wl_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name       text not null check (length(trim(name)) > 0),
  wallet     text not null check (wallet in ('Blowfly','MEGA')),
  type       text not null default ''      check (type   in ('FCFS','GTD','GTD + FCFS','')),
  chain      text not null default ''      check (chain  in ('RH','ARC','')),
  mint_date  date,
  mint_time  time,
  status     text not null default 'TBH'   check (status in ('Confirmado','TBH','TBA')),
  cost       numeric,
  sold       numeric,
  supply     integer,
  link       text not null default '',
  notes      text not null default '',
  done       text not null default 'pendente' check (done in ('pendente','mintado','pulado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index wl_items_user_date_idx on public.wl_items (user_id, mint_date);
```

Notas:

- `mint_date` / `mint_time` em vez de `date` / `time` porque os nomes originais colidem com
  tipos do Postgres. São valores ingênuos: sempre BRT, nunca convertidos.
- `cost` e `sold` são nuláveis de propósito. **`null` = não registrado**, distinto de `0` — o
  protótipo usava `''` para essa diferença, e o dashboard depende dela ("registre custo e venda"
  versus um lucro real de zero). Na matemática, `null` conta como `0`.
- `profit` não é coluna: é sempre `sold - cost`, calculado na exibição.
- `updated_at` é mantido por trigger `set_updated_at` em `before update`.

### `user_settings`

```sql
create table public.user_settings (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  reminder_hour   time    not null default '08:00',
  discord_webhook text    not null default '',
  discord_on      boolean not null default true,
  pc_on           boolean not null default false,
  currency        text    not null default '$'    check (currency   in ('$','R$','ETH','SOL')),
  start_view      text    not null default 'dash' check (start_view in ('dash','hoje','lista','cal','notif')),
  show_past       boolean not null default true,
  updated_at      timestamptz not null default now()
);
```

`currency`, `start_view` e `show_past` eram "tweaks" do protótipo. Viram configuração persistida
com os mesmos defaults, mas **sem UI nesta versão** — só são lidos.

Um trigger `on auth.users after insert` cria a linha de settings do usuário novo.

### `notification_log`

```sql
create table public.notification_log (
  user_id  uuid not null references auth.users(id) on delete cascade,
  day      date not null,
  channel  text not null check (channel in ('discord')),
  status   text not null check (status in ('sending','ok','error')),
  attempts integer not null default 0,
  error    text,
  sent_at  timestamptz,
  primary key (user_id, day, channel)
);
```

É o registro de idempotência e a trilha de depuração do job (seção 7).

### RLS

`alter table ... enable row level security` nas três tabelas, com política
`using (auth.uid() = user_id) with check (auth.uid() = user_id)` para select, insert, update e
delete. Sem isso, a chave anon publicada no front dá acesso irrestrito ao banco.

A Edge Function usa a `service_role` key (guardada como secret da função, nunca no front) para
ler as settings e os itens de quem precisa ser notificado.

### Seed

`supabase/seed.sql` insere as 30 WL da tabela do handoff, resolvendo o `user_id` pelo e-mail do
dono. Rodado uma vez no SQL editor após o primeiro login. Não é trigger: um trigger injetaria
esta lista pessoal em qualquer conta criada depois.

Os horários já estão convertidos para BRT e o horário original vai em `notes`, conforme o
handoff. As datas usam o ano corrente.

## 5. Fuso horário

O app inteiro fala BRT, e a interface diz isso em vários lugares ("HORÁRIOS EM BRT", "08:00
BRT"). "Hoje" é calculado explicitamente em `America/Sao_Paulo`, via `Intl.DateTimeFormat`, e
não pelo relógio local da máquina — caso contrário o app mentiria se o PC estivesse em outro
fuso. O mesmo vale no servidor: o job compara `reminder_hour` com a hora corrente de São Paulo.

## 6. Front

### Estado e fluxo

`useGestor()` carrega `items` e `settings` uma vez após o login e mantém em memória. Todas as
telas derivam desse mesmo array via `domain/`.

Mutações (mintado, pular, salvar, excluir, mudar settings) aplicam **otimista** no estado local
e chamam o Supabase em seguida. Em falha: rollback do estado e banner de erro no topo do
conteúdo. Sem realtime (um usuário, uma aba) e sem router — a aba ativa é estado, inicializada
por `settings.start_view`.

O relógio e o "hoje" recalculam a cada 30 s, como no handoff.

### Telas

As 5 telas seguem o handoff sem desvio: Dashboard, Hoje, Lista, Calendário e Notificações.
Duas diferenças, ambas já decididas:

1. **Notificações** perde o card de WhatsApp. Restam o campo de horário, o card do Discord e o
   card de Aviso no PC, além da coluna direita de prévia (segmented Hoje | Próximo dia com mint,
   botão Copiar, bloco `<pre>`).
2. O card do Discord ganha uma linha de estado: **"último envio: hoje 08:02 · ok"**, lida do
   `notification_log`. Não está no design, mas um job que falha calado é a pior falha possível
   neste app.

### Login (tela nova)

O handoff não cobre autenticação. A tela usa os mesmos tokens: marca "Gestor WL" com o subtítulo
"FCFS · GTD · Blowfly & MEGA", um campo de e-mail (`.input`), botão `.btn-primary .btn-block`
"Enviar link de acesso", e o estado de confirmação ("Link enviado — confere seu e-mail.").
Centralizada sobre o mesmo fundo radial do app. Erros de envio aparecem abaixo do botão.

### Design system

`styles.css` do handoff entra como `src/styles/nocturne.css` praticamente intacto — os tokens e
as classes (`.btn`, `.seg`, `.tag`, `.card`, `.table`, `.dialog`, as regras que desvanecem nas
pontas) já são o contrato de design. Por cima, componentes finos em `ui/` que encapsulam só a
marcação repetida, sem reinventar estilo.

Ícones: Phosphor (`@phosphor-icons/react`) — `PencilSimple`, `Check`, `ArrowRight`,
`ArrowSquareOut`, `CaretLeft`, `CaretRight` — no lugar dos glifos `✎ ✓ → ↗ ‹ ›` do protótipo.

Fonte Inter via Google Fonts, importada pelo CSS.

## 7. Lembrete diário

**Agendamento.** `pg_cron` chama a Edge Function `daily-digest` a cada 5 minutos via `pg_net`.
O atraso máximo entre o horário configurado e o envio é, portanto, de 5 minutos — irrelevante
para um resumo diário.

**Critério de envio.** Para cada usuário com `discord_on = true` e `discord_webhook` preenchido,
cuja `reminder_hour` já passou no horário de São Paulo: buscar os itens com `mint_date = hoje` e
`done = 'pendente'`. Se não houver nenhum, **não envia e não registra nada** — igual ao
protótipo, o dia sem mint é silencioso.

**Idempotência.** Antes de enviar, a função reivindica a linha `(user_id, hoje, 'discord')` em
`notification_log` com `insert ... on conflict do nothing` e `status = 'sending'`. Se nenhuma
linha foi inserida, outro tick já está cuidando — encerra. A chave primária composta garante
isso mesmo com ticks simultâneos ou redeploy.

**Falha e retry.** Se o POST no webhook falhar, a linha vira `status = 'error'` com `attempts`
incrementado e a mensagem do erro. Os ticks seguintes reprocessam linhas em `error` enquanto
`attempts < 3`. Sem retry, uma indisponibilidade do Discord às 8h viraria silêncio e um mint
perdido; com retry infinito, um webhook revogado geraria ruído o dia todo.

**Mensagem.** Texto puro, sem emoji, no formato do handoff:

```
Mints de ter 15/09 (BRT):
• 06:00 — Fortune Foes  [MEGA]
• horário TBH — Yield Farm  [Blowfly · FCFS · RH] · custo $ 0.02
  https://link-se-houver
```

Montada por `_shared/digest.ts`, o mesmo módulo que renderiza a prévia na tela.

**Teste manual.** O botão "Enviar agora" do card do Discord chama a mesma Edge Function em modo
teste: envia a prévia e não escreve no `notification_log`. O teste exercita o caminho real —
webhook salvo, formatação, entrega — em vez de um POST direto do navegador, que passaria por
fora do que roda às 8h. Os estados de feedback são os do handoff: "Enviando… / Enviado. / Falhou
(status)".

**Aviso no PC.** Continua sendo a `Notification API` do navegador, disparada pelo cliente com a
aba aberta. O texto de estado do handoff ("Permissão concedida.", "Permissão negada no
navegador.", "Navegador sem suporte.", "Ative para pedir permissão.") já comunica a limitação.
Push real com service worker ficou fora de escopo.

## 8. Erros

- Falha de rede ou RLS numa mutação: rollback do otimista e banner no topo do conteúdo, com a
  mensagem do Supabase. Nada de erro silencioso.
- Falha ao carregar: estado de erro com botão "Tentar de novo", em vez de tela vazia.
- Falha do job: registrada em `notification_log` e exposta na linha de estado do card do Discord.
- Sessão expirada: volta para a tela de login. Não há rascunho a perder.

## 9. Testes

Vitest, com TDD sobre `domain/` e `_shared/`. As regras já estão escritas em texto no handoff,
então os testes saem dele antes da implementação:

- **Dashboard:** contagens dos 5 KPIs, "agendadas" = pendentes com data ≥ hoje, gasto/vendido/
  lucro sobre os mintados, ROI, segmentos por tipo das barras por wallet, percentual do donut,
  as até 8 datas da agenda, e a série de lucro acumulado em ordem de data (incluindo o estado
  vazio).
- **Lista:** busca por nome, os quatro filtros, a regra de que o filtro "GTD" casa também com
  "GTD + FCFS", e a ordenação (com data primeiro em ordem crescente, depois sem data por nome).
- **Hoje:** separação entre hoje, "passaram sem marcar" (data anterior e ainda pendente),
  próximos agrupados por data com os rótulos "amanhã" / "em N dias", e sem data.
- **Calendário:** grade começando no domingo, dias fora do mês, e o corte de 4 a 6 semanas
  conforme o mês.
- **Digest:** com custo, com link, com e sem horário, e o caso sem mints ("Nenhum mint em ter
  15/09.").
- **Datas:** "hoje" em `America/Sao_Paulo` independente do fuso da máquina que roda o teste.

Dois testes de componente (Testing Library) nas regras que mordem: salvar com data e hora
preenchidas força `status = 'Confirmado'`, e "Mintado" num item pendente marca o item **e** abre
o modal "Registrar mint".

Sem E2E — o custo não se paga num app de um usuário.

## 10. Fora de escopo

- Layout móvel dedicado.
- WhatsApp em qualquer forma.
- Web Push / service worker / PWA.
- UI para `currency`, `start_view` e `show_past` (persistidos, mas não editáveis).
- Realtime, multiusuário aberto, wallets configuráveis, import/export.

## 11. Deploy

- **Front:** build estático do Vite na Vercel. Variáveis: `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`.
- **Banco:** migrations versionadas em `supabase/migrations/`, aplicadas pelo Supabase CLI.
- **Edge Function:** `supabase functions deploy daily-digest`. Secret:
  `SUPABASE_SERVICE_ROLE_KEY` — nunca no front.
- **Cron:** migration que registra o `cron.schedule` de 5 em 5 minutos.
