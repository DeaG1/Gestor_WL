# Handoff: Gestor WL (FCFS / GTD em várias chains)

## Overview
App pessoal para gerenciar whitelists (WL) de mints de NFT em duas wallets — **Blowfly** e **MEGA** — em várias chains (RH, ARC…). O usuário cadastra cada WL (nome, wallet, tipo FCFS/GTD, chain, data/hora, custo, venda…), vê o que precisa mintar hoje, recebe um lembrete diário (WhatsApp, Discord, notificação no PC) e acompanha um dashboard de quantidade de WL e lucro por wallet.

Repositório de destino: `DeaG1/Gestor_WL` (branch `main`, vazio no momento da entrega).

## About the Design Files
Os arquivos deste pacote (`Gestor WL.dc.html`, `styles.css`) são **referências de design feitas em HTML** — um protótipo funcional que mostra a aparência e o comportamento pretendidos. Não é código de produção para copiar direto. A tarefa é **recriar este design no ambiente do projeto**. Como o repo está vazio, escolha a stack mais adequada (sugestão: Next.js/React + TypeScript, ou Vite + React; backend leve para agendar as notificações — ver seção Notificações). Todo o comportamento descrito abaixo deve ser reproduzido.

## Fidelity
**Alta fidelidade (hi-fi).** Cores, tipografia, espaçamento e interações são finais. Recrie a UI fielmente usando os tokens listados em *Design Tokens*. O protótipo roda 100% no navegador com `localStorage`; a implementação real deve ter persistência de verdade (banco) e envio de notificações server-side.

---

## Modelo de dados

### WL (item)
| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | string | único |
| `name` | string | obrigatório |
| `wallet` | `'Blowfly' \| 'MEGA'` | obrigatório |
| `type` | `'FCFS' \| 'GTD' \| 'GTD + FCFS' \| ''` | vazio = "Sem tipo" |
| `chain` | `'RH' \| 'ARC' \| ''` | opcional |
| `date` | `YYYY-MM-DD` ou `''` | opcional |
| `time` | `HH:MM` (BRT) ou `''` | opcional |
| `status` | `'Confirmado' \| 'TBH' \| 'TBA'` | se `date` e `time` preenchidos → força `Confirmado` ao salvar |
| `cost` | number (string no form) | custo do mint |
| `sold` | number | valor de venda |
| `supply` | number | qtd mintada (default visual "1" quando mintado) |
| `link` | URL | link do mint |
| `notes` | string | observações (ex.: horário original "4h20 EST") |
| `done` | `'pendente' \| 'mintado' \| 'pulado'` | default `pendente` |

Derivados: `profit = sold - cost`.

### Configurações de notificação
| Campo | Tipo | Default |
| --- | --- | --- |
| `hour` | `HH:MM` BRT | `08:00` |
| `wa` | string (dígitos com DDI) | `''` |
| `waOn` | boolean | true |
| `webhook` | URL do webhook Discord | `''` |
| `dcOn` | boolean | true |
| `pcOn` | boolean | false |

### Dados iniciais (seed)
Cadastrar exatamente estas WL. Horários já convertidos para BRT; o horário original vai em `notes`. Ano = ano corrente.

**Blowfly**
| Nome | Tipo | Chain | Data | Hora | Status | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| Remilia: Civil War | FCFS | RH | 08/09 | 05:20 | Confirmado | 4h20 EST |
| ubk | FCFS | RH | — | — | TBH | |
| Terminal Cats | GTD | RH | — | — | TBH | |
| The Floks | GTD | RH | — | — | TBH | -$3 |
| Yield Farm | FCFS | RH | 15/09 | — | TBH | |
| Kanz | FCFS | RH | — | — | TBH | |
| Bright Brokers | FCFS | RH | 09/09 | — | TBH | |
| Arc Brookies | FCFS | ARC | — | — | TBH | |
| AGNT.Social | GTD | RH | 10/09 | 10:00 | Confirmado | 1pm UTC |
| RichGirlsClub | GTD | ARC | 17/09 | — | TBH | |
| SotkcSalesman | FCFS | RH | — | — | TBH | |
| Kashed | GTD | ARC | — | — | TBH | |
| Rowdies | GTD | RH | — | — | TBH | |
| BoyMeetsHood | GTD | RH | — | — | TBH | |
| Arcana | FCFS | ARC | — | — | TBH | |
| Rojak | — | — | — | — | TBH | |
| Mana Wizards | — | — | — | — | TBH | |
| The Alms | — | — | — | — | TBH | |

