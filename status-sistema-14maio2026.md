# Sistema de Atendimento ENG — Status 14/05/2026

## ARQUITETURA ATUAL

### Julian (IA) — atendimento WhatsApp principal
- Instância UAZAPI: ENG 5511971482204 (`engsolucao.uazapi.com`)
- Modelo: Gemini 2.5-flash
- Roteia handoff direto pro celular corporativo do vendedor (não usa Chatwoot pra atribuição)
- Cliente recebe aviso "a partir de agora quem cuida é o X"
- Conversa marcada como `transferido_externo` e fechada

### 6 instâncias UAZAPI ativas (plano R$139/mês, até 100 instâncias)
| Vendedor | Número | Função |
|---|---|---|
| ENG (Julian) | 5511971482204 | Atendimento IA principal |
| Ismar | 5511919695008 | Comercial |
| Thiago Biólogo | 5511919361449 | Comercial (alguns estados) |
| Julia | 5511997357793 | Pós-venda / Suporte |
| Elaine | 5511972387708 | Financeiro (substituiu Felipe) |
| Felipe | 5511944985003 | Gestor (não atende mais cliente) |

### Equipe que recebe relatórios
| Nome | Número | Papel |
|---|---|---|
| Thiago Nicezio | 5511964486564 | Sócio / projetos (você) |
| Felipe | 5511944985003 | Gestor |
| Antônio | 5511951604808 | Dono |

---

## CRONOGRAMA DE RELATÓRIOS

### Diários
| Horário | O que | Pra quem |
|---|---|---|
| **12h seg-sex** | WF15 Snapshot meio-dia | Gestores |
| **19h seg-sex** | WF19 Relatório Diário (5 individuais espaçados 5min) | Conforme abaixo |

### WF19 — 5 relatórios individuais (refatorado 14/05 com Wait nodes)
| Ordem | Operador | Tipo | Destinatários |
|---|---|---|---|
| 1 | Ismar | Comercial | Thiago Nicezio + Felipe + Antônio |
| 2 | Thiago Biólogo | Comercial | Thiago Nicezio + Felipe + Antônio |
| 3 | Julia | Suporte | Thiago Nicezio + Felipe + Antônio |
| 4 | Elaine | Sigiloso | SÓ Thiago Nicezio + Antônio |
| 5 | Felipe gestor | Sigiloso | SÓ Thiago Nicezio + Antônio (Felipe NÃO recebe o dele) |

### O que cada relatório traz
- **Comercial:** clientes atendidos, mensagens, orçamentos enviados (lista), fechamentos detectados (cliente+produto+valor), taxa conversão, tempo médio resposta, score IA, tom geral, palavras erradas, erros português, leads quentes sem fechar, clientes irritados, oportunidades perdidas, clientes sem resposta, comparativo hoje/ontem/7d
- **Suporte:** solicitações, reposições, garantias, **problemas por linha** (Ozone Fish / Filtro UV / AquaMax / ENG MIX) com % e marcação da linha mais problemática, casos detalhados com status
- **Sigiloso:** marcado como CONFIDENCIAL, resumo do dia + conversas detalhadas por contato (tópicos+sentimento), alertas

### Semanais (sextas)
| Horário | O que |
|---|---|
| 17h sexta | WF14 Relatório Semanal |
| 17h sexta | WF17 Checklist Semanal Julian |

---

## WORKFLOWS INTERNOS (não te mandam mensagem)

| WF | Função | Frequência |
|---|---|---|
| WF03 | Dedup Guard | por mensagem |
| WF04 | Julian Pipeline Principal | por mensagem |
| WF05 | Audio Poller & Transcriber | a cada 20s |
| WF09 | SLA Monitor | a cada 1min |
| WF10 | Observabilidade e Limpeza | a cada 1h |
| WF12 | Monitor Saúde Julian | a cada 15min |
| WF18 | Monitor Atendimento Vendedor | webhook UAZAPI (5 instâncias) |

---

## BUGS RESOLVIDOS HOJE (14/05/2026)

1. **WF18 Postgres `column "undefined"`** — quando msg de grupo ou owner inválido, o Code retornava `{skipped:true}` mas Postgres tentava inserir mesmo assim. Fix: retornar `[]` para pular sem erro.
2. **WF19 Timeout 300s do Code node** — código original tinha `setTimeout 5min` × 5 operadores = 25min, mas n8n mata Code que passa de 300s. Fix: refatorado em 5 Code + 4 Wait nodes (Wait não conta no timeout).
3. **Webhook responseMode** — mudado de `lastNode` (cliente HTTP fica preso 25min) pra `onReceived` (responde imediato, execução roda async). Evita duplicação em testes manuais.

---

## TOKENS / IDs IMPORTANTES

- n8n: `https://whats-n8n.ghikuu.easypanel.host`
- UAZAPI server: `https://engsolucao.uazapi.com`
- Token instância principal ENG: `a899bc3f-db63-436f-9047-f291d4a22ea3`
- Postgres credential id: `qSNNpS1TadimC3ND`
- Workflow WF19 id: `Gm0ZVeY9Ak4ljk3x`
- Workflow WF18 id: `ZTi7ssCfIXIYlt5N`
- Workflow WF04 (Julian) id: `Xkz4b53YdWhlX8uN`

---

## PENDÊNCIAS ABERTAS

- Campo "cliente VIP" (>1 conversa/mês)
- Métrica taxa de handoff
- Dashboard web (SaaS futuro)
- Unificação de atendimentos no Chatwoot
- Handoff automático no prompt do Julian após X msgs sem fechar
- Confirmar se WF14 e WF17 (semanais) devem ser desativados (parcialmente cobertos pelo WF19)

---

## REGRAS DE OURO (não quebrar)

1. Crons em **UTC-4** no n8n (servidor é 1h atrás de Brasília)
2. Normalização de nomes: Júlia Urra → Julia, Ismar Casaroli Jr → Ismar
3. Julian: maxOutputTokens ≥ 800
4. Gemini API nativa (não SDK que pode mudar)
5. **NUNCA** mandar mensagem pra contato novo sem aquecimento (causa ban WhatsApp — aconteceu 11/05 deu 3h de block)
