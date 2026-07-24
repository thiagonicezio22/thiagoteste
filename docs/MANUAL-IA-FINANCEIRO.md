# MANUAL DE OPERAÇÃO — PLANILHAS FINANCEIRAS DO THIAGO
**Para a IA financeira (WhatsApp/n8n). Atualizado em 24/07/2026.**

Este manual ensina a lançar dados nas 4 planilhas da pasta `Financeiro`. Quando o Thiago mandar mensagem informal ("vendi um ozone 15 mil por 3.400", "paguei o antonio 2 mil", "andré aportou 10 mil"), identifique a planilha, a aba e a linha correta usando as regras abaixo. **Nunca invente valores. Na dúvida, pergunte.**

---

## REGRAS DE OURO (valem para tudo)

1. **Células AZUIS = entrada de dados.** Colunas com fórmula (lucro, margem, saldo, acumulado, mês) NUNCA são sobrescritas — elas calculam sozinhas.
2. **Lançar sempre na primeira linha vazia** da tabela, dentro do range dela (ranges listados abaixo). Não lançar fora do range — as somas param de enxergar.
3. **Status com grafia exata** (os SUMIFS são sensíveis): `Pago`, `Pendente`, `Recebido`, `EM ANDAMENTO`.
4. **Datas** como data real (DD/MM/AAAA), não texto.
5. Depois de lançar, **conferir o total da aba** e responder ao Thiago com o número novo (ex.: novo saldo).
6. Todos os arquivos têm `fullCalcOnLoad` — o Excel recalcula ao abrir.
7. **Backup antes de editar** (copiar o arquivo com sufixo de data).
8. Pagamento a fornecedor ≠ custo novo: verificar se o item já existe antes de duplicar.

---

## ARQUIVO 1 — `Lojão Aquático - Financeiro.xlsx`
Loja no Mercado Livre. Sócio fornecedor: ENG Soluções (Antonio, pai do Thiago).
Abas: `DASHBOARD` (só leitura) · `VENDAS` · `Custos ENG` · `PAGAMENTOS ENG` · `COMPRAS E CUSTOS`.

### Nova venda → aba VENDAS (linhas 12 a 71)
Preencher SÓ estas colunas:
| Col | Campo | Exemplo |
|---|---|---|
| A | nº sequencial | 20 |
| B | Data da venda | 28/07/2026 |
| C | Nº venda ML | 2000017343244948 |
| D | Produto | GERADOR DE OZÔNIO |
| E | **Modelo** (chave da tabela de custos) | 15000 |
| F | Valor bruto (relatório ML) | 3885.00 |
| G | Recebido líquido (Total BRL do ML) | 3215.63 |

H (tarifas), I (custo ENG via PROCV), J (lucro), K (margem), L (mês) calculam sozinhos.
**Modelo (col E)** aceita: números `3000, 8000, 15000, 30000, 60000, 80000, 120000, 300000, 500000` ou chaves de texto da aba Custos ENG (`UV 95W`, `VENTURI`, `AQUAMAX 35000`, `ENG MIX`...). Anúncio "Ozone Fish 300.000" = Power.
Fonte da verdade dos valores: **relatório oficial do ML** (bruto = "Receita por produtos"; recebido = "Total BRL"). Vendas canceladas/reembolsadas (Total = 0) não entram.

### Pagou o Antonio → aba PAGAMENTOS ENG (linhas 12 a 41)
A = data · B = valor · C = descrição. O resumo (B8 devido, D8 pago, B9 saldo) atualiza sozinho.
Estado em 24/07/2026: **QUITADO** (devido 17.410,89 = pago 17.410,89, saldo 0).

### Comprou algo com dinheiro do Lojão → aba COMPRAS E CUSTOS
- Compras: linhas 18 a 32 → A data · B item · C valor · D status (`Pago` / `EM ANDAMENTO`) · E obs.
- Custos mensais recorrentes: linhas 38 a 45 (B item, C valor/mês). Contador = **R$ 250/mês** (lançar os meses pagos como compra, ex.: "Contabilidade ago/26 — 250").
- Investimento inicial (linhas 9-13): fechado em 3.321,34 — não mexer.

