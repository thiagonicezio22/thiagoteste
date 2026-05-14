# Giulia — Assistente Pessoal WhatsApp do Thiago

Secretária virtual rodando no mesmo n8n da ENG Soluções, **completamente isolada** do sistema Julian/WF18/19/20.

## O que a Giulia faz

Você manda mensagem pra ela no WhatsApp e ela:
- **Salva ideias** — "anota essa: trocar bomba do tanque grande, tag projetos"
- **Cria lembretes** — "me lembra amanha 9h de ligar pro Antonio" (envia mensagem na hora marcada)
- **Agenda mensagens pra terceiros** — "manda pro Ismar segunda 8h: bom dia, novidades do orçamento?"
- **Envia mensagens agora** — "manda pra Julia: o cliente X ligou pedindo follow-up"
- **Lista o que está salvo** — "quais lembretes eu tenho?", "minhas ideias com tag projetos"
- **Conversa normal** — quando não é nenhum dos acima

Ela usa **Gemini 2.5 Flash** (já configurado no projeto) pra entender o que você quer e escolher a ação.

## O que foi criado (separado do ENG)

### Postgres — 5 tabelas novas (prefixo `giulia_`)
| Tabela | Função |
|---|---|
| `giulia_ideias` | Anotações com tags |
| `giulia_lembretes` | Lembretes com data/hora e recorrência opcional |
| `giulia_mensagens_agendadas` | Mensagens pra terceiros agendadas |
| `giulia_contatos` | Agenda de números ("Ismar" → 5511919695008) |
| `giulia_memoria` | Histórico das conversas com a Giulia |

Nenhuma tabela existente foi alterada. `julian_memory`, `monitoramento_vendedor`, `julian_audio_processed`, `delivery_logs` continuam intactas.

### n8n — 2 workflows novos (inativos)
| ID | Nome | Função |
|---|---|---|
| `Tm1Ec80tegOqWS4N` | `GIULIA - 01 Pipeline Assistente Pessoal` | Webhook UAZAPI → Gemini decide ação → executa |
| `sl6gOYuAIwvCRvOP` | `GIULIA - 02 Scheduler Lembretes` | Cron 1min → dispara lembretes/mensagens pendentes |

Nenhum workflow ENG foi tocado (Pipeline Julian, WF18, WF19, WF20 etc. seguem rodando).

## ⚠️ Setup que falta (manual) — 4 passos

### 1. Criar nova instância UAZAPI pra Giulia

No painel UAZAPI (`https://uazapi.dev/interno?p=conecte`):

1. **Criar instância nova** com nome `Giulia`
2. **Conectar um chip novo** via QR Code (precisa de um número de WhatsApp dedicado pra Giulia — chip novo de preferência)
3. **Copiar o token** da instância recém-criada

### 2. Substituir o token nos workflows

O placeholder `__GIULIA_UAZAPI_TOKEN__` aparece **3 vezes** distribuído entre os 2 workflows:

- Workflow `Tm1Ec80tegOqWS4N` → nodes `Enviar Pra Terceiro UAZAPI` e `Responder Thiago UAZAPI`
- Workflow `sl6gOYuAIwvCRvOP` → nodes `Enviar Lembrete UAZAPI` e `Enviar Msg UAZAPI`

Use o script helper:

```bash
cd /home/user/thiagoteste
GIULIA_TOKEN="seu-token-uazapi-novo-aqui" ./scripts/deploy-token.sh
```

Ou faça pelo painel n8n editando cada node manualmente.

### 3. Configurar webhook UAZAPI pra Giulia

Na instância Giulia no UAZAPI, configure o webhook de mensagens:

- **URL:** `https://whats-n8n.ghikuu.easypanel.host/webhook/giulia-msg`
- **Método:** POST
- **Eventos:** `messages` (recebimento de mensagens)
- **Excluir:** `isGroupYes` (não capturar grupos)
- **Excluir:** `fromMe` (não capturar mensagens enviadas pela própria Giulia)

### 4. Ativar os 2 workflows

```bash
./scripts/activate-giulia.sh
```

Ou no painel n8n, ative manualmente os dois `GIULIA - *`.

## Testando

Depois de ativo, manda do seu WhatsApp (5511964486564) pro número da Giulia:

