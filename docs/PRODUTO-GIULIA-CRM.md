# Giulia CRM — Assistente financeira e CRM pelo WhatsApp

> Documento de produto (v1 — rascunho para discussão).
> Status: a matriz competitiva detalhada será anexada quando a pesquisa de mercado concluir.

---

## 1. Visão

**Uma assistente profissional no WhatsApp que organiza o dinheiro e a operação de
pequenos empreendedores — sem app, sem planilha manual, sem sistema pra aprender.**

O cliente conversa com a assistente como conversa com uma secretária de confiança:
manda foto do comprovante, áudio dizendo "paguei o Alex, 1.280", pergunta "quanto
gastei esse mês?" — e recebe controle financeiro completo, lembretes de vencimento,
folha de pagamentos de funcionários/prestadores em dia e relatórios profissionais
(planilha Excel + gráficos), tudo dentro do WhatsApp.

**Por que agora:** o WhatsApp é onde o pequeno empresário brasileiro e o imigrante
brasileiro nos EUA já trabalham o dia inteiro. Toda solução que exige "baixar app e
criar conta" morre na praia. A Giulia já provou o conceito com 2 usuários reais em
2 países, 2 moedas e 2 fusos.

## 2. Público-alvo

| Persona | Perfil | Dor principal |
|---|---|---|
| **Empreendedor de serviços (BR)** | Paisagismo, piscinas, obras, estética, delivery. 0–15 funcionários. | Não sabe quanto gasta, esquece vencimentos, paga prestadores "de cabeça". |
| **Brasileiro empreendendo nos EUA** | Construção, limpeza, remodeling na Flórida/costa leste. Fala português, opera em dólar. | Mesmo caos financeiro + barreira de idioma com ferramentas americanas. |
| **Autônomo/profissional liberal** | Arquiteto, advogado, corretor. | Mistura PF e PJ, perde recibos, não tem secretária. |

Começamos pelos dois primeiros (é o perfil do Thiago e do André — validação real).

## 3. Proposta de valor e diferenciais

1. **Zero fricção**: nenhum app para instalar. Onboarding inteiro pela conversa.
2. **Multimodal de verdade**: texto, áudio (transcrição) e foto de comprovante
   (leitura automática de valor/beneficiário) — já funcionando hoje.
3. **Bilíngue e bi-moeda nativo**: PT/EN, R$/US$, fuso horário por usuário —
   já funcionando hoje (arquitetura multi-dono provada).
4. **Proativa, não passiva**: a assistente cobra, lembra e avisa (vencimentos,
   pagamento de funcionário chegando, tarefa atrasada, briefing matinal) —
   concorrentes na maioria só respondem quando perguntados.
5. **Relatórios de gente grande**: planilha Excel formatada + gráficos
   profissionais entregues no próprio WhatsApp — já funcionando hoje.
6. **Tom humano**: nada de menu numérico nem robô; conversa natural.

## 4. Módulos do produto

### 4.1 Financeiro (núcleo)
- **Gastos**: registro por texto/áudio/foto de comprovante; categorização
  automática; edição e exclusão por conversa. *(existe hoje)*