### Custos de equipamento mudaram → aba Custos ENG (tabela B9:D51)
Coluna D = custo (azul). Fonte: **tabela executiva ENG** (última: 24/07/2026). Mudou lá, recalcula as vendas todas.

### Estado atual (24/07/2026)
Recebido total 79.641,78 · lucro 62.230,89 · Antonio quitado · compras+investimento 33.218,34 · **caixa 29.012,55**.

---

## ARQUIVO 2 — `Horizon - Controle Financeiro.xlsx`
Sociedade 50/50 Thiago × André (Horizon Pools and Lagoons, CNPJ 66.319.861/0001-45). Foco: INVESTIMENTOS.
Abas: `Dashboard` (leitura) · `Aportes Sócios` · `Despesas` · `Vendas` · `Compromissos Futuros` · `Acerto Sócios` · `Configurações`.

### Lógica do acordo (não alterar)
- Cada **aporte do André** soma ao saldo devedor (Thiago → André).
- Cada venda: lucro 50/50; **25% do lucro** (metade da parte do Thiago) abate o saldo devedor até quitar.
- Aportes do Thiago contam como investimento, não geram dívida.
- **REGRA CRÍTICA: pagamento direto feito por um sócio = lançar 2×**: como DESPESA (aba Despesas, "Pago Por" = sócio) **E** como APORTE (aba Aportes) do mesmo valor.

### Onde lançar
- **Aportes Sócios**: linhas 12 a 61 → A data · B sócio (`Thiago`/`André`) · C descrição · D forma · E valor.
- **Despesas**: linhas 12 a 111 → A data · B categoria · C descrição · D fornecedor · E forma · F valor · G pago por (`André`/`Thiago`/`Empresa`) · H status.
- **Vendas**: linhas 12 a 61 → A data · B cliente · C descrição · D valor bruto · E custos diretos. F-K calculam (50/50 e repasse 25%).
- **Compromissos Futuros**: linhas 12 a 41 → A vencimento · B categoria · C descrição · D fornecedor · E forma · F valor · G status. Ao pagar um compromisso: mudar status para `Pago` E lançar a despesa (e o aporte, se sócio pagou).
- **Configurações**: C10/C11 participação 50/50 · C12 retenção 25% · **C13 câmbio US$** (fretes internacionais em revisão usam essa célula) · contador da Horizon = R$ 350/mês.
- **Acerto Sócios B18** = saldo real em conta (informado pelo Thiago, azul).

### Estado atual (24/07/2026)
Investido 94.401 (André 87.101 = 92,3% · Thiago 7.300) · saldo devedor ao André 87.100,90 · compromissos: pedra 6.100 (venceu 15/07) + arquiteto 4.000 + fretes internacionais US$ 5.476 e US$ 10.225 (EM REVISÃO, câmbio 5,50) · saldo real em conta 7.000 (13/07).

---

## ARQUIVO 3 — `Controle Financeiro Obras - Thiago Nicezio.xlsx`
Obras pessoais do Thiago + operações de EPDM. **ATENÇÃO: este arquivo tem GRÁFICOS no Resumo Geral — salvar com openpyxl DESTRÓI os gráficos.** Editar preferencialmente os valores via manipulação direta do XML, ou avisar o Thiago antes de salvar por openpyxl.
Abas: `Resumo Geral` (leitura) · `Calendário Recebimentos` (manual) · `Custos Equipamentos` (tabela) · `RJ Maricá` · `Gramoterra` · `Itu` · `Obra em Branco 2/3` · `Dashboard EPDM` (leitura) · `EPDM Gramoterra` · `EPDM Coral Home`.

### Estrutura das abas de obra (RJ Maricá, Itu, obras em branco)
- Dados: C8 cliente · C9 cidade · I8 CNPJ · C10 data.
- Cronograma: linhas 14-19 → B parcela · C vencimento · D recebido em · E valor · G status (`Recebido`/`Pendente`).
- Equipamentos: linhas 27-34 → B nome · C qtd · E custo unitário manual. Se o nome em B for IGUAL ao da aba `Custos Equipamentos`, a coluna D puxa o custo automático (aí deixar E = 0).
- Marcadores ENG: B36/F36 (pago) e B37/F37 (saldo).
- Custos operacionais: C39 arquiteta · H39 Felipe · viagem C42/E42/G42/I42 · **outros: B47-B51 descrição + I47-I51 valor**.
- Resultado: I56-I64 (fórmulas — NF de 12% sobre o contrato é automática).
- A aba **Gramoterra tem layout próprio**: equipamentos 22-29, outros 42-46, resultado I51-I59.

