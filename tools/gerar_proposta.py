"""
Gera Proposta de Parceria Técnica — 11 páginas landscape — replicando o modelo Otávio/Gramopool.
Paleta: verde-preto profundo + bronze fosco. Tipografia: Cormorant Garamond + Manrope.
"""
import base64
from pathlib import Path
from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "output"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "proposta.pdf"


def fmt(v: float) -> str:
    int_part = int(v)
    dec_part = int(round((v - int_part) * 100))
    int_str = f"{int_part:,}".replace(",", ".")
    return f"R$ {int_str},{dec_part:02d}"


def b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()


# Assets
ICONS_DIR = ROOT / "assets" / "icons"
LOGO = b64(ROOT / "assets" / "logo_thiago_nicezio.png")
ICON = {n.stem: b64(n) for n in ICONS_DIR.glob("*.png")}
HERO1 = b64(ROOT / "assets" / "renders" / "projeto_aerea_full.png")
HERO2 = b64(ROOT / "assets" / "renders" / "projeto_deck_close.png")
HERO3 = b64(ROOT / "assets" / "renders" / "projeto_aerea_sunset.png")


# SVG inline para os 3 ícones que faltam (Lucide style, bronze fill)
def svg_globe():
    return """<svg viewBox="0 0 24 24" fill="#C9A56E" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>"""


def svg_medal():
    return """<svg viewBox="0 0 24 24" fill="#C9A56E" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.21 3l2.99 4.49a8.997 8.997 0 0 1 3.6 0L16.79 3H7.21zM12 8a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-9.5l1.18 2.4 2.65.39-1.92 1.87.45 2.64L12 16.05l-2.36 1.25.45-2.64L8.17 12.79l2.65-.39L12 10z"/>
    </svg>"""


def svg_gears():
    return """<svg viewBox="0 0 24 24" fill="#C9A56E" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>"""


SVG_ICONS = {
    "globe": svg_globe(),
    "medal": svg_medal(),
    "gears": svg_gears(),
}


def icon_html(name: str, size_mm: float = 10) -> str:
    """Renderiza ícone: usa PNG se existe, senão SVG inline."""
    if name in ICON:
        return f'<img class="ico" src="data:image/png;base64,{ICON[name]}" style="width:{size_mm}mm;height:{size_mm}mm;" />'
    if name in SVG_ICONS:
        return f'<div class="ico" style="width:{size_mm}mm;height:{size_mm}mm;display:inline-block;">{SVG_ICONS[name]}</div>'
    return ""


# ============== DATA (replicando exatamente o Otávio) ==============
CLIENTE = "Otávio — Empresa Exemplo"
DATA = "Maio 2026"
VOLUME = "150.000 Litros"

PRODUTOS_DETALHE = [
    ("bolt",   "Ozone Fish<br/>Power — Inox",  "Gerador de ozônio industrial para tratamento de alto volume"),
    ("wind",   "Concentrador<br/>10 LPM",      "Pureza 95%, aumenta em +300% a potência do ozônio"),
    ("waves",  "ENG MIX",                      "Microbolhas que potencializam a transferência de ozônio"),
    ("sun",    "Filtro UV Inox<br/>380W",      "Esterilização UV-C industrial, corpo em aço inox 304"),
    ("drop",   "AquaMax<br/>50.000 L/h",       "Bombas de alta vazão para circulação completa do lago"),
    ("arrows", "Sistema de<br/>Injeção de Ozônio", "Bypass personalizado para injeção eficiente na água"),
]

# (nome, qtd, valor_unit, desconto_pct ou None)
PRECOS = [
    ("Ozone Fish Power — Inox",      1, 15339.00, 20),
    ("Concentrador de Oxigênio 10 LPM", 1, 9800.00, None),
    ("Filtro UV Inox 380W — 220V",   2, 9943.50, 20),
    ("ENG MIX",                       1, 1890.00, None),
    ("Bypass",                        1, 924.00, None),
    ("Bomba AquaMax 50.000 L/h",      5, 2730.00, None),
]

