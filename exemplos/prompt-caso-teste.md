# Caso de teste pronto — foto aérea do drone com marcação no Paint

Para testar AGORA no app Gemini (grátis): anexe, nesta ordem, **(1)** a foto limpa do drone, **(2)** a foto marcada (`exemplo-drone-marcacao.jpg`) e **(3)** 1 foto de uma obra sua já executada — e cole o prompt abaixo.

---

## Prompt pronto (PT)

> Você atuará como um motor de renderização fotorrealista (como V-Ray ou Lumion) especializado em paisagismo, lagos ornamentais e piscinas de areia estilo praia.
>
> IMAGEM 1 é a foto real aérea (drone) do local do meu cliente. Ela é a base: o resultado deve ser ESTA MESMA FOTO com o projeto construído.
>
> IMAGEM 2 é a mesma foto com um rascunho desenhado por cima. O desenho é apenas um mapa de POSIÇÃO — ele NÃO deve aparecer no resultado. Legenda do desenho:
> - ÁREA AZUL = espelho d'água de piscina natural estilo praia, água verde-esmeralda cristalina;
> - ÁREA BEGE = praia de areia clara compactada com entrada gradual na água (na face mais próxima da casa);
> - CONTORNO MARROM = borda de pedras naturais e limite exato do projeto — NADA fora deste contorno pode ser alterado.
>
> IMAGEM 3 é uma obra já executada por mim: use como referência FIEL de estilo, materiais, cor de água e acabamento.
>
> Construa: piscina natural de areia estilo praia com bordas de pedras naturais acompanhando o contorno marrom, praia de areia com entrada gradual e paisagismo tropical discreto junto à borda.
>
> PRESERVE EXATAMENTE, SEM NENHUMA ALTERAÇÃO: a casa e o telhado na parte inferior da foto; a cerca viva à direita; todas as árvores existentes (incluindo a árvore florida à esquerda); os quintais e construções vizinhas; os fios elétricos; o céu; o ângulo aéreo do drone, o enquadramento e a proporção da foto; a direção do sol e as sombras.
>
> Resultado: uma única imagem fotorrealista, como uma FOTOGRAFIA REAL de drone do projeto concluído, mesma hora do dia da foto original, alta resolução, sem pessoas, sem textos, sem marca d'água, sem traços de desenho. Não altere a proporção da imagem original.

## Prompt pronto (EN — para Higgsfield ou máxima estabilidade)

> Act as a photorealistic rendering engine (like V-Ray or Lumion) specialized in landscaping, ornamental ponds and beach-style sand pools.
>
> IMAGE 1 is the real aerial (drone) photo of my client's site. It is the base: the output must be THIS SAME PHOTO with the project built.
>
> IMAGE 2 is the same photo with a rough sketch drawn on top. The sketch is only a POSITION map — it must NOT appear in the result. Sketch legend:
> - BLUE AREA = water surface of a beach-style natural sand-bottom pool, crystal-clear emerald green water;
> - BEIGE AREA = light compacted sand beach with gradual zero-entry slope into the water (on the side closest to the house);
> - BROWN OUTLINE = natural stone border and the exact project boundary — NOTHING outside this outline may change.
>
> IMAGE 3 is a project I have actually built: use it as FAITHFUL reference for style, materials, water color and finish.
>
> Build: a beach-style natural sand pool with natural stone edges following the brown outline, a gradual-entry sand beach and discreet tropical planting along the border.
>
> PRESERVE EXACTLY, WITH NO CHANGES: the house and roof at the bottom of the photo; the hedge on the right; all existing trees (including the flowering tree on the left); the neighboring yards and buildings; the power lines; the sky; the aerial drone angle, framing and aspect ratio; the sun direction and shadows.
>
> Output: one photorealistic image, like a REAL DRONE PHOTOGRAPH of the finished project, same time of day as the original photo, high resolution, no people, no text, no watermark, no sketch lines. Do not change the aspect ratio of the input image.

---

## Depois da primeira geração

Compare lado a lado com a foto original (casa, cerca viva, árvores). Ajuste com UM pedido por vez, por exemplo:

- *"Mantenha esta imagem exata, mas aumente a faixa de praia em ~1 metro para dentro da água. Não mude mais nada."*
- *"Mantenha esta imagem exata, mas restaure a cerca viva à direita exatamente como na primeira foto. Não mude mais nada."*

Se a qualidade cair depois de 3-5 gerações: abra um chat novo e recomece da foto original.
