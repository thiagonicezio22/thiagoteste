# Assistente WhatsApp do Thiago (n8n + Gemini + UAZAPI + Postgres)

Sistema em produção: assistente pessoal multi-usuário no WhatsApp
("Thiago Nicezio"), vendida como produto. 17 workflows GIULIA no n8n
self-hosted, dados no Postgres, envio via UAZAPI, IA Gemini (roteador
flash/pro). O dono é Thiago (5511910441709).

## Leia antes de operar

- **docs/OPERACAO-ACESSOS.md** — onde vive cada credencial e como
  recuperar acesso num ambiente novo (o `.env` morre com a reciclagem;
  bootstrap = N8N_API_KEY do Thiago → tabela `giulia_config`).
- **docs/FEATURE-FINANCEIRO.md** — módulo de planilhas financeiras,
  EXCLUSIVO do número do Thiago (gate em 3 camadas; nunca afrouxar).
- **docs/MANUAL-IA-FINANCEIRO.md** — regras das 4 planilhas dele.
- **docs/TRIALS-ACESSO.md** — trials de pilotos e modo eco.
- **docs/FEATURE-EMAIL.md** — email contato@thiagonicezio.com (só Thiago).
- **docs/FEATURE-CRM-JOTA.md** — CRM de aniversários do Jota Expedições.
- **docs/FEATURE-TAREFAS.md** — lista/cobrança/limpeza de tarefas (posição
  numerada = mesma ordem em todo lugar; "limpa todas", "cancela a 1, 2 e 3").

## Regras de ouro do projeto

1. A assistente NUNCA fala com número que o Thiago não cadastrou.
2. Testes que geram mensagem real: avisar o Thiago antes, limpar
   rastros depois (memoria/tarefas/lembretes de teste).
3. Deploy sempre via `scripts/deploy-workflows.sh` (injeta secrets,
   verifica reativação). WF15 Error Handler NUNCA pode ficar inativo.
4. Runner SQL temporário: criar → usar → desativar → DELETAR.
5. Nunca commitar `.env` nem tokens (repo tem placeholders
   `__GIULIA_*__` nos workflows).
6. Mudança em workflow: patch por âncora com assert de unicidade +
   `node --check` no jsCode antes de deployar; testar ao vivo depois.
7. Fuso: memoria/created_at em UTC naive (exibir com -3h);
   lembretes/disparar_em no horário LOCAL do dono, sem conversão.