VALOR_PROJETO = 8000.00

def calc_totais():
    subtotal = 0.0
    for _, q, vu, desc in PRECOS:
        bruto = q * vu
        if desc:
            bruto *= (1 - desc/100)
        subtotal += bruto
    return subtotal, subtotal + VALOR_PROJETO

SUBTOTAL_EQUIP, TOTAL_GERAL = calc_totais()


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700&display=swap');

@page {
    size: 338.67mm 190.5mm;
    margin: 0;
    background: #04140F;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
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

/* Decoração: linhas diagonais douradas suaves */
.page::before {
    content: '';
    position: absolute; inset: 0; z-index: 0;
    pointer-events: none;
    background:
        linear-gradient(115deg, transparent 18%, rgba(201,165,110,.16) 18.05%, rgba(201,165,110,.16) 18.18%, transparent 18.23%),
        linear-gradient(115deg, transparent 62%, rgba(201,165,110,.12) 62.05%, rgba(201,165,110,.12) 62.18%, transparent 62.23%),
        linear-gradient(115deg, transparent 88%, rgba(201,165,110,.08) 88.05%, rgba(201,165,110,.08) 88.15%, transparent 88.2%),
        linear-gradient(-65deg, transparent 35%, rgba(201,165,110,.10) 35.05%, rgba(201,165,110,.10) 35.18%, transparent 35.23%),
        linear-gradient(-65deg, transparent 78%, rgba(201,165,110,.13) 78.05%, rgba(201,165,110,.13) 78.18%, transparent 78.23%);
}
.page > * { position: relative; z-index: 1; }

/* Tipografia base */
h1 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500; font-style: normal;
    font-size: 38pt; color: #C9A56E;
    line-height: 1.1; letter-spacing: .005em;
}
.sub-italic {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-weight: 400; font-size: 11.5pt;
    color: #B5AB94; margin-top: 1mm;
}
.body-p {
    font-family: 'Manrope', sans-serif; font-size: 10.5pt;
    color: #E5DCC8; line-height: 1.6;
}
.gold-line {
    width: 70mm; height: 1px; margin: 4mm 0;
    background: linear-gradient(90deg, #C9A56E 0%, transparent 100%);
}
.gold-line-center {
    width: 60mm; height: 1px; margin: 4mm auto;
    background: linear-gradient(90deg, transparent, #C9A56E, transparent);
}

/* Footer global */
.foot {
    position: absolute; bottom: 5mm; left: 0; right: 0;
    text-align: center; font-size: 8.5pt; color: #8a7f6a;
    letter-spacing: .04em;
    border-top: 1px solid rgba(201,165,110,.18);
    padding-top: 3mm; margin: 0 22mm;
}

/* Header logo top-right pequeno */
.logo-top-right {
    position: absolute; top: 13mm; right: 22mm;
    height: 17mm; width: auto;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,.5));
}

/* --- CAPA --- */
.cover {
    text-align: left;
    padding: 22mm 30mm 14mm 30mm !important;
}
.cover .logo-big {
    display: block;
    width: 95mm; height: auto;
    margin: 2mm 0 6mm 0;
    filter: drop-shadow(0 4px 16px rgba(0,0,0,.6));
}
.cover h1 {
    font-size: 44pt; color: #C9A56E; margin-top: 4mm;
}
.cover .sub-main {
    font-size: 14pt; color: #E5DCC8; margin-top: 2mm;
    letter-spacing: .01em;
}
.cover-diag {
    position: absolute; bottom: 50mm; left: 30mm; right: 30mm;
    height: 0; border-top: 1px solid rgba(201,165,110,.5);
    transform: rotate(-2deg); transform-origin: left center;
}
.cover .client-block {
    margin-top: 18mm;
}
.cover .client-label {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-size: 11pt; color: #B5AB94;
}
.cover .client-name {
    font-family: 'Manrope', sans-serif; font-weight: 700;
    font-size: 17pt; color: #E5DCC8; margin-top: 1.5mm;
}
.cover .client-date {
    font-size: 10pt; color: #8a7f6a; margin-top: 2mm;
}