**MEGA**
| Nome | Tipo | Chain | Data | Hora | Status | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| Akai | GTD | — | 23/09 | 15:15 | Confirmado | |
| Stock Salesman | GTD | — | — | — | TBH | |
| Arc Machines | GTD | — | — | — | TBH | talvez 15/09 |
| Reeve | FCFS | — | — | — | TBH | |
| Zec Punks | GTD | — | — | — | TBH | |
| Broke Bookies | — | — | — | — | TBA | |
| Porkalus | GTD | — | — | — | TBA | |
| Misfits | GTD + FCFS | — | 16/09 | — | TBH | |
| Juicehedz | FCFS | — | — | — | TBH | |
| Imprint | FCFS | — | — | — | TBH | |
| Arc Chibi | — | — | — | — | TBH | |
| Fortune Foes | — | — | 15/09 | 06:00 | Confirmado | 6h da manhã |

---

## Layout geral (app shell)
- Grid de 2 colunas: sidebar fixa **232px** + conteúdo `minmax(0,1fr)`.
- Fundo: `radial-gradient(900px 420px at 30% -10%, #2b2741 0%, transparent 65%), #161826`.
- **Sidebar** (sticky, altura 100vh, padding 22.4px 16.8px, borda direita 1px `--color-divider`):
  - Marca: "Gestor WL" (Inter 500, 20px) + subtítulo "FCFS · GTD · Blowfly & MEGA" (12px, neutral-500). **Sem ícone/bolinha.**
  - Nav vertical: Dashboard, Hoje, Lista, Calendário, Notificações. Item: 14px/500, padding 9px 12px, radius 8px. Ativo: fundo `--color-surface`, texto accent-200, marca sólida de 2px à esquerda em `--color-accent` (`box-shadow: inset 2px 0 0`). Hover: fundo `color-mix(text 6%)`. Badge à direita (11px, neutral-500): Hoje = nº pendentes hoje; Lista = total de WL; Notificações = "on" se algum canal ativo.
  - Botão "+ Nova WL" (`.btn-primary .btn-block` — outline accent, nunca preenchido).
  - Rodapé: 2 mini-cards (surface, shadow-sm, radius 8px) — Blowfly e MEGA — com ponto colorido da wallet, nome (13px/500), sub "N mintadas · N sem data" (11px) e total (18px/500). Abaixo, relógio "HH:MM BRT · dom 13/09" (11px, neutral-600).
- **Conteúdo**: padding 22.4px 40px 96px; wrapper interno `max-width: 1080px; margin: 0 auto`; entrada com animação `wl-rise` (opacity 0→1, translateY 6px→0, .35s ease-out).
- Cabeçalho de cada tela: kicker uppercase 11px, letter-spacing .1em, cor accent; `h1` 34px/500; subtítulo 14px neutral-400.

---

## Telas

### 1. Dashboard (tela inicial)
**Propósito:** visão geral de quantidade de WL e resultado financeiro.

- Header: kicker "DASHBOARD", h1 "Visão geral", sub "`N` WL em 2 wallets · `N` mintadas · `N` ainda sem data". À direita, segmented **Tudo | Blowfly | MEGA** que filtra todos os números/gráficos abaixo (escopo).
- **KPIs** (grid `auto-fit minmax(170px,1fr)`, gap 8.4px; card surface, shadow-sm, padding 11.2px): kicker 10px uppercase neutral-500, valor 30px/500 letter-spacing -.02em, sub 12px neutral-500.
  1. WL totais — valor = count; sub "18 Blowfly · 12 MEGA"
  2. Mintadas — count `done=mintado`; sub "N puladas · N agendadas" (agendadas = pendentes com data ≥ hoje)
  3. Gasto — Σ cost dos mintados; sub "soma dos custos de mint"
  4. Vendido — Σ sold dos mintados; sub "soma das vendas"
  5. Lucro — Vendido − Gasto, cor accent-300 (negativo: neutral-400); sub "ROI N%" ou "registre custo e venda"
