"""
Gera Proposta de Parceria Técnica — 10 páginas landscape — Thiago Nicézio.

Para cada novo orçamento, editar os blocos no topo:
  - PROJETO:   dados do cliente (cliente, data, tipo, volume)
  - PRODUTOS:  lista unificada (alimenta a pág Equipamentos + tabela Investimento)
  - VALOR_PROJETO_EXECUTIVO

Depois rodar:  python3 tools/gerar_proposta.py
PDF sai em:    output/proposta.pdf
"""
import base64
from pathlib import Path
from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "output"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "proposta.pdf"


# ====================================================================
# DADOS DO CLIENTE — editar para cada orçamento
# ====================================================================
PROJETO = {
    "cliente":  "Otávio — Empresa Exemplo",
    "data":     "Maio 2026",
    "tipo":     "Lago Ornamental",     # "Lago Ornamental" ou "Piscina Praia"
    "volume":   "150.000 Litros",
}

# Cada produto alimenta simultaneamente:
#   - pág "Equipamentos Especificados" (icon + nome_card + desc_card)
#   - tabela "Investimento" (nome_tabela + qtd + unit + desc_pct)
PRODUTOS = [
    {
        "icon": "bolt",
        "nome_card": "Ozone Fish<br/>Power — Inox",
        "desc_card": "Gerador de ozônio industrial para tratamento de alto volume",
        "nome_tabela": "Ozone Fish Power — Inox",
        "qtd": 1, "unit": 15339.00, "desc_pct": 20,
    },
    {
        "icon": "wind",
        "nome_card": "Concentrador<br/>10 LPM",
        "desc_card": "Pureza 95%, aumenta em +300% a potência do ozônio",
        "nome_tabela": "Concentrador de Oxigênio 10 LPM",
        "qtd": 1, "unit": 9800.00, "desc_pct": None,
    },
    {
        "icon": "waves",
        "nome_card": "ENG MIX",
        "desc_card": "Microbolhas que potencializam a transferência de ozônio",
        "nome_tabela": "ENG MIX",
        "qtd": 1, "unit": 1890.00, "desc_pct": None,
    },
    {
        "icon": "sun",
        "nome_card": "Filtro UV Inox<br/>380W",
        "desc_card": "Esterilização UV-C industrial, corpo em aço inox 304",
        "nome_tabela": "Filtro UV Inox 380W — 220V",
        "qtd": 2, "unit": 9943.50, "desc_pct": 20,
    },
    {
        "icon": "drop",
        "nome_card": "AquaMax<br/>50.000 L/h",
        "desc_card": "Bombas de alta vazão para circulação completa",
        "nome_tabela": "Bomba AquaMax 50.000 L/h",
        "qtd": 5, "unit": 2730.00, "desc_pct": None,
    },
    {
        "icon": "arrows",
        "nome_card": "Sistema de<br/>Injeção de Ozônio",
        "desc_card": "Bypass personalizado para injeção eficiente na água",
        "nome_tabela": "Bypass",
        "qtd": 1, "unit": 924.00, "desc_pct": None,
    },
]

VALOR_PROJETO_EXECUTIVO = 8000.00
DESCONTO_PARCEIRO_PCT   = 20


# ====================================================================
# Helpers
# ====================================================================
def fmt(v: float) -> str:
    int_part = int(v)
    dec_part = int(round((v - int_part) * 100))
    int_str = f"{int_part:,}".replace(",", ".")
    return f"R$ {int_str},{dec_part:02d}"


def b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()


# Assets — todos os 17 ícones agora são PNG bronze sólido (extraídos do pptx oficial)
ICONS_DIR = ROOT / "assets" / "icons"
LOGO = b64(ROOT / "assets" / "logo_thiago_nicezio.png")
ICON = {n.stem: b64(n) for n in ICONS_DIR.glob("*.png")}


def icon_html(name: str, size_mm: float = 10) -> str:
    if name not in ICON:
        return ""
    return f'<img class="ico" src="data:image/png;base64,{ICON[name]}" style="width:{size_mm}mm;height:{size_mm}mm;" />'


def calc_totais():
    subtotal = 0.0
    for p in PRODUTOS:
        bruto = p["qtd"] * p["unit"]
        if p["desc_pct"]:
            bruto *= (1 - p["desc_pct"]/100)
        subtotal += bruto
    return subtotal, subtotal + VALOR_PROJETO_EXECUTIVO


SUBTOTAL_EQUIP, TOTAL_GERAL = calc_totais()


# ====================================================================
# CSS
# ====================================================================
CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@300;400;500;600;700&display=swap');

