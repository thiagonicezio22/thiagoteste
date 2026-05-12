# Proposta de Parceria Técnica — Thiago Nicézio

## Quem sou eu

Thiago Nicézio Santos. Sócio da ENG Soluções (referência nacional em ozônio e UV para tratamento de água) e Presidente da ABLP. Especialista em lagos ornamentais e piscinas praia com atuação no Brasil, Europa e EUA. **Não executo obras — projeto, especifico e garanto qualidade e resultado.**

### Posicionamento canônico (5 credenciais — pág 2 da proposta)

| # | Título | Subtítulo |
|---|---|---|
| 1 | Padrão Internacional | Projetos no Brasil, Europa e EUA |
| 2 | Presidente da ABLP | Normatiza o setor no Brasil |
| 3 | Sócio ENG Soluções | Domina a tecnologia por dentro |
| 4 | Especialista Técnico | Dimensionamento preciso, zero improviso |
| 5 | Garantia de Resultado | Compromisso com água cristalina |

### Frase-âncora (quote no rodapé da pág 2)

> *"Percorreu o mundo em busca das melhores tecnologias em tratamento aquático e as aplicou nos projetos mais exigentes do país."*

### Frase de encerramento (pág 11)

> *"Água cristalina não é promessa. É compromisso técnico."*

---

## Setup Obrigatório

```bash
pip install weasyprint --break-system-packages
apt-get install -y poppler-utils  # pra pdftoppm gerar previews
```

