# Gestor WL

Aplicativo pessoal para acompanhar whitelists (WL) de mints de NFT em duas
carteiras — **Blowfly** e **MEGA** — espalhadas por várias chains (RH, ARC…).
Cada WL guarda nome, carteira, tipo (FCFS/GTD), chain, data e hora do mint,
custo, valor de venda e um status de confirmação. O app resolve três
perguntas do dia a dia de quem gerencia várias WL ao mesmo tempo: o que
precisa ser mintado hoje, quanto já foi gasto e ganho por carteira, e — a
parte que mais importa — não deixar passar um mint por esquecimento.

Por trás das cinco telas (Dashboard, Hoje, Lista, Calendário, Notificações)
há um banco Postgres (Supabase) com Row Level Security, então os dados
sobrevivem a logout/login e cada usuário só vê as próprias WL. Um lembrete
diário é enviado para o Discord por uma Edge Function agendada via
`pg_cron`: ela olha o horário configurado, o que está pendente para hoje e
manda uma mensagem de texto com os mints do dia — sem duplicar, mesmo que o
job rode a cada 5 minutos.

## Rodando localmente

Pré-requisitos: Node, Docker (para o Supabase local) e a Supabase CLI
(`npm i -D supabase` ou o binário global).

```bash
npm install
```

Crie um `.env` na raiz (não é versionado) com:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key impressa pelo `supabase start`>
```

Suba o banco local e aplique as migrations:

```bash
npx supabase start
npx supabase db reset
```

`db reset` roda todas as migrations em `supabase/migrations/` em ordem,
inclusive `20260913000004_cron.sql`. Isso é inofensivo localmente: ela só
cria o agendamento (`cron.schedule`), e como o Vault local não tem o
segredo `service_role_key` nem `<PROJECT_REF>` é um host real, cada
tentativa de chamada falha sem afetar o resto do banco. Se preferir não ter
esse job rodando de 5 em 5 minutos no ambiente local, rode
`select cron.unschedule('gestor-wl-daily-digest');` depois do reset.

Depois, `npm run dev` e faça login pelo magic link. **Só então** rode o seed
(ele depende de o usuário já existir em `auth.users`):

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed.sql
```

O seed é idempotente (não faz nada se o usuário já tiver qualquer WL) e
carrega as 30 WL da entrega para o e-mail gravado no início do arquivo —
troque esse e-mail se for rodar com outra conta.

## Testes

```bash
npm test        # roda uma vez
npm run test:watch
```

131 testes em 16 arquivos. A maior parte cobre `src/domain/` e o mapeamento
de dados (`src/data/`, `supabase/functions/_shared/`,
`supabase/functions/daily-digest/eligibility.ts`); um punhado testa
comportamento de componente — clique, digitação, o que fica na tela depois
de uma interação (`ItemDialog`, `Seg`). **O que não é testado
automaticamente é fidelidade visual:** cor, espaçamento e layout das cinco
telas foram conferidos por leitura, seção por seção, contra
`design_handoff_gestor_wl/README.md` — não há teste de snapshot ou de
pixel nesse projeto.

## Estrutura do projeto

```
src/
  domain/     funções puras — o "o quê", sem React nem Supabase
  data/       repositórios (Supabase) + o hook use-gestor, que expõe o
              estado do app às telas
  screens/    as cinco telas e o diálogo de item — só desenham
  ui/         primitivas de design system (Field, Seg, Dialog, Tag…)
  lib/        cliente Supabase, tipos, tokens de design, hooks utilitários
supabase/
  migrations/ schema, RLS, trigger de settings, cron
  functions/  a Edge Function daily-digest e o _shared/ (ver abaixo)
  seed.sql    as 30 WL da entrega
```

A regra que importa: **tudo que aparece como número ou lista na tela vem de
uma função pura em `src/domain/`.** Nenhuma tela calcula agregados,
contagens ou filtros sozinha — ela chama uma função de `domain/` e desenha o
resultado. Essa separação existe para que o comportamento seja testável sem
abrir um navegador, e não é teórica: um bug real já aconteceu por causa
dela. Os mini-cards de carteira na sidebar contavam "N sem data" checando só
`!item.date`, calculado direto num componente; o protótipo do handoff conta
`!item.date && item.done === 'pendente'`. Como o seed carrega tudo como
pendente, o bug ficou invisível até uma WL ser marcada como mintada ou
pulada sem data — aí o número errava. O conserto não foi só a condição: foi
tirar o cálculo do componente e colocá-lo em `src/domain/wallet-cards.ts`
com teste, porque foi exatamente por estar fora da camada testada que o erro
sobreviveu. Ao adicionar uma tela ou um card novo, qualquer derivação de
dado nova deve nascer em `domain/`, com teste, mesmo que pareça pequena.

