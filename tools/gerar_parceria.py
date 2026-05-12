"""
Gera Proposta de Parceria Técnica — Multi-Lago — 12 páginas landscape.

Usado quando a proposta cobre MAIS DE UM LAGO em uma única parceria, com
condições especiais (desconto único, projeto executivo único, máquinas
personalizadas para o clima da região do parceiro).

Para single-cliente continue usando tools/gerar_proposta.py.

Edite os blocos no topo:
  - PARCEIRO:   dados da empresa parceira (nome, data)
  - LAGOS:      lista de lagos (cliente final, tipo, volume, lista de produtos)
  - VALOR_PROJETO_UNICO + DESCONTO_PCT + FILTRO_FIBRA_UNIT

Rode:  python3 tools/gerar_parceria.py
PDF:   output/proposta.pdf
"""
import base64
from pathlib import Path
from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "output"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "proposta.pdf"


# ====================================================================
# DADOS DA PROPOSTA — editar para cada parceiro
# ====================================================================
PARCEIRO = {
    "nome": "Forte Ecossistemas",
    "data": "Maio 2026",
}

LAGOS = [
    {
        "cliente": "Mauricio",
        "tipo":    "Lago Ornamental",
        "volume":  "50.000 Litros",
        "produtos": [
            {"nome": "Ozone Fish 60.000",                 "qtd": 1, "unit": 4084.50},
            {"nome": "Filtro UV Inox 380W — 220V",        "qtd": 1, "unit": 9943.50},
            {"nome": "Bomba AquaMax 50.000 L/h",          "qtd": 2, "unit": 2730.00},
            {"nome": "ENG MIX",                           "qtd": 1, "unit": 1890.00},
            {"nome": "Bypass",                            "qtd": 1, "unit": 924.00},
            {"nome": "Filtro de Sílica",                  "qtd": 1, "unit": 241.50},
        ],
    },
    {
        "cliente": "Eugenio",
        "tipo":    "Lago Ornamental",
        "volume":  "300.000 Litros",
        "produtos": [
            {"nome": "Ozone Fish Power Max — Até 500.000L", "qtd": 1, "unit": 27300.00},
            {"nome": "Concentrador 10 LPM — 220V",          "qtd": 1, "unit": 12000.00},
            {"nome": "Filtro UV Inox 380W — 220V",          "qtd": 1, "unit": 9943.50},
            {"nome": "Filtro UV 95W — 220V",                "qtd": 1, "unit": 2205.00},
            {"nome": "ENG MIX",                             "qtd": 1, "unit": 1890.00},
            {"nome": "Bypass",                              "qtd": 1, "unit": 924.00},
            {"nome": "Bomba 35.000 L/h ENG — UV 380W",      "qtd": 1, "unit": 1837.50},
            {"nome": "Bomba 20.000 L/h ENG — UV 95W",       "qtd": 1, "unit": 1593.90},
            {"nome": "Bomba 50.000 L/h ENG — circulação",   "qtd": 4, "unit": 2730.00},
        ],
    },
    {
        "cliente": "Daniel",
        "tipo":    "Lago Ornamental",
        "volume":  "39.000 Litros",
        "produtos": [
            {"nome": "Ozone Fish 60.000",                "qtd": 1, "unit": 4084.50},
            {"nome": "Filtro UV 190W — 220V",            "qtd": 1, "unit": 4819.50},
            {"nome": "Bomba 35.000 L/h ENG — UV 190W",   "qtd": 1, "unit": 1837.50},
            {"nome": "Bomba 35.000 L/h ENG — circulação","qtd": 2, "unit": 1837.50},
            {"nome": "Bomba 50.000 L/h ENG — Ozônio",    "qtd": 1, "unit": 2730.00},
            {"nome": "ENG MIX",                          "qtd": 1, "unit": 1890.00},
            {"nome": "Bypass",                           "qtd": 1, "unit": 924.00},
            {"nome": "Filtro de Sílica",                 "qtd": 1, "unit": 241.50},
        ],
    },
    {
        "cliente": "Bruna",
        "tipo":    "Lago Ornamental",
        "volume":  "40.000 Litros",
        "produtos": [
            {"nome": "Ozone Fish 60.000",                "qtd": 1, "unit": 4084.50},
            {"nome": "Filtro UV 190W — 220V",            "qtd": 1, "unit": 4819.50},
            {"nome": "Bomba 35.000 L/h ENG — UV 190W",   "qtd": 1, "unit": 1837.50},
            {"nome": "Bomba 35.000 L/h ENG — circulação","qtd": 2, "unit": 1837.50},
            {"nome": "Bomba 50.000 L/h ENG — Ozônio",    "qtd": 1, "unit": 2730.00},
            {"nome": "ENG MIX",                          "qtd": 1, "unit": 1890.00},
            {"nome": "Bypass",                           "qtd": 1, "unit": 924.00},
            {"nome": "Filtro de Sílica",                 "qtd": 1, "unit": 241.50},
        ],
    },
]

