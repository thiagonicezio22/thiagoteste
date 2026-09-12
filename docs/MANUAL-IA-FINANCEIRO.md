# MANUAL FINANCEIRO COMPLETO — THIAGO NICÉZIO
**Documento mestre de todas as planilhas · para a IA financeira (WhatsApp/n8n) e para consulta.
Atualizado em 20/08/2026.**

Quando o Thiago mandar mensagem informal ("vendi um ozone 15 mil por 3.400", "paguei o antonio 2 mil", "andré aportou 10 mil", "gastei 800 no mercado"), identifique a planilha, a aba e a linha corretas usando as regras abaixo. **Nunca invente valores. Na dúvida, pergunte.**

## As 5 planilhas

| # | Arquivo | O que controla |
|---|---|---|
| 1 | `Controle Financeiro Obras - Thiago Nicezio.xlsx` | Obras pessoais do Thiago + operações de EPDM |
| 2 | `Lojão Aquático - Financeiro.xlsx` | Loja no Mercado Livre (equipamentos ENG) |
| 3 | `Horizon - Controle Financeiro.xlsx` | Horizon Brasil/EUA — sociedade com André (50/50) |
| 4 | `Horizon Paraguai - Financeiro.xlsx` | Filial Paraguai — 3 sócios (30/30/40) |
| 5 | `Financeiro Pessoal - Thiago.xlsx` | Finanças pessoais (entradas, gastos, dívidas) |

Apoio: `tabela de custo.xlsx` (tabela executiva ENG — fonte oficial dos custos de equipamento).
Obsoletos (não alimentar): `Financeiro (lojao.xlsx`, `VALORES EPDM.xlsx`, `EPDM - Gramoterra e Coral Home.xlsx`.

---

## REGRAS DE OURO (valem para tudo)

1. **Células AZUIS = entrada de dados.** Colunas com fórmula (lucro, margem, saldo, acumulado, mês, quota) NUNCA são sobrescritas.
2. **Lançar sempre na primeira linha vazia** dentro do range da tabela (ranges listados abaixo). Fora do range as somas não enxergam.
3. **Status com grafia exata** (os SUMIFS são sensíveis): `Pago`, `Pendente`, `Recebido`.
4. **Datas** como data real (DD/MM/AAAA), não texto.
5. Depois de lançar, **conferir o total da aba** e responder ao Thiago com o número novo.
6. Todos os arquivos têm `fullCalcOnLoad` — o Excel recalcula ao abrir.
7. **Backup antes de editar** (copiar com sufixo de data).
8. **Pagamento direto de sócio = 2 lançamentos**: despesa + aporte (vale para Horizon Brasil e Paraguai).
9. **O arquivo de Obras tem GRÁFICOS** — salvar com openpyxl os destrói. Editar via XML ou recriar o gráfico ao salvar.

---

# 1. CONTROLE FINANCEIRO OBRAS + EPDM

Abas: `Resumo Geral` (leitura) · `Calendário Recebimentos` · `Custos Equipamentos` · `RJ Maricá` · `Gramoterra` · `Itu` · `Rei dos Motores` · `Obra em Branco 3` · `Dashboard EPDM` (leitura) · `EPDM Gramoterra` · `EPDM Coral Home`.

**REGRA: cada obra é única — o Resumo Geral NÃO consolida totais.** Só compara obra a obra.

## 1.1 Estrutura padrão de uma aba de obra

| Onde | O que é |
|---|---|
| C8 / C9 / I8 / C10 | Cliente · Cidade/UF · CNPJ · Data de fechamento |
| Linhas 14–19 | Cronograma: B parcela · C vencimento · D recebido em · E valor · G status (`Recebido`/`Pendente`) |
| E21 / E22 / E23 | Total recebido · A receber · % pago (fórmulas) |
| Linhas 27–34 | Equipamentos: B nome · C qtd · D custo automático (PROCV na aba Custos Equipamentos) · E custo manual · F total |
| F35 | Total equipamentos |
| B36/F36 · B37/F37 | Marcadores livres (ex.: "A pagar à ENG", "PAGO — QUITADO") |
| C39 / H39 | Custos operacionais: arquiteta ou prestador · Felipe |
| C42 / E42 / G42 / I42 | Viagem: combustível · pedágios · alimentação · hospedagem |
| B47–B51 / I47–I51 | Outros adicionais: descrição + valor |
| I56–I64 | Resultado: receita · (−) NF 12% automática · (−) custos · LUCRO |