### Abas EPDM (importação e revenda de manta)
- Regra: imposto = **12% sobre o valor recebido do cliente**; custos = valores reais pagos; lucro dividido **50/50 com o pai (Antonio)**.
- `EPDM Gramoterra`: custos D6-D9 · venda B14 · comissão a receber B15 (10.000, PENDENTE).
- `EPDM Coral Home`: pagamentos fornecedor C6/C7 · despesas JM C10 (36.576,34 A PAGAR) · imposto C11 (fórmula 12%) · recebido B19/B20 · a receber B22 (95.000 PENDENTE).
- `Dashboard EPDM` B11 = já enviado ao pai (20.000). Saldo a enviar ao pai: 46.402,02.

### Estado atual das obras (24/07/2026)
- **RJ Maricá** (contrato 168.000): recebido 140.000, falta 28.000 (24/08). ENG: equip. 34.760,69 + mão de obra 4.000 − pagos 25.000 = **saldo 13.760,69**.
- **Itu** (contrato 40.000): recebido 20.000, falta 20.000. ENG QUITADA (2.506,41 em 24/07). Bombas Tropical pagas (2.687,82). Pendente: Lojão fibra 4.900.
- **Gramoterra** (obra, 74.786,80): recebida integral, lucro 22.687,21.
- Lucro total obras: 131.998,58 · EPDM: 132.804,04.

---

## ARQUIVO 4 — `EPDM - Gramoterra e Coral Home.xlsx`
**Espelho antigo** das abas EPDM. A fonte oficial é o Controle (arquivo 3). Não alimentar os dois — em caso de lançamento EPDM, usar o Controle e avisar que este arquivo está desatualizado (ou apagá-lo).

---

## EXEMPLOS DE COMANDO → AÇÃO

| Thiago escreve | Ação |
|---|---|
| "vendi um ozone 30 mil, bruto 3.885, caiu 3.215,63, venda nº 2000..." | Lojão → VENDAS nova linha (modelo 30000) |
| "paguei o antonio 5 mil hoje" | Lojão → PAGAMENTOS ENG (se for do Lojão) OU marcador da obra citada |
| "comprei embalagens 800 reais pro lojão" | Lojão → COMPRAS E CUSTOS |
| "andré mandou 10 mil" | Horizon → Aportes (André) |
| "paguei 2 mil de frete da pedra, eu mesmo" | Horizon → Despesas (Pago Por Thiago) **+** Aportes (Thiago) |
| "paguei o saldo da pedra" | Horizon → Compromissos: status Pago + Despesas |
| "recebi a última parcela do RJ" | Controle → RJ Maricá cronograma: status Recebido |
| "recebi os 20 mil finais do Itu" | Controle → Itu linha 15: status Recebido |
| "gramoterra pagou a comissão" | Controle → EPDM Gramoterra B15: status RECEBIDO + atualizar B17 |
| "coral home pagou mais 50 mil" | Controle → EPDM Coral Home: novo recebido |
| "mandei 10 mil pro meu pai do EPDM" | Controle → Dashboard EPDM B11: somar 10.000 |
| "paguei a JM logística" | Controle → EPDM Coral Home C10: status PAGO |

## PENDÊNCIAS EM ABERTO (cobrar/lembrar)
1. Receber: 28.000 RJ Maricá (24/08) · 20.000 Itu · 10.000 comissão Gramoterra · 95.000 Coral Home.
2. Pagar: 13.760,69 ENG (RJ Maricá) · 4.900 Lojão (fibra Itu) · 36.576,34 JM Logística · impostos NF EPDM (28.924,40 + 29.400) · saldo pedra Horizon 6.100 (VENCIDO 15/07) · arquiteto Horizon 4.000.
3. Revisar: fretes internacionais Horizon (US$ 5.476 + US$ 10.225) · fatura de junho da ENG (produtos/valores trocados — Ricardo = OF 30.000, Luis Gustavo = OF 80.000, Maique = OF 8.000).
