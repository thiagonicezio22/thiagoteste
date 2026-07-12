# Acesso por período de teste (trials)

> Criado em 12/07/2026 para o piloto do João (Ambiente Aquático).

## Como funciona

- `giulia_donos` ganhou `trial_dias`, `acesso_expira_em` e `trial_aviso_d5`
  (migração 19). Dono sem `trial_dias` = acesso sem prazo (Thiago, André).
- **O relógio só começa na primeira mensagem do usuário** — o WF14 detecta
  a primeira atividade, define `acesso_expira_em = agora + trial_dias`,
  liga o fechamento diário (pacote completo) e avisa o Thiago.
- **5 dias antes de vencer**: aviso ao Thiago (bom momento pra falar de
  renovação).
- **Ao vencer**: o dono vira `status = 'suspenso'` (perde o modo dono no
  WF01 na hora) e o Thiago recebe o resumo de uso do período (mensagens,
  gastos, orçamentos, lembretes).
- **Usuário suspenso que escreve**: recebe explicação simpática de que o
  teste acabou (sem fingir executar nada) e o Thiago é notificado do
  interesse via notificar_thiago.
- **Renovação por chat (só Thiago)**: ação `gerenciar_acesso` —
  "reativa o joão por mais 30 dias" (com prazo) ou "reativa o joão"
  (sem prazo). "suspende o fulano" também funciona.

## WF14 - GIULIA Trials (id wids1oU1e8EaNrHl)

Cron de hora em hora; avisos só entre 8h e 22h de São Paulo. Os três
eventos são idempotentes (claim atômico num único statement). Webhook de
teste: `POST /webhook/giulia-trial-tick` com `{"force": true}` (ignora a
janela de horário).

## Piloto ativo

| Usuário | Número | Trial | Estado |
|---|---|---|---|
| João (Ambiente Aquático) | 5511975525312 | 30 dias | Cadastrado 12/07, relógio parado aguardando 1a mensagem dele. Template de orçamento próprio (cópia do Ambiente Aquático, id 2). Fechamento diário liga junto com o trial. |

Testes executados em 12/07: início/aviso-D5/expiração+suspensão com dono
fake, suspenso sem fantasia no WF01, reativação e suspensão por chat —
todos passaram. Envios dos WF12/13/14 com retry 3x (falha de rede
transitória detectada em teste).
