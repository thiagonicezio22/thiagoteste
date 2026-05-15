# Setup UAZAPI da Giulia — passo a passo

A Giulia precisa de uma **instância UAZAPI nova** com um **chip de WhatsApp dedicado**. Não dá pra reusar a instância do Julian (5511971482204) porque a Giulia conversa com você no privado e enviaria como se fosse atendimento ENG.

## Pré-requisitos

- Conta UAZAPI já paga (R$139/mês, até 100 instâncias — você tem 6 ativas, sobra muito)
- Um chip de celular novo (ou um número WhatsApp que você não usa pra mais nada)

## Passo 1 — Criar instância no painel UAZAPI

1. Acesse `https://uazapi.dev/interno?p=conecte` e faça login (código de acesso por email)
2. Clique em **"Nova instância"** ou equivalente
3. Nome: `Giulia` (ou `Giulia - Assistente Thiago`)
4. Anote o **TOKEN** que aparece após criação — formato UUID parecido com `a899bc3f-db63-436f-9047-f291d4a22ea3`

## Passo 2 — Conectar chip via QR Code

1. Na instância recém-criada, clique em **"Conectar"** ou **"QR Code"**
2. No chip novo, abra o WhatsApp e vá em **Configurações → Aparelhos conectados → Conectar um aparelho**
3. Escaneie o QR code do painel UAZAPI
4. Aguarde o status mudar pra **"connected"**
5. Anote o **número da Giulia** (do chip que você acabou de conectar) — vai precisar pra mandar mensagem pra ela

## Passo 3 — Configurar webhook de mensagens

Ainda no painel UAZAPI, na instância Giulia:

1. Vá em **Webhooks** ou **Configurações → Webhooks**
2. Configure assim:

| Campo | Valor |
|---|---|
| URL | `https://whats-n8n.ghikuu.easypanel.host/webhook/giulia-msg` |
| Método | `POST` |
| Eventos | `messages` (recebimento) |
| Excluir grupos | `isGroupYes` = sim |
| Excluir fromMe | sim (não capturar msgs que a Giulia mandou) |

3. Salve

## Passo 4 — Deploy dos secrets nos workflows

Volte pro shell na pasta `/home/user/thiagoteste`:

```bash
cd /home/user/thiagoteste
chmod +x scripts/*.sh

# Se for a primeira vez:
cp .env.example .env
# Edite .env e preencha N8N_API_KEY, GIULIA_UAZAPI_TOKEN (que voce acabou de copiar) e GIULIA_GEMINI_API_KEY

set -a; source .env; set +a
./scripts/deploy-secrets.sh
```

Saída esperada:
```
Atualizando GIULIA - 01 Pipeline (Tm1Ec80tegOqWS4N)...
  OK
Atualizando GIULIA - 02 Scheduler (sl6gOYuAIwvCRvOP)...
  OK
Secrets aplicados nos 2 workflows. Proximo: ./scripts/activate-giulia.sh
```

## Passo 5 — Ativar

```bash
./scripts/activate-giulia.sh
```

## Passo 6 — Testar

Do seu WhatsApp pessoal (5511964486564) manda pro número da Giulia:

1. `oi giulia` — ela deve responder.
2. `me lembra daqui a 2 minutos de testar isso` — espera 2 min, deve chegar "Lembrete: testar isso".
3. `anota: melhorar prompt julian com few-shot examples, tag projetos` — confirma que salvou.
4. `quais ideias eu tenho?` — lista o que foi salvo.

## Se algo der errado

- **Não responde nada:** verifica logs em n8n `https://whats-n8n.ghikuu.easypanel.host` → Executions do workflow `GIULIA - 01 Pipeline Assistente Pessoal`
- **Webhook não dispara:** confere se o webhook tá ativo no UAZAPI e se URL bate certinho
- **Erro 401 ao enviar:** token errado no workflow, rodar `deploy-secrets.sh` de novo
- **Lembrete não chega:** confere `GIULIA - 02 Scheduler` está ativo. Executa pelo painel n8n manualmente uma vez pra testar.

## Como pausar a Giulia

```bash
./scripts/deactivate-giulia.sh
```

Os dados ficam intactos no banco. Pra retomar: `./scripts/activate-giulia.sh`.