- **Gráficos** (grid 2 colunas `repeat(auto-fit, minmax(min(100%,440px),1fr))`, gap 8.4px; cards padding 16.8px, título 15px/500 + sub 12px neutral-500):
  1. **WL por wallet** — para cada wallet, linha com nome, "N WL · N mintadas" e barra horizontal empilhada (altura 22px, radius 6px, fundo neutral-900, gap 2px) com segmentos proporcionais por tipo. Legenda: FCFS, GTD, GTD + FCFS, Sem tipo com contagens.
  2. **FCFS vs GTD** — donut 150px (`conic-gradient`) com furo 104px em surface; centro = "% GTD" (26px) sobre "GTD" (10px uppercase). Lista à direita: cor, tipo, count, %.
  3. **Agenda de mints** — barras verticais (altura 130px), uma por data com mint (até 8 datas, ordenadas). Altura ∝ count. Cores: hoje = accent, passado = neutral-800, futuro = accent-700. Rótulo "ter 15/09" (11px), número acima da barra. Animação `wl-grow` (scaleY 0→1, .5s, origin bottom). Vazio: "Nenhum mint com data ainda."
  4. **Lucro acumulado** — linha SVG (600×150, `preserveAspectRatio: none`) do lucro cumulativo dos mintados em ordem de data; área sob a linha accent 14% opacity; pontos r=4 (fill bg, stroke accent 2px); linha tracejada no zero (neutral-700). Total à direita do título (22px/500). Estado vazio: caixa tracejada com "Ao marcar um mint como **Mintado**, registre quanto custou e por quanto vendeu. O gráfico monta sozinho."
- **Resultado por wallet** (2 cards): ponto colorido + "Resultado Blowfly/MEGA", "N mints registrados"; 3 colunas Gasto / Vendido / Lucro (20px/500); barra de ROI (8px, largura = min(100, sold/cost·50)%); texto "ROI N% · cada $ 1 gasto virou $ X" ou "sem custo registrado ainda".
- **Mints registrados** — tabela dos `done=mintado`, ordem data desc: Nome, Wallet(tag), Data, Qtd, Custo, Venda, Lucro (colorido), botão editar. Vazio: "Nenhum mint marcado como mintado ainda."

### 2. Hoje
**Propósito:** o que mintar hoje, o que passou sem marcar, o que vem.

- Header: kicker "HOJE · HORÁRIOS EM BRT", h1 "Domingo, 13 de setembro" (só o dia da semana capitalizado). À direita 3 pills (surface, shadow-sm): "N pra mintar hoje", "N dias agendados", "N sem data".
- **Mints de hoje** — cards horizontais (padding 11.2px 16.8px): hora 30px/500 em accent-300 + "BRT" (10px uppercase) ou "—" + "horário TBH"; nome 18px/500 (riscado se mintado); meta 12px: tag wallet, tag outline tipo, chain, custo, notas. Ações: "Abrir mint ↗" (ghost, só se `link`), **Mintado** (primary), **Pular** (secondary), ✎ editar (icon). Item mintado: opacity .5, ring accent-700. Vazio: card "Nada pra mintar hoje — Próximo: ter 15/09 — Fortune Foes, Yield Farm".
- **Passaram sem marcar** (só se houver; tweak `showPast`) — itens com `date < hoje` e `done=pendente`; card lista com data, nome, meta, botões ghost "Mintei" / "Pulei".
- **Próximos** — timeline vertical: coluna esquerda 132px alinhada à direita (dia da semana 15px/500 + "15/09 · em 2 dias"/"amanhã"), coluna 20px com linha 1px `--color-divider` e ponto 9px (borda 2px accent, fundo bg), coluna de cards compactos (hora accent-300 16px, nome 15px/500, meta, ✎). Agrupado por data, ordem crescente.
- **Sem data · N** — chips (surface, 13px, radius 8px, borda transparente → accent no hover) com ponto da wallet, nome e status (TBH/TBA). Clique abre edição.