/* --- CARDS GRID --- */
.cards { width: 100%; border-collapse: separate; border-spacing: 8mm 6mm; margin-top: 6mm; }
.cards td { vertical-align: top; padding: 0; width: 50%; }
.card { padding: 0; }
.card .icon-wrap {
    display: inline-block; width: 11mm; height: 11mm;
    vertical-align: middle;
}
.card .icon-wrap img, .card .icon-wrap svg {
    width: 100%; height: 100%; display: block;
}
.card .title-inline {
    display: inline-block; vertical-align: middle;
    margin-left: 4mm; font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 16pt; color: #E5DCC8;
}
.card .desc {
    margin-top: 2mm; margin-left: 15mm;
    font-size: 9.5pt; color: #B5AB94; line-height: 1.5;
    padding-bottom: 2mm;
    border-bottom: 1px dashed rgba(201,165,110,.18);
}

/* Variant: 3 cols */
.cards-3 td { width: 33.333%; }
.cards-3 .card { text-align: center; }
.cards-3 .icon-wrap { display: block; margin: 0 auto; }
.cards-3 .title-inline {
    display: block; margin-left: 0; margin-top: 3mm;
    font-size: 14pt; color: #C9A56E; font-weight: 600;
}
.cards-3 .desc { margin-left: 0; text-align: center; border: 0; padding-top: 3mm; }

/* Variant: equipment 3x2 (center) */
.cards-eq td { width: 33.333%; vertical-align: top; }
.cards-eq .card { text-align: center; padding: 0 3mm; }
.cards-eq .icon-wrap { display: block; margin: 0 auto 3mm auto; width: 9mm; height: 9mm; }
.cards-eq .title-inline {
    display: block; margin-left: 0;
    font-size: 13.5pt; color: #E5DCC8; font-weight: 600;
    line-height: 1.2;
}
.cards-eq .desc {
    margin: 4mm 0 0 0; text-align: center;
    border: 0; padding-top: 0;
}

/* Quote dourada com linha cruzada */
.quote {
    position: relative;
    text-align: center;
    margin: 6mm auto 0 auto;
    padding: 4mm 8mm;
    max-width: 250mm;
}
.quote-text {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-size: 11.5pt; color: #C9A56E;
    letter-spacing: .005em;
}
.quote::before {
    content: ''; position: absolute;
    top: 50%; left: -10mm; right: -10mm;
    height: 0; border-top: 1px solid rgba(201,165,110,.65);
    transform: rotate(-2deg);
}

/* === Visualização do Projeto === */
.hero-mosaic { width: 100%; border-collapse: separate; border-spacing: 4mm; margin-top: 6mm; }
.hero-mosaic td.big { width: 60%; height: 110mm; padding: 0; vertical-align: top; }
.hero-mosaic td.col-right { width: 40%; padding: 0; vertical-align: top; }
.hero-mosaic td img.full {
    width: 100%; height: 110mm; object-fit: cover; display: block;
    border: 1px solid rgba(201,165,110,.18);
}
.hero-mosaic .small-stack img {
    width: 100%; height: 53mm; object-fit: cover; display: block;
    border: 1px solid rgba(201,165,110,.18);
    margin-bottom: 4mm;
}
.hero-mosaic .small-stack img:last-child { margin-bottom: 0; }