- `oi giulia`
- `anota essa ideia: melhorar prompt do julian com exemplos few-shot`
- `me lembra daqui a 2 minutos de testar isso aqui`
- `quais lembretes eu tenho?`
- `manda pro thiago biologo agora: oi, tudo bem?`

A Giulia responde no mesmo chat. O lembrete deve chegar pra você 2 min depois.

## Como funciona

```
WhatsApp Thiago → UAZAPI Giulia → Webhook n8n
                                       │
                                       ▼
                          [GIULIA - 01 Pipeline]
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
     Carrega memória            Carrega contatos          Chama Gemini com
     últimas 24h                (pra resolver nomes)      system prompt da Giulia
                                                                  │
                                                                  ▼
                                                       Gemini retorna JSON:
                                                       { acao, parametros,
                                                         resposta_pro_thiago }
                                                                  │
                                              ┌───────────────────┼───────────────────┐
                                              ▼                   ▼                   ▼
                                       DB_OP (INSERT/SELECT)  SEND_NOW             REPLY_ONLY
                                       giulia_ideias          (POST UAZAPI         (sem ação,
                                       giulia_lembretes        pra terceiro)        só responde)
                                       giulia_msgs_agendadas
                                              │                   │                   │
                                              └───────────────────┴───────────────────┘
                                                                  ▼
                                                         Formata resposta texto
                                                                  ▼
                                                    POST UAZAPI → Thiago no WhatsApp
                                                                  ▼
                                                       Salva user+assistant em
                                                          giulia_memoria
```

E em paralelo:

```
Cron 1min UTC-4 → [GIULIA - 02 Scheduler]
                          │
        ┌─────────────────┴──────────────────┐
        ▼                                    ▼
Claim lembretes devidos               Claim msgs agendadas devidas
(status='pendente' AND                (mesmo padrão pra
 disparar_em <= NOW() Brasília)        giulia_mensagens_agendadas)
        │                                    │
Marca como 'processando'              Marca como 'processando'
(SKIP LOCKED — sem race)              (SKIP LOCKED)
        │                                    │
        ▼                                    ▼
POST UAZAPI → Thiago                  Wait 30s anti-spam
"Lembrete: descricao"                       │
        │                                    ▼
        ▼                          POST UAZAPI → destinatário
UPDATE status='enviado'                     │
+ se recorrente, INSERT             UPDATE status='enviado'
próximo lembrete
```

## Regras respeitadas (do contexto ENG)

- ✅ Crons em UTC-4 (`*/1 * * * *` roda todo minuto independente de timezone)
- ✅ `maxOutputTokens: 1500` no Gemini (acima do mínimo 800)
- ✅ Webhook `responseMode: onReceived` no pipeline (responde rápido)
- ✅ Parse defensivo do JSON Gemini (strip ```json e ```)
- ✅ `responseMimeType: 'application/json'` no Gemini pra forçar JSON
- ✅ Wait 30s entre mensagens pra terceiros (anti-ban)
- ✅ `FOR UPDATE SKIP LOCKED` no claim (evita duplo envio se houver race)
- ✅ Nenhuma tabela ou workflow existente foi modificado

## Pendências futuras (não bloqueantes)

- [ ] Permitir outros números além do Thiago conversarem com a Giulia
- [ ] Aquecimento automático de contato novo antes de mandar pra terceiro (regra anti-ban)
- [ ] Comando "cancelar lembrete X"
- [ ] Comando "editar ideia Y"
- [ ] Importar contatos da `monitoramento_vendedor` automaticamente
- [ ] Suporte a áudio (transcrever via Whisper) — reaproveitar lógica do WF05
- [ ] Botão de "marcar como feito" nos lembretes (precisa de webhook de leitura)
- [ ] Dashboard simples web pra listar/editar ideias e lembretes

## Arquivos no repo

```
workflows/
  00-GIULIA-Setup-DB.json       # Workflow de setup DB (já executado, mantido por histórico)
  01-GIULIA-Pipeline.json       # Pipeline principal
  02-GIULIA-Scheduler.json      # Scheduler de lembretes/msgs
scripts/
  deploy-token.sh               # Substitui placeholder do token nos workflows do n8n
  activate-giulia.sh            # Ativa os 2 workflows GIULIA
docs/
  setup-uazapi.md               # Passo a passo pra criar instância nova
README.md                       # Este arquivo
```