### Fontes — Google Fonts via @import
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700&display=swap');
```

### Assets obrigatórios

```
assets/
├── logo_thiago_nicezio.png        # logo oficial (extraída do pptx oficial)
├── icons/                          # 17 PNGs bronze sólido (extraídos do pptx Otávio)
│   ├── globe.png        (padrão internacional)
│   ├── medal.png        (presidente ABLP / autoridade no setor)
│   ├── gears.png        (sócio ENG / fornecimento de equipamentos)
│   ├── target.png       (especialista técnico)
│   ├── drop.png         (garantia de resultado / AquaMax)
│   ├── lock.png         (confidencialidade)
│   ├── sitemap.png      (projeto técnico / executivo)
│   ├── handshake.png    (parceria)
│   ├── wrench.png       (visita técnica + start)
│   ├── document.png     (contrato)
│   ├── bolt.png         (Ozone Fish Power)
│   ├── wind.png         (Concentrador)
│   ├── waves.png        (ENG MIX)
│   ├── sun.png          (Filtro UV)
│   ├── arrows.png       (Sistema de Injeção)
│   ├── shield.png       (Domínio Técnico Absoluto)
│   └── eye.png          (Compromisso com Resultado)
└── renders/                        # fotos opcionais (atualmente não usadas no template)
```

Todos os 17 ícones são PNG bronze sólido (256×256, RGBA) com mesmo estilo visual — extraídos diretamente do pptx oficial.

---

## Template Canônico: Proposta de Parceria Técnica — 10 páginas landscape

**Este é o ÚNICO modelo a ser usado pra todo orçamento.** Posicionamos sempre como "proposta de parceria técnica", cativa o cliente desde o primeiro contato.

Formato: **landscape PowerPoint-size** (338.67mm × 190.5mm). NÃO é A4 portrait.

### Estrutura das 10 páginas

| # | Nome | Conteúdo |
|---|---|---|
| 1 | **Capa** | Logo grande + linha dourada + "Proposta de Parceria Técnica" + subtítulo `Sistema de Filtragem para {TIPO} — {VOLUME}` + diagonal + Cliente: NOME + Data |
| 2 | **Quem é Thiago Nicezio** | H1 + logo small top-right + parágrafo intro + 5 cards 2-col (com ícones) + quote dourada com diagonal cruzando |
| 3 | **A Parceria** | H1 + subtítulo italic + parágrafo + 3 cards centralizados (Confidencialidade / Projeto Técnico / Parceria Longo Prazo) |
| 4 | **Escopo do Primeiro Projeto** | H1 + subtítulo italic `Solução Integrada para {TIPO} — {VOLUME}` + 4 cards 2x2 (Projeto Executivo / Fornecimento / Visita+Start / Confidencialidade) + quote "Objetivo Central" |
| 5 | **Equipamentos Especificados** | H1 + subtítulo italic `Sistema Personalizado para {VOLUME}` + cards 3xN com ícones bronze de cada produto (sem preços, só nome+descrição) |
| 6 | **Investimento** | H1 + subtítulo italic com condição parceiro + tabela 5 col (Equip/Qtd/Unit/Desc/Total) + descontos `-20%` em verde + subtotal + valor projeto + TOTAL GERAL Cormorant grande + footnote italic |
| 7 | **Itens Não Inclusos** | H1 + subtítulo italic "Transparência Total" + 8 items em 2 colunas + nota de explicação com diagonal |
| 8 | **Condições** | H1 + esquerda: "Investimento Total R$X" grande Cormorant + Pagamento à vista PIX + direita: 4 cards (Contrato / Pagamento / Entrega / Visita) + nota "Incluso" |
| 9 | **Por que Thiago Nicezio** | H1 + 5 cards 2-col (Padrão Internacional / Domínio Técnico / Autoridade no Setor / Compromisso / Parceiro Não Fornecedor) |
| 10 | **Encerramento** | Logo centralizada grande + linha dourada + quote italic "Água cristalina não é promessa..." + contato + "Obrigado pela confiança." |

A "página de Visualização do Projeto" (fotos da residência) foi REMOVIDA — o template não usa mais fotos reais de propriedades.

### O que muda entre clientes

Apenas: **`PROJETO` (cliente, data, tipo, volume)** + **`PRODUTOS` (lista de equipamentos)** + **`VALOR_PROJETO_EXECUTIVO`** no topo de `tools/gerar_proposta.py`. Estrutura visual, copy fixa, layout: **idênticos sempre**.

---

## Como Gerar uma Proposta

Perguntar ao Thiago:

1. **Cliente** — Nome (ex: "Marcio — Gramopool" ou "Otávio — Empresa X")
2. **Data** — Mês/Ano (ex: "Maio 2026")
3. **Tipo de projeto** — `"Lago Ornamental"` OU `"Piscina Praia"`
4. **Volume** — em litros (ex: "150.000 Litros")
5. **Equipamentos** — Lista de itens, cada um com:
   - Ícone (de `assets/icons/`)
   - Nome para card (multi-linha com `<br/>`)
   - Descrição para card
   - Nome para tabela (single-line)
   - Quantidade
   - Valor unitário tabela ENG
   - Desconto parceiro? (geralmente 20% em Ozone Fish e Filtro UV)
6. **Valor do Projeto Executivo + Visita Técnica + Start** (ex: R$ 8.000)

Daí editar `tools/gerar_proposta.py`, blocos:
- `PROJETO`: dict com `cliente`, `data`, `tipo`, `volume`
- `PRODUTOS`: lista de dicts (cada um com `icon`, `nome_card`, `desc_card`, `nome_tabela`, `qtd`, `unit`, `desc_pct`)
- `VALOR_PROJETO_EXECUTIVO`: float
- `DESCONTO_PARCEIRO_PCT`: int (geralmente 20)

E rodar:

```bash
python3 tools/gerar_proposta.py
```

O PDF sai em `output/proposta.pdf`.

### Exemplo de produto no `PRODUTOS`:

```python
{
    "icon": "bolt",                              # nome do arquivo em assets/icons/ (sem extensão)
    "nome_card": "Ozone Fish<br/>Power — Inox",  # quebra em 2 linhas no card
    "desc_card": "Gerador de ozônio industrial para tratamento de alto volume",
    "nome_tabela": "Ozone Fish Power — Inox",    # single-line para tabela
    "qtd": 1,
    "unit": 15339.00,
    "desc_pct": 20,                              # ou None se não tiver desconto
},
```

---

## Regras CRÍTICAS

- **SEMPRE 10 páginas** — não reduzir, não pular seções, não reintroduzir página de "Visualização do Projeto"
- **SEMPRE "Proposta de Parceria Técnica"** no título — não usar "Orçamento"
- **Tipo de projeto sempre presente na capa** — "Lago Ornamental" ou "Piscina Praia"
- **NUNCA inventar modelos de equipamento**. Modelos válidos:
  - Ozone Fish: 3000, 8000, 15000, 30000, 60000, 80000, 120000, Power
  - Filtro UV: 60W, 95W, 190W, 380W, Power
  - AquaMax: 35000, 50000
  - Acessórios: ENG MIX, ENG Protect, OzoneUP, Bypass da ENG, Filtro de Sílica, Concentrador de Oxigênio
- **WeasyPrint NÃO suporta flexbox** — usar `<table>` para grids/layouts lado a lado
- **Logo SEMPRE em base64** embutido no HTML (não path externo)
- **Moeda BRL**: `R$ 1.000,00` (ponto milhares, vírgula decimais) — usar a função `fmt(v)`
- **NUNCA enviar preços no chat** — somente no PDF
- **Todos os equipamentos operam em 220V**
- **Desconto parceiro 20%** padrão se aplica APENAS às linhas Ozone Fish e Filtro UV
- **Footnote sempre** na pág 7: "Valores com contrato de parceiro ENG Soluções assinado..."
- **Email do footer**: `contato@filtrosuvc.com.br`

---

## Formatador de Moeda BR

```python
def fmt(v: float) -> str:
    int_part = int(v)
    dec_part = int(round((v - int_part) * 100))
    int_str = f"{int_part:,}".replace(",", ".")
    return f"R$ {int_str},{dec_part:02d}"
