# Migração do n8n: SQLite → Postgres (roteiro, 13/09/2026)

## Por quê

Três episódios em 5 semanas de "Timeout waiting for lock
SqliteWriteConnectionMutex" / "Task request timed out" (07/08, 12/09 e
13/09). Em 12/09 o briefing das 07:00 não saiu pros 3 donos. Medição de
13/09 (últimas 1.500 execuções guardadas): **1.257 são erros**, sendo
978 do `05 - Audio Poller & Transcriber` (projeto Julian, cron de **20 s**)
e 238 do `HZ - Lauren Pipeline v1` (tick de **5 s**). Cada erro grava uma
execução inteira no SQLite; o arquivo único é o gargalo. Postgres resolve
o lock; reduzir a cadência dos dois workflows acima reduz a carga.

## O que já está pronto (feito pela API)

- Banco **`n8n`** e role **`n8n`** criados no Postgres do Easypanel
  (host interno `10.11.0.15`, porta 5432, Postgres 17). Senha em
  `giulia_config` chave `N8N_DB_PASSWORD` (não está neste arquivo).
- Snapshot de todos os 51 workflows (id, nome, ativo):
  `ops/n8n-snapshot-2026-09-13.json` — é o gabarito da verificação final.
- Todos os workflows GIULIA versionados em `workflows/` com placeholders;
  o `deploy-workflows.sh` re-publica qualquer um pelo id.

## O que só o Thiago consegue (Easypanel, ~15 min)

Tudo abaixo é no serviço **n8n** do projeto `whats` no Easypanel.
Fazer num horário calmo (fora das 07:00/08:00/17:00/21:00 BRT).

**1. Exportar (console do container, aba "Console")**
```bash
mkdir -p /home/node/.n8n/export
n8n export:workflow   --all --output=/home/node/.n8n/export/workflows.json
n8n export:credentials --all --decrypted --output=/home/node/.n8n/export/credentials.json
ls -la /home/node/.n8n/export/
```
`/home/node/.n8n` é o volume — sobrevive ao redeploy. `/tmp` não.

**2. Variáveis de ambiente (aba "Environment")** — adicionar, sem
remover as existentes (em especial **`N8N_ENCRYPTION_KEY`**, que precisa
continuar igual):
```
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=10.11.0.15
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=<valor de N8N_DB_PASSWORD na giulia_config>
DB_POSTGRESDB_SCHEMA=public
```
Salvar → o Easypanel redeploya. O n8n sobe **vazio** (cria o schema no
Postgres sozinho).

**3. Recriar o dono** — abrir `whats-n8n.ghikuu.easypanel.host`: tela
de setup → mesmo e-mail/senha de antes.

**4. Importar (console de novo)**
```bash
n8n import:credentials --input=/home/node/.n8n/export/credentials.json
n8n import:workflow   --input=/home/node/.n8n/export/workflows.json
```
O import preserva **ids** de workflows e credenciais (por isso NÃO usar a
API pra importar — ela gera ids novos e quebra `errorWorkflow`, o deploy
script e os webhooks por id).

**5. Reiniciar o serviço** (botão Restart) — os workflows marcados como
ativos no export voltam a registrar cron/webhook/IMAP.

**6. Nova API key** — Settings → n8n API → Create → colar no chat. A
antiga morre com o SQLite.

## Verificação (eu faço, com a key nova)

1. `GET /workflows` = 51 workflows, 45 ativos, ids iguais ao snapshot;
   os 18 GIULIA ativos, WF15 Error Handler ativo.
2. Credenciais: `PostgreSQL Julian`, `Email Thiago IMAP`, `Email Thiago
   SMTP` existem com os mesmos ids (workflows referenciam por id).
3. Ponta a ponta: mensagem de teste no WF01, e-mail de teste no WF18,
   `giulia-briefing-tick` NÃO (mandaria briefing duplicado).
4. `giulia_erros_log` sem "Sqlite" por 24 h.

## Rollback

Remover as 7 variáveis `DB_*` e redeployar: o n8n volta a ler o
`database.sqlite` do volume, intacto. Nada é apagado na migração.

## Depois (opcional, decisão do Thiago)

- `05 - Audio Poller & Transcriber`: cron 20 s → 60 s (3× menos
  escrita; ele falha ~15% das vezes com "connection aborted" no Chatwoot).
- `HZ - Lauren Pipeline v1`: tick 5 s → 15 s.
- Migrar também executions? Não — retenção curta, sem valor.
