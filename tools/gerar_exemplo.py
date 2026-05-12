"""Gera PDF de exemplo (3 páginas: Institucional + Tecnologia + Orçamento ENG).
Usa dados fictícios para validar o design system novo (marinho + amber, Cormorant + Manrope).
"""
import base64
import os
from pathlib import Path
from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output" / "exemplo.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)


def fmt(v: float) -> str:
    int_part = int(v)
    dec_part = int(round((v - int_part) * 100))
    int_str = f"{int_part:,}".replace(",", ".")
    return f"R$ {int_str},{dec_part:02d}"


def b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode()


hero_b64 = b64(ROOT / "assets" / "renders" / "projeto_aerea_full.png")
hero2_b64 = b64(ROOT / "assets" / "renders" / "projeto_deck_close.png")
hero3_b64 = b64(ROOT / "assets" / "renders" / "projeto_aerea_sunset.png")
hero_mime = "image/png"
logo_b64 = b64(ROOT / "assets" / "logo_thiago_nicezio.png")

CLIENTE = dict(
    nome="Aquaverde Engenharia Ltda",
    cnpj="12.345.678/0001-90",
    cidade="Curitiba / PR",
    tel="(41) 99999-0000",
    email="contato@aquaverde.com.br",
    data="12 / Maio / 2026",
    vendedor="Thiago Nicézio",
)

PRODUTOS = [
    ("Ozone Fish 60000 — Gerador de ozônio para até 60.000L", 1, 28500.00),
    ("Filtro UV 190W — Esterilização ultravioleta", 1, 8900.00),
    ("ENG MIX — Misturador de ozônio na água", 1, 4200.00),
    ("Bypass da ENG — Controle de fluxo", 1, 1800.00),
    ("Filtro de Sílica — Filtragem física complementar", 1, 3200.00),
]
SUBTOTAL = sum(q * v for _, q, v in PRODUTOS)
DESCONTO_PCT = 0
DESCONTO = SUBTOTAL * DESCONTO_PCT / 100
TOTAL = SUBTOTAL - DESCONTO

CRED = [
    ("01", "Experiência de Campo",
     "Anos de atuação prática em lagos ornamentais e piscinas praia no Brasil, com projetos premiados em residências e empreendimentos premium."),
    ("02", "ENG Soluções",
     "Sócio da empresa referência nacional em tratamento de água por ozônio e UV, atendendo do residencial ao industrial."),
    ("03", "Liderança Setorial",
     "Presidente da ABLP — Associação Brasileira de Lagos e Piscinas, liderando padronização e profissionalização do mercado."),
    ("04", "Domínio Técnico Completo",
     "Concepção, hidráulica, circulação, filtragem, UV, ozônio, automação e comissionamento — do projeto à entrega chave-na-mão."),
]

DIFS = [
    ("Tratamento UV + Ozônio",
     "Água cristalina sem cloro ou químicos agressivos. Sistemas dimensionados para volume e carga biológica."),
    ("Cálculo Hidráulico",
     "Dimensionamento preciso de bombas, tubulação e biofiltros para garantir um sistema com água totalmente tratada."),
    ("Acompanhamento Integral",
     "Concepção → projeto técnico → execução → comissionamento → pós-venda. Um único interlocutor do início ao fim."),
]

CONDICOES = [
    "PIX à vista com 5% de desconto adicional",
    "Parcelamento em até 3x sem juros no cartão",
    "Validade da proposta: 30 dias",
    "Frete e instalação cotados separadamente",
    "Garantia de fábrica de 12 meses (peças e mão-de-obra)",
    "Todos os equipamentos operam em 220V",
]


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Manrope:wght@200;300;400;500;600;700&display=swap');