```

---

## Design System — Verde-Preto + Bronze Fosco

Identidade visual alinhada ao modelo aprovado (Otávio/Gramopool).

### Cores

| Uso | Hex |
|---|---|
| **Fundo página** (verde-preto profundo) | `#04140F` |
| Fundo gradiente sutil (top-left) | `#0a2218` → `#04140F` |
| **Bronze primário** (títulos, ícones, linhas) | `#C9A56E` |
| Bronze translúcido (decoração diagonal) | `rgba(201,165,110,.08-.18)` |
| Texto principal (cream) | `#E5DCC8` |
| Texto secundário (cream-muted) | `#B5AB94` |
| Texto terciário/footer | `#8a7f6a` |
| **Verde positivo** (descontos e totais na tabela) | `#52C75E` |
| Verde escuro (variação) | `#3CC03C` |
| Fundo header tabela | `#C9A56E` (mesmo bronze) |

### Tipografia

| Elemento | Fonte | Peso | Tamanho |
|---|---|---|---|
| H1 (título de página) | Cormorant Garamond | 500 | 38pt (44pt na capa) |
| Subtitle italic (cinza) | Manrope | 400 italic | 11.5pt |
| Body parágrafo | Manrope | 400 | 10.5pt, line-height 1.6 |
| Card title (com ícone) | Cormorant Garamond | 600 | 16pt (14pt em cards-3col) |
| Card description | Manrope | 400 | 9.5pt, cream-muted |
| Tabela header | Manrope | 700 | 10pt, sobre bronze |
| Tabela body | Manrope | 400 | 10pt, cream |
| Total Geral (valor) | Cormorant Garamond | 600 | 32pt bronze |
| Footer | Manrope | 400 | 8.5pt, muted |

### Decoração assinatura — Linhas diagonais douradas

Cada página tem ~5 linhas finas em ângulo 115° / -65° com opacidade variável (.08 a .18). Implementação CSS via `background` com gradientes lineares múltiplos. Quote em cards usa uma linha diagonal de bronze mais visível CRUZANDO o texto (efeito "manuscrito riscado" estilizado).

---

## Componentes principais (snippets WeasyPrint)

**@page e .page (landscape 16:9):**
```css
@page { size: 338.67mm 190.5mm; margin: 0; background: #04140F; }
.page {
    width: 338.67mm; height: 190.5mm;
    background: radial-gradient(ellipse at top left, #0a2218 0%, #04140F 65%);
    position: relative; padding: 16mm 22mm 14mm 22mm;
    page-break-after: always; overflow: hidden;
}
.page::before {
    content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background:
        linear-gradient(115deg, transparent 18%, rgba(201,165,110,.16) 18.05%, rgba(201,165,110,.16) 18.18%, transparent 18.23%),
        linear-gradient(115deg, transparent 62%, rgba(201,165,110,.12) 62.05%, rgba(201,165,110,.12) 62.18%, transparent 62.23%),
        linear-gradient(115deg, transparent 88%, rgba(201,165,110,.08) 88.05%, rgba(201,165,110,.08) 88.15%, transparent 88.2%),
        linear-gradient(-65deg, transparent 35%, rgba(201,165,110,.10) 35.05%, rgba(201,165,110,.10) 35.18%, transparent 35.23%),
        linear-gradient(-65deg, transparent 78%, rgba(201,165,110,.13) 78.05%, rgba(201,165,110,.13) 78.18%, transparent 78.23%);
}
```

