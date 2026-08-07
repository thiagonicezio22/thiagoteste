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