**Se o nome em B for igual ao da aba `Custos Equipamentos`, D puxa o custo sozinho** (deixar E = 0). Senão, digitar o valor em E.

**Exceção:** a aba `Gramoterra` tem layout próprio — equipamentos 22–29, outros 42–46, resultado I51–I59.

## 1.2 Situação das obras (20/08/2026)

| Obra | Contrato | Recebido | A receber | Lucro | Observações |
|---|---|---|---|---|---|
| **RJ Maricá** (União de Benefícios, Niterói/RJ) | 168.000 | 140.000 | 28.000 (24/08) | 85.779,31 | ENG: equip. 34.760,69 + mão de obra 4.000 − 25.000 pagos = **saldo 13.760,69** |
| **Gramoterra** (Xangri-Lá/RS) | 74.786,80 | 74.786,80 | 0 | 22.687,21 | inclui comissão eng. Antonio 5.415,39 + adicionais ENG 7.000 |
| **Itu** (Itu/SP) | 40.000 | 20.000 | 20.000 | 23.532,06 | ENG QUITADA (2.506,41 em 24/07) · bombas Tropical pagas (2.687,82) · **pendente: Lojão fibra 4.900** |
| **Rei dos Motores** | 28.000 | 14.000 | 14.000 (fim da obra) | 9.015,92 | comissão Antonio **15% do lucro** (fórmula) = 1.591,04 · a pagar Lojão 1.650 · a pagar Isac 1.205 |

Equipamentos da Rei dos Motores: fibra Lojão 1.300 · UV Lojão 350 · manta Isac 1.025 · frete manta 180 · bomba AquaMax 20.000 450 · Ozone Fish 3.000 (tabela) 528,04 · custos adicionais 3.000 = **6.833,04**. Mão de obra: Fernando 3.500 + Felipe 2.500. Viagem 1.200.

## 1.3 Abas EPDM (importação e revenda de manta)

- Imposto = **12% sobre o valor recebido do cliente** · custos = valores reais pagos · lucro dividido **50/50 com o pai (Antonio)**.
- `EPDM Gramoterra`: custos D6–D9 · venda B14 · comissão a receber B15 (**10.000 PENDENTE**) · lucro 61.272,26.
- `EPDM Coral Home`: fornecedor C6/C7 · despesas JM C10 (**36.576,34 A PAGAR**) · imposto C11 (fórmula 12%) · recebido B19/B20 · a receber B22 (**95.000 PENDENTE**) · lucro 71.531,78.
- `Dashboard EPDM`: lucro total **132.804,04** · B11 = já enviado ao pai (20.000) · **saldo a enviar ao pai: 46.402,02**.

---

# 2. LOJÃO AQUÁTICO

Loja no Mercado Livre. Fornecedor: ENG Soluções (Antonio, pai do Thiago).
Abas: `DASHBOARD` (leitura) · `VENDAS` · `Custos ENG` · `PAGAMENTOS ENG` · `COMPRAS E CUSTOS`.

## 2.1 Nova venda → aba VENDAS (linhas 12–71)

| Col | Campo |
|---|---|
| A | nº sequencial |
| B | data |
| C | nº da venda ML |
| D | produto |
| E | **modelo** (chave do PROCV: `3000, 8000, 15000, 30000, 60000, 80000, 120000, 300000, 500000`, `UV 95W`, `VENTURI`, `AQUAMAX 35000`…) |
| F | valor bruto (relatório ML: "Receita por produtos") |
| G | recebido líquido (relatório ML: "Total BRL") |

H (tarifas), I (custo ENG via PROCV em `Custos ENG` B9:D51), J (lucro), K (margem), L (mês) calculam sozinhos.
Vendas canceladas/reembolsadas (Total = 0) **não entram**. Anúncio "Ozone Fish 300.000" = **Power**.

## 2.2 Outras abas

