# Handoff para a sessão do Invoice Horizon — mudanças feitas em 03/11/2026

> Escrito pela sessão GIULIA (Claude) para a sessão que construiu o módulo de
> invoice da Horizon Pottery em 25/10. Leia antes de regerar o WF19 a partir
> de `calc-invoice.js` / `lib-wf`, senão estas correções somem.
> Autor humano: Thiago Nicézio. Tudo aprovado por ele e testado ao vivo.

## Por quê

Em 03/11 o André (17869660718) pediu "1 Yellowstone, dois Búfalo Médio, um
Oregon 3 e um Bisbi 1" para a Camila. O rascunho #15 travou em 5 perguntas,
duas delas evitáveis: "Búfalo" ambíguo entre I/II/III (só o Bufalo I tem
Medium) e "Bisbi 1" não encontrado (é Bixby I; erro de transcrição do
áudio). Na invoice de 26/10 (HP-I-2026-0002), "18% de desconto" virou
`preco_unit_manual` = $13.120 em vez de desconto visível.

## 1. WF19 `Gd9UCBiztkoVA4q5` — nós `Montar Rascunho` e `Montar Numeracao`

Logo depois de `var achado = acharProduto(produtos, nome);` (mesmo trecho
nos dois nós) entrou:

```js
// 03/11: nome ambiguo + tamanho informado ('Bufalo Medio'): se so UM dos candidatos tem esse tamanho, e ele
if (achado.erro === 'ambiguo') {
  var tamQ = normTamanho(String(it.tamanho == null ? '' : it.tamanho).trim());
  if (tamQ) {
    var comTam = produtos.filter(function (pp) { return achado.opcoes.indexOf(pp.produto) >= 0 &&
      pp.rows.some(function (r) { return r.ativo !== false && r.tamanho === tamQ; }); });
    if (comTam.length === 1) achado = { produto: comTam[0] };
  }
}
```

Efeito: "Búfalo Médio" → Bufalo I. Atenção: "Búfalo Large" também vira
Bufalo I, porque Bufalo II/III não têm tamanho cadastrado. O resumo continua
sendo confirmado antes de gerar.
**Pedido:** levar isso para `calc-invoice.js` (função de resolução de item) e
regerar, ou manter este patch.

## 2. Dados — `hz_catalogo.apelidos`

Bixby I (6 SKUs) ganhou `{'Bisbi I','Bixbi I','Bisby I'}`. O WF20 não mexe em
`apelidos`, então persiste. Testado: "Bisbi 1" → Bixby I.

## 3. WF01 `Tm1Ec80tegOqWS4N`

- **Schema do `pedido` em `gerar_invoice_hz`** (Montar Prompt): `itens[]`
  ganhou `desconto_pct, desconto_valor`. O pedido ganhou os mesmos campos no
  topo. Regra nova: "18% nesse vaso" → `desconto_pct` no item; no total →
  no pedido; nunca trocar preço em `preco_unit_manual`. O `calc` do WF19 já
  suportava (`tem(it,'desconto_pct')`), só a IA não sabia.
- **`Carregar Invoices HZ`** ganhou a coluna `historico_json`: últimas 8
  invoices emitidas pelo próprio solicitante (`hz_invoices.solicitante_numero`,
  não teste, não anuladas): numero, cliente, endereço, cidade, estado, zip e
  acabamentos. O Montar Prompt mostra isso como "INVOICES QUE <dono> JÁ
  EMITIU", no prompt do dono e no modo só-invoice. Regra: acabamento ausente
  e todas as anteriores com o mesmo → preenche; cliente com mesmo nome e
  nada de entrega → reaproveita a entrega anterior; endereço novo → usa só o
  novo.
- **Regra geral:** "nunca diga que fez o que não fez".

## 4. Novos workflows que conversam com o invoice

- **WF22 `91E9A49eKBCSj7Tw`, Follow-up de perguntas:** quando a Giulia
  pergunta algo, inclusive um rascunho incompleto, e o dono fica 40 min sem
  responder, ela volta uma vez. Lê `hz_invoices_pendentes` (rascunho aberto),
  `hz_invoices` (anteriores) e os tamanhos de `hz_catalogo`, e prorroga
  `hz_invoices_pendentes.expira_em` em +24h ao enviar. Grava a memória com
  `metadata.followup = true`. Após 3h sem resposta, avisa o Thiago.
- **WF23 `7y7QzP23U7P7HTSs`, Documento PDF:** ação `gerar_documento_pdf` no
  WF01, para extratos e listas que não são invoice. Usa Gotenberg
  (`http://whats_gotenberg:3000`).

## Onde está o código

`workflows/01`, `19`, `20`, `21`, `22`, `23` neste repo, branch
`claude/whatsapp-virtual-assistant-bDR9r`, com tokens como placeholders.
Os fontes `calc-invoice.js`, `ESPEC-INVOICE-GIULIA.md` e `lib-wf` **não**
estão aqui. Se puderem, versionem neste repo.