- **Contas a pagar fixas e variáveis**: cadastro guiado ("me fala as contas que
  você paga todo mês"), recorrência (mensal/semanal/anual), lembrete 3 dias antes,
  na véspera e no dia; baixa por comprovante ou "paguei". *(existe hoje; falta
  recorrência automática de contas fixas)*
- **Pagamentos de funcionários e prestadores** *(novo — prioridade nº 1)*:
  - Cadastro de pessoas: nome, função, tipo (fixo/diarista/empreitada), valor
    combinado, frequência (semanal/quinzenal/mensal/por serviço), dia de pagamento.
  - A assistente avisa: "Sexta é dia de pagar o Alex ($ 650). Confirmo na agenda?"
  - Baixa por comprovante (foto) vinculada à pessoa; histórico completo por
    pessoa ("quanto já paguei pro Laércio esse ano?").
  - Relatório de folha: total por pessoa, por mês, pendências.
- **Contas a receber / cobranças** *(novo — fase 2)*: registrar quem deve, valor e
  vencimento; lembrete pro dono; opcionalmente mensagem de cobrança educada
  enviada ao cliente com aprovação do dono.
- **Fluxo de caixa** *(novo — fase 2)*: entradas + saídas, saldo do mês, projeção
  do mês com base nas contas fixas e folha.
- **Relatórios**: resumo no chat + planilha Excel formatada + gráficos, por
  período; separação pessoal × empresa por tags/categorias. *(existe hoje;
  falta filtro empresa/pessoal e relatório de folha)*

### 4.2 Secretaria pessoal
Lembretes pontuais e recorrentes, tarefas com cobrança até concluir, rotina
semanal, agenda consolidada, briefing matinal. *(tudo existe hoje)*

### 4.3 CRM de clientes (por plano — fase 2/3)
Funil simples pelo WhatsApp: leads que chegam no número do negócio são
qualificados pela assistente (o modo "recepcionista" que já existe hoje para o
Thiago), reunião agendada com aprovação do dono, follow-up manual. É o gancho
de expansão para "CRM completo", mas **não** entra no MVP comercial.

## 5. Jornada do usuário

1. **Contratação**: o cliente entra numa página simples (ou é indicado), paga a
   assinatura e informa seu número de WhatsApp.
2. **Onboarding pela conversa** (primeiros 10 minutos):
   - Boas-vindas no idioma dele; confirma nome, país/fuso, moeda.
   - "Me conta as contas que você paga todo mês" → cadastro guiado.
   - "Tem funcionário ou prestador fixo? Me fala nome, valor e quando paga" → folha.
   - Primeiro gasto de teste com foto de comprovante.
3. **Uso diário**: manda comprovantes e áudios; recebe avisos e briefing.
4. **Rotina de valor**: relatório semanal automático no domingo à noite +
   relatório mensal com planilha e gráficos no dia 1º.

## 6. Idioma, moeda e fuso

- PT-BR e EN-US por usuário (o prompt já é parametrizado por dono; falta só o inglês).
- BRL e USD por usuário *(pronto)*; fuso por usuário com DST *(pronto)*.
- Formato de data/número segue o locale do usuário.

## 7. Arquitetura — do protótipo ao produto

### O que já existe (provado em produção com 2 usuários)
- n8n (10 workflows) + Gemini 3.5 Flash + Postgres + gateway WhatsApp (UAZAPI).
- Tabelas `giulia_*` com `dono_numero` em tudo — isolamento de dados por usuário.
- Timezone, moeda, nome e idioma implícito por dono (`giulia_donos`).
- Pipeline multimodal (áudio Whisper, imagem Gemini Vision), scheduler por fuso,
  relatórios XLSX/gráficos, memória de conversa por usuário.

### O que muda para virar produto multi-cliente
| Hoje (protótipo) | Produto |
|---|---|
| Donos hardcoded no código do workflow | Cadastro 100% na tabela `tenants` (banco), carregado dinamicamente |
| 1 número de WhatsApp compartilhado | Estratégia de número por plano (ver riscos, §9) |
| Sem onboarding | Fluxo de onboarding conversacional automático |
| Sem cobrança | Billing por assinatura (Stripe BR/US) com status no banco (ativo/inadimplente → assistente avisa e pausa) |
| Sem limites | Limites por plano (nº de lançamentos/mês, relatórios, usuários) |
| Banco compartilhado com outro sistema | Banco dedicado do produto, backups, ambiente de staging |
| Prompt único | Prompt por idioma + política de dados por tenant |

### Ponto crítico: API do WhatsApp
Hoje usamos gateway não-oficial (protocolo do WhatsApp Web). Para uso pessoal,
ok; **para produto comercial é o maior risco do negócio** — números podem ser
banidos e o serviço morre da noite pro dia. Decisão a tomar antes do MVP comercial:

- **Opção A — WhatsApp Business Platform oficial (Meta)**: sem risco de ban,
  templates aprovados para mensagens proativas, custo por conversa (~US$
  0,005–0,08 dependendo do país/categoria). É o caminho profissional.
- **Opção B — continuar com gateway (UAZAPI) por instância dedicada por
  cliente**: mais barato e rápido de lançar, risco assumido e comunicado.
- **Recomendação**: MVP beta com poucos clientes na Opção B (validar demanda),
  migração para Opção A antes de escalar/cobrar caro.

## 8. Modelo de negócio (hipótese a validar com a pesquisa)

- **Plano Pessoal** (~R$ 39–59/mês | US$ 15–19): financeiro pessoal + secretaria.
- **Plano Profissional** (~R$ 99–149/mês | US$ 29–49): + folha de
  funcionários/prestadores, contas a receber, separação empresa/pessoal,
  relatórios semanais automáticos.
- **Plano Business** (~R$ 249+/mês | US$ 79+): + CRM de leads/recepcionista,
  número dedicado, multiusuário (sócio/esposa no mesmo painel financeiro).
- Trial de 7–14 dias. Cobrança via Stripe (USD) e Stripe/Pix (BRL).

## 9. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Ban de número (gateway não-oficial) | Alto | Migrar pra API oficial antes de escala; instância por cliente no beta |
| Custo de IA por usuário | Médio | Gemini Flash é barato; limites por plano; cache de prompt |
| Dados financeiros sensíveis (LGPD/privacidade) | Alto | Banco dedicado, criptografia, política de privacidade, exclusão sob demanda |
| Alucinação da IA em números | Alto | Regras anti-fantasia (já temos), confirmação antes de gravar valores altos, tudo auditável na planilha |
| Concorrência (Zapia, Magie etc.) | Médio | Diferencial: proatividade + folha de prestadores + bilíngue BR/US |
| Suporte/atendimento | Médio | A própria assistente resolve 80%; canal humano pro resto |

## 10. Fases de execução

- **Fase 0 — Especificação (agora)**: este documento + matriz competitiva da
  pesquisa + decisão de nome/marca do produto.
- **Fase 1 — Fundação multi-tenant (evolução do que existe)**:
  tenants dinâmicos no banco (sem hardcode), onboarding conversacional,
  módulo de folha de funcionários/prestadores, contas fixas recorrentes,
  inglês, separação empresa/pessoal.
- **Fase 2 — Beta pago (5–10 clientes convidados)**: billing Stripe,
  limites por plano, contas a receber, fluxo de caixa, relatório semanal
  automático, instância dedicada por cliente.
- **Fase 3 — Comercial**: API oficial da Meta, página de vendas, CRM de
  leads por plano, painel web simples (opcional), escala.

## 11. Métricas de sucesso

- Ativação: % de novos clientes que cadastram ≥3 contas e ≥1 funcionário na 1ª semana.
- Retenção mês 2 (a métrica que mata ou valida o produto).
- Lançamentos por usuário/semana (engajamento real).
- NPS por conversa trimestral ("de 0 a 10, o quanto eu tô te ajudando?").

---

## Anexo A — Matriz competitiva
*(será preenchido com o resultado da pesquisa de mercado em andamento)*

## Anexo B — Decisões em aberto
1. Nome/marca do produto (manter "Giulia"? registrar domínio/marca?).
2. API oficial desde o início ou beta com gateway?
3. Número compartilhado com nome da assistente único vs número por cliente.
4. Painel web mínimo no MVP ou 100% WhatsApp?
5. Preços finais após a matriz competitiva.
