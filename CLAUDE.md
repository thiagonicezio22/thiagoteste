# Gerador de Orçamentos Premium — Thiago Nicézio

## Quem sou eu

Thiago Nicézio Santos. Sócio da ENG Soluções (referência nacional em ozônio e UV para tratamento de água) e presidente da ABLP. Especialista em lagos ornamentais e piscinas praia.

### Credenciais (4 cards usados na seção Institucional)
1. **Experiência de Campo** — Anos de atuação prática em lagos ornamentais e piscinas praia no Brasil
2. **ENG Soluções** — Sócio da empresa referência nacional em tratamento de água
3. **Liderança Setorial** — Presidente da ABLP, liderando padronização e profissionalização do mercado
4. **Domínio Técnico Completo** — Concepção, hidráulica, circulação, filtragem, UV, ozônio, automação, comissionamento

---

## Setup Obrigatório

```bash
pip install weasyprint --break-system-packages
```

### Fontes — Google Fonts via @import no CSS
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@200;300;400;500;600;700&display=swap');
```
- **Cormorant Garamond** — títulos serif
- **Manrope** — corpo sans

### Logo
- `assets/logo_thiago_nicezio.png` — embutir via base64 no HTML
- Se não existir, procurar em `pptx_images/slide1_img3.png` ou extrair de qualquer PPTX

### Imagens de Ambientação
- `assets/renders/lago_ornamental.jpg` — hero pra orçamentos de execução
- `assets/renders/piscina_praia.jpg` — hero pra piscina praia
- `assets/renders/casa_de_maquinas/*` — renders 3D técnicos do Thiago (sala de máquinas, biofiltro, skimmer, comissionamento)

---

## Fluxo do PDF Integrado (Padrão)

PDF único de 3 páginas A4, gerado UMA VEZ por cliente:

1. **Página 1 — Apresentação Institucional**
   - Header (logo + nome) + tagline
   - "Quem sou" (parágrafo curto)
   - 4 cards de credenciais
   - Imagem hero
2. **Página 2 — Tecnologia & Diferenciais**
   - 3 diferenciais (UV+Ozônio sem químicos / Engenharia hidráulica / Acompanhamento integral)
   - Grid de 4 renders técnicos (casa de máquinas, biofiltro, isométrica, comissionamento)
3. **Página 3 — Orçamento**
   - Equipamentos ENG **ou** Execução de Lago (escolher template)

Se o cliente já recebeu a institucional antes, gerar só a Página 3 (orçamento standalone).

---

## Como Gerar um Orçamento

Perguntar:

1. **Tipo**: Equipamentos ENG ou Execução de Lago?
2. **Cliente**: Nome da empresa, CNPJ, cidade/estado, telefone, email
3. **Local da obra** (se execução): nome do local, cidade/estado
4. **Produtos** (se equipamentos): lista com descrição, quantidade, valor unitário
5. **Valores**: total, área (se execução), prazo em dias
6. **Desconto?**: percentual, condição, quais produtos
7. **Exclusões**: o que NÃO está contemplado
8. **Condições de pagamento**: PIX, parcelamento, validade
9. **Email do footer**: `contato@filtrosuvc.com.br` (ENG) ou `contato@thiagonicezio.com` (pessoal)
10. **Apresentação institucional incluída?** (sim por padrão; não se cliente já recebeu)

Depois gerar o script Python e rodar para criar o PDF.

---

## Regras CRÍTICAS

- **NUNCA inventar modelos de equipamento** que não existem. Modelos válidos:
  - Ozone Fish: 3000, 8000, 15000, 30000, 60000, 80000, 120000, Power
  - Filtro UV: 60W, 95W, 190W, 380W, Power
  - AquaMax: 35000, 50000
  - Acessórios: ENG MIX, ENG Protect, OzoneUP, Bypass da ENG, Filtro de Sílica, Concentrador de Oxigênio
- **Cada página em A4** — se não couber, reduzir paddings e font-sizes
- **WeasyPrint NÃO suporta bem flexbox** — usar `<table>` para grids/layouts lado a lado
- **Logo SEMPRE em base64** embutido no HTML (não path externo)
- **Moeda BRL**: `R$ 1.000,00` (ponto para milhares, vírgula para decimais)
- **NUNCA enviar preços no chat** — somente no PDF
- **Todos os equipamentos operam em 220V**

---

## Formatador de Moeda BR

```python
def fmt(v):
    """Formata valor como Real brasileiro."""
    int_part = int(v)
    dec_part = int(round((v - int_part) * 100))
    int_str = f"{int_part:,}".replace(",", ".")
    return f"R$ {int_str},{dec_part:02d}"
```

---

## Design System — Marinho Profundo + Amber

Identidade alinhada ao site thiagonicezio.com.

### Cores
| Uso | Hex |
|---|---|
| Fundo página (marinho profundo) | `#06090F` |
| Fundo secundário (gradiente sutil) | `#0a1224` → `#0f172a` |
| Bordas/superfícies | `#1e293b` |
| Texto principal (creme quente) | `#f5f1e8` |
| Texto secundário | `#94a3b8` |
| Texto terciário/labels | `rgba(245,241,232,.72)` |
| **Amber primário** (títulos, linhas, labels) | `#fbbf24` |
| **Amber profundo** (header tabela, destaques) | `#f59e0b` |
| Amber luminoso (hover/glow) | `#fcd34d` |
| Amber translúcido (bg cards) | `rgba(245,158,11,.08)` |
| Total Box (dourado luxo) | `#f59e0b` → `#fbbf24` → `#fcd34d` |
| Total Box texto (sobre dourado) | `#06090F` |
| Exclusões borda/título | `#dc2626` / `#fca5a5` |
| WhatsApp | `#25D366` |

### Tipografia
| Elemento | Fonte | Peso | Tamanho |
|---|---|---|---|
| Título principal ("ORÇAMENTO", "THIAGO NICÉZIO") | Cormorant Garamond | 500 italic | 22-26pt |
| Section titles | Cormorant Garamond | 500 | 11-13pt |
| Nome do cliente | Manrope | 600 | 11pt |
| Labels uppercase | Manrope | 700 (letter-spacing .12em) | 6.5pt |
| Corpo / detalhes | Manrope | 400 | 7.5-8.5pt |
| Total (valor grande) | Manrope | 700 | 26pt |
| Footer principal | Manrope | 400 | 7pt |
| Footer secundário | Manrope | 300 | 6pt |

### Componentes (WeasyPrint)

**Página base com gradiente marinho:**
```css
@page { size: A4; margin: 0; background: #06090F; }
body { font-family: 'Manrope', sans-serif; color: #f5f1e8; background: #06090F; margin: 0; }
.page {
    background: radial-gradient(ellipse at top, #0f172a 0%, #06090F 60%);
    position: relative; padding: 22mm 24mm 18mm 24mm;
    page-break-after: always;
    width: 210mm; min-height: 297mm; box-sizing: border-box;
}
.page:last-of-type { page-break-after: auto; }
```

**Textura de fundo (grid amber sutil):**
```css
.page::before {
    content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background:
        repeating-linear-gradient(0deg, transparent 0 14px, rgba(245,158,11,.02) 14px 15px),
        repeating-linear-gradient(90deg, transparent 0 14px, rgba(245,158,11,.02) 14px 15px);
}
.page > * { position: relative; z-index: 1; }
```

**Gold line decorativa:**
```css
.gold-line {
    width: 50mm; height: 1.2px;
    background: linear-gradient(90deg, transparent, #fbbf24, transparent);
    margin: 0 auto;
    box-shadow: 0 0 8px rgba(251,191,36,.4);
}
```

**Client Card:**
```css
.client-card {
    background: linear-gradient(135deg, rgba(245,158,11,.08) 0%, rgba(245,158,11,.02) 100%);
    border: 1px solid rgba(251,191,36,.18);
    border-radius: 3mm; padding: 3mm 5mm;
}
```

**Credencial Card (4 cards na institucional):**
```css
.cred-card {
    background: linear-gradient(135deg, rgba(245,158,11,.06), rgba(245,158,11,.01));
    border: 1px solid rgba(251,191,36,.15);
    border-left: 2px solid #fbbf24;
    border-radius: 2mm; padding: 4mm 5mm;
}
.cred-card .num {
    font-family: 'Cormorant Garamond', serif;
    color: #fbbf24; font-size: 18pt; font-weight: 500;
    line-height: 1; opacity: .7;
}
.cred-card .title {
    font-family: 'Manrope', sans-serif;
    color: #f5f1e8; font-size: 9pt; font-weight: 700;
    letter-spacing: .04em; margin-top: 1mm;
}
.cred-card .desc {
    color: rgba(245,241,232,.7); font-size: 7.5pt; line-height: 1.4; margin-top: 1.5mm;
}
```

**Table header dourado luminoso:**
```css
.equip-table thead th {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: #06090F; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; font-size: 6.5pt;
    padding: 2mm 3mm; text-align: left;
}
.equip-table tbody td {
    padding: 2mm 3mm; border-bottom: 1px solid rgba(251,191,36,.08);
    font-size: 8pt; color: #f5f1e8;
}
```

**Total Box (dourado luxo):**
```css
.total-box {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%);
    border: 1.5px solid rgba(251,191,36,.85);
    border-radius: 3mm; padding: 4.5mm 6mm; text-align: center;
    box-shadow: 0 4px 24px rgba(245,158,11,.35);
    color: #06090F;
}
.total-box .label { font-size: 7pt; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; opacity: .85; }
.total-box .value { font-family: 'Manrope', sans-serif; font-size: 26pt; font-weight: 700; line-height: 1; margin-top: 1.5mm; }
```

**Exclusions Box (vermelho):**
```css
.excl-box {
    background: rgba(220,38,38,.06);
    border: 1px solid rgba(220,38,38,.25);
    border-left: 3px solid #dc2626;
    border-radius: 2.5mm; padding: 2.5mm 5mm;
}
.excl-box .title { color: #fca5a5; font-size: 8pt; font-weight: 700; }
```

**Transparency Box (dourado glow):**
```css
.transp-box {
    background: linear-gradient(135deg, rgba(245,158,11,.08), rgba(245,158,11,.02));
    border: 1px solid rgba(251,191,36,.2);
    border-left: 3px solid #fbbf24;
    border-radius: 2.5mm; padding: 2.5mm 5mm;
}
```

**Discount Badge:**
```css
.discount-badge {
    display: inline-block; background: #fbbf24; color: #06090F;
    font-size: 6pt; font-weight: 700; padding: 0.8mm 2mm;
    border-radius: 1.5mm; margin-left: 2mm; letter-spacing: .05em;
}
```

**Condition Items (bullet amber glow):**
```css
.condition-item {
    font-size: 7.5pt; color: rgba(245,241,232,.8); margin-bottom: 1.2mm;
    padding-left: 4mm; position: relative;
}
.condition-item::before {
    content: ''; position: absolute; left: 0; top: 2.2px;
    width: 4px; height: 4px; border-radius: 50%;
    background: #fbbf24; box-shadow: 0 0 4px rgba(251,191,36,.6);
}
```

**Footer (absoluto no bottom):**
```css
.footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 3mm 22mm; text-align: center;
    border-top: 1px solid rgba(251,191,36,.12);
    background: rgba(6,9,15,0.95);
    font-size: 7pt; color: rgba(245,241,232,.6);
}
```

**Imagem hero (institucional):**
```css
.hero-img {
    width: 100%; height: 55mm; object-fit: cover;
    border-radius: 3mm; border: 1px solid rgba(251,191,36,.15);
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
}
```

**Grid de renders técnicos (2x2):**
```css
.renders-grid { width: 100%; border-collapse: separate; border-spacing: 2mm; }
.renders-grid td {
    width: 50%; height: 50mm;
    background: #0a1224; border: 1px solid rgba(251,191,36,.12);
    border-radius: 2mm; padding: 0; overflow: hidden;
}
.renders-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }
.renders-grid .cap {
    background: linear-gradient(180deg, transparent, rgba(6,9,15,.85));
    color: #fbbf24; font-size: 7pt; padding: 1.5mm 2mm;
    position: absolute; bottom: 0; left: 0; right: 0;
}
```

---

## Template Página 1 — Apresentação Institucional

Seções (top → bottom):
1. **Header** — Logo (40mm largura) à esquerda, "THIAGO NICÉZIO" em Cormorant 18pt à direita, "Lagos Ornamentais & Piscinas Naturais" em Manrope 8pt cinza
2. **Gold line decorativa**
3. **Hero image** (lago_ornamental.jpg) — 55mm de altura, full-width
4. **"QUEM SOU"** — section title amber + 1 parágrafo de 3-4 linhas
5. **Grid 2x2 de credenciais** (os 4 cards, usando `.cred-card`)
6. **Footer** — telefone, email, site

## Template Página 2 — Tecnologia & Diferenciais

1. **Header reduzido** (só "TECNOLOGIA & METODOLOGIA" em Cormorant)
2. **3 diferenciais** (tabela 3 colunas):
   - Tratamento UV + Ozônio (sem cloro/químicos agressivos)
   - Engenharia Hidráulica de Ponta (dimensionamento, automação)
   - Acompanhamento Integral (concepção → comissionamento)
3. **Grid 2x2 de renders técnicos**:
   - Top-down sala de máquinas (4 grupos de filtros)
   - Isométrica completa (biofiltro + casa de máquinas)
   - Calha/skimmer com bicos
   - Comissionamento (operário inspecionando bombas)
4. **Footer**

## Template Página 3 — Orçamento

Usar o template apropriado (Equipamentos ENG ou Execução de Lago — abaixo).

---

## Template: Orçamento de Equipamentos ENG

Usar quando o orçamento listar produtos ENG com quantidades e valores unitários.

Seções do PDF:
1. Header (logo + "ORÇAMENTO" + subtítulo)
2. Client Card (nome, CNPJ, cidade, tel, email, data, vendedor)
3. Tabela de Equipamentos (descrição, qtd, valor unit., total) com header dourado
4. [Opcional] Box de desconto condicional (verde)
5. Totals block (subtotal, desconto, projeto) alinhado à direita
6. Total Box dourado grande
7. Condições (bullets dourados)
8. Footer

Email footer para ENG: `contato@filtrosuvc.com.br`
Padding: `22mm 24mm 18mm 24mm` (mais espaçoso pois tem menos seções)

---

## Template: Orçamento de Execução de Lago

Usar quando o orçamento for para construção/execução de lago ornamental.

Seções do PDF:
1. Header (logo + "ORÇAMENTO" + "Execução de Lago Ornamental")
2. Client Card
3. Local da Obra (box centralizado)
4. Escopo da Execução (grid 2x2 com table: Execução / Área / Prazo / Margem)
5. Total Box dourado (com valor por m² abaixo)
6. [Opcional] Nota de margem (ex: "20% de margem já inclusos")
7. [Opcional] Exclusões Box (vermelho)
8. Transparência entre Parceiros Box (dourado)
9. Condições
10. Footer

Email footer pessoal: `contato@thiagonicezio.com`
Padding: `10mm 22mm 12mm 22mm` (mais compacto pois tem mais seções)

---

## Higgsfield AI — Imagens de Ambientação

Para gerar imagens de lagos/piscinas e inserir nos orçamentos via base64.

### Credenciais
```
API_KEY=937398b8-1456-4a49-ba6d-bf3fb0414e64
SECRET=d8afc9f9e7df6b7c9854310b7463ec4821a4752c3f84a618449d5ac453f8787d
BASE=https://platform.higgsfield.ai
```

### Gerar Imagem
```python
import requests, time

API_KEY = "937398b8-1456-4a49-ba6d-bf3fb0414e64"
SECRET = "d8afc9f9e7df6b7c9854310b7463ec4821a4752c3f84a618449d5ac453f8787d"
BASE = "https://platform.higgsfield.ai"
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
            # IMPORTANTE: a API retorna em images[0].url (NÃO em result.outputs[0].url)
            imgs = s.get("images", [])
            return imgs[0].get("url") if imgs else None
        elif s.get("status") == "failed":
            return None
    return None

def baixar(url, path):
    with open(path, "wb") as f: f.write(requests.get(url).content)
```

Script pronto disponível em `tools/gerar_imagens.py`.

### Prompts Prontos
```python
PROMPT_LAGO = "RAW photograph, luxury ornamental pond in premium residential garden, crystal clear water with koi fish, natural stone edges, lush tropical landscaping, golden hour, Hasselblad H6D, 8K"

PROMPT_PISCINA = "RAW photograph, premium beach entry pool with shallow sandy gradient sloping into crystal clear turquoise water, tropical garden, lush landscaping, natural stone deck, luxury residential, Phase One IQ4"

PROMPT_TECNICO = "RAW photograph, professional pool equipment room, stainless steel UV filters and ozone generators, clean organized piping, premium installation, studio lighting"
```

### Inserir no HTML
```python
img_b64 = base64.b64encode(open("imagem.jpg","rb").read()).decode()
# <img src="data:image/jpeg;base64,{img_b64}" class="hero-img" />
```

### Image-to-Video (Higgsfield DOP)
```python
def upload_url(filepath):
    r = requests.post("https://litterbox.catbox.moe/resources/internals/api.php",
        data={"reqtype": "fileupload", "time": "24h"},
        files={"fileToUpload": open(filepath, "rb")})
    return r.text.strip()

def gerar_video(prompt, image_url, turbo=True):
    endpoint = "dop/turbo" if turbo else "dop/standard"
    r = requests.post(f"{BASE}/higgsfield-ai/{endpoint}", headers=HEADERS, json={
        "prompt": prompt, "image_url": image_url, "enhance_prompt": True
    })
    rid = r.json().get("request_id")
    # mesmo polling da imagem...
```

---

## Renders 3D dos Produtos ENG

Turntable 360° com ~125 frames PNG (fundo verde chroma key):
- Ozone Fish 120.000L, 80.000L, 60.000L, Power

Workflow para usar frame no orçamento:
```python
from PIL import Image
import numpy as np

def remover_verde(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    data = np.array(img)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    green_mask = (g > 80) & (g > r * 1.3) & (g > b * 1.3)
    data[green_mask] = [0, 0, 0, 0]
    from scipy.ndimage import binary_dilation
    border = binary_dilation(green_mask, iterations=2) & ~green_mask
    data[border, 1] = (data[border, 1] * 0.7).astype(np.uint8)
    Image.fromarray(data).save(out_path)
```

---

## Lições Aprendidas

1. **WeasyPrint > ReportLab** para PDFs visuais
2. **Total box dourado** com texto escuro (#06090F) sobre gradiente amber — alto contraste e luxo
3. **Overflow**: se não cabe na página, reduzir paddings e font-sizes iterativamente
4. **Flex no WeasyPrint**: NÃO FUNCIONA BEM — usar `<table>` para layouts lado a lado
5. **Nunca inventar modelos** de equipamento que não existem na tabela ENG
6. **Margem de segurança**: quando o cliente diz "20% incluso", já está no valor total, não é adicional
7. **Arredondar valores** quando o cliente pedir (ex: R$ 395.043 → R$ 396.000)
8. **Preço riscado + desconto**: mostrar preço original `<s>` com badge amber `-15%` e preço novo
9. **API Higgsfield**: retorna em `images[0].url`, NÃO em `result.outputs[0].url`
10. **Page break**: usar `page-break-after: always` em `.page` para garantir 1 seção por A4
11. **Fontes via Google @import** funcionam no WeasyPrint mas precisam de internet no momento do render

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
| 120.001-300.000 | 1x Ozone Fish Power |
| 300.001-600.000 | 2x Ozone Fish Power |
| 600.001-900.000 | 3x Ozone Fish Power |
| 900.001-1.000.000 | 4x Ozone Fish Power |
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