- **PAGAMENTOS ENG** (linhas 12–41): A data · B valor · C descrição. Resumo: B8 devido · D8 pago · B9 saldo.
- **COMPRAS E CUSTOS**: compras linhas 18–32 (A data · B item · C valor · D status · E obs); recorrentes 38–45. Investimento inicial linhas 9–13 (fechado em 3.321,34).
- **Custos ENG** (B9:D51): coluna D = custo. Fonte: `tabela de custo.xlsx` (tabela executiva ENG, 24/07/2026).

## 2.3 Situação (24/07/2026)

| Indicador | Valor |
|---|---|
| Vendas registradas | 19 (nov/25 a jul/26), conferidas com os relatórios oficiais ML |
| Recebido líquido | 79.641,78 |
| Tarifas ML | 16.384,12 |
| Custo ENG (devido) | 17.410,89 |
| Lucro | 62.230,89 |
| Pago ao Antonio | 17.410,89 (5.141,68 + 2.368,57 + 9.900,64 em 24/07) |
| **Saldo com o Antonio** | **R$ 0,00 — QUITADO** |
| Compras + investimento | 33.218,34 |
| **Caixa do Lojão** | **29.012,55** |

Compras: caixas de fibra P 10×1.100 = 11.000 · protótipo P 950 · protótipo G 3.300 · pedido 2 (adiantamento) 12.000 · cano 110mm Plastolândia 397 · contabilidade 9×250 = 2.250. Investimento inicial: suporte notebook 168 + RAM 1.324 + papel/impressora 429,34 + CNPJ 1.400.

**Atenção — fatura de junho da ENG está errada** (produtos/valores trocados): Ricardo Lessa = OF 30.000 · Luis Gustavo Ibanez = OF 80.000 · Maique Cabral = OF 8.000. A planilha usa os dados oficiais do ML.

---

# 3. HORIZON BRASIL / EUA

**Horizon Pools and Lagoons Ltda** · CNPJ 66.319.861/0001-45 · sociedade **Thiago 50% · André 50%** · moeda R$ (conta USD convertida a **R$ 5,20**).
Abas: `Dashboard` (leitura) · `Aportes Sócios` · `Despesas` · `Vendas` · `Compromissos Futuros` · `Acerto Sócios` · `Configurações`.

## 3.1 Lógica do acordo (não alterar)

- **Saldo devedor = EQUALIZAÇÃO 50/50**: (aportes do André − aportes do Thiago) ÷ 2 − devolvido. **NÃO é o total aportado pelo André.**
- Cada venda: lucro 50/50; **25% do lucro** (metade da parte do Thiago) abate o saldo até igualar.
- Aportes do Thiago reduzem o saldo devedor.
- **SISPAG/conta = `Empresa`**; pagamento direto de sócio = despesa + aporte.

## 3.2 Ranges

- **Aportes Sócios**: 12–61 → A data · B sócio · C descrição · D forma · E valor.
- **Despesas**: 12–111 → A data · B categoria · C descrição · D fornecedor · E forma · F valor · G pago por · H status.
- **Vendas**: 12–61 → A data · B cliente · C descrição · D valor bruto · E custos. F–K calculam.
- **Compromissos Futuros**: 12–41. Ao pagar: status `Pago` + lançar a despesa.
- **Configurações**: C10/C11 participação · C12 retenção 25% · **C13 câmbio US$** · contabilidade **R$ 250/mês pela conta**.
- **Acerto Sócios B20** = saldo real em conta (do extrato).

## 3.3 Situação (09/08/2026 — extratos BRL e USD conciliados)

| Indicador | Valor |
|---|---|
| Total investido | 161.350,66 |
| Despesas | 159.619,66 |
| Custos em reais | 69.120,00 |
| Custos em dólar | US$ 17.403,78 (= 90.499,66) |
| Aportes André | 157.499,66 (97,6%) |
| Aportes Thiago | 3.851,00 (2,4%) |
| **Saldo para igualar 50/50** | **76.824,02** (cada sócio ficará com 80.675,33) |
| Saldo em conta BRL | 1.732,23 |
| A pagar | **R$ 0,00** |

**Materiais:** pedra = 2 contêineres com quantidade reduzida (46 t × R$ 600 = **27.600**, Isailde), quitada em 15.000 + 5.000 + 1.500 + 6.100 · frete da pedra 15.400 (13.000 conta + 2.400 Thiago por fora) · areia 1 contêiner 5.000 + frete 6.720 · arquiteto Guilherme 12.000 (quitado) · papelão 700 · certificado 250 · contabilidade 1.450.

