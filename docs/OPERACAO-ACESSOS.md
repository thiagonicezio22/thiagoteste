# Operação: acessos e recuperação (sem segredos neste arquivo)

> Criado em 07/08/2026, depois de perder o `.env` numa reciclagem de
> ambiente e ter que reconstruir o acesso na mão. Este arquivo NUNCA
> guarda o valor de um token — só ONDE cada um vive e COMO recuperar.

## Mapa de acessos

| O quê | Onde vive | Como recuperar |
|---|---|---|
| N8N_API_KEY | `.env` local (morre com o ambiente) | Thiago gera outra em `whats-n8n.ghikuu.easypanel.host` → Settings → n8n API (1 min). É a chave-mestra de bootstrap. |
| GIULIA_UAZAPI_TOKEN | `.env` + tabela `giulia_config` no Postgres + injetado nos workflows publicados | Com a N8N_API_KEY: ler da `giulia_config` via runner SQL, ou extrair de um nó UAZAPI de qualquer workflow publicado (header `token`) |
| GIULIA_GEMINI_API_KEY | idem | idem — no WF01, nó "Decidir Acao" (`generateContent?key=...`) |
| HOSTINGER_API_TOKEN | `.env` + `giulia_config` | Idem via `giulia_config`; ou Thiago gera novo em hpanel.hostinger.com/api (marcar TODAS as permissões de produto — sem "Hospedagem VPS" o token não executa ações, só lê) |
| EASYPANEL_API_TOKEN | `.env` + `giulia_config` (+ `EASYPANEL_URL`) | Painel → Settings → Usuários → chave do admin. **Usar sempre `https://ghikuu.easypanel.host`** (o `http://76.13.172.146:3000` não passa pelo proxy). API tRPC: `GET /api/trpc/<proc>?input={"json":...}` para queries, `POST` para mutations, header `Authorization: Bearer`. Procs úteis: `projects.listProjectsAndServices`, `services.app.inspectService/updateEnv/updateDeploy/deployService/restartService`, `services.postgres.createService/inspectService`. Cuidado: `inspect` devolve env e senhas em claro — nunca imprimir. |
| N8N_DB_PASSWORD / N8N_DB_HOST | `giulia_config` | Serviço Postgres dedicado `whats/n8n-db` (postgres:17, db `n8n`, user `n8n`, host interno `whats_n8n-db`), criado em 13/09 pela API pra migração do n8n. |

**Bootstrap completo de um ambiente novo:** pedir só a N8N_API_KEY ao
Thiago → criar runner SQL temporário → `SELECT * FROM giulia_config` →
reconstruir o `.env` inteiro. (Definitivo de verdade: colocar os 4 como
secrets do ambiente do Claude Code — recomendado ao Thiago, pendente.)

## Hostinger (VPS)

- API: `https://developers.hostinger.com/api/vps/v1/...`, header
  `Authorization: Bearer <token>`.
- VPS único: **id 1306768** (`srv1306768.hstgr.cloud`, KVM 2: 2 vCPU,
  8 GB RAM, 100 GB, IP 76.13.172.146). Roda Easypanel com n8n, Postgres
  e os projetos antigos (Julian/Lauren).
- Restart: `POST /virtual-machines/1306768/restart` (usado em 07/08 pra
  limpar o task runner saturado). SSH não é alcançável deste ambiente
  (porta 22 bloqueada pelo proxy) e o painel Easypanel exige login do
  Thiago — ações de dentro do servidor são sempre dele.
- `*.easypanel.host` resolve pro edge compartilhado do Easypanel
  (72.251.7.x), NÃO pro IP do VPS — incidente de 01/08 foi desse edge.

## Higiene aprendida (não repetir)

- Runner SQL temporário: criar, usar, **desativar e deletar** na hora.
- Token de leitura ≠ token de gestão na Hostinger: teste com um POST
  antes de prometer ação.
- n8n loga pouco histórico (retenção curta, projetos antigos inundam o
  SQLite): auditoria de erros confiável = `giulia_erros_log` no Postgres.


## Reciclagem do ambiente (04/09) — terceira perda do `.env`