**H1 e subtitle italic (padrão de toda página de conteúdo):**
```css
h1 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500; font-size: 38pt;
    color: #C9A56E; line-height: 1.1; letter-spacing: .005em;
}
.sub-italic {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-weight: 400; font-size: 11.5pt;
    color: #B5AB94; margin-top: 1mm;
}
```

**Card 2-col (com ícone à esquerda):**
```css
.card .icon-wrap { display: inline-block; width: 11mm; height: 11mm; vertical-align: middle; }
.card .title-inline {
    display: inline-block; vertical-align: middle; margin-left: 4mm;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 16pt; color: #E5DCC8;
}
.card .desc {
    margin-top: 2mm; margin-left: 15mm;
    font-size: 9.5pt; color: #B5AB94; line-height: 1.5;
    padding-bottom: 2mm;
    border-bottom: 1px dashed rgba(201,165,110,.18);
}
```

**Tabela de Investimento:**
```css
.inv-table thead th {
    background: #C9A56E; color: #04140F;
    font-weight: 700; font-size: 10pt; padding: 3mm 4mm;
}
.inv-table tbody td {
    padding: 2.5mm 4mm; font-size: 10pt; color: #E5DCC8;
    border-bottom: 1px solid rgba(201,165,110,.10);
}
.inv-table .green { color: #52C75E; font-weight: 600; }
```

**Total Geral (linha grande):**
```css
.totals-rows tr.grand td {
    color: #C9A56E;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 22pt;
    border-top: 1px solid rgba(201,165,110,.4);
}
.totals-rows tr.grand td.r { font-size: 32pt; }
```

**Quote dourada com diagonal cruzando:**
```css
.quote { position: relative; text-align: center; margin: 6mm auto 0 auto; padding: 4mm 8mm; }
.quote-text { font-family: 'Manrope', sans-serif; font-style: italic; font-size: 11.5pt; color: #C9A56E; }
.quote::before {
    content: ''; position: absolute;
    top: 50%; left: -10mm; right: -10mm; height: 0;
    border-top: 1px solid rgba(201,165,110,.65);
    transform: rotate(-2deg);
}
```

**Footer global:**
```css
.foot {
    position: absolute; bottom: 5mm; left: 0; right: 0;
    text-align: center; font-size: 8.5pt; color: #8a7f6a;
    letter-spacing: .04em;
    border-top: 1px solid rgba(201,165,110,.18);
    padding-top: 3mm; margin: 0 22mm;
}
```

Texto fixo do footer: `Thiago Nicezio  |  contato@filtrosuvc.com.br  |  thiagonicezio.com`

---

## Higgsfield AI — Imagens de Ambientação

Para gerar imagens de lagos/piscinas quando não houver foto real do cliente.

### Credenciais
```
API_KEY=937398b8-1456-4a49-ba6d-bf3fb0414e64
SECRET=d8afc9f9e7df6b7c9854310b7463ec4821a4752c3f84a618449d5ac453f8787d
BASE=https://platform.higgsfield.ai
```

### Gerar Imagem
```python
import requests, time

HEADERS = {"Authorization": f"Key {API_KEY}:{SECRET}", "Content-Type": "application/json"}

def gerar_imagem(prompt, aspect="16:9", resolution="1080p"):
    r = requests.post(f"{BASE}/higgsfield-ai/soul/standard", headers=HEADERS, json={
        "prompt": prompt, "aspect_ratio": aspect, "resolution": resolution
    })
    rid = r.json().get("request_id")
    if not rid: return None
    for _ in range(60):
        time.sleep(5)
        s = requests.get(f"{BASE}/requests/{rid}/status", headers=HEADERS).json()
        if s.get("status") == "completed":
            # IMPORTANTE: API retorna em images[0].url (NÃO em result.outputs[0].url)
            imgs = s.get("images", [])
            return imgs[0].get("url") if imgs else None
        elif s.get("status") == "failed":
            return None
    return None
```

