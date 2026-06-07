# 💧 Dimensionador de Bombas — Cálculo de Vazão Real

Sistema web (um único arquivo `index.html`, abre em qualquer navegador — celular ou PC)
para calcular a **vazão final que uma bomba realmente entrega** em um sistema, considerando:

- A **curva da bomba** (dados do fabricante: vazão × altura manométrica);
- O **desnível** / coluna d'água a vencer;
- O **comprimento, diâmetro e material** da tubulação;
- As **conexões** (cotovelos 90°/45°, curvas, tês, registros, válvula de pé, retenção...);
- A **pressão exigida** no ponto de chegada;
- O **NPSH disponível** (verificação de cavitação na sucção — opcional).

O resultado é o **ponto de operação**: a vazão onde a curva da bomba cruza a curva do sistema.

## Como usar

1. Abra o arquivo `index.html` no navegador (duplo clique) — não precisa instalar nada.
2. **Bloco 1 — Curva da bomba:** digite os pontos (vazão × altura mca) do catálogo da bomba.
   Informe a "altura máxima / shutoff" (altura a vazão zero) se tiver — melhora a precisão.
3. **Bloco 2 — Tubulação:** material, diâmetro, comprimento reto, desnível e pressão exigida.
4. **Bloco 3 — Conexões:** quantas de cada tipo existem no recalque.
5. **Bloco 4 — NPSH (opcional):** sucção, temperatura e altitude para checar cavitação.
6. Clique em **Calcular**. Você vê a vazão final (L/h, m³/h, L/min), a altura manométrica
   no ponto, a velocidade, as perdas e o gráfico curva da bomba × curva do sistema.

## Base de engenharia (fórmulas)

| Item | Fórmula |
|------|---------|
| **Curva do sistema** | H_sistema(Q) = desnível + pressão exigida + perdas |
| **Perda distribuída** (atrito no tubo reto) — Hazen-Williams | J = 10,643 · Q^1,852 · C^−1,852 · D^−4,87 (Q em m³/s, D em m); h_f = J·L |
| **Perda localizada** (conexões) — método dos coeficientes K | h_loc = ΣK · V²/(2g), V = Q/Área, g = 9,81 m/s² |
| **Capacidade do tubo** | Q = V · Área = V · (π/4)·D² |
| **Ponto de operação** | Q onde H_bomba(Q) = H_sistema(Q) (resolvido por bisseção) |
| **NPSH disponível** | NPSHd = P_atm − P_vapor − altura_sucção − perdas_sucção; deve ser ≥ NPSHr + 0,6 m |

A curva da bomba é ajustada por mínimos quadrados a um polinômio de 2º grau
(H = c₀ + c₁·Q + c₂·Q²), o formato físico de uma bomba centrífuga.

### Parâmetros de referência usados

- **Coeficiente C (Hazen-Williams):** PVC/plástico novo 150; PVC usado/cobre 140;
  ferro/aço novo 130; aço galvanizado 125; concreto 120; ferro fundido usado 90–100.
- **Velocidades recomendadas:** recalque 0,6–2,0 m/s (máx. absoluto 3,5 m/s);
  sucção ≤ 1,0 m/s (ABNT NBR 12208 / NBR 5626).
- **Coeficientes K (perda localizada, valores típicos):** cotovelo 90° raio curto 0,9;
  cotovelo 90° raio longo 0,6; cotovelo 45° 0,4; curva 90° 0,4; tê passagem direta 0,6;
  tê saída lateral 1,3; registro de gaveta aberto 0,2; registro de globo aberto 10;
  válvula de pé com crivo ~1,75; válvula de retenção 2,5; saída de tubulação 1,0; entrada de borda 0,5.

### Exemplo de validação

Tubo de **50 mm a 3,68 m/s → ≈ 26.000 L/h** (Q = (π/4)·0,05²·3,68·3.600.000),
confirmando a regra prática de mercado "tubo de 50 mm passa até 26 mil litros/hora".
A 3,5 m/s (limite ABNT) ≈ 24.740 L/h.

## Fontes consultadas

- Tabelas de vazão / velocidade: [Niagara](https://www.niagara.com.br/tabela-de-vazao),
  [Val Aço](http://www.valaco.com.br/inf_tecnicas/vazaoagua.html).
- Velocidades de sucção/recalque (ABNT): [Hidráulica Agrícola](https://hidraulica.tolentino.pro.br/tubula%C3%A7%C3%B5es-de-suc%C3%A7%C3%A3o-e-recalque.html),
  [AltoQi (NBR 12208)](https://suporte.altoqi.com.br/hc/pt-br/articles/17113365126167).
- Fórmula de Hazen-Williams e coeficiente C: [SciELO / RBEAA](https://www.scielo.br/j/rbeaa/a/8WzPw5dwsL3cgb86HLz5gcK/?lang=pt),
  [UNESP-FEG](https://www.feg.unesp.br/Home/PaginasPessoais/nestorproenzaperez/sfm-2014-aula-2.pdf).
- Fórmula de Fair-Whipple-Hsiao (pequenos diâmetros): [PlanilhaWeb](https://planilhaweb.com.br/calculadora_perda_carga_unitaria_tubulacoes_fair_whipple_hsiao.php).
- Comprimentos equivalentes / coeficientes de conexões: NBR 5626 (Azevedo Netto).
- Ponto de operação e NPSH: [Engenheiro Planilheiro](https://engenheiroplanilheiro.com.br/2023/01/29/dimensionamento-bombas-centrifugas/),
  [UNICAMP EM461 — NPSH e Ponto de Operação](https://sites.fem.unicamp.br/~im250/SITE%20IM250/SITES%20INTERESSE/em461-pdf/aula-26-cap10-NPSH-v(2).pdf).

## Observações técnicas

- O cálculo usa o **diâmetro interno real** do tubo. A tabela de referência rápida usa o
  diâmetro nominal (prática de mercado), por isso para projeto use o DI real no formulário.
- Hazen-Williams é válida para água, diâmetros ≥ 50 mm e velocidade < 3 m/s. Para tubos
  muito pequenos (< 50 mm) a fórmula de Fair-Whipple-Hsiao é mais precisa (citada acima).
- Os coeficientes K são valores típicos de literatura; fabricantes podem fornecer valores próprios.
