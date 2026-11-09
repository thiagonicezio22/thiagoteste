# ✅ CONCLUÍDA em 13/09/2026 ~16:20 BRT (pela sessão "Atendimento ENG")

Verificação desta sessão (GIULIA), 13/09 ~17:10 BRT, com a API key nova:
- 51 workflows, **51 ids iguais** ao snapshot `ops/n8n-snapshot-2026-09-13.json`;
  45 ativos, 0 divergências; 18 GIULIA ativos; WF15 Error Handler ativo.
- Versões dos meus workflows chegaram (WF01 com `Carregar Tarefas`, WF18 com
  loop por e-mail e `RETURNING email_id`).
- Credenciais nos ids antigos: `PostgreSQL Julian` (26 nós), IMAP, SMTP.
  Query real pela credencial: `julian_db` em `evolution-api-db` OK.
- Webhooks `giulia-msg` e `giulia-email` respondem 200.
- Ponta a ponta no WF01 ("minhas tarefas" → resposta certa, memória gravada,
  rastro apagado). `giulia_erros_log` sem nenhum erro após a migração;
  0 lembretes atrasados; `giulia_config` íntegra (15 chaves).
- Restante: 24 h sem "Sqlite" no log (checar 14/09).

---

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

- Serviço Postgres **dedicado** `whats/n8n-db` (postgres:17, db `n8n`,
  user `n8n`, host interno **`whats_n8n-db`**) criado pela API do Easypanel.
  Senha em `giulia_config` (`N8N_DB_PASSWORD`). Conexão n8n → n8n-db
  **testada** (credencial temporária, `select version()` OK, apagada).
- Acesso ao Easypanel pela API (`https://ghikuu.easypanel.host`, token em
  `giulia_config`): variáveis, deploy e restart do n8n saem daqui.
- Snapshot de todos os 51 workflows (id, nome, ativo):
  `ops/n8n-snapshot-2026-09-13.json` — é o gabarito da verificação final.
- Todos os workflows GIULIA versionados em `workflows/` com placeholders;
  o `deploy-workflows.sh` re-publica qualquer um pelo id.

## Divisão (versão com API, 13/09)

- **Thiago (console do n8n no Easypanel):** os 2 exports (passo 1), criar
  o dono (passo 3), os 2 imports (passo 4), gerar a API key (passo 6).
- **Claude (API):** variáveis `DB_*` + deploy (passo 2), restart (passo 5),
  verificação e rollback.

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
DB_POSTGRESDB_HOST=whats_n8n-db
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