### `supabase/functions/_shared/`

Este diretório é importado dos dois lados: do app no navegador (via o alias
`@shared`, configurado em `vite.config.ts` e `tsconfig.json`) e da Edge
Function Deno (`daily-digest/index.ts`, via caminho relativo). Por isso seus
módulos (`digest.ts`, `date.ts`, `money.ts`) precisam continuar sem
dependências — nada de React, nada de `@supabase/supabase-js` ali dentro.
É esse compartilhamento que garante que a prévia da mensagem mostrada na
tela de Notificações e a mensagem de fato postada no Discord nunca fiquem
diferentes: as duas chamam a mesma `buildDigest`.

## Deploy

### Vercel (frontend)

Importe o repositório. Comando de build: `npm run build`. Diretório de
saída: `dist`. Variáveis de ambiente: `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`, apontando para o projeto Supabase hospedado (não
para o `127.0.0.1` local). Depois do primeiro deploy, acrescente a URL da
Vercel em **Authentication → URL Configuration → Redirect URLs** no painel
do Supabase — sem isso o magic link continua redirecionando para
`localhost`.

### Supabase (banco, Edge Function, Vault e cron)

O lembrete diário depende de duas coisas que **não estão neste repositório**
por conterem segredo ou apontarem para um projeto específico: a
`service_role key` no Vault e o ref do projeto dentro da migration do cron.
Por isso a ordem importa — `db push` aplica **todos** os arquivos de
`supabase/migrations/` em ordem, sem pular nenhum e sem substituir
variável nenhuma, então o placeholder precisa estar trocado antes de rodar:

1. No SQL editor do projeto hospedado (nunca numa migration, a chave não
   pode entrar no git):

   ```sql
   select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
   ```

2. Edite `supabase/migrations/20260913000004_cron.sql` e troque
   `<PROJECT_REF>` pelo ref do projeto (Project Settings → General →
   Reference ID).

3. Publique:

   ```bash
   npx supabase link --project-ref <PROJECT_REF>
   npx supabase db push
   npx supabase functions deploy daily-digest
   ```

   Isso cria as tabelas, a RLS e o trigger de settings, agenda o job
   `gestor-wl-daily-digest` (a cada 5 minutos, chave lida do Vault por
   nome) e publica a função `daily-digest`.

4. Confirme:

   ```sql
   select jobname, schedule, active from cron.job;
   select status, return_message, start_time
     from cron.job_run_details order by start_time desc limit 5;
   ```

   Espera-se o job ativo e as execuções recentes com `succeeded`.

## Documentação de referência

- Spec do projeto: `docs/superpowers/specs/2026-09-13-gestor-wl-design.md`
- Handoff de design (fonte da verdade visual): `design_handoff_gestor_wl/`
  (`README.md` descreve modelo de dados e comportamento; `Gestor WL.dc.html`
  e `styles.css` são o protótipo de referência)

## Cuidados conhecidos

- **Datas do seed estão em `MM-DD`, não `DD/MM`.** O handoff descreve datas
  no formato brasileiro `DD/MM` (ex.: a linha "Remilia: Civil War" traz
  `08/09`, 8 de setembro), mas `supabase/seed.sql` guarda cada uma já
  invertida, como `'09-08'`, para bater com `make_date(ano, mês, dia)`. Ao
  adicionar uma WL copiando o formato do handoff sem inverter os dois
  números — escrever `'08-09'` em vez de `'09-08'` —, o resultado é 9 de
  setembro, uma data válida e silenciosamente errada: `make_date` não
  reclama porque tanto 08 quanto 09 são meses válidos (1–12).
- **Testes de componente precisam de jsdom.** `npm test` roda em ambiente
  Node por padrão (mais rápido para os testes de `domain/`). Um arquivo de
  teste que renderiza componentes React precisa declarar
  `// @vitest-environment jsdom` como a primeira linha do arquivo, ou o
  teste falha ao tentar acessar `document`.