**Dólar:** Altha Cargos US$ 13.523,78 = 70.323,66 (wire 15/07) · Python Logistics US$ 2.880 = 14.976 (Zelle 29/07) · abertura da empresa nos EUA US$ 1.000 = 5.200 (pago direto pelo André, data a confirmar).

**Conciliação:** caixa estimado = saldo do extrato = 1.732,23 → **diferença ZERO**.

**Histórico (não relançar):** removidos os registros duplicados "Isailde 30.000 direto pelo André" e "pedra parcela 3 — 2.400 do Thiago" (o 2.400 dele era o FRETE); SISPAG de 1.500 (01/07) identificado como pagamento da pedra; contabilidade corrigida para 250/mês pela conta; saldo do acordo corrigido para equalização 50/50.

---

# 4. HORIZON FILIAL PARAGUAI

**Sociedade: Thiago 30% · André 30% · Philipe Colibri 40%** · moeda base **US$** · fase de estruturação (constituída em ago/2026).
Abas: `Dashboard` (leitura) · `Aportes` · `Despesas` · `Acerto Sócios` (leitura) · `Configurações`.

## 4.1 Ranges e regras

- **Aportes**: 12–56 → A data · B sócio (`Thiago`/`André`/`Philipe`) · C descrição · D forma · E valor US$.
- **Despesas**: 12–61 → A data · B categoria · C descrição · D fornecedor · E forma · F valor US$ · G pago por · H status.
- **Equalização 30/30/40**: quota ideal = % × total investido; saldo = aportado − quota (positivo = crédito; negativo = precisa aportar; **a soma dos saldos é sempre zero**). Percentuais em Configurações C10/C12/C14.
- Pagamento direto de sócio = despesa + aporte.

## 4.2 Situação (09/08/2026)

| Sócio | % | Aportado | Quota ideal | Situação |
|---|---|---|---|---|
| André | 30% | US$ 3.000 | US$ 900 | **crédito de US$ 2.100** |
| Thiago | 30% | US$ 0 | US$ 900 | a aportar US$ 900 |
| Philipe | 40% | US$ 0 | US$ 1.200 | a aportar US$ 1.200 |

Único lançamento: abertura da empresa no Paraguai **US$ 3.000, paga pelo André** (data a confirmar). Caixa US$ 0.

---

# 5. FINANCEIRO PESSOAL

Abas: `Dashboard` (leitura) · `Categorias` · `Entradas` · `Saídas` · `Dívidas e Parcelas`.
Método: **lançamento por mês/fatura** (não gasto a gasto).

## 5.1 Ranges

- **Entradas** (12–111): A data · B origem (ENG, Obras/Projetos, Lojão, EPDM, Horizon, Sua Natureza, Outros) · C descrição · D valor. E = mês (fórmula).
- **Saídas** (12–211): A data · B categoria · C descrição · D valor · E forma. F = mês (fórmula).
- **Dívidas e Parcelas** (12–41): A descrição · B credor · C total (fórmula) · D valor da parcela · E nº parcelas · F já pagas · G saldo (fórmula) · H término.
- **Categorias**: despesas B8:B23 · origens B26:B32. Editáveis.
- **Dashboard**: mês a mês (linhas 14–25) e categorias (30–45), tudo por SUMIFS.

**Regra:** toda parcela vai na categoria `Parcelas / Empréstimos` na aba Saídas **e** é cadastrada na aba Dívidas (para o saldo devedor).

## 5.2 Situação (agosto/2026 — levantamento parcial)

| Indicador | Valor |
|---|---|
| Salário fixo (ENG) | 12.000,00 |
| **Custo mensal mapeado** | **13.328,42** |
| **Resultado com o salário** | **−1.328,42** (o restante vem do lucro das obras) |
| Parcelas por mês | 3.306,52 (25% do custo) |
| Saldo devedor total | 27.776,31 |

**Gastos por categoria:** Moradia/aluguel 4.700 (35%) · Parcelas 3.306,52 (25%) · Bruna/casa 2.500 (19%) · Pets/Pedro Mel 1.500 (11%) · ABLP 600 · Telefonia e Internet 579 (Starlink 319 + internet 100 + TIM 80 + Claro 80) · Faculdade Bruna 79 · Amazon Prime 13,90 · fatura Santander 50.