Script pronto em `tools/gerar_imagens.py`.

### Prompts Prontos
```python
PROMPT_LAGO = "RAW photograph, luxury ornamental pond in premium residential garden, crystal clear water with koi fish, natural stone edges, lush tropical landscaping, golden hour, Hasselblad H6D, 8K"
PROMPT_PISCINA = "RAW photograph, premium beach entry pool with shallow sandy gradient sloping into crystal clear turquoise water, tropical garden, lush landscaping, natural stone deck, luxury residential, Phase One IQ4"
PROMPT_TECNICO = "RAW photograph, professional pool equipment room, stainless steel UV filters and ozone generators, clean organized piping, premium installation, studio lighting"
```

---

## Lições Aprendidas

1. **WeasyPrint > ReportLab** para PDFs visuais
2. **Sempre 16:9 landscape** — o modelo de Thiago aprovou esse formato, não A4 portrait
3. **Cormorant REGULAR (não italic) para títulos H1** — italic só nos subtítulos e quotes
4. **Bronze fosco `#C9A56E` (não amber brilhante)** — paleta calma e premium
5. **Flex no WeasyPrint não funciona** — usar `<table>` para qualquer layout grid
6. **Page size em `@page` size:** definir em mm explícitos, não em named (a4-landscape, etc) — controle exato
7. **Diagonal lines** via `linear-gradient` empilhados — não usa SVG-background (mais lento)
8. **Quote com diagonal cruzando**: usar `position:absolute` + `transform:rotate` no `::before`, não tachado CSS
9. **Ícones em mix PNG+SVG inline**: PNG quando existe no pptx oficial, SVG inline quando precisa criar
10. **API Higgsfield**: retorna em `images[0].url` (NÃO em `result.outputs[0].url`)
11. **Nunca inventar modelos** de equipamento que não estão na tabela ENG

---

## Linha de Produtos ENG (Dimensionamento)

### Ozone Fish (por volume do lago)
| Volume | Modelo |
|---|---|
| Até 3.000L | Ozone Fish 3000 |
| 3.001-8.000 | Ozone Fish 8000 |
| 8.001-15.000 | Ozone Fish 15000 |
| 15.001-30.000 | Ozone Fish 30000 |
| 30.001-60.000 | Ozone Fish 60000 |
| 60.001-80.000 | Ozone Fish 80000 |
| 80.001-120.000 | Ozone Fish 120000 |
| 120.001-300.000 | 1× Ozone Fish Power |
| 300.001-600.000 | 2× Ozone Fish Power |
| 600.001-900.000 | 3× Ozone Fish Power |
| 900.001-1.000.000 | 4× Ozone Fish Power |
| Acima de 1.000.000 | NÃO DIMENSIONAR — engenharia |

### Filtro UV (por volume)
| Volume | Modelo |
|---|---|
| Até 18.000L | UV 60W |
| 18.001-25.000 | UV 95W |
| 25.001-50.000 | UV 190W |
| 50.001-100.000 | UV 380W |
| 100.001-1.000.000 | Filtro UV Power |

### Acessórios Obrigatórios
| Volume | Acessórios |
|---|---|
| Até 15.000 | Filtro de sílica + Bypass. Se úmido: + OzoneUP |
| 15.001-60.000 | Filtro de sílica + Bypass. Se úmido: OzoneUP + Bypass (OzoneUP substitui sílica) |
| 60.001-79.999 | SOMENTE Bypass |
| 80.000+ | Concentrador + ENG MIX + Bypass (1 concentrador e 1 ENG MIX por Ozone Fish) |

### Equipe Comercial
| Agente | Estados |
|---|---|
| Thiago | PR, MG, GO, MT, MS, SE, RJ, BA, PA, MA, RN, PI, TO, RR, RO |
| Ismar | SP, RS, SC, ES, DF, PE, CE, AM, AL, PB, AC, AP |
| Julia | Pós-venda (todos) |
| Thiago Nicézio | Projetos (todos) |