### 3. Lista
- Header: kicker "LISTA", h1 "Todas as WL", sub "N de N WL · 18 Blowfly · 12 MEGA".
- Filtros em linha (wrap): busca por nome (input 220px) + 4 segmented: Wallet (Todas/Blowfly/MEGA), Tipo (Todos/FCFS/GTD/GTD + FCFS — GTD casa também com "GTD + FCFS"), Chain (Todas/RH/ARC), Status (**Pendentes** default/Mintados/Pulados/Tudo).
- Tabela em card: Nome (+ notas 11px abaixo), Wallet(tag), Tipo (accent-300), Chain, Data · BRT ("ter 15/09 · 06:00" ou "—"), Status(tag), Custo, Venda, Lucro (alinhados à direita), ações ↗ (se link) ✓ mintado → pular ✎ editar. Ordenação: com data primeiro (asc), depois sem data por nome. Linhas concluídas opacity .5; mintado riscado.

### 4. Calendário
- Header: kicker "CALENDÁRIO", h1 "setembro 2026" (capitalizado); botões ‹ · Hoje · ›.
- Grade 7 colunas (dom→sáb), rótulos 10px uppercase. Células min-height 110px, surface, radius 8px, shadow-sm; dias fora do mês opacity .35; hoje: ring 1px accent e número em accent. Cada mint = botão pequeno (11px) com hora/TBH e nome, fundo da cor da wallet (Blowfly `oklch(0.36 0.07 85)`, MEGA `oklch(0.36 0.08 250)`); clique abre edição. Legenda das duas cores abaixo. Mostra 4–6 semanas conforme o mês.

### 5. Notificações
- Header: kicker "NOTIFICAÇÕES", h1 "Lembrete diário", texto explicativo.
- Coluna esquerda: campo "Horário do lembrete (BRT)" (`time`), e 3 cards com toggle "ativo":
  - **WhatsApp** — campo número com DDI; botão "Abrir WhatsApp com a mensagem" → `https://wa.me/<digitos>?text=<mensagem url-encoded>`.
  - **Discord** — campo webhook; botão "Enviar agora" faz `POST {content: mensagem}` no webhook; feedback "Enviando… / Enviado. / Falhou (status)".
  - **Aviso no PC** — Notification API; ativar pede permissão; texto de estado ("Permissão concedida." etc.); botão "Testar agora".
- Coluna direita (sticky): "Prévia da mensagem · ter 15/09", segmented **Hoje | Próximo dia com mint**, botão "Copiar" (→ "Copiado" por 1.5s), bloco `<pre>` monoespaçado 13px/1.7 com a mensagem.
- **Formato da mensagem** (texto puro, sem emoji):
  ```
  Mints de ter 15/09 (BRT):
  • 06:00 — Fortune Foes  [MEGA]
  • horário TBH — Yield Farm  [Blowfly · FCFS · RH] · custo $ 0.02
    https://link-se-houver
  ```
  Sem mints: `Nenhum mint em ter 15/09.`
- **Regra de disparo** (no protótipo roda só com a página aberta; na implementação real deve ser um job server-side/cron): todo dia no `hour` configurado, se houver mints pendentes com `date = hoje`, monta a mensagem e envia para os canais ativos, **uma vez por dia** (guardar "já notificado em YYYY-MM-DD"). WhatsApp sem servidor não envia sozinho — na versão real usar API oficial/Twilio ou equivalente.

### 6. Modal Nova WL / Editar WL / Registrar mint
- `.dialog` 600px, backdrop com blur 3px; clique fora fecha. Título: "Nova WL" | "Editar WL" | "Registrar mint" (quando aberto via botão Mintado). Em edição, botão ghost "Excluir" à direita do título.
- Campos: Nome (autofocus, obrigatório); segmented Wallet (Blowfly/MEGA), Tipo (FCFS/GTD/GTD + FCFS), Chain (RH/ARC) — grid `auto-fit minmax(160px)`; Data, Horário (BRT), Status (Confirmado/TBH/TBA); Link do mint.
- Bloco **Financeiro** (fundo bg, shadow-sm): segmented Pendente/Mintado/Pulado à direita; grid 4 colunas: Custo do mint ($), Vendido por ($), Qtd mintada, Lucro (somente leitura, calculado, colorido). Moeda vem da config `currency` ($, R$, ETH, SOL).
- Observações (textarea). Ações: Cancelar / **Cadastrar** ou **Salvar**.
- Defaults de nova WL: wallet Blowfly, tipo FCFS, chain RH, status TBH, data = hoje.