**Dívidas:**

| Item | Parcela | Situação | Falta pagar | Termina |
|---|---|---|---|---|
| Tucson — financiamento | 1.664,60 | 2/12 | 16.646,00 | jun/2027 |
| Mercado Livre — 6 compras parceladas | 1.019,51 | várias | 8.240,94 | jan/2028 |
| Peças Pajero | 535,50 | 6/10 | 2.142,00 | dez/2026 |
| Shopee — gastos gerais | 86,91 | 5/12 | 608,37 | mar/2027 |
| Amazon Prime (anual parcelado) | 13,90 | 2/12 | 139,00 | jun/2027 |
| **TOTAL** | **3.306,52/mês** | | **27.776,31** | |

Detalhe do Mercado Livre: carregador portátil 326,15 (1/18) · 87,75 (5/10) · 164,80 (7/10) · 64,49 (6/10) · 296,70 (6/10) · 79,62 (6/10).

**Alívios já programados:** nov/2026 −164,80 · dez/2026 −976,31 (Pajero + 3 compras ML) · jun/2027 −1.664,60 (Tucson).

**AINDA FALTA MAPEAR:** mercado/supermercado · combustível · luz e água · plano de saúde · restaurantes e delivery · farmácia · faturas dos outros cartões · seguro do carro/IPVA. Com esses itens o custo real deve passar de R$ 15 mil.

---

# 6. EXEMPLOS DE COMANDO → AÇÃO

| Thiago escreve | Ação |
|---|---|
| "vendi um ozone 30 mil, bruto 3.885, caiu 3.215,63, venda nº 2000..." | Lojão → VENDAS, nova linha (modelo 30000) |
| "paguei o antonio 5 mil" | Lojão → PAGAMENTOS ENG **ou** marcador da obra citada (perguntar se não estiver claro) |
| "comprei embalagens 800 pro lojão" | Lojão → COMPRAS E CUSTOS |
| "andré mandou 10 mil" | Horizon Brasil → Aportes (André) |
| "paguei 2 mil de frete, eu mesmo" | Horizon → Despesas (Pago Por Thiago) **+** Aportes (Thiago) |
| "philipe aportou 1.200 dólares" | Horizon Paraguai → Aportes (Philipe) |
| "recebi a última parcela do RJ" | Obras → RJ Maricá, cronograma: status `Recebido` |
| "recebi os 14 mil finais da Rei dos Motores" | Obras → Rei dos Motores, linha 15: status `Recebido` |
| "gramoterra pagou a comissão" | Obras → EPDM Gramoterra B15: status RECEBIDO |
| "mandei 10 mil pro meu pai do EPDM" | Obras → Dashboard EPDM B11: somar 10.000 |
| "paguei a JM logística" | Obras → EPDM Coral Home C10: status PAGO |
| "gastei 900 no mercado" | Pessoal → Saídas (categoria Alimentação) |
| "paguei a fatura do nubank 2.300" | Pessoal → Saídas (categoria Cartão de crédito) |
| "fechei obra nova de 50 mil" | Obras → usar `Obra em Branco 3` (ou criar aba); perguntar cliente, cidade, parcelas, equipamentos e comissões |

---

# 7. PENDÊNCIAS EM ABERTO

**A receber:** 28.000 RJ Maricá (24/08) · 20.000 Itu · 14.000 Rei dos Motores · 10.000 comissão Gramoterra (EPDM) · 95.000 Coral Home (EPDM).

**A pagar:** 13.760,69 ENG (RJ Maricá) · 4.900 Lojão (fibra da Itu) · 1.650 Lojão + 1.205 Isac (Rei dos Motores) · 36.576,34 JM Logística (EPDM) · impostos NF EPDM (28.924,40 + 29.400) · 46.402,02 ao pai (metade do lucro EPDM).

**Organizar:** aportes de Thiago e Philipe no Paraguai (900 e 1.200 USD) · corrigir a fatura de junho da ENG · completar os gastos pessoais que faltam mapear · confirmar a data da abertura da empresa nos EUA e no Paraguai.