@page {
    size: 338.67mm 190.5mm;
    margin: 0;
    background: #04140F;
}
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

/* Linhas diagonais douradas decorativas (intensificadas) */
.page::before {
    content: '';
    position: absolute; inset: 0; z-index: 0;
    pointer-events: none;
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
    font-weight: 500;
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
.foot {
    position: absolute; bottom: 5mm; left: 0; right: 0;
    text-align: center; font-size: 8.5pt; color: #8a7f6a;
    letter-spacing: .04em;
    border-top: 1px solid rgba(201,165,110,.18);
    padding-top: 3mm; margin: 0 22mm;
}
.logo-top-right {
    position: absolute; top: 13mm; right: 22mm;
    height: 17mm; width: auto;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,.5));
}

/* CAPA */
.cover { text-align: left; padding: 22mm 30mm 14mm 30mm !important; }
.cover .logo-big {
    display: block; width: 95mm; height: auto;
    margin: 2mm 0 6mm 0;
    filter: drop-shadow(0 4px 16px rgba(0,0,0,.6));
}
.cover h1 { font-size: 44pt; color: #C9A56E; margin-top: 4mm; }
.cover .sub-main { font-size: 14pt; color: #E5DCC8; margin-top: 2mm; letter-spacing: .01em; }
.cover-diag {
    position: absolute; bottom: 50mm; left: 30mm; right: 30mm;
    height: 0; border-top: 1px solid rgba(201,165,110,.5);
    transform: rotate(-2deg); transform-origin: left center;
}
.cover .client-block { margin-top: 18mm; }
.cover .client-label { font-style: italic; font-size: 11pt; color: #B5AB94; }
.cover .client-name { font-weight: 700; font-size: 17pt; color: #E5DCC8; margin-top: 1.5mm; }
.cover .client-date { font-size: 10pt; color: #8a7f6a; margin-top: 2mm; }

/* CARDS */
.cards { width: 100%; border-collapse: separate; border-spacing: 8mm 6mm; margin-top: 6mm; }
.cards td { vertical-align: top; padding: 0; width: 50%; }
.card .icon-wrap { display: inline-block; width: 11mm; height: 11mm; vertical-align: middle; }
.card .icon-wrap img { width: 100%; height: 100%; display: block; }
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
.cards-3 .title-inline {
    display: block; margin-left: 0; margin-top: 3mm;
    font-size: 14pt; color: #C9A56E; font-weight: 600;
}
.cards-3 .desc { margin-left: 0; text-align: center; border: 0; padding-top: 3mm; }

.cards-eq td { width: 33.333%; vertical-align: top; }
.cards-eq .card { text-align: center; padding: 0 3mm; }
.cards-eq .icon-wrap { display: block; margin: 0 auto 3mm auto; width: 9mm; height: 9mm; }
.cards-eq .title-inline {
    display: block; margin-left: 0; font-size: 13.5pt;
    color: #E5DCC8; font-weight: 600; line-height: 1.2;
}
.cards-eq .desc { margin: 4mm 0 0 0; text-align: center; border: 0; padding-top: 0; }

.quote {
    position: relative; text-align: center;
    margin: 6mm auto 0 auto; padding: 4mm 8mm; max-width: 250mm;
}
.quote-text {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-size: 11.5pt; color: #C9A56E; letter-spacing: .005em;
}
.quote::before {
    content: ''; position: absolute;
    top: 50%; left: -10mm; right: -10mm; height: 0;
    border-top: 1px solid rgba(201,165,110,.65);
    transform: rotate(-2deg);
}

/* INVESTIMENTO */
.inv-table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
.inv-table thead th {
    background: #C9A56E; color: #04140F;
    font-size: 10pt; font-weight: 700; padding: 3mm 4mm;
    text-align: left; letter-spacing: .02em;
}
.inv-table thead th.r { text-align: right; }
.inv-table thead th.c { text-align: center; }
.inv-table tbody td {
    padding: 2.5mm 4mm; font-size: 10pt; color: #E5DCC8;
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
    font-size: 32pt;
}
.footnote {
    margin-top: 4mm; font-style: italic; font-size: 8.5pt; color: #8a7f6a;
}

/* EXCLUSÕES */
.excl-list { width: 100%; border-collapse: collapse; margin-top: 6mm; }
.excl-list td {
    width: 50%; padding: 4mm 6mm 4mm 0;
    font-size: 11pt; color: #E5DCC8;
    border-bottom: 1px solid rgba(201,165,110,.13);
}
.bottom-note {
    margin-top: 6mm; text-align: center;
    font-size: 10pt; color: #E5DCC8; font-style: italic;
    line-height: 1.6; padding: 0 30mm;
}
.bottom-note::after {
    content: ''; display: block; margin-top: 4mm; height: 0;
    border-top: 1px solid rgba(201,165,110,.45);
    transform: rotate(-1.5deg);
}

/* CONDIÇÕES */
.cond-grid { width: 100%; margin-top: 4mm; border-collapse: separate; }
.cond-grid td.left { width: 38%; vertical-align: middle; padding: 4mm 8mm 4mm 0; }
.cond-grid td.right { width: 62%; vertical-align: top; padding-left: 4mm; }
.cond-total-lbl { font-size: 11pt; color: #B5AB94; letter-spacing: .02em; margin-bottom: 2mm; }
.cond-total-val {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 40pt; color: #C9A56E; line-height: 1;
}
.cond-pay-title {
    margin-top: 6mm;
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 16pt; color: #E5DCC8;
}
.cond-pay-sub { margin-top: 1.5mm; font-size: 10pt; color: #B5AB94; }
.cond-item { padding: 3mm 3mm 3mm 0; border-bottom: 1px solid rgba(201,165,110,.13); }
.cond-item:first-child { padding-top: 0; }
.cond-item .ct {
    font-family: 'Cormorant Garamond', serif; font-weight: 600;
    font-size: 13pt; color: #C9A56E;
}
.cond-item .cd { margin-top: 1mm; font-size: 9.5pt; color: #B5AB94; }
.cond-bottom { margin-top: 6mm; padding-top: 4mm; font-size: 9.5pt; color: #E5DCC8; line-height: 1.6; }

/* ENCERRAMENTO */
.close-page { text-align: center; padding-top: 28mm !important; }
.close-page img.logo-close {
    width: 75mm; height: auto; margin: 0 auto 6mm auto;
    filter: drop-shadow(0 4px 16px rgba(0,0,0,.6));
}
.close-page .closing-quote {
    font-family: 'Manrope', sans-serif; font-style: italic;
    font-size: 16pt; color: #C9A56E; line-height: 1.4; margin-top: 6mm;
}
.close-page .closing-contact { margin-top: 8mm; font-size: 10pt; color: #B5AB94; letter-spacing: .04em; }
.close-page .closing-thanks { margin-top: 6mm; font-size: 11pt; color: #E5DCC8; }
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


# ====================================================================
# Páginas (10 — sem "Visualização do Projeto")
# ====================================================================
def page_capa():
    return f"""
    <div class="page cover">
        <img class="logo-big" src="data:image/png;base64,{LOGO}" />
        <div class="gold-line"></div>
        <h1>Proposta de Parceria Técnica</h1>
        <div class="sub-main">Sistema de Filtragem para {PROJETO['tipo']} — {PROJETO['volume']}</div>
        <div class="cover-diag"></div>
        <div class="client-block">
            <div class="client-label">Cliente:</div>
            <div class="client-name">{PROJETO['cliente']}</div>
            <div class="client-date">{PROJETO['data']}</div>
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
        ("lock",     "Confidencialidade",      "Contrato de sigilo garante que o projeto é apresentado pelo parceiro comercial ao cliente final"),
        ("sitemap",  "Projeto Técnico",        "Thiago Nicezio é responsável pelo dimensionamento completo do sistema de filtragem"),
        ("handshake","Parceria de Longo Prazo","Este é o primeiro projeto — a porta de entrada para trabalharmos juntos em lagos ornamentais"),
    ]
    cells = "".join(f"<td>{card_3col(*c)}</td>" for c in cards)
    return f"""
    <div class="page">
        <h1>A Parceria</h1>
        <div class="sub-italic">Início de uma Parceria Técnica em Lagos Ornamentais</div>
        <p class="body-p" style="margin-top:7mm; max-width:285mm;">
            Esta proposta marca o primeiro passo para uma parceria técnica sólida.
            Thiago Nicezio assume o papel de parceiro técnico, responsável por todo o projeto de filtragem,
            dimensionamento e especificação de equipamentos. O parceiro comercial mantém a autoria
            comercial e o relacionamento direto com o cliente final.
        </p>
        <table class="cards cards-3" style="margin-top: 12mm;"><tr>{cells}</tr></table>
        {footer_html()}
    </div>
    """


def page_escopo():
    cards = [
        ("sitemap",  "Projeto Executivo de Filtragem", "Dimensionamento técnico completo: ozônio, UV, bombas, sistema de injeção e memorial descritivo."),
        ("gears",    "Fornecimento de Equipamentos",   "Sistema personalizado e industrial, especificado sob medida para este projeto."),
        ("wrench",   "Visita Técnica + Start do Sistema", "Entrega dos equipamentos no local, acompanhamento da instalação e start completo do sistema."),
        ("document", "Contrato de Confidencialidade",  "Parceria técnica sigilosa — o projeto é apresentado pelo parceiro comercial ao cliente final."),
    ]
    rows = ""
    for i in range(0, 4, 2):
        rows += f"<tr><td>{card_2col(*cards[i])}</td><td>{card_2col(*cards[i+1])}</td></tr>"
    return f"""
    <div class="page">
        <h1>Escopo do Primeiro Projeto</h1>
        <div class="sub-italic">Solução Integrada para {PROJETO['tipo']} — {PROJETO['volume']}</div>
        <table class="cards" style="margin-top:5mm;">{rows}</table>
        <div class="quote">
            <div class="quote-text"><b style="font-weight:600;">Objetivo Central:</b>  Água cristalina, estabilidade biológica e durabilidade máxima — sem surpresas.</div>
        </div>
        {footer_html()}
    </div>
    """


def page_equipamentos():
    rows = ""
    chunks = [PRODUTOS[i:i+3] for i in range(0, len(PRODUTOS), 3)]
    for chunk in chunks:
        rows += "<tr>"
        for p in chunk:
            rows += f"<td>{card_3col(p['icon'], p['nome_card'], p['desc_card'], size=12)}</td>"
        for _ in range(3 - len(chunk)):
            rows += "<td></td>"
        rows += "</tr>"
    return f"""
    <div class="page">
        <h1>Equipamentos Especificados</h1>
        <div class="sub-italic">Sistema Personalizado para {PROJETO['volume']}</div>
        <table class="cards cards-eq" style="margin-top:6mm; border-spacing: 4mm 8mm;">{rows}</table>
        {footer_html()}
    </div>
    """


def page_investimento():
    rows = ""
    for p in PRODUTOS:
        q, vu = p["qtd"], p["unit"]
        bruto = q * vu
        if p["desc_pct"]:
            total = bruto * (1 - p["desc_pct"]/100)
            desc_cell = f'<td class="c green">-{p["desc_pct"]}%</td>'
        else:
            total = bruto
            desc_cell = '<td class="c dash">—</td>'
        rows += f"""
        <tr>
            <td>{p['nome_tabela']}</td>
            <td class="c">{q}</td>
            <td class="r">{fmt(vu)}</td>
            {desc_cell}
            <td class="r green">{fmt(total)}</td>
        </tr>
        """

    return f"""
    <div class="page">
        <h1>Investimento</h1>
        <div class="sub-italic">Valores com Condição de Parceiro ENG Soluções — {DESCONTO_PARCEIRO_PCT}% de desconto nas linhas Ozone Fish e Filtro UV</div>
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
                <td>Subtotal Equipamentos (com desconto parceiro {DESCONTO_PARCEIRO_PCT}%):</td>
                <td class="r">{fmt(SUBTOTAL_EQUIP)}</td>
            </tr>
            <tr>
                <td>Projeto Executivo + Visita Técnica + Start do Sistema:</td>
                <td class="r">{fmt(VALOR_PROJETO_EXECUTIVO)}</td>
            </tr>
            <tr class="grand">
                <td>TOTAL GERAL:</td>
                <td class="r">{fmt(TOTAL_GERAL)}</td>
            </tr>
        </table>
        <div class="footnote">* Valores com contrato de parceiro ENG Soluções assinado. Desconto de {DESCONTO_PARCEIRO_PCT}% aplicado nas linhas Ozone Fish e Filtro UV.</div>
        {footer_html()}
    </div>
    """


def page_nao_inclusos():
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


def page_condicoes():
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


def page_por_que():
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


def page_encerramento():
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
{page_capa()}
{page_quem_e()}
{page_a_parceria()}
{page_escopo()}
{page_equipamentos()}
{page_investimento()}
{page_nao_inclusos()}
{page_condicoes()}
{page_por_que()}
{page_encerramento()}
</body></html>"""

(OUT_DIR / "proposta.html").write_text(html, encoding="utf-8")

# Preserva qualidade das imagens (desabilita compressão automática)
HTML(string=html, base_url=str(ROOT)).write_pdf(
    str(OUT),
    optimize_images=False,
)

print(f"PDF gerado: {OUT}  ({OUT.stat().st_size/1024:.1f} KB)")
