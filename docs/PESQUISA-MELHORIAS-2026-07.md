# Pesquisa: ideias para melhorar o sistema (julho/2026)

> Pesquisa profunda com verificação adversarial (11 achados confirmados nas
> fontes primárias, votação 3-0 quase todos; preços e features checados AO
> VIVO nos sites em 15-16/07/2026). Cruzada com os aprendizados reais dos
> 4 pilotos + André.

## O mapa competitivo (verificado)

| Produto | Mercado | Preço | O que faz de relevante |
|---|---|---|---|
| **Zapia** (BrainLogic, US$5M) | BR/LatAm | **Grátis** | Assistente geral: agenda Google, lembretes, e-mail, transcrição, comparação de preços, "Conecta" (agente liga/contata empresas sozinho) |
| **Jota** (US$39M, ~300k clientes) | BR | **Grátis** (ganha em taxas de cartão) | O mais parecido conosco: **paga boleto de verdade**, fechamento diário 22h, **cobra clientes com "Pix pronto"** no vencimento |
| ZapGastos | BR | R$9,90-39,90/mês | Finanças com **Open Finance** (3/5/10 bancos por plano, 114+ bancos) |
| Financinha | BR | R$26,90-36,90/mês | Registro multimodal de gastos (texto/áudio/imagem/PDF) — nossa paridade |
| Meu Assessor | BR | ~R$29,90/mês promo | Open Finance 114+ bancos, Google Agenda, **link de Meet por voz, ata de reunião com tarefas extraídas** |
| **Martin** | EUA | **US$21-49/mês** | Benchmark US: omnichannel (voz/SMS/WhatsApp/email/Slack), liga e manda mensagem pra terceiros, trial 7 dias |

**Leitura estratégica**: no "assistente geral" e no "bot de finanças puro" há
âncoras GRÁTIS bem financiadas (Zapia, Jota) — não dá pra ganhar aí. Nosso
espaço defensável é o **ciclo de venda do empreendedor**: orçamento em PDF
com a marca dele (ninguém grátis faz) → follow-up → cobrança do recebível.
O João AA provou o apetite: 7 orçamentos na primeira semana.

## Ideias priorizadas

### Tier 1 — fecham o ciclo de venda (diferencial único, dá pra fazer já)
1. **Contas a receber com "Pix pronto"** (padrão validado pelo Jota, sem
   virar fintech): orçamento aprovado → entrada/parcelas registradas → no
   vencimento o assistente manda pro dono a mensagem de cobrança PRONTA pra
   encaminhar ao cliente (com a chave Pix dele). Não executa pagamento —
   prepara a cobrança. Encaixa no gancho "aprovou →" que já existe.
2. **Ata de reunião por áudio** (diferencial emergente — Meu Assessor cobra
   por isso): dono manda o áudio longo da reunião → resumo + decisões +
   tarefas extraídas direto pra lista (com cobrança). Já temos transcrição
   e extração; é evolução de prompt + uma ação nova.

### Tier 2 — paridade que importa
3. **Google Calendar sync** (table stakes no mercado; hoje nossa agenda é
   interna) + link de Meet por voz.
4. **E-mail no WhatsApp** — o gap mais consistente vs Zapia/Martin: resumo
   dos importantes + rascunho de resposta (Gmail OAuth por usuário).

### Tier 3 — estratégico / quando escalar
5. **Open Finance** via agregador (Pluggy/Belvo/Celcoin) — alto valor, mas
   custo/complexidade pra bootstrapped; é também a alavanca de tiering de
   preço (por bancos conectados) que o mercado já pratica.
6. **Omnichannel** (voz/ligação) — direção do Martin; não é urgente.

## Preço e trial (dados verificados)

- BR nicho pago: R$10-40/mês. Nossos R$97/197 sugeridos ficam ACIMA do
  cluster — sustentável só ancorado no ciclo de venda completo (orçamento +
  recebível), que ninguém grátis oferece. Alternativa: entrada R$49-69.
- US: Martin US$21-49 valida nossos US$39/79.
- Trial: mercado converge em **7 dias** (Martin, Financinha); nossos 30 dias
  são generosos — bom para pilotos/aprendizado, avaliar 14 dias (ou 7 + 
  extensão por engajamento) no lançamento público.
- Padrão de tiering: qualidade de modelo, cota de ações proativas,
  bancos conectados, número de usuários.

## Aprendizados internos que a pesquisa confirma

- Registro multimodal de gastos é PARIDADE, não diferencial — o valor está
  no que acontece DEPOIS da captura (fechamento, relatório, recebível,
  orçamento). Já estamos posicionados certo.
- Volume de mensagens mata retenção (caso André) — controle de ritmo por
  usuário já implementado; nenhum concorrente anuncia isso como feature.
- Áudio-first é o comportamento real (João RS ditou a agenda inteira).