Trocar de modelo (`/model`) recicla o container: some `.env`, scratchpad e
variáveis; o repo volta do GitHub. Bootstrap levou ~5 min com a
N8N_API_KEY nova: runner SQL → `giulia_config` → `.env` (só as 7 chaves
operacionais; as chaves de imagem `CAPA_*`/`VOUCHER_*`/`CARTAO_*` ficam
só no banco). Runner SQL criado pela API precisa de `webhookId` no nó
Webhook, senão o n8n ativa mas não registra a rota (404).

**Pendente com o Thiago:** cadastrar `N8N_API_KEY`, `GIULIA_UAZAPI_TOKEN`,
`GIULIA_GEMINI_API_KEY`, `HOSTINGER_API_TOKEN` e `GIULIA_EMAIL_SENHA` como
variáveis do *environment* no Claude Code web — acabam com esse passo.

## Registro: zerar tarefas do Thiago (04/09)

16 tarefas pendentes (14 de 07/08 com 49–59 cobranças cada, #70 e #71)
marcadas `cancelada` a pedido dele. Cópia integral em
`giulia_tarefas_bak_20260904` (reverter: `UPDATE giulia_tarefas SET
status='pendente' WHERE id IN (SELECT id FROM giulia_tarefas_bak_20260904)`).

## Menos ruído (04/09) — WF06 e WF11

- **WF06 Cobrar Tarefas**: era 4×/dia (8h/12h/16h/19h) e tarefa atrasada
  voltava a cada 4h — as 14 tarefas de 07/08 chegaram a 59 cobranças cada.
  Agora 2×/dia (8h/17h), atrasada/hoje a cada 8h, normal 24h, e tarefa já
  cobrada **6+ vezes** passa pra 72h com aviso "se não vai rolar, manda
  'cancela a X'".
- **WF11 Fechamento do Dia**: não manda mais o fechamento quando não há
  nada (sem gasto, sem feito, sem pendência, sem agenda) — antes era um
  "nenhum registrado / nenhuma" todo dia desde que os gastos pararam
  (último gasto 24/07).
- **Contas a pagar**: 2 pendentes vencidas em agosto (Aluguel da barbearia
  1.800 / Internet do escritório 129,90) canceladas a pedido; cópia em
  `giulia_contas_pagar_bak_20260904`.

## Deploy: salvaguarda (04/09)

Um 502 do edge no meio do `deploy-workflows.sh` deixou o **WF17 Financeiro
29 min inativo** (o script desativa, o PUT falha, o script morre). Agora:
`trap EXIT` reativa o workflow pendente, PUT com 3 tentativas em 5xx, e
auditoria final que falha se qualquer workflow da lista estiver inativo.
Lição: rodar o script sem `| grep` no meio — o pipe escondeu o exit 1.

## Incidente 12/09 06:55–07:12 BRT — task runner saturado

`giulia_erros_log`: "Task request timed out after 60 seconds" em Code nodes
de 6 workflows + "Timeout waiting for lock SqliteWriteConnectionMutex".
Briefing das 07:00 (WF07) falhou pros 3 donos; scheduler (WF02) errou 7×
na janela. Recuperou sozinho às ~07:12 (Code node de teste em 3 s, crons
das 08:00 OK). Briefing reenviado às 08:28 pelo webhook `giulia-briefing-tick`
(manda pra todos os donos ativos, sem claim — só usar quando o do dia NÃO
saiu). Atenção: WF02 tem `saveDataSuccessExecution: none` — ausência de
execuções na lista NÃO significa que parou; confira `Lembrete enviado` na
memória. Mesmo sintoma de 07/08 (VPS reiniciado na época) — se repetir,
o próximo passo é migrar o n8n de SQLite pra Postgres.

## 13/09 — de onde vem a pressão no SQLite (e um erro meu)

Medição via API (1.500 execuções guardadas): 1.257 erros, 978 do
`05 - Audio Poller & Transcriber` (Julian, cron 20 s, ~15% de falha com
"connection aborted" no Chatwoot) e 238 do `HZ - Lauren Pipeline v1`
(tick 5 s). Roteiro da migração: `docs/MIGRACAO-N8N-POSTGRES.md`.
Banco/role `n8n` já criados; senha em `giulia_config` (`N8N_DB_PASSWORD`).

Erro meu: desativei o Audio Poller por ~2 min achando o alvo morto — o
Chatwoot respondeu 401 (vivo) e o script interpretou como "não responde".
Reativado na hora. Lição: 401 ≠ offline; e workflow de outro projeto só
se mexe com o Thiago sabendo.

## Mapa dos serviços (Easypanel, projeto `whats`, 13/09)

n8n (`n8nio/n8n:2.8.3`, volume `data` em `/home/node/.n8n`,
`N8N_ENCRYPTION_KEY` mora no arquivo de config do volume; **desde 13/09
16:20 roda em Postgres** no serviço `n8n-db`), chatwoot + chatwoot-db +
chatwoot-redis + sidekiq, **evolution-api + evolution-api-db + evolution-api-redis
(⛔ NUNCA parar: o `evolution-api-db` é o "PostgreSQL Julian" — banco
`julian_db` com as tabelas giulia_*, orcamentos, lauren_*; o IP interno muda
a cada restart, por isso a credencial usa o hostname)**, gotenberg, n8n-db.
Projeto `post` está vazio. (Correção: em 13/09 eu tinha anotado chatwoot-db
como dono das tabelas — errado; o handoff da sessão ENG confirmou evolution-api-db.)

## n8n em Postgres — regras novas (handoff ENG, 13/09)

- **API key do n8n mudou** na migração (owner novo). A antiga (`sub 91b9f758…`)
  está morta. A nova vive só no `.env` desta sessão — se o ambiente reciclar,
  pedir ao Thiago de novo (Settings → n8n API). Nunca em docs.
- Restart do n8n pelo Easypanel (API/MCP): **`stopAppService` →
  `deployAppService` → `startAppService`** — sem o `start` o serviço fica
  parado (custou 9 min de queda em 13/09). `deploy.zeroDowntime=false`.
- Env novas: `EXECUTIONS_DATA_PRUNE=true`, `EXECUTIONS_DATA_MAX_AGE=48`,
  `EXECUTIONS_DATA_PRUNE_MAX_COUNT=3000`, `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`.
  Histórico de execuções começou do zero; sucesso não é salvo nos pollers.
- SQLite antigo fica no volume por 30 dias (rollback); pasta
  `/home/node/.n8n/mig/` será apagada — não usar como fonte.
- Easypanel também tem MCP (`/api/mcp`, Streamable HTTP, tools
  `search_procedures`/`execute_query`/`execute_mutation`) — daqui só pelo
  domínio HTTPS `ghikuu.easypanel.host`. `Execute Command` bloqueado no n8n 2.x.
- Vendedores ENG: `5511919695008`=Leticia, `5511997357793`=Beatriz; Felipe
  (`5511944985003`) bloqueado de envio em 9 workflows — não readicionar.


## Auditoria completa de 13/10/2026 (relatório: `ops/auditoria-2026-10-13.json`)

Feita em modo somente leitura por 8 agentes em paralelo + 8 verificadores
céticos (147 itens: 100 OK, 39 WARN, 2 FAIL, 6 não verificáveis). Ambiente
tinha sido reciclado de novo (4ª vez); recuperado com a API key de 13/09
e o token do Easypanel que estavam no histórico da conversa.

**Infra saudável:** 51 workflows / 45 ativos = gabarito de 13/09; 18
GIULIA ativos; WF15 ativo; briefing, cobrança, fechamento, scheduler,
sumarização e horários rodando; zero erro de SQLite/lock desde a migração;
Easypanel com todos os serviços enabled; 18/18 workflows GIULIA ao vivo
idênticos ao repo (nenhuma edição manual desde 13/09).

**FAIL 1 — inscrição em expedição (Jota):** `inscrever_expedicao` recusa
pessoa fora da base ("Nao achei essa pessoa na tua base"); em 28/08 o Jota
tentou 4× inscrever "Alexandre Smitch", a IA PROMETEU cadastrar na hora e
falhou de novo; ele disse "Já enroscamos" e nunca mais usou (45 dias, modo
eco). `giulia_expedicao_inscritos` = 0 no sistema inteiro. Correção: no
Decidir Acao, candidatos=0 + nome informado → INSERT em giulia_pessoas e
seguir; alinhar o prompt.

**FAIL 2 — briefing de 27/09 não saiu** para Thiago e Jota: UAZAPI fora
do ar às 07:00 BRT, nó `Enviar UAZAPI` do WF07 sem retryOnFail, memória é
gravada DEPOIS do envio → execução abortou inteira. Único dia sem briefing
em 30 dias. Correção: retryOnFail (3×, 30–60 s) nos nós de envio UAZAPI de
WF07/WF11/WF06/WF02.

**WARNs que viram tarefa:**
- WF15 `Montar Alerta` só lê `j.execution.*`; erro de TRIGGER (IMAP do
  WF18 caindo/reconectando, 16 eventos/21 linhas em 30 dias) vira
  "node ? / erro desconhecido / Exec ?" e alerta inútil ao Thiago (16 de
  18 alertas do mês). Ler também `j.trigger.error`. Dedup de 30 min falha
  em erros concorrentes (5 pares de alerta duplicado) → advisory lock.
- `GIULIA_SHEETS_DOC_ID/TAB/CRED_ID` não estão no `.env` → o deploy de
  13/09 colocou os placeholders literais em produção no WF03 (Append
  Sheets: documentId e credencial) e no WF01 (link da planilha no
  resumo de gastos). Latente: próximo gasto do Thiago = erro a cada 5 min
  no WF03. Setup em docs/setup-sheets-gastos.md.
- Crons de hora fixa rodam no fuso da instância (America/New_York, sem
  GENERIC_TIMEZONE): em **01/11/2026** (fim do DST nos EUA) briefing vai
  pra 08:00 BRT, cobrança 09:00/18:00, contas 09:30, rotina 13:00. Fixar
  `settings.timezone=America/Sao_Paulo` nos 5 workflows (WF04/05/06/07/09).
- Notificação de e-mail com mojibake ("OlÃ¡", 63% dos corpos): WF18 não
  decodifica charset/quoted-printable do corpo.
- Briefing do Thiago repete há 50–76 dias 4 reuniões `pendente_aprovacao`
  (ids 9–12); WF07 sem corte de idade.
- Expedição #4 (29/08) segue "aberta" — não existe fechamento automático.
- CRM do Jota congelado desde 17/07: 1.458 pessoas, 73 nomes duplicados,
  52 com datas de nascimento divergentes (cartões repetidos já saíram);
  reenvio da planilha nunca veio; 150 registros da janela LLM ainda lá.
- Resumos de memória do WF04 truncados (~150 chars) e com dono trocado
  (prompt diz "Thiago" para qualquer dono).
- Retenção de execuções do n8n = 48 h (`EXECUTIONS_DATA_MAX_AGE=48`):
  erros de 30 dias só no `giulia_erros_log`. Runner SQL gera ~100
  execuções por auditoria — contam no teto de 3.000.
- Token Hostinger inválido (401) desde ago; só serve pra restart do VPS.
- Settings de retenção (saveDataSuccessExecution) não são versionados.
- Uso: Thiago 10 msgs em 5 semanas, 0 gastos desde 24/07, planilhas
  financeiras defasadas/não enviadas desde 21/08; André 0 msgs desde
  ~23/08 (só recebe 3 automáticas/dia, 9 tarefas de julho intocadas, pedido
  de "me ligue" de 19/09 expirou sem confirmação); Jota 0 msgs desde 28/08.
- Workflow não-GIULIA `18 - Monitor Atendimento Vendedor` foi editado em
  13/10 13:02 UTC fora do repo (não foi esta sessão — conferido no log
  dos agentes).

## Correções da auditoria — 13/10/2026 (deploy no mesmo dia)

Aprovadas pelo Thiago ("pode fazer tudo"). Patch por âncora + revisão
adversarial (4 revisores + 4 céticos, 23 achados, 0 bloqueios) + testes.

- **Fuso dos crons**: `settings.timezone = America/Sao_Paulo` em WF04/05/06/
  07/09 e expressões reescritas em hora de Brasília (07:00 briefing, 08/17
  cobrança, 08:30 contas, 12:00 rotina, dom 05:00 sumarização). Não muda
  mais com o horário de verão dos EUA.
- **Briefing (WF07) tolerante a falha**: `Enviar UAZAPI` com
  `onError=continueRegularOutput` (um destinatário falhando não derruba os
  outros) e o nó seguinte virou `Salvar Memoria ou Reenfileirar`: item com
  erro entra em `giulia_mensagens_agendadas` (+2 min) e o WF02 reenvia.
  **Não** usar `retryOnFail` em nó de envio com vários itens: o n8n
  re-executa o nó inteiro (reenvia pra quem já recebeu) e limita a espera
  a 5 s / 5 tentativas (revisão de 13/10).
- **WF15 Error Handler**: lê `j.trigger.error` (erro de trigger, sem
  execução) — node `trigger(<mode>)` e mensagem real (+ `cause` quando o
  n8n serializar); erro de trigger de e-mail alerta no máximo 1×/12 h com
  texto próprio ("confere a credencial IMAP"); `pg_advisory_xact_lock` no
  início do SQL serializa handlers concorrentes (fim dos alertas em
  dobro); `%`/`_` do nome escapados no LIKE da dedup.
- **WF18**: corpo com mojibake ("OlÃ¡") reconvertido latin-1→UTF-8 só
  quando sem perda; `&#N;` via `fromCodePoint`; NUL removido antes do SQL.
- **WF11**: CTE `fecha_exp` marca `concluida` expedição com
  `COALESCE(data_fim, data_ini) < hoje(SP) - 1` a cada hora.
- **WF07**: briefing só lista reunião `pendente_aprovacao_thiago` criada
  nos últimos 14 dias; ids 9–12 (jul/ago) marcadas `dispensada`.
- **WF03/WF01 Sheets**: sem `GIULIA_SHEETS_DOC_ID`/`_CRED_ID` no `.env` o
  sync sai em silêncio e o link da planilha não aparece (antes: erro a
  cada 5 min e link quebrado). Para ligar: criar a credencial "Google
  Sheets Giulia", definir as 3 vars (docs/setup-sheets-gastos.md) e
  redeployar WF01+WF03.
- **WF04**: resumo usa o nome do dono (não mais "Thiago" para todos) e
  ignora partes `thought` da resposta do Gemini (resumos vinham truncados
  com trecho de raciocínio).
- **WF01 inscrição em expedição**: ver docs/FEATURE-CRM-JOTA.md.
- Pendências que continuam com o Thiago: token Hostinger (401), planilha
  de gastos (Sheets), 9 tarefas de julho do André, reenvio da planilha do
  CRM do Jota.

### Validação pós-deploy (13–14/10)

Ao vivo com o número do Thiago (rastros apagados): criar expedição de
teste → "inscreve o Fulano Auditoria Teste" → cadastrou como piloto (com
`observacoes` de rastro) e inscreveu; 2ª vez "já estava inscrito" sem
duplicar; erro proposital num workflow temporário → WF15 gravou node e
mensagem reais e criou 1 alerta (sem dobro); timezone `America/Sao_Paulo`
e crons novos confirmados nos 5 workflows. Dia seguinte (14/10): cobrança
rodou 17:00 e 08:00 BRT, briefing 07:00 pros 3 donos (texto "Dia livre"
quando não há nada — não começa com "Resumo"), expedição #4 → `concluida`,
0 erros e 0 alertas em 24 h, lembretes do André nos horários de NY.
Mojibake: a 1ª versão não pegou o Nubank de 14/10 (nbsp); corrigido e
redeployado (WF18) no mesmo dia. 18/18 GIULIA ativos, 0 temporários.

## 15/10/2026 — n8n atualizado pela sessão ENG (2.8.3 → 2.42.7) e patch v3/v4

**O que aconteceu (14/10 ~20:20 BRT, sessão ENG):** upgrade do n8n para
2.42.7, app `evolution-api` e `evolution-api-redis` desligados no Easypanel
(o `evolution-api-db`, que é o banco da GIULIA, continua ligado; a GIULIA
não usa o app Evolution — WhatsApp é UAZAPI), banco inalcançável por ~2 min
(23:23–23:28 UTC; WF02 falhou 2×, WF15 não conseguiu registrar). Dois
workflows `CK-*` foram criados e depois removidos por eles.

**Regressão da versão nova:** ao resolver `={{ $json.sql }}` o nó Postgres
passa o valor por um `String.replace`, que consome `$'`, `$$`, `$&`, `` $` ``.
O escape de 04/09 (`' || '$' || '`) virou veneno: e-mail da Dixieply com
"$36.05" (14/10 20:54, 3 PDFs, para o André) derrubou o `Salvar Email` e
foi perdido; e o regex fixo `'[0-9]+$'` do WF12 quebrou — **nenhum
orçamento em PDF saiu entre 14/10 20:20 e 15/10 02:00**.

**Patch v3+v4 (commits 7836d59..HEAD), revisado por 3 revisores + 3
céticos (18 achados, 2 bloqueios corrigidos antes do deploy):**
- `esc()` → `' || chr(36) || '` (runs de `$` viram `repeat(chr(36), n)`) nos 4
  Code nodes do WF18, `Montar SQL Memoria`/`Memoria Anexo` do WF01 e nos 2
  literais de descrição do WF02; WF12 `substring(numero from '[0-9]+' || chr(36))`.
- WF01 `Decidir Acao`: parâmetros do Gemini passam por `_san` (espaço após
  `$` quando seguido de dígito/`'`/`&`/`` ` ``/`$`: "R$1500" → "R$ 1500") — cobre
  os ~80 literais sem mexer nos casts tipados (`::jsonb`, `::TIMESTAMP`).
- WF01 expedição: nome vazio/curto → `acao_tipo='REPLY_ONLY'` (antes ficava
  `DB_OP` e o roteador executava `DELETE ... ILIKE '%%'`); `cancelar_inscricao`
  e `marcar_pago_expedicao` só agem com **1** candidato (nome parcial "Ana"
  casava 3) e listam os nomes quando há mais.
- WF18: 1 aviso por e-mail mesmo com N anexos (`Gravar Anexos` devolve 1
  linha; `queryBatching=independently` + `continueRegularOutput`); `Preparar
  Anexos` checa o id antes do pairedItem.
- WF15: `Salvar Alerta` com `continueErrorOutput` → `Limitar Aviso Direto`
  (1 a cada 30 min via `$getWorkflowStaticData`, que mora no `n8n-db`) →
  `Avisar Direto UAZAPI` (Thiago fica sabendo quando o banco cai).
- WF13/14/16: `retryOnFail` removido dos envios multi-item.
- Jota: duplicata "CLAUDIO JOSE DO AMARAL" (id 317) apagada — evitava 2
  cartões em 20/10.

**Validação (15/10 02:03–02:10 UTC, rastros apagados):** deploy 18/18;
13/13 ao vivo (e-mail com `$36.05`/`$$`/`$'` + 2 PDFs salvo e avisado 1×;
ideia com `$36.05` e "R$1500 e os $'" gravada; auto-cadastro; guarda "J";
nome ambíguo não apaga; nome completo cancela só ela). E-mail da Dixieply
**recuperado** (id 268, 3 PDFs) pelo clone `SINCE 14-Oct-2026`; Thiago
avisado por `giulia_mensagens_agendadas`.

**Fica pra depois (achados CORRIGIR_DEPOIS da revisão):** WF13/14/16 no
padrão WF07 (reenfileirar); corpo com >~2.100 `$` isolados estoura
`max_stack_depth` (só spam patológico); `Decidir Acao` ainda usa `esc()` só
de aspas (o `_san` cobre o risco real); WF04 converte `periodo_inicio` no
fuso do processo; André recebe briefing às 06:00 NY e passará a 05:00 em
01/11 (cron único em SP); 9 tarefas de julho do André; reenvio da planilha
do Jota; `saveDataSuccessExecution=all` em WF05/WF09 se quiser prova de
execução diária.