---

## Interações & comportamento
- **Mintado** (em qualquer lista): se pendente → marca `done=mintado` **e abre o modal "Registrar mint"** para preencher custo/venda; se já mintado → volta para pendente ("Desfazer").
- **Pular**: alterna `pendente ↔ pulado`.
- Editar (✎, chips, blocos do calendário): abre modal preenchido.
- Salvar: exige nome; se data e hora preenchidos, status vira Confirmado.
- Segmented controls: `.seg` / `.seg-opt` com rádio nativo; selecionado = texto accent + inset ring 1px accent.
- Hover em linhas/cards: tint `color-mix(text 4%)` ou shadow-sm; botões seguem estados do design system. Focus visível: outline 2px accent.
- Relógio/“hoje” recalculado a cada 30 s.
- Responsivo: grids com `auto-fit` colapsam para 1 coluna; nada com largura fixa além da sidebar.

## Estado
- `items[]`, `settings`, `tab` (dash | hoje | lista | cal | notif), `filters {q, wallet, type, chain, done}`, `dashScope`, `cal {y, m}`, `form` (null ou item em edição + `isEdit`), `dcStatus`, `copyLabel`, `digestMode`, `now`.
- Persistência: no protótipo `localStorage` (`gestor-wl-items`, `gestor-wl-settings`, `gestor-wl-notified`). Na implementação real: banco por usuário.
- Configs globais (tweaks): `currency` ($ default), `startView` (dash default), `showPast` (true).

---

## Design Tokens (Nocturne — ver `styles.css`)
- Fundo `#161826` · surface `#232532` · texto `#e9e9ed` · accent `#9184d9` · divider `color-mix(#e9e9ed 16%, transparent)`
- Neutral 100→900: `#f3f5fe #e4e7f5 #cfd3e5 #b2b6ca #9397ab #75798c #595d6c #3f424d #292b31`
- Accent 100→900: `#f5f4ff #e7e5fe #d2cefd #b5abfc #968ae0 #796cbf #5d5294 #423a6a #2b2741`
- **Wallets:** Blowfly amarelo — ponto `oklch(0.82 0.15 88)`, tag fundo `oklch(0.42 0.09 85)` / texto `oklch(0.93 0.12 90)`; MEGA azul — ponto `oklch(0.72 0.14 250)`, tag fundo `oklch(0.42 0.10 250)` / texto `oklch(0.92 0.07 250)`.
- **Status (tag fundo / texto):** Confirmado verde `oklch(0.40 0.09 150)` / `oklch(0.92 0.10 150)`; TBH laranja `oklch(0.42 0.10 55)` / `oklch(0.92 0.09 60)`; TBA neutral-800 / neutral-100; Mintado accent-800 / accent-100; Pulado vermelho `oklch(0.40 0.10 25)` / `oklch(0.92 0.06 25)`.
- **Tipos (gráficos):** FCFS accent-400, GTD accent-600, GTD + FCFS accent-800, Sem tipo neutral-700. Lucro positivo accent-300, negativo neutral-400.
- Fonte: Inter (400/500). Títulos peso 500, nunca mais. Body 15px/1.55.
- Espaçamento: 2.8 · 5.6 · 8.4 · 11.2 · 16.8 · 22.4 px. Radius: 4 · 8 · 14 px.
- Sombras: sm `0 0 0 1px #3f424d`; md `0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,.55)`; lg `0 0 0 1px #9397ab, 0 16px 40px rgba(0,0,0,.65)`.
- Regras/divisórias desvanecem nas pontas (gradiente 48px). Botão primário é **outline** accent, nunca preenchido.
- Ícones: Phosphor (no protótipo foram usados glifos ✎ ✓ → ↗ ‹ ›; substituir por Phosphor: PencilSimple, Check, ArrowRight, ArrowSquareOut, CaretLeft, CaretRight).

## Assets
Nenhuma imagem. Fonte Inter via Google Fonts (importada em `styles.css`).

## Files
- `Gestor WL.dc.html` — protótipo completo (template + lógica JS na mesma página).
- `styles.css` — tokens e classes do design system Nocturne.