/* === Tabela INVESTIMENTO === */
.inv-table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
.inv-table thead th {
    background: #C9A56E; color: #04140F;
    font-family: 'Manrope', sans-serif; font-size: 10pt; font-weight: 700;
    padding: 3mm 4mm; text-align: left;
    letter-spacing: .02em;
}
.inv-table thead th.r { text-align: right; }
.inv-table thead th.c { text-align: center; }
.inv-table tbody td {
    padding: 2.5mm 4mm; font-size: 10pt;
    color: #E5DCC8;
    border-bottom: 1px solid rgba(201,165,110,.10);
}
.inv-table tbody td.r { text-align: right; font-variant-numeric: tabular-nums; }
.inv-table tbody td.c { text-align: center; }
.inv-table .green { color: #52C75E; font-weight: 600; }
.inv-table .dash { color: #6a6253; }
.totals-rows { width: 100%; margin-top: 6mm; font-size: 11pt; }
.totals-rows td {
    padding: 3mm 4mm; font-weight: 600;
    border-top: 1px solid rgba(201,165,110,.18);
    color: #E5DCC8;
}
.totals-rows td.r { text-align: right; font-variant-numeric: tabular-nums; }
.totals-rows tr.grand td {
    padding: 5mm 4mm 3mm 4mm;
    color: #C9A56E;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600; font-size: 22pt;
    border-top: 1px solid rgba(201,165,110,.4);
}
.totals-rows tr.grand td.r {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32pt; font-style: normal;
}
.footnote {
    margin-top: 4mm; font-style: italic; font-size: 8.5pt;
    color: #8a7f6a;
}

/* === Itens Não Inclusos === */
.excl-list { width: 100%; border-collapse: collapse; margin-top: 6mm; }
.excl-list td {
    width: 50%; padding: 4mm 6mm 4mm 0;
    font-size: 11pt; color: #E5DCC8;
    border-bottom: 1px solid rgba(201,165,110,.13);
}
.bottom-note {
    margin-top: 6mm; text-align: center;
    font-size: 10pt; color: #E5DCC8; font-style: italic;
    line-height: 1.6;
    padding: 0 30mm;
}
.bottom-note::after {
    content: ''; display: block; margin-top: 4mm;
    height: 0; border-top: 1px solid rgba(201,165,110,.45);
    transform: rotate(-1.5deg);
}

/* === Condições === */
.cond-grid { width: 100%; margin-top: 4mm; border-collapse: separate; border-spacing: 0 0; }
.cond-grid td.left {
    width: 38%; vertical-align: middle; padding: 4mm 8mm 4mm 0;
}
.cond-grid td.right { width: 62%; vertical-align: top; padding-left: 4mm; }
.cond-total-lbl {
    font-size: 11pt; color: #B5AB94;
    letter-spacing: .02em; margin-bottom: 2mm;
}
.cond-total-val {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 40pt; color: #C9A56E; line-height: 1;
}
.cond-pay-title {
    margin-top: 6mm;
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 16pt; color: #E5DCC8;
}
.cond-pay-sub {
    margin-top: 1.5mm; font-size: 10pt; color: #B5AB94;
}
.cond-item {
    padding: 3mm 3mm 3mm 0;
    border-bottom: 1px solid rgba(201,165,110,.13);
}
.cond-item:first-child { padding-top: 0; }
.cond-item .ct {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 13pt; color: #C9A56E;
}
.cond-item .cd {
    margin-top: 1mm; font-size: 9.5pt; color: #B5AB94;
}
.cond-bottom {
    margin-top: 6mm; padding-top: 4mm;
    font-size: 9.5pt; color: #E5DCC8; line-height: 1.6;
}

/* === Encerramento === */
.close-page { text-align: center; padding-top: 28mm !important; }
.close-page img.logo-close {
    width: 75mm; height: auto;
    margin: 0 auto 6mm auto;
    filter: drop-shadow(0 4px 16px rgba(0,0,0,.6));
}
.close-page .closing-quote {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-size: 16pt; color: #C9A56E;
    line-height: 1.4; margin-top: 6mm;
}
.close-page .closing-contact {
    margin-top: 8mm; font-size: 10pt; color: #B5AB94;
    letter-spacing: .04em;
}
.close-page .closing-thanks {
    margin-top: 6mm; font-size: 11pt; color: #E5DCC8;
}

/* helpers */
.title-block { margin-bottom: 2mm; }
.cards-wrap { margin-top: 4mm; }
"""


def footer_html():
    return '<div class="foot">Thiago Nicezio  |  contato@filtrosuvc.com.br  |  thiagonicezio.com</div>'


def card_2col(icon, title, desc):
    return f"""
    <div class="card">
        <span class="icon-wrap">{icon_html(icon, 11)}</span>
        <span class="title-inline">{title}</span>
        <div class="desc">{desc}</div>
    </div>
    """


def card_3col(icon, title, desc, size=14):
    return f"""
    <div class="card">
        <span class="icon-wrap">{icon_html(icon, size)}</span>
        <span class="title-inline">{title}</span>
        <div class="desc">{desc}</div>
    </div>
    """


def page1_capa():
    return f"""
    <div class="page cover">
        <img class="logo-big" src="data:image/png;base64,{LOGO}" />
        <div class="gold-line"></div>
        <h1>Proposta de Parceria Técnica</h1>
        <div class="sub-main">Sistema de Filtragem para Lago Ornamental — {VOLUME}</div>
        <div class="cover-diag"></div>
        <div class="client-block">
            <div class="client-label">Cliente:</div>
            <div class="client-name">{CLIENTE}</div>
            <div class="client-date">{DATA}</div>
        </div>
    </div>
    """


def page2_quem_e():
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
    # último card sozinho
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


def page3_a_parceria():
    cards = [
        ("lock",     "Confidencialidade",      "Contrato de sigilo garante que o projeto é apresentado como Gramopool ao cliente final"),
        ("sitemap",  "Projeto Técnico",        "Thiago Nicezio é responsável pelo dimensionamento completo do sistema de filtragem"),
        ("handshake","Parceria de Longo Prazo","Este é o primeiro projeto — a porta de entrada para trabalharmos juntos em lagos ornamentais"),
    ]
    cells = "".join(f"<td>{card_3col(*c)}</td>" for c in cards)
    return f"""
    <div class="page">
        <h1>A Parceria</h1>
        <div class="sub-italic">Início de uma Parceria Técnica em Lagos Ornamentais</div>
        <p class="body-p" style="margin-top:7mm; max-width:285mm;">
            Esta proposta marca o primeiro passo para uma parceria técnica sólida na área de lagos ornamentais.
            Thiago Nicezio assume o papel de parceiro técnico, responsável por todo o projeto de filtragem,
            dimensionamento e especificação de equipamentos. A Gramopool mantém a autoria comercial e o
            relacionamento direto com o cliente final.
        </p>
        <table class="cards cards-3" style="margin-top: 12mm;"><tr>{cells}</tr></table>
        {footer_html()}
    </div>
    """


def page4_visualizacao():
    return f"""
    <div class="page">
        <h1>Visualização do Projeto</h1>
        <div class="sub-italic">Lago Ornamental — Volume Estimado: {VOLUME}</div>
        <table class="hero-mosaic">
            <tr>
                <td class="big"><img class="full" src="data:image/png;base64,{HERO1}" /></td>
                <td class="col-right">
                    <div class="small-stack">
                        <img src="data:image/png;base64,{HERO2}" />
                        <img src="data:image/png;base64,{HERO3}" />
                    </div>
                </td>
            </tr>
        </table>
        {footer_html()}
    </div>
    """


def page5_escopo():
    cards = [
        ("sitemap",  "Projeto Executivo de Filtragem", "Dimensionamento técnico completo: ozônio, UV, bombas, sistema de injeção e memorial descritivo."),
        ("gears",    "Fornecimento de Equipamentos",   "Sistema personalizado e industrial, especificado sob medida para este projeto."),
        ("wrench",   "Visita Técnica + Start do Sistema", "Entrega dos equipamentos no local, acompanhamento da instalação e start completo do sistema."),
        ("document", "Contrato de Confidencialidade",  "Parceria técnica sigilosa — o projeto é apresentado como Gramopool ao cliente final."),
    ]
    rows = ""
    for i in range(0, 4, 2):
        rows += f"<tr><td>{card_2col(*cards[i])}</td><td>{card_2col(*cards[i+1])}</td></tr>"
    return f"""
    <div class="page">
        <h1>Escopo do Primeiro Projeto</h1>
        <div class="sub-italic">Solução Integrada para Lago Ornamental — {VOLUME}</div>
        <table class="cards" style="margin-top:5mm;">{rows}</table>
        <div class="quote">
            <div class="quote-text"><b style="font-weight:600;">Objetivo Central:</b>  Água cristalina, estabilidade biológica e durabilidade máxima — sem surpresas.</div>
        </div>
        {footer_html()}
    </div>
    """


def page6_equipamentos():
    rows = ""
    for i in range(0, 6, 3):
        rows += "<tr>"
        for j in range(3):
            ico, t, d = PRODUTOS_DETALHE[i+j]
            rows += f"<td>{card_3col(ico, t, d, size=12)}</td>"
        rows += "</tr>"
    return f"""
    <div class="page">
        <h1>Equipamentos Especificados</h1>
        <div class="sub-italic">Sistema Personalizado para {VOLUME}</div>
        <table class="cards cards-eq" style="margin-top:6mm; border-spacing: 4mm 8mm;">{rows}</table>
        {footer_html()}
    </div>
    """


def page7_investimento():
    rows = ""
    for nome, q, vu, desc in PRECOS:
        bruto = q * vu
        if desc:
            total = bruto * (1 - desc/100)
            desc_cell = f'<td class="c green">-{desc}%</td>'
        else:
            total = bruto
            desc_cell = '<td class="c dash">—</td>'
        rows += f"""
        <tr>
            <td>{nome}</td>
            <td class="c">{q}</td>
            <td class="r">{fmt(vu)}</td>
            {desc_cell}
            <td class="r green">{fmt(total)}</td>
        </tr>
        """

    return f"""
    <div class="page">
        <h1>Investimento</h1>
        <div class="sub-italic">Valores com Condição de Parceiro ENG Soluções — 20% de desconto nas linhas Ozone Fish e Filtro UV</div>
        <table class="inv-table">
            <thead><tr>
                <th>Equipamento</th>
                <th class="c">Qtd.</th>
                <th class="r">Valor Unit.</th>
                <th class="c">Desc.</th>
                <th class="r">Total</th>
            </tr></thead>
            <tbody>{rows}</tbody>
        </table>
        <table class="totals-rows">
            <tr>
                <td>Subtotal Equipamentos (com desconto parceiro 20%):</td>
                <td class="r">{fmt(SUBTOTAL_EQUIP)}</td>
            </tr>
            <tr>
                <td>Projeto Executivo + Visita Técnica + Start do Sistema:</td>
                <td class="r">{fmt(VALOR_PROJETO)}</td>
            </tr>
            <tr class="grand">
                <td>TOTAL GERAL:</td>
                <td class="r">{fmt(TOTAL_GERAL)}</td>
            </tr>
        </table>
        <div class="footnote">* Valores com contrato de parceiro ENG Soluções assinado. Desconto de 20% aplicado nas linhas Ozone Fish e Filtro UV.</div>
        {footer_html()}
    </div>
    """


def page8_nao_inclusos():
    items = [
        "Manta de impermeabilização (EPDM ou PVC)",
        "Materiais hidráulicos (tubos, conexões, registros)",
        "Areia, pedras e materiais para paisagismo",
        "Execução da obra civil ou hidráulica",
        "Execução física do sistema de filtragem",
        "Mão de obra para construção da casa de máquinas",
        "Frete dos equipamentos (cotado separadamente)",
        "Despesas de deslocamento da equipe técnica",
    ]
    rows = ""
    for i in range(0, 8, 2):
        rows += f"<tr><td>{items[i]}</td><td>{items[i+1]}</td></tr>"
    return f"""
    <div class="page">
        <h1>Itens Não Inclusos</h1>
        <div class="sub-italic">Transparência Total — Sem Surpresas</div>
        <table class="excl-list" style="margin-top:6mm;">{rows}</table>
        <div class="bottom-note">
            O projeto executivo fornece todas as especificações necessárias para que a equipe do cliente execute a obra corretamente. A visita técnica garante o start correto e a validação do sistema.
        </div>
        {footer_html()}
    </div>
    """


def page9_condicoes():
    conds = [
        ("Contrato de Confidencialidade", "Assinatura por ambas as partes antes do início"),
        ("Pagamento do Orçamento",        "À vista via PIX ou transferência bancária"),
        ("Entrega do Projeto",            "Em até 4 dias após confirmação do pagamento"),
        ("Visita Técnica + Start",        "Data definida em comum acordo entre as partes"),
    ]
    cond_html = "".join(
        f'<div class="cond-item"><div class="ct">{t}</div><div class="cd">{d}</div></div>'
        for t, d in conds
    )
    return f"""
    <div class="page">
        <h1>Condições</h1>
        <table class="cond-grid">
            <tr>
                <td class="left">
                    <div class="cond-total-lbl">Investimento Total</div>
                    <div class="cond-total-val">{fmt(TOTAL_GERAL)}</div>
                    <div class="cond-pay-title">Pagamento à vista</div>
                    <div class="cond-pay-sub">PIX / Transferência Bancária</div>
                </td>
                <td class="right">{cond_html}</td>
            </tr>
        </table>
        <div class="cond-bottom">
            Incluso: Projeto executivo de filtragem completo + todos os equipamentos + visita técnica com entrega, acompanhamento da instalação e start do sistema.
        </div>
        {footer_html()}
    </div>
    """


def page10_por_que():
    cards = [
        ("globe",     "Padrão Internacional",   "Projetos executados no Brasil, Europa e Estados Unidos com tecnologias de ponta."),
        ("shield",    "Domínio Técnico Absoluto","Sócio da ENG Soluções — entende o equipamento por dentro. Precisão cirúrgica."),
        ("medal",     "Autoridade no Setor",    "Presidente da ABLP — normatiza e profissionaliza o mercado de lagos e piscinas praia."),
        ("eye",       "Compromisso com Resultado","Não entregamos promessas — entregamos água cristalina com validação técnica."),
        ("handshake", "Parceiro, Não Fornecedor","Trabalhamos lado a lado. Seu sucesso é o nosso sucesso."),
    ]
    rows = ""
    for i in range(0, 4, 2):
        rows += f"<tr><td>{card_2col(*cards[i])}</td><td>{card_2col(*cards[i+1])}</td></tr>"
    rows += f"<tr><td>{card_2col(*cards[4])}</td><td></td></tr>"
    return f"""
    <div class="page">
        <h1>Por que Thiago Nicezio</h1>
        <table class="cards" style="margin-top:6mm;">{rows}</table>
        {footer_html()}
    </div>
    """


def page11_encerramento():
    return f"""
    <div class="page close-page">
        <img class="logo-close" src="data:image/png;base64,{LOGO}" />
        <div class="gold-line-center"></div>
        <div class="closing-quote">"Água cristalina não é promessa.<br/>É compromisso técnico."</div>
        <div class="closing-contact">contato@filtrosuvc.com.br  |  thiagonicezio.com</div>
        <div class="closing-thanks">Obrigado pela confiança.</div>
    </div>
    """


html = f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
{page1_capa()}
{page2_quem_e()}
{page3_a_parceria()}
{page4_visualizacao()}
{page5_escopo()}
{page6_equipamentos()}
{page7_investimento()}
{page8_nao_inclusos()}
{page9_condicoes()}
{page10_por_que()}
{page11_encerramento()}
</body></html>"""

(OUT_DIR / "proposta.html").write_text(html, encoding="utf-8")
HTML(string=html, base_url=str(ROOT)).write_pdf(str(OUT))
print(f"PDF gerado: {OUT}  ({OUT.stat().st_size/1024:.1f} KB)")
