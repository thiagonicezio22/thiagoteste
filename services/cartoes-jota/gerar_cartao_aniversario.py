#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cartao de aniversario Jota Expedicoes — identidade da Proposta 2026 (OffRoad Azul)."""
from PIL import Image, ImageDraw, ImageFont

NAVY = (13, 23, 38)        # fundo escuro da capa
NAVY2 = (18, 32, 52)       # painel
AZUL = (63, 132, 213)      # azul OffRoad
BRANCO = (240, 244, 249)
CINZA = (150, 165, 185)
PRETO = (10, 14, 20)

W = H = 1200
img = Image.new('RGB', (W, H), NAVY)
d = ImageDraw.Draw(img)

def fonte(path, size):
    return ImageFont.truetype(path, size)

SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
MONO_B = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'

# ---- faixa diagonal (hazard) topo e rodape, igual ao rodape da proposta ----
def hazard(y0, altura):
    faixa = Image.new('RGB', (W + 80, altura), PRETO)
    fd = ImageDraw.Draw(faixa)
    passo = 46
    for x in range(-altura, W + 120, passo):
        fd.polygon([(x, altura), (x + altura, 0), (x + altura + passo // 2, 0), (x + passo // 2, altura)], fill=AZUL)
    img.paste(faixa.crop((40, 0, W + 40, altura)), (0, y0))

hazard(0, 26)
hazard(H - 26, 26)

# ---- linha de coordenadas (detalhe da capa) ----
f_coord = fonte(MONO, 25)
coord = "S 20°14' · W 46°31' — MAIS UMA VOLTA AO SOL"
wc = d.textlength(coord, font=f_coord)
d.text((W - wc - 56, 52), coord, font=f_coord, fill=CINZA)

# ---- logo hexagonal com alpha ----
logo_rgb = Image.open('img1-002.png').convert('RGB')
logo_mask = Image.open('img1-003.png').convert('L')
logo = logo_rgb.copy(); logo.putalpha(logo_mask)
logo = logo.resize((180, 177))
img.paste(logo, (60, 108), logo)

# cabecalho ao lado do logo
f_head = fonte(MONO_B, 30)
d.text((272, 150), "J O T A   E X P E D I Ç Õ E S", font=f_head, fill=AZUL)
f_sub = fonte(MONO, 23)
d.text((272, 196), "PASSEIOS E EXPEDIÇÕES 4X4 · DESDE 2021", font=f_sub, fill=CINZA)

# ---- titulo grande no estilo da capa (branco + azul), ajustado pra caber ----
tam = 148
while True:
    f_tit = fonte(SANS, tam)
    if d.textlength("ANIVERSÁRIO!", font=f_tit) <= W - 150: break
    tam -= 4
d.text((72, 340), "FELIZ", font=f_tit, fill=BRANCO)
d.text((72, 340 + tam + 18), "ANIVERSÁRIO!", font=f_tit, fill=AZUL)

# ---- carimbo tracejado (estilo TEMPORADA 2026) ----
bx, by, bw, bh = 72, 700, 560, 78
for i in range(0, bw, 18):
    d.line([(bx + i, by), (bx + min(i + 10, bw), by)], fill=AZUL, width=4)
    d.line([(bx + i, by + bh), (bx + min(i + 10, bw), by + bh)], fill=AZUL, width=4)
for i in range(0, bh, 18):
    d.line([(bx, by + i), (bx, by + min(i + 10, bh)), ], fill=AZUL, width=4)
    d.line([(bx + bw, by + i), (bx + bw, by + min(i + 10, bh))], fill=AZUL, width=4)
f_car = fonte(MONO_B, 40)
d.text((bx + 38, by + 18), "KM +1 · NOVA JORNADA", font=f_car, fill=AZUL)

# ---- mensagem ----
f_msg = fonte(SANS, 40)
d.text((72, 850), "Que o novo ciclo tenha estrada boa,", font=f_msg, fill=BRANCO)
d.text((72, 906), "poeira, lama e horizontes que só", font=f_msg, fill=BRANCO)
d.text((72, 962), "o 4x4 alcança.", font=f_msg, fill=BRANCO)

# ---- assinatura ----
f_ass = fonte(MONO_B, 30)
ass = "— EQUIPE JOTA EXPEDIÇÕES OFF-ROAD"
d.text((72, 1075), ass, font=f_ass, fill=AZUL)

img.save('cartao-aniversario-jota.png', optimize=True)
print('OK cartao-aniversario-jota.png', img.size)