@page { size: A4; margin: 0; background: #06090F; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Manrope', sans-serif; color: #f5f1e8; background: #06090F; }

.page {
    background: radial-gradient(ellipse at top, #0f172a 0%, #06090F 60%);
    position: relative; padding: 22mm 24mm 18mm 24mm;
    page-break-after: always;
    width: 210mm; height: 297mm;
    overflow: hidden;
}
.page:last-of-type { page-break-after: auto; }
.page::before {
    content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    background:
        repeating-linear-gradient(0deg, transparent 0 14px, rgba(245,158,11,.02) 14px 15px),
        repeating-linear-gradient(90deg, transparent 0 14px, rgba(245,158,11,.02) 14px 15px);
}
.page > * { position: relative; z-index: 1; }

/* Header com logo */
.brand-header {
    width: 100%; text-align: center;
    border-bottom: 1px solid rgba(251,191,36,.15);
    padding-bottom: 4mm; margin-bottom: 5mm;
}
.brand-logo {
    display: inline-block; height: 24mm; width: auto;
    filter: drop-shadow(0 4px 16px rgba(251,191,36,.15)) drop-shadow(0 2px 8px rgba(0,0,0,.6));
}
.brand-logo-sm { height: 16mm; }

/* Stats bar (pág 2) */
.stats-bar {
    width: 100%; border-collapse: separate; border-spacing: 2mm;
    margin: 4mm 0 7mm 0;
}
.stats-bar td {
    width: 25%; vertical-align: middle; text-align: center;
    padding: 4mm 3mm;
    background: linear-gradient(135deg, rgba(245,158,11,.05), rgba(245,158,11,.01));
    border: 1px solid rgba(251,191,36,.12);
    border-radius: 2mm;
}
.stat-num {
    font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500;
    color: #fbbf24; font-size: 22pt; line-height: 1;
}
.stat-lbl {
    font-family: 'Manrope', sans-serif; font-size: 6.5pt;
    color: rgba(245,241,232,.65); letter-spacing: .14em;
    text-transform: uppercase; margin-top: 2mm;
}

/* Gold line */
.gold-line { width: 50mm; height: 1.2px; margin: 4mm auto;
    background: linear-gradient(90deg, transparent, #fbbf24, transparent); }

/* Hero image */
.hero {
    width: 100%; height: 60mm; object-fit: cover; display: block;
    border-radius: 3mm; border: 1px solid rgba(251,191,36,.15);
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
}

/* Hero mosaic — 3 projetos no mesmo espaço (1 grande + 2 pequenas) */
.hero-mosaic {
    width: 100%; border-collapse: separate; border-spacing: 2mm;
    margin-bottom: 2mm;
}
.hero-mosaic td {
    position: relative; overflow: hidden;
    border: 1px solid rgba(251,191,36,.15);
    border-radius: 3mm;
    box-shadow: 0 4px 18px rgba(0,0,0,.5);
    padding: 0;
}
.hero-mosaic td.big {
    width: 60%; height: 70mm;
    vertical-align: top;
}
.hero-mosaic td.sm {
    width: 40%; height: 34mm;
}
.hero-mosaic img {
    width: 100%; height: 100%; object-fit: cover; display: block;
}
.hero-mosaic .cap {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(180deg, transparent, rgba(6,9,15,.88));
    color: #fbbf24; font-family: 'Manrope', sans-serif;
    font-size: 6pt; font-weight: 700;
    letter-spacing: .15em; text-transform: uppercase;
    padding: 4mm 3mm 1.8mm 3mm;
}

/* Section title */
.sec-title {
    font-family: 'Cormorant Garamond', serif; font-weight: 500; font-style: italic;
    font-size: 13pt; color: #fbbf24; margin: 6mm 0 2mm 0;
    letter-spacing: .03em;
}
.sec-sub {
    font-family: 'Manrope', sans-serif; font-size: 7pt; color: rgba(245,241,232,.55);
    letter-spacing: .2em; text-transform: uppercase; margin-bottom: 3mm;
}

/* "Quem sou" parágrafo */
.quem-p {
    font-size: 9.5pt; line-height: 1.6; color: rgba(245,241,232,.85);
    margin-bottom: 6mm;
}

/* Credenciais grid 2x2 */
.cred-grid { width: 100%; border-collapse: separate; border-spacing: 3mm; margin-top: 1mm; }
.cred-grid td { width: 50%; vertical-align: top; padding: 0; }
.cred-card {
    background: linear-gradient(135deg, rgba(245,158,11,.07), rgba(245,158,11,.01));
    border: 1px solid rgba(251,191,36,.15);
    border-left: 2px solid #fbbf24;
    border-radius: 2mm; padding: 4mm 5mm;
    height: 100%;
}
.cred-card .num {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    color: #fbbf24; font-size: 18pt; font-weight: 500; line-height: 1; opacity: .75;
}
.cred-card .ctitle {
    color: #f5f1e8; font-size: 9pt; font-weight: 700;
    letter-spacing: .04em; margin-top: 1.5mm;
}
.cred-card .cdesc {
    color: rgba(245,241,232,.7); font-size: 7.5pt; line-height: 1.5; margin-top: 1.5mm;
}

/* Diferenciais (3 cols) */
.dif-grid { width: 100%; border-collapse: separate; border-spacing: 3mm; }
.dif-grid td { width: 33.333%; vertical-align: top; padding: 0; }
.dif-card {
    background: linear-gradient(135deg, rgba(245,158,11,.05), rgba(245,158,11,.005));
    border: 1px solid rgba(251,191,36,.13);
    border-radius: 2mm; padding: 4mm 4mm 5mm 4mm; height: 100%;
}
.dif-card .icon {
    font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 600;
    color: #fbbf24; font-size: 24pt; line-height: 1;
}
.dif-card .dtitle {
    color: #f5f1e8; font-size: 9pt; font-weight: 700;
    letter-spacing: .03em; margin-top: 2.5mm;
}
.dif-card .ddesc {
    color: rgba(245,241,232,.72); font-size: 7.5pt; line-height: 1.5; margin-top: 1.5mm;
}

/* Renders grid 2x2 placeholders */
.renders { width: 100%; border-collapse: separate; border-spacing: 3mm; margin-top: 5mm; }
.renders td {
    width: 50%; height: 52mm; padding: 0;
    background: #0a1224;
    border: 1px solid rgba(251,191,36,.18);
    border-radius: 2mm; position: relative; overflow: hidden;
}
.render-ph {
    display: block; width: 100%; height: 100%; text-align: center;
    padding: 22mm 4mm 0 4mm;
    background:
        radial-gradient(ellipse at center, rgba(251,191,36,.04), transparent 70%),
        repeating-linear-gradient(45deg, transparent 0 6px, rgba(251,191,36,.025) 6px 7px);
}
.render-ph .lbl {
    font-family: 'Manrope', sans-serif; font-size: 7pt; color: rgba(251,191,36,.6);
    letter-spacing: .18em; text-transform: uppercase;
}
.render-ph .ttl {
    font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500;
    color: #f5f1e8; font-size: 11pt; margin-top: 1.5mm;
}

/* Client Card (orçamento) */
.orc-title {
    font-family: 'Cormorant Garamond', serif; font-weight: 500; font-style: italic;
    font-size: 26pt; color: #f5f1e8; text-align: center; letter-spacing: .04em;
}
.orc-sub {
    font-family: 'Manrope', sans-serif; font-size: 7pt; color: rgba(251,191,36,.7);
    text-align: center; letter-spacing: .25em; text-transform: uppercase; margin-top: 1mm;
}
.client-card {
    background: linear-gradient(135deg, rgba(245,158,11,.07), rgba(245,158,11,.01));
    border: 1px solid rgba(251,191,36,.18);
    border-radius: 3mm; padding: 4mm 6mm; margin-top: 5mm;
}
.client-card table { width: 100%; }
.client-card td { padding: 1mm 4mm 1mm 0; vertical-align: top; }
.kv-label { font-size: 6pt; font-weight: 700; color: rgba(251,191,36,.75);
    letter-spacing: .15em; text-transform: uppercase; }
.kv-value { font-size: 8.5pt; color: #f5f1e8; margin-top: 0.5mm; }
.client-name { font-size: 11pt; font-weight: 600; color: #f5f1e8; }

/* Tabela equipamentos */
.eq-table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
.eq-table thead th {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    color: #06090F; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; font-size: 6.5pt;
    padding: 2.5mm 3mm; text-align: left;
}
.eq-table thead th.r { text-align: right; }
.eq-table tbody td {
    padding: 2.2mm 3mm; border-bottom: 1px solid rgba(251,191,36,.08);
    font-size: 8pt; color: #f5f1e8;
}
.eq-table tbody td.r { text-align: right; font-variant-numeric: tabular-nums; }
.eq-table tbody td.qty { text-align: center; color: rgba(245,241,232,.7); }

/* Totals block */
.totals { margin-top: 5mm; }
.totals table { float: right; }
.totals td { padding: 1mm 4mm; font-size: 8pt; color: rgba(245,241,232,.8); }
.totals td.v { text-align: right; color: #f5f1e8; font-weight: 600; font-variant-numeric: tabular-nums; }

/* Total box (dourado luxo) */
.total-box {
    clear: both;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%);
    border: 1.5px solid rgba(251,191,36,.85);
    border-radius: 3mm; padding: 5mm 6mm; text-align: center;
    box-shadow: 0 4px 24px rgba(245,158,11,.35);
    color: #06090F; margin-top: 5mm;
}
.total-box .lbl { font-size: 7pt; font-weight: 700;
    letter-spacing: .2em; text-transform: uppercase; opacity: .85; }
.total-box .val {
    font-family: 'Manrope', sans-serif; font-size: 28pt; font-weight: 700;
    line-height: 1; margin-top: 1.5mm;
}

/* Condições */
.conds { margin-top: 6mm; }
.cond-item {
    font-size: 7.8pt; color: rgba(245,241,232,.78);
    margin-bottom: 1.2mm; padding-left: 4mm; position: relative;
    line-height: 1.5;
}
.cond-item::before {
    content: ''; position: absolute; left: 0; top: 3.2px;
    width: 4px; height: 4px; border-radius: 50%; background: #fbbf24;
    box-shadow: 0 0 4px rgba(251,191,36,.6);
}

/* Footer */
.footer {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 3mm 22mm 4mm 22mm; text-align: center;
    border-top: 1px solid rgba(251,191,36,.1);
    background: rgba(6,9,15,0.95);
}
.footer .main { font-size: 7pt; color: rgba(245,241,232,.7); letter-spacing: .05em; }
.footer .sub { font-size: 6pt; color: rgba(245,241,232,.4); margin-top: 0.8mm; letter-spacing: .1em; }

/* Page-specific layout */
.p1-content { padding-top: 1mm; }
.p2-content { padding-top: 3mm; }
"""


def header(page="institucional"):
    return f"""
    <div class="brand-header">
        <img class="brand-logo" src="data:image/png;base64,{logo_b64}" />
    </div>
    """


def page1():
    cards = ""
    rows = [(CRED[0], CRED[1]), (CRED[2], CRED[3])]
    for left, right in rows:
        cards += "<tr>"
        for n, t, d in (left, right):
            cards += f"""
            <td><div class="cred-card">
                <div class="num">{n}</div>
                <div class="ctitle">{t}</div>
                <div class="cdesc">{d}</div>
            </div></td>
            """
        cards += "</tr>"

    return f"""
    <div class="page">
        {header()}
        <div class="p1-content">
            <table class="hero-mosaic">
                <tr>
                    <td class="big" rowspan="2">
                        <img src="data:image/png;base64,{hero_b64}" />
                        <div class="cap">PROJETO 01 · Residencial Premium</div>
                    </td>
                    <td class="sm">
                        <img src="data:image/png;base64,{hero2_b64}" />
                        <div class="cap">PROJETO 02 · Deck &amp; Piscina Praia</div>
                    </td>
                </tr>
                <tr>
                    <td class="sm">
                        <img src="data:image/png;base64,{hero3_b64}" />
                        <div class="cap">PROJETO 03 · Vista Sunset</div>
                    </td>
                </tr>
            </table>

            <div class="sec-sub">Quem sou</div>
            <p class="quem-p">
                Thiago Nicézio Santos. Sócio da <strong>ENG Soluções</strong> — referência nacional em
                ozônio e UV para tratamento de água — e <strong>Presidente da ABLP</strong>
                (Associação Brasileira de Lagos e Piscinas). Atuo há anos na concepção, projeto e execução
                de lagos ornamentais e piscinas praia de alto padrão, com domínio integral do ciclo técnico:
                hidráulica, filtragem, automação e comissionamento.
            </p>

            <table class="cred-grid">{cards}</table>
        </div>

        <div class="footer">
            <div class="main">contato@thiagonicezio.com · (41) 99999-0000 · thiagonicezio.com</div>
            <div class="sub">CONFIDENCIAL · Apresentação Institucional · {CLIENTE['data']}</div>
        </div>
    </div>
    """


def page2():
    difs_html = "<tr>"
    icons = ["01", "02", "03"]
    for (t, d), ic in zip(DIFS, icons):
        difs_html += f"""
        <td><div class="dif-card">
            <div class="icon">{ic}</div>
            <div class="dtitle">{t}</div>
            <div class="ddesc">{d}</div>
        </div></td>
        """
    difs_html += "</tr>"

    renders_html = ""
    labels = [
        ("RENDER 01", "Sala de Máquinas — Topo"),
        ("RENDER 02", "Biofiltro &amp; Casa de Máquinas — Isométrica"),
        ("RENDER 03", "Calha de Transbordo"),
        ("RENDER 04", "Comissionamento &amp; Inspeção"),
    ]
    for i in range(0, 4, 2):
        renders_html += "<tr>"
        for lbl, ttl in labels[i:i+2]:
            renders_html += f"""
            <td><div class="render-ph">
                <div class="lbl">{lbl}</div>
                <div class="ttl">{ttl}</div>
            </div></td>
            """
        renders_html += "</tr>"

    return f"""
    <div class="page">
        {header()}
        <div class="p2-content">
            <table class="stats-bar">
                <tr>
                    <td><div class="stat-num">3</div><div class="stat-lbl">Continentes pesquisados</div></td>
                    <td><div class="stat-num">ABLP</div><div class="stat-lbl">Presidente</div></td>
                    <td><div class="stat-num">ENG</div><div class="stat-lbl">Sócio · Ozônio &amp; UV</div></td>
                    <td><div class="stat-num">Único</div><div class="stat-lbl">Cada projeto sob medida</div></td>
                </tr>
            </table>

            <div class="sec-sub">Tecnologia &amp; Metodologia</div>
            <div class="sec-title">Por que projetos Thiago Nicézio entregam mais</div>

            <table class="dif-grid">{difs_html}</table>

            <div class="sec-sub" style="margin-top: 7mm;">Renders técnicos do projeto</div>
            <table class="renders">{renders_html}</table>
        </div>

        <div class="footer">
            <div class="main">Tecnologia &amp; Diferenciais · UV + Ozônio · Engenharia Hidráulica · Acompanhamento Integral</div>
            <div class="sub">CONFIDENCIAL · {CLIENTE['data']}</div>
        </div>
    </div>
    """


def page3():
    rows = ""
    for desc, qty, unit in PRODUTOS:
        rows += f"""
        <tr>
            <td>{desc}</td>
            <td class="qty">{qty}</td>
            <td class="r">{fmt(unit)}</td>
            <td class="r">{fmt(qty*unit)}</td>
        </tr>
        """

    conds_html = "".join(f'<div class="cond-item">{c}</div>' for c in CONDICOES)

    return f"""
    <div class="page">
        <div class="brand-header">
            <img class="brand-logo brand-logo-sm" src="data:image/png;base64,{logo_b64}" />
        </div>

        <div style="text-align:center; padding-top: 1mm;">
            <div class="orc-title">Orçamento</div>
            <div class="orc-sub">Equipamentos ENG · Tratamento de Água</div>
            <div class="gold-line"></div>
        </div>

        <div class="client-card">
            <div class="client-name">{CLIENTE['nome']}</div>
            <table>
                <tr>
                    <td><div class="kv-label">CNPJ</div><div class="kv-value">{CLIENTE['cnpj']}</div></td>
                    <td><div class="kv-label">Cidade</div><div class="kv-value">{CLIENTE['cidade']}</div></td>
                    <td><div class="kv-label">Telefone</div><div class="kv-value">{CLIENTE['tel']}</div></td>
                </tr>
                <tr>
                    <td><div class="kv-label">Email</div><div class="kv-value">{CLIENTE['email']}</div></td>
                    <td><div class="kv-label">Data</div><div class="kv-value">{CLIENTE['data']}</div></td>
                    <td><div class="kv-label">Vendedor</div><div class="kv-value">{CLIENTE['vendedor']}</div></td>
                </tr>
            </table>
        </div>

        <table class="eq-table">
            <thead>
                <tr>
                    <th style="width:60%">Equipamento</th>
                    <th style="width:8%; text-align:center;">Qtd</th>
                    <th class="r" style="width:16%">Valor Unit.</th>
                    <th class="r" style="width:16%">Total</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>

        <div class="totals">
            <table>
                <tr><td>Subtotal</td><td class="v">{fmt(SUBTOTAL)}</td></tr>
                <tr><td>Desconto</td><td class="v">— —</td></tr>
            </table>
        </div>

        <div class="total-box">
            <div class="lbl">Valor Total</div>
            <div class="val">{fmt(TOTAL)}</div>
        </div>

        <div class="conds">
            <div class="sec-sub" style="margin-bottom: 2mm;">Condições</div>
            {conds_html}
        </div>

        <div class="footer">
            <div class="main">contato@filtrosuvc.com.br · ENG Soluções · Tratamento de água por ozônio &amp; UV</div>
            <div class="sub">Proposta {CLIENTE['data']} · Validade 30 dias · CONFIDENCIAL</div>
        </div>
    </div>
    """


html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><style>{CSS}</style></head>
<body>
{page1()}
{page2()}
{page3()}
</body>
</html>
"""

(ROOT / "output" / "exemplo.html").write_text(html, encoding="utf-8")
HTML(string=html, base_url=str(ROOT)).write_pdf(str(OUT))
print(f"PDF gerado: {OUT}  ({OUT.stat().st_size/1024:.1f} KB)")
