# Tarefas — como a assistente lista, cobra e limpa (v2, 12/09/2026)

## Por que mudou

Thiago pediu "reseta minhas tarefas" e nada aconteceu. Causa: a IA **não
enxergava a lista** de tarefas pendentes no prompt (só a memória da conversa)
e `cancelar_tarefa` aceitava **uma** id por vez — "limpa todas" e "cancela a
1, 2 e 3" não tinham como funcionar. Além disso cada lugar mostrava a lista
de um jeito (cobrança com `#59`, briefing com `#id`, "minhas tarefas" com
`(#id)` e ordem diferente).

## Como funciona agora

**Uma ordem só, em todo lugar:** `(prazo IS NULL), prazo, criada_em, id`.
A posição da tarefa nessa ordem é o número que o usuário vê — em "minhas
tarefas", na cobrança (WF06), no briefing (WF07) e no fechamento (WF11).
Sem `#id` no texto.

**A IA vê a lista.** Nó novo `Carregar Tarefas` no WF01 (entre
`Carregar Email Pendentes` e `Montar Prompt`) alimenta a seção
`TAREFAS PENDENTES DO <dono> (posicao. #id titulo)` do prompt, com a regra:
número sem `#` = posição → converter em `#id`; número com `#` = id;
"todas/tudo/zera/reseta/limpa" sem número = `todas=true`;
limpar/zerar/resetar/apagar = **cancelar** (não é concluir).

**Ações (Decidir Acao):**
- `cancelar_tarefa` — `todas=true` | `ids=[...]` | `posicoes=[...]` |
  `id_tarefa` | `titulo_match`. Posição vira id no SQL via `row_number()`
  com a mesma ordem. Sem alvo → pergunta ("cancela a 2" ou "limpa todas").
- `marcar_tarefa_feita` — igual, ganhou `posicoes`.
- `adiar_tarefa` — `ids` | `posicoes` | `titulo_match` + `novo_prazo`.

**Textos (Formatar Resposta Final):**
```
📋 Suas tarefas (4):

1. Carimbar o manual da caminhonete ⚠️ atrasada (era 27/08)
2. Enviar medidas pro Kip
3. Reuniao com o contador 📅 hoje
4. Fazer site da Horizon · até 20/09

Responde: "fiz a 1" · "adia a 2 pra sexta" · "cancela a 3" · "limpa todas"
```
`🧹 Cancelei N tarefas:` (lista; + "Lista zerada" só quando foi "todas") · `Cancelei: X.` · `✅ Feito: X.` ·
`📆 Adiei "X" pra 25/09.` · sem alvo: "Nao achei essa tarefa na lista.
Manda 'minhas tarefas' pra ver os numeros."

**Cobrança (WF06):** "Bom dia! Você tem N tarefas pendentes:" + grupos
⚠️ Atrasadas / 📅 Pra hoje / 📌 Outras, numerados pela posição global
(`row_number` sobre todas as pendentes do dono, antes do filtro de
"vence cobrança"), até 5 por grupo, rodapé com os comandos. Cadência:
2×/dia (8h/17h), atrasada/hoje a cada 8h, normal 24h, 6+ cobranças → 72h
com aviso "se não vai rolar, cancela a N".

## Comandos que o usuário pode falar

| ele diz | ação |
|---|---|
| "minhas tarefas", "o que tenho pra fazer" | lista numerada |
| "fiz a 2", "fiz a 1 e a 3", "fiz todas" | conclui |
| "cancela a 2", "limpa a 1, 2 e 3", "tira a do contador" | cancela |
| "limpa todas as tarefas", "zera minhas tarefas", "reseta", "apaga tudo" | cancela todas |
| "adia a 2 pra sexta", "deixa a 3 pra semana que vem" | novo prazo |
| "preciso fazer X até sexta" | cria |

Cancelada some da lista mas fica no banco (`status='cancelada'`) — dá pra
voltar por SQL se for engano.

## Validação ao vivo (12/09, número do Thiago)

15/15: criar 3 → "minhas tarefas" (numerada, datas curtas) → "fiz a 2"
(acertou a 2ª) → "cancela a 1" → "cancela a 1 e a 3" (2 canceladas, listadas)
→ "adia a 1 pra sexta" (18/09) → "zera minhas tarefas" → "limpa todas as
tarefas" com lista vazia ("Sua lista ja esta vazia"). Obs.: "anota: pagar o
IPVA ate sexta" vira **conta a pagar**, não tarefa — comportamento certo.
Rastros apagados (tarefas, conta IPVA, 32 linhas de memória).
