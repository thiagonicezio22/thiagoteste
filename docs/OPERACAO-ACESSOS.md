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