DESCONTO_PCT          = 30        # desconto parceiro em TODOS os itens ENG
VALOR_PROJETO_UNICO   = 40000.00  # projeto executivo único cobrindo TODOS os lagos
FILTRO_FIBRA_UNIT     = 4600.00   # unitário do filtro de fibra — qtd a definir pós-projeto


# ====================================================================
# Helpers
# ====================================================================
def fmt(v: float) -> str:
    # f"{v:,.2f}" arredonda corretamente e formata em padrão US (1,234.56);
    # depois trocamos os separadores para padrão BR (1.234,56) usando X como
    # placeholder temporário pra evitar conflito entre . e ,.
    s = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {s}"


def b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()


ICONS_DIR = ROOT / "assets" / "icons"
LOGO = b64(ROOT / "assets" / "logo_thiago_nicezio.png")
ICON = {n.stem: b64(n) for n in ICONS_DIR.glob("*.png")}


def icon_html(name: str, size_mm: float = 10) -> str:
    if name not in ICON:
        return ""
    return f'<img class="ico" src="data:image/png;base64,{ICON[name]}" style="width:{size_mm}mm;height:{size_mm}mm;" />'


def lago_totais(lago):
    cheio = 0.0
    com_desc = 0.0
    for p in lago["produtos"]:
        bruto = p["qtd"] * p["unit"]
        cheio += bruto
        com_desc += bruto * (1 - DESCONTO_PCT / 100)
    return cheio, com_desc


# Cálculos globais
LAGOS_STATS = []
for lago in LAGOS:
    cheio, desc = lago_totais(lago)
    LAGOS_STATS.append({"lago": lago, "cheio": cheio, "com_desc": desc, "economia": cheio - desc})

ENG_TOTAL_CHEIO   = sum(s["cheio"]    for s in LAGOS_STATS)
ENG_TOTAL_COM_DESC = sum(s["com_desc"] for s in LAGOS_STATS)
ECONOMIA_TOTAL    = ENG_TOTAL_CHEIO - ENG_TOTAL_COM_DESC
TOTAL_GERAL       = ENG_TOTAL_COM_DESC + VALOR_PROJETO_UNICO
VOLUME_TOTAL_LITROS = sum(int(l["volume"].replace(".", "").split()[0]) for l in LAGOS)
VOLUME_TOTAL_FMT    = f"{VOLUME_TOTAL_LITROS:,}".replace(",", ".")


# ====================================================================
# CSS
# ====================================================================
CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700&display=swap');

