#!/usr/bin/env python3
"""Gera o render do projeto sobre a foto do cliente via API do Gemini (Nano Banana Pro).

Uso:
  export GEMINI_API_KEY="sua-chave"   # criar em https://aistudio.google.com/apikey (exige billing)
  pip install google-genai pillow

  python gerar_render.py \
      --foto quintal.jpg \
      --rascunho quintal-marcado.jpg \
      --ref obra1.jpg --ref obra2.jpg \
      --projeto "piscina natural de areia estilo praia" \
      --medidas "9 x 6 m" \
      --agua "verde-esmeralda cristalina" \
      --detalhes "cascata baixa de pedra à esquerda, deck de cumaru na borda leste" \
      --preservar "a churrasqueira, a cerca viva à direita" \
      --aereo            # se a foto for de drone
      --resolucao 2K     # 1K | 2K | 4K (4K para impressão da proposta)

Saída: render-<foto>-<n>.png no diretório atual.
Custo aproximado (ago/2026): US$ 0,134/imagem em 1K-2K e US$ 0,24 em 4K — conferir
em https://ai.google.dev/gemini-api/docs/pricing. O modelo devolve a imagem na
mesma proporção da foto de entrada quando o aspect ratio não é fixado.
"""

import argparse
import os
import pathlib
import sys

MODELO = "gemini-3-pro-image"  # Nano Banana Pro; rascunhos baratos: gemini-3.1-flash-image

LEGENDA_PADRAO = [
    "ÁREA AZUL = espelho d'água",
    "ÁREA BEGE = praia de areia clara compactada com entrada gradual na água",
    "CONTORNO MARROM = borda de pedras naturais e limite exato do projeto — NADA fora dele pode ser alterado",
    "ÁREA VERDE = vegetação e paisagismo novos",
    "ÁREA VERMELHA = cascata / queda d'água",
    "ÁREA PRETA = deck de madeira",
]

PRESERVAR_PADRAO = (
    "a casa, telhado, janelas e portas; os muros e cercas; o portão; o piso existente "
    "fora da área do projeto; as construções vizinhas; as árvores existentes fora da "
    "área do projeto; o céu; a direção do sol e as sombras"
)


def montar_prompt(args, n_refs):
    partes = [
        "Você atuará como um motor de renderização fotorrealista (como V-Ray ou Lumion) "
        "especializado em paisagismo, lagos ornamentais e piscinas de areia estilo praia.",
        f"\nIMAGEM 1 é a foto real {'aérea (drone) ' if args.aereo else ''}do local do meu cliente. "
        "Ela é a base: o resultado deve ser ESTA MESMA FOTO com o projeto construído.",
    ]
    idx = 2
    if args.rascunho:
        partes.append(
            f"\nIMAGEM {idx} é a mesma foto com um rascunho desenhado por cima. O desenho é apenas "
            "um mapa de POSIÇÃO — ele NÃO deve aparecer no resultado. Legenda do desenho:\n- "
            + ";\n- ".join(LEGENDA_PADRAO) + "."
        )
        idx += 1
    if n_refs:
        fim = idx + n_refs - 1
        rotulo = f"IMAGENS {idx} a {fim} são obras já executadas" if n_refs > 1 else f"IMAGEM {idx} é uma obra já executada"
        partes.append(
            f"\n{rotulo} por mim: use como referência FIEL de estilo, materiais, cor de água e acabamento."
        )
    desc = f"\nConstrua: {args.projeto}"
    if args.medidas:
        desc += f" de {args.medidas}"
    desc += f", com água {args.agua}"
    if args.detalhes:
        desc += f". {args.detalhes}"
    partes.append(desc + ".")
    if args.medidas:
        partes.append(f"As medidas reais da área são {args.medidas}; respeite a escala usando o muro e a casa como referência.")
    preservar = PRESERVAR_PADRAO
    if args.preservar:
        preservar += f"; {args.preservar}"
    preservar += (
        "; o ângulo aéreo do drone, o enquadramento e a proporção da foto"
        if args.aereo
        else "; o ângulo e a altura da câmera, o enquadramento e a proporção da foto"
    )
    partes.append(f"\nPRESERVE EXATAMENTE, SEM NENHUMA ALTERAÇÃO: {preservar}.")
    partes.append(
        "\nResultado: uma única imagem fotorrealista, como uma FOTOGRAFIA REAL do projeto concluído, "
        "mesma hora do dia da foto original, alta resolução, sem pessoas, sem textos, sem marca "
        "d'água, sem traços de desenho. Não altere a proporção da imagem original."
    )
    return "\n".join(partes)


def main():
    ap = argparse.ArgumentParser(description="Foto do local -> render do projeto (Gemini/Nano Banana Pro)")
    ap.add_argument("--foto", required=True, help="foto limpa do local")
    ap.add_argument("--rascunho", help="mesma foto com o rascunho desenhado por cima")
    ap.add_argument("--ref", action="append", default=[], help="foto de obra do portfólio (repetir até 3x)")
    ap.add_argument("--projeto", required=True)
    ap.add_argument("--medidas", default="")
    ap.add_argument("--agua", default="verde-esmeralda cristalina")
    ap.add_argument("--detalhes", default="")
    ap.add_argument("--preservar", default="", help="itens extras a preservar, separados por ';'")
    ap.add_argument("--aereo", action="store_true", help="foto aérea de drone")
    ap.add_argument("--resolucao", default="2K", choices=["1K", "2K", "4K"])
    ap.add_argument("--variacoes", type=int, default=2, help="quantas imagens gerar")
    args = ap.parse_args()

    if not os.environ.get("GEMINI_API_KEY"):
        sys.exit("Defina GEMINI_API_KEY (crie em https://aistudio.google.com/apikey).")

    try:
        from google import genai
        from google.genai import types
        from PIL import Image
    except ImportError:
        sys.exit("Instale as dependências: pip install google-genai pillow")

    prompt = montar_prompt(args, len(args.ref))
    print("--- PROMPT ---\n" + prompt + "\n--------------")

    imagens = [Image.open(args.foto)]
    if args.rascunho:
        imagens.append(Image.open(args.rascunho))
    imagens += [Image.open(r) for r in args.ref[:3]]

    client = genai.Client()
    base = pathlib.Path(args.foto).stem
    geradas = 0
    for i in range(1, args.variacoes + 1):
        resp = client.models.generate_content(
            model=MODELO,
            contents=imagens + [prompt],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(image_size=args.resolucao),
            ),
        )
        for parte in resp.candidates[0].content.parts:
            if getattr(parte, "inline_data", None):
                nome = f"render-{base}-{i}.png"
                with open(nome, "wb") as f:
                    f.write(parte.inline_data.data)
                print(f"OK: {nome}")
                geradas += 1
    if not geradas:
        sys.exit("Nenhuma imagem retornada — verifique a chave, o billing e o nome do modelo (MODELO).")


if __name__ == "__main__":
    main()