@page { size: 338.67mm 190.5mm; margin: 0; background: #04140F; }
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
body { font-family: 'Manrope', sans-serif; color: #E5DCC8; background: #04140F; margin: 0; }

.page {
    width: 338.67mm; height: 190.5mm;
    background: radial-gradient(ellipse at top left, #0a2218 0%, #04140F 65%);
    position: relative;
    padding: 16mm 22mm 14mm 22mm;
    page-break-after: always;
    overflow: hidden;
}
.page:last-of-type { page-break-after: auto; }

.page::before {
    content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background:
        linear-gradient(115deg, transparent 18%, rgba(201,165,110,.22) 18.04%, rgba(201,165,110,.22) 18.20%, transparent 18.24%),
        linear-gradient(115deg, transparent 62%, rgba(201,165,110,.17) 62.04%, rgba(201,165,110,.17) 62.20%, transparent 62.24%),
        linear-gradient(115deg, transparent 88%, rgba(201,165,110,.11) 88.04%, rgba(201,165,110,.11) 88.16%, transparent 88.20%),
        linear-gradient(-65deg, transparent 35%, rgba(201,165,110,.13) 35.04%, rgba(201,165,110,.13) 35.20%, transparent 35.24%),
        linear-gradient(-65deg, transparent 78%, rgba(201,165,110,.18) 78.04%, rgba(201,165,110,.18) 78.20%, transparent 78.24%);
}
.page > * { position: relative; z-index: 1; }

h1 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500; font-size: 38pt; color: #C9A56E;
    line-height: 1.1; letter-spacing: .005em;
}
.sub-italic {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-weight: 400; font-size: 11.5pt;
    color: #B5AB94; margin-top: 1mm;
}
.body-p { font-family: 'Manrope', sans-serif; font-size: 10.5pt; color: #E5DCC8; line-height: 1.6; }
.gold-line { width: 70mm; height: 1px; margin: 4mm 0; background: linear-gradient(90deg, #C9A56E 0%, transparent 100%); }
.gold-line-center { width: 60mm; height: 1px; margin: 4mm auto; background: linear-gradient(90deg, transparent, #C9A56E, transparent); }
.foot {
    position: absolute; bottom: 5mm; left: 0; right: 0;
    text-align: center; font-size: 8.5pt; color: #8a7f6a;
    letter-spacing: .04em;
    border-top: 1px solid rgba(201,165,110,.18);
    padding-top: 3mm; margin: 0 22mm;
}
.logo-top-right { position: absolute; top: 13mm; right: 22mm; height: 17mm; width: auto; filter: drop-shadow(0 2px 6px rgba(0,0,0,.5)); }

/* CAPA */
.cover { text-align: left; padding: 22mm 30mm 14mm 30mm !important; }
.cover .logo-big { display: block; width: 95mm; height: auto; margin: 2mm 0 6mm 0; filter: drop-shadow(0 4px 16px rgba(0,0,0,.6)); }
.cover h1 { font-size: 42pt; color: #C9A56E; margin-top: 4mm; }
.cover .sub-main { font-size: 13.5pt; color: #E5DCC8; margin-top: 2mm; letter-spacing: .01em; }
.cover-diag { position: absolute; bottom: 50mm; left: 30mm; right: 30mm; height: 0; border-top: 1px solid rgba(201,165,110,.5); transform: rotate(-2deg); transform-origin: left center; }
.cover .client-block { margin-top: 18mm; }
.cover .client-label { font-style: italic; font-size: 11pt; color: #B5AB94; }
.cover .client-name { font-weight: 700; font-size: 17pt; color: #E5DCC8; margin-top: 1.5mm; }
.cover .client-date { font-size: 10pt; color: #8a7f6a; margin-top: 2mm; }

/* CARDS GENÉRICOS (2 col) */
.cards { width: 100%; border-collapse: separate; border-spacing: 8mm 6mm; margin-top: 6mm; }
.cards td { vertical-align: top; padding: 0; width: 50%; }
.card .icon-wrap { display: inline-block; width: 11mm; height: 11mm; vertical-align: middle; }
.card .icon-wrap img { width: 100%; height: 100%; display: block; object-fit: contain; }
.card .title-inline {
    display: inline-block; vertical-align: middle; margin-left: 4mm;
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 16pt; color: #E5DCC8;
}
.card .desc {
    margin-top: 2mm; margin-left: 15mm; font-size: 9.5pt; color: #B5AB94;
    line-height: 1.5; padding-bottom: 2mm;
    border-bottom: 1px dashed rgba(201,165,110,.18);
}

.cards-3 td { width: 33.333%; }
.cards-3 .card { text-align: center; }
.cards-3 .icon-wrap { display: block; margin: 0 auto; }
.cards-3 .title-inline { display: block; margin-left: 0; margin-top: 3mm; font-size: 14pt; color: #C9A56E; font-weight: 600; }
.cards-3 .desc { margin-left: 0; text-align: center; border: 0; padding-top: 3mm; }

/* OS 4 LAGOS — cards 2x2 */
.cards-lagos { width: 100%; border-collapse: separate; border-spacing: 12mm 10mm; margin-top: 12mm; }
.cards-lagos td { width: 50%; vertical-align: top; padding: 0; }
.lago-card {
    background: rgba(201,165,110,.04);
    border: 1px solid rgba(201,165,110,.20);
    padding: 6mm 8mm; position: relative;
}
.lago-card .num {
    position: absolute; top: 4mm; right: 6mm;
    font-family: 'Cormorant Garamond', serif;
    font-size: 30pt; color: rgba(201,165,110,.25);
    font-weight: 500;
}
.lago-card .name {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 24pt; color: #C9A56E; line-height: 1; margin-top: 2mm;
}
.lago-card .vol {
    margin-top: 3mm; font-size: 11pt; color: #E5DCC8; letter-spacing: .02em;
}
.lago-card .typ {
    margin-top: 1mm; font-style: italic; font-size: 9.5pt; color: #B5AB94;
}
.lago-card .stats { margin-top: 5mm; font-size: 9pt; color: #8a7f6a; }
.lago-card .stats b { color: #C9A56E; font-weight: 600; }

/* TABELAS DE INVESTIMENTO POR LAGO */
.lago-header { display: flex; align-items: baseline; gap: 6mm; }
.lago-header .h-num {
    font-family: 'Cormorant Garamond', serif; font-size: 20pt; color: rgba(201,165,110,.55);
    font-style: italic; font-weight: 500;
}
.inv-table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
.inv-table thead th {
    background: #C9A56E; color: #04140F;
    font-size: 10pt; font-weight: 700; padding: 2.5mm 4mm;
    text-align: left; letter-spacing: .02em;
}
.inv-table thead th.r { text-align: right; }
.inv-table thead th.c { text-align: center; }
.inv-table tbody td {
    padding: 1.8mm 4mm; font-size: 9.5pt; color: #E5DCC8;
    border-bottom: 1px solid rgba(201,165,110,.10);
}
.inv-table tbody td.r { text-align: right; font-variant-numeric: tabular-nums; }
.inv-table tbody td.c { text-align: center; }
.inv-table .green { color: #52C75E; font-weight: 600; }
.inv-table .dash { color: #6a6253; }

.lago-summary {
    width: 100%; margin-top: 5mm; border-collapse: collapse;
    background: rgba(201,165,110,.05);
}
.lago-summary td {
    padding: 2mm 5mm; font-size: 10pt; color: #E5DCC8;
    border-bottom: 1px solid rgba(201,165,110,.10);
}
.lago-summary td.lbl { color: #B5AB94; }
.lago-summary td.r { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
.lago-summary .strike-soft {
    text-decoration: line-through; text-decoration-color: rgba(201,165,110,.5);
    color: #8a7f6a; font-weight: 400;
}
.lago-summary tr.econ td {
    background: rgba(82,199,94,.08);
    border-top: 1px solid rgba(82,199,94,.30); border-bottom: 0;
    color: #52C75E; font-weight: 700; font-size: 10.5pt;
    padding: 2.5mm 5mm;
}
.lago-summary tr.econ td.lbl { color: #52C75E; }

/* RESUMO GERAL — tabela dos 4 lagos */
.resumo-table { width: 100%; border-collapse: collapse; margin-top: 6mm; }
.resumo-table thead th {
    background: #C9A56E; color: #04140F;
    font-size: 10pt; font-weight: 700; padding: 3mm 4mm;
    text-align: left; letter-spacing: .02em;
}
.resumo-table thead th.r { text-align: right; }
.resumo-table thead th.c { text-align: center; }
.resumo-table tbody td {
    padding: 2.5mm 4mm; font-size: 10pt; color: #E5DCC8;
    border-bottom: 1px solid rgba(201,165,110,.12);
}
.resumo-table tbody td.r { text-align: right; font-variant-numeric: tabular-nums; }
.resumo-table tbody td.c { text-align: center; }
.resumo-table .strike-soft { text-decoration: line-through; text-decoration-color: rgba(201,165,110,.5); color: #8a7f6a; }
.resumo-table tr.total td {
    border-top: 2px solid rgba(201,165,110,.4); border-bottom: 0;
    padding-top: 3mm; padding-bottom: 3mm;
    font-weight: 700; font-size: 11pt; color: #C9A56E;
}
.resumo-table tr.total td.green { color: #52C75E; }

.totals-final { width: 100%; margin-top: 8mm; font-size: 11pt; }
.totals-final td {
    padding: 2.5mm 4mm; font-weight: 600;
    color: #E5DCC8;
}
.totals-final td.r { text-align: right; font-variant-numeric: tabular-nums; }
.totals-final tr.grand td {
    padding: 4mm 4mm 2mm 4mm;
    color: #C9A56E;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 22pt;
    border-top: 1px solid rgba(201,165,110,.4);
}
.totals-final tr.grand td.r {
    font-family: 'Cormorant Garamond', serif; font-size: 30pt;
}

/* FILTRO DE FIBRA — pág especial */
.fibra-box {
    margin: 14mm 30mm 0 30mm;
    padding: 10mm 12mm;
    background: rgba(201,165,110,.06);
    border-left: 3px solid #C9A56E;
}
.fibra-val {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 38pt; color: #C9A56E;
}
.fibra-lbl { font-size: 10pt; color: #B5AB94; margin-bottom: 2mm; letter-spacing: .03em; }
.fibra-note { margin-top: 5mm; font-size: 11pt; color: #E5DCC8; line-height: 1.6; }
.fibra-disclaimer { margin-top: 6mm; font-style: italic; font-size: 9.5pt; color: #8a7f6a; }

/* CONDIÇÕES DA PARCERIA */
.cond-pitch {
    margin: 8mm 0 0 0; padding: 6mm 8mm;
    border-left: 2px solid #C9A56E;
    font-style: italic; font-size: 11.5pt; color: #E5DCC8;
    line-height: 1.7;
}
.cond-list { width: 100%; margin-top: 8mm; border-collapse: separate; border-spacing: 6mm 4mm; }
.cond-list td { vertical-align: top; padding: 0; width: 50%; }
.cond-list .item {
    border-bottom: 1px dashed rgba(201,165,110,.20);
    padding-bottom: 3mm;
}
.cond-list .item .t {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 14pt; color: #C9A56E;
}
.cond-list .item .d { margin-top: 1.5mm; font-size: 9.5pt; color: #B5AB94; line-height: 1.5; }

/* ENCERRAMENTO */
.close-page { text-align: center; padding-top: 28mm !important; }
.close-page img.logo-close { width: 75mm; height: auto; margin: 0 auto 6mm auto; filter: drop-shadow(0 4px 16px rgba(0,0,0,.6)); }
.close-page .closing-quote { font-family: 'Manrope', sans-serif; font-style: italic; font-size: 16pt; color: #C9A56E; line-height: 1.4; margin-top: 6mm; }
.close-page .closing-contact { margin-top: 8mm; font-size: 10pt; color: #B5AB94; letter-spacing: .04em; }
.close-page .closing-thanks { margin-top: 6mm; font-size: 11pt; color: #E5DCC8; }

.quote { position: relative; text-align: center; margin: 6mm auto 0 auto; padding: 4mm 8mm; max-width: 260mm; }
.quote-text { font-family: 'Manrope', sans-serif; font-style: italic; font-size: 11.5pt; color: #C9A56E; letter-spacing: .005em; }
.quote::before { content: ''; position: absolute; top: 50%; left: -10mm; right: -10mm; height: 0; border-top: 1px solid rgba(201,165,110,.65); transform: rotate(-2deg); }
"""


def footer_html():
    return '<div class="foot">Thiago Nicezio  |  contato@filtrosuvc.com.br  |  thiagonicezio.com</div>'


def card_2col(icon, title, desc):
    return f"""<div class="card">
        <span class="icon-wrap">{icon_html(icon, 11)}</span>
        <span class="title-inline">{title}</span>
        <div class="desc">{desc}</div>
    </div>"""


def card_3col(icon, title, desc):
    return f"""<div class="card">
        <span class="icon-wrap">{icon_html(icon, 14)}</span>
        <span class="title-inline">{title}</span>
        <div class="desc">{desc}</div>
    </div>"""


# ====================================================================
# Páginas (12)
# ====================================================================
def page_capa():
    return f"""
    <div class="page cover">
        <img class="logo-big" src="data:image/png;base64,{LOGO}" />
        <div class="gold-line"></div>
        <h1>Proposta de Parceria Técnica</h1>
        <div class="sub-main">{len(LAGOS)} Primeiros Projetos — {VOLUME_TOTAL_FMT} Litros</div>
        <div class="cover-diag"></div>
        <div class="client-block">
            <div class="client-label">Parceiro:</div>
            <div class="client-name">{PARCEIRO['nome']}</div>
            <div class="client-date">{PARCEIRO['data']}</div>
        </div>
    </div>
    """


def page_quem_e():
    cards_data = [
        ("globe",   "Padrão Internacional",  "Projetos no Brasil, Europa e EUA"),
        ("medal",   "Presidente da ABLP",    "Normatiza o setor no Brasil"),
        ("gears",   "Sócio ENG Soluções",    "Domina a tecnologia por dentro"),
        ("target",  "Especialista Técnico",  "Dimensionamento preciso, zero improviso"),
        ("drop",    "Garantia de Resultado", "Compromisso com água cristalina"),
    ]
    rows = ""
    for i in range(0, 4, 2):
        rows += f"<tr><td>{card_2col(*cards_data[i])}</td><td>{card_2col(*cards_data[i+1])}</td></tr>"
    rows += f"<tr><td>{card_2col(*cards_data[4])}</td><td></td></tr>"
    return f"""
    <div class="page">
        <img class="logo-top-right" src="data:image/png;base64,{LOGO}" />
        <h1>Quem é Thiago Nicezio</h1>
        <p class="body-p" style="margin-top:3mm; max-width:200mm;">
            Especialista em projetos de lagos ornamentais e piscinas praia com atuação no Brasil, Europa e
            Estados Unidos. Fundador e Presidente da ABLP. Sócio da ENG Soluções, referência nacional em
            tratamento de água com ozônio e UV. Não executamos obras — projetamos, especificamos e
            garantimos qualidade e resultado.
        </p>
        <table class="cards">{rows}</table>
        <div class="quote">
            <div class="quote-text">"Percorreu o mundo em busca das melhores tecnologias em tratamento aquático e as aplicou nos projetos mais exigentes do país."</div>
        </div>
        {footer_html()}
    </div>
    """


def page_a_parceria():
    cards = [
        ("gears",    "Máquinas Personalizadas",    "Não são linhas comerciais — são equipamentos NOVOS, projetados sob medida para o clima da sua região"),
        ("handshake","Trabalho Conjunto",          "Você foca no comercial e na obra. Eu cuido do projeto técnico e da especificação de cada lago"),
        ("lock",     "Condição de Parceria",       "Os valores desta proposta são exclusivos para parceiros — contrato de sigilo entre as partes"),
    ]
    cells = "".join(f"<td>{card_3col(*c)}</td>" for c in cards)
    return f"""
    <div class="page">
        <h1>A Parceria</h1>
        <div class="sub-italic">Engenharia exclusiva para o clima de praia dos seus projetos</div>
        <p class="body-p" style="margin-top:7mm; max-width:285mm;">
            Esta proposta marca o início de uma parceria técnica de longo prazo. Os equipamentos
            especificados para os 4 primeiros lagos <b style="color:#C9A56E;">não são produtos de prateleira</b> — são máquinas projetadas
            do zero por mim para suportar o clima costeiro, com adaptações de material, vedação e
            durabilidade que a linha comercial padrão da ENG não oferece.
        </p>
        <table class="cards cards-3" style="margin-top: 10mm;"><tr>{cells}</tr></table>
        {footer_html()}
    </div>
    """


def page_os_quatro_lagos():
    rows = ""
    for i in range(0, len(LAGOS), 2):
        rows += "<tr>"
        for j in range(2):
            if i + j < len(LAGOS):
                lago = LAGOS[i + j]
                stats = LAGOS_STATS[i + j]
                rows += f"""<td><div class="lago-card">
                    <div class="num">{i+j+1:02d}</div>
                    <div class="name">{lago['cliente']}</div>
                    <div class="vol">{lago['volume']}</div>
                    <div class="typ">{lago['tipo']}</div>
                    <div class="stats">
                        Lista ENG: <span style="color:#8a7f6a;text-decoration:line-through;">{fmt(stats['cheio'])}</span>
                        &nbsp;→&nbsp;
                        <b>{fmt(stats['com_desc'])}</b>
                    </div>
                </div></td>"""
            else:
                rows += "<td></td>"
        rows += "</tr>"
    return f"""
    <div class="page">
        <h1>Os {len(LAGOS)} Lagos</h1>
        <div class="sub-italic">Visão geral dos primeiros projetos da parceria — {VOLUME_TOTAL_FMT} Litros no total</div>
        <table class="cards-lagos">{rows}</table>
        {footer_html()}
    </div>
    """


def page_lago(idx):
    stats = LAGOS_STATS[idx]
    lago = stats["lago"]
    rows_html = ""
    for p in lago["produtos"]:
        bruto = p["qtd"] * p["unit"]
        total = bruto * (1 - DESCONTO_PCT / 100)
        rows_html += f"""<tr>
            <td>{p['nome']}</td>
            <td class="c">{p['qtd']}</td>
            <td class="r">{fmt(p['unit'])}</td>
            <td class="c green">-{DESCONTO_PCT}%</td>
            <td class="r green">{fmt(total)}</td>
        </tr>"""
    return f"""
    <div class="page">
        <div class="lago-header">
            <span class="h-num">Lago {idx+1:02d}</span>
            <h1 style="line-height:1;">{lago['cliente']}</h1>
        </div>
        <div class="sub-italic">{lago['tipo']} — {lago['volume']}</div>
        <table class="inv-table">
            <thead><tr>
                <th>Equipamento</th>
                <th class="c">Qtd.</th>
                <th class="r">Valor Unit.</th>
                <th class="c">Desc.</th>
                <th class="r">Total</th>
            </tr></thead>
            <tbody>{rows_html}</tbody>
        </table>
        <table class="lago-summary">
            <tr><td class="lbl">Direto na ENG Soluções (lista cheia):</td><td class="r strike-soft">{fmt(stats['cheio'])}</td></tr>
            <tr><td class="lbl">Com Thiago Nicezio — parceiro ENG (-{DESCONTO_PCT}%):</td><td class="r">{fmt(stats['com_desc'])}</td></tr>
            <tr class="econ"><td class="lbl">Economia exclusiva deste lago:</td><td class="r">{fmt(stats['economia'])}</td></tr>
        </table>
        {footer_html()}
    </div>
    """


def page_resumo():
    rows = ""
    for i, s in enumerate(LAGOS_STATS):
        l = s["lago"]
        rows += f"""<tr>
            <td><b style="color:#C9A56E;">Lago {i+1:02d}</b> &nbsp;{l['cliente']}</td>
            <td>{l['volume']}</td>
            <td class="r strike-soft">{fmt(s['cheio'])}</td>
            <td class="r">{fmt(s['com_desc'])}</td>
            <td class="r green">{fmt(s['economia'])}</td>
        </tr>"""
    return f"""
    <div class="page">
        <h1>Resumo Geral</h1>
        <div class="sub-italic">Consolidação financeira dos {len(LAGOS)} primeiros projetos da parceria</div>
        <table class="resumo-table">
            <thead><tr>
                <th>Projeto</th>
                <th>Volume</th>
                <th class="r">Direto na ENG</th>
                <th class="r">Com Thiago (-{DESCONTO_PCT}%)</th>
                <th class="r">Economia</th>
            </tr></thead>
            <tbody>
                {rows}
                <tr class="total">
                    <td colspan="2">TOTAL — {len(LAGOS)} lagos</td>
                    <td class="r strike-soft">{fmt(ENG_TOTAL_CHEIO)}</td>
                    <td class="r">{fmt(ENG_TOTAL_COM_DESC)}</td>
                    <td class="r green">{fmt(ECONOMIA_TOTAL)}</td>
                </tr>
            </tbody>
        </table>
        <table class="totals-final">
            <tr>
                <td>Subtotal Equipamentos (com desconto parceiro {DESCONTO_PCT}%):</td>
                <td class="r">{fmt(ENG_TOTAL_COM_DESC)}</td>
            </tr>
            <tr>
                <td>Projeto Executivo Único — cobre os {len(LAGOS)} lagos da parceria:</td>
                <td class="r">{fmt(VALOR_PROJETO_UNICO)}</td>
            </tr>
            <tr class="grand">
                <td>TOTAL GERAL DA PARCERIA:</td>
                <td class="r">{fmt(TOTAL_GERAL)}</td>
            </tr>
        </table>
        {footer_html()}
    </div>
    """


def page_filtro_fibra():
    return f"""
    <div class="page">
        <h1>Filtro de Fibra</h1>
        <div class="sub-italic">Item Especial — Dimensionamento Pós-Projeto</div>
        <div class="fibra-box">
            <div class="fibra-lbl">VALOR UNITÁRIO (a partir de)</div>
            <div class="fibra-val">{fmt(FILTRO_FIBRA_UNIT)}</div>
            <div class="fibra-note">
                O Filtro de Fibra é um componente <b style="color:#C9A56E;">personalizado para cada lago</b>. A quantidade exata,
                dimensão e configuração serão definidas somente após a entrega do projeto executivo
                técnico, quando o sistema de cada um dos {len(LAGOS)} lagos estiver detalhado.
            </div>
            <div class="fibra-disclaimer">
                * Este valor não está incluso no TOTAL GERAL da parceria. Será orçado caso a caso conforme o
                projeto definir as necessidades de cada lago.
            </div>
        </div>
        {footer_html()}
    </div>
    """


def page_condicoes():
    items = [
        ("Máquinas Personalizadas",     "Equipamentos NOVOS projetados do zero para o clima costeiro — não são as linhas comerciais que você já compra"),
        ("Projeto Executivo Único",     f"Cobre integralmente os {len(LAGOS)} lagos. {fmt(VALOR_PROJETO_UNICO)} — único pagamento referente a engenharia técnica completa"),
        ("Desconto Parceiro",           f"{DESCONTO_PCT}% em TODOS os equipamentos da linha ENG Soluções dos {len(LAGOS)} lagos — economia consolidada de {fmt(ECONOMIA_TOTAL)}"),
        ("Contrato de Confidencialidade","Acordo de sigilo entre as partes — você apresenta o projeto e mantém o relacionamento direto com cada cliente final"),
        ("Trabalho Conjunto",           "Visita técnica para cada lago + start do sistema. Estou disponível para suporte técnico durante toda a execução"),
        ("Parceria de Longo Prazo",     "Estes são os 4 primeiros projetos. A condição se estende aos próximos lagos que executarmos juntos"),
    ]
    rows = ""
    for i in range(0, len(items), 2):
        a = items[i]
        b = items[i+1] if i+1 < len(items) else None
        rows += f"""<tr>
            <td><div class="item"><div class="t">{a[0]}</div><div class="d">{a[1]}</div></div></td>
            <td>{f'<div class="item"><div class="t">{b[0]}</div><div class="d">{b[1]}</div></div>' if b else ''}</td>
        </tr>"""
    return f"""
    <div class="page">
        <h1>Condições da Parceria</h1>
        <div class="sub-italic">Os termos que tornam esta proposta exclusiva</div>
        <div class="cond-pitch">
            "Esta proposta foi formulada como condição para iniciarmos nossa parceria. Mais do que um
            fornecimento, é um trabalho conjunto — desenhamos cada máquina do zero para o clima de praia
            dos seus {len(LAGOS)} primeiros projetos. Você não recebe linha comercial; recebe engenharia exclusiva
            para sua região."
        </div>
        <table class="cond-list">{rows}</table>
        {footer_html()}
    </div>
    """


def page_encerramento():
    return f"""
    <div class="page close-page">
        <img class="logo-close" src="data:image/png;base64,{LOGO}" />
        <div class="gold-line-center"></div>
        <div class="closing-quote">"Água cristalina não é promessa.<br/>É compromisso técnico."</div>
        <div class="closing-contact">contato@filtrosuvc.com.br  |  thiagonicezio.com</div>
        <div class="closing-thanks">Obrigado pela confiança — vamos construir juntos.</div>
    </div>
    """


pages = [
    page_capa(),
    page_quem_e(),
    page_a_parceria(),
    page_os_quatro_lagos(),
]
for i in range(len(LAGOS)):
    pages.append(page_lago(i))
pages.extend([
    page_resumo(),
    page_filtro_fibra(),
    page_condicoes(),
    page_encerramento(),
])

html = f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
{''.join(pages)}
</body></html>"""

(OUT_DIR / "proposta.html").write_text(html, encoding="utf-8")
HTML(string=html, base_url=str(ROOT)).write_pdf(str(OUT), optimize_images=False)
print(f"PDF gerado: {OUT}  ({OUT.stat().st_size/1024:.1f} KB) — {len(pages)} páginas")
