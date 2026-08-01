# Engenharia de prompts para visualização fotorrealista de lagos ornamentais, piscinas de areia e paisagismo a partir de foto real

## 1. Contexto de ferramentas (fatos verificados, jul-ago/2026)

- **ChatGPT (OpenAI)**: o modelo de imagem (gpt-image / "4o Image Generation") aceita foto como entrada e edita por instrução de texto. Plano gratuito: ~2–3 imagens por janela de 24h; **Plus (US$ 20/mês)**: ~40–50 imagens por janela de 3h (a OpenAI ajusta esses limites com a demanda — informação volátil, confirme no app). Via API, gpt-image-1 em 1024x1024 custa US$ 0,011 (low), US$ 0,042 (medium) e US$ 0,167 (high) por imagem.
- **Limitação crítica do ChatGPT**: a "máscara" de inpainting é apenas orientativa. A documentação da OpenAI afirma: *"Masking with GPT Image is entirely prompt-based. The model uses the mask as guidance, but may not follow its exact shape with complete precision."* Relatos no fórum oficial confirmam que o modelo **recria a imagem inteira** (soft mask), não substitui pixels só na área marcada, como o DALL·E 2 fazia. Consequência prática: casa, muro e piso podem sofrer micro-alterações mesmo quando você pede para preservar — por isso o prompt de preservação precisa ser explícito e repetido a cada iteração.
- **Higgsfield**: planos por créditos ~US$ 15/mês (Starter), US$ 39 (Plus) e US$ 99 (Ultra), cobrados anualmente (valores de 2026, sujeitos a mudança). O **Higgsfield AI Image Editor** é o produto certo para este caso: *"describe a change and it fills, expands, or replaces exactly what you mean"*, preservando as áreas não tocadas, com **suporte a imagens de referência** (*"Reference images guide the look"*) e acesso a 15+ modelos por edição — incluindo **Nano Banana Pro** (inpainting com pincel, troca de objetos — o melhor para preservar a foto), FLUX.2 Pro, Seedream, GPT Image e Soul. Exporta até 4K. Para edição fiel sobre foto, dentro do Higgsfield escolha Nano Banana Pro ou FLUX.2; o Soul é focado em estética editorial/pessoas, menos em fidelidade estrutural.

## 2. Estrutura ideal do prompt (anatomia em 7 camadas)

Guias de archviz (ArchiGPT) recomendam camadas nesta ordem — nem todo prompt precisa das sete:

1. **Sujeito/cena** — o que construir e onde na foto ("piscina natural com praia de areia na área do gramado central");
2. **Preservação** — o que NÃO mudar (casa, muros, vizinhança, céu, perspectiva);
3. **Materiais** — seja específico: "borda de pedra São Tomé", "deck de cumaru", "areia branca compactada", "água turquesa translúcida";
4. **Vegetação** — nomeie espécies (palmeiras, filodendro Xanadu, helicônias);
5. **Iluminação/hora** — "golden hour", "luz difusa de dia nublado", e principalmente **"combine com a direção do sol e as sombras da foto original"**;
6. **Câmera** — "eye-level perspective, 35mm lens" (padrão arquitetônico) ou "wide-angle 24mm";
7. **Qualidade** — "photorealistic architectural render, high resolution" (em PT: "render arquitetônico ultra-realista").

O guia oficial do Google para Nano Banana reforça: especifique iluminação ("golden hour backlighting creating long shadows"), lente ("wide-angle lens", "f/1.8") e materialidade com precisão — em vez de "pedras", "matacões de granito cobertos de musgo".

## 3. Como instruir a PRESERVAR a foto original

Template validado (guia Ovacen/Nano Banana, funciona também no ChatGPT e no Higgsfield):

> *"Using the provided image, change only the [elemento] to [novo elemento]. Keep everything else exactly the same, preserving original style, lighting, and composition."*

Regras práticas documentadas:
- **Liste nominalmente** o que preservar ("the house facade, the white boundary wall, the neighbor's roof, the sky") — o guia do Google diz: *"Be explicit about what to keep exactly the same"*;
- Delimite a área de mudança por referência espacial ("only the lawn area in the center-right of the photo");
- Peça coerência de luz: "match the sun direction and existing shadows of the original photo" — essencial para o resultado parecer foto e não colagem;
- No ChatGPT, se algo "escorregar" (muro mudou de cor), não reescreva do zero: responda "keep this exact image, but restore the wall to its original color" na mesma conversa.

## 4. Referenciando imagens de estilo anexadas

A API/ChatGPT aceita múltiplas imagens: *"Pass multiple images to combine subjects, styles, or references into one output."* Padrão que funciona (numere as imagens no texto):

> *"Image 1 is the real site photo of my client's backyard. Image 2 is a style reference. Recreate Image 1 adding a pool in the exact style, materials and water color of Image 2, placed only in the lawn area, keeping Image 1's house, walls, perspective and lighting unchanged."*

Em PT: "A imagem 1 é a foto real do local. A imagem 2 é referência de estilo. Recrie a imagem 1 adicionando a piscina no estilo/materiais da imagem 2, apenas na área do gramado, mantendo casa, muros, perspectiva e iluminação da imagem 1." Use no máximo 1–2 referências de estilo por vez; mais que isso dilui a fidelidade.

## 5. Prompts negativos

ChatGPT/Nano Banana não têm campo formal de negative prompt — escreva as exclusões no próprio texto ("no people, no text, no watermark"). Em ferramentas que têm o campo (Stable Diffusion, alguns modelos no Higgsfield/Segmind), o template de archviz recomendado é:

> *"blurry, low quality, deformed, distorted perspective, warped lines, cartoon, anime, illustration, text, watermark, logo, oversaturated, people, vehicles, cluttered"*

## 6. Workflow numerado recomendado

1. Fotografe o local à altura dos olhos, luz uniforme, sem obstruções (recomendação da Higgsfield: *"clean, well-lit image with minimal occlusions"*);
2. Anexe foto do local + 1 referência de estilo (do seu portfólio);
3. Prompt inicial com as 7 camadas + bloco de preservação;
4. Avalie: perspectiva batendo? Casa intacta? Sombras coerentes?
5. Itere na MESMA conversa com correções pontuais ("keep this exact image, but...") — o guia do Google chama de refinamento conversacional;
6. Gere 2–3 variações (dia/entardecer/noite com iluminação de jardim) para apresentar ao cliente;
7. No Higgsfield, use o pincel do Nano Banana Pro para retocar só a área que falhou e exporte em 4K.

## 7. Exemplos concretos de prompts

**(a) Piscina de areia / estilo praia** — EN: *"Using the provided photo of my client's backyard, transform only the central lawn area into a beach-style sand pool: turquoise translucent water, gradual zero-entry slope, white compacted sand deck, natural stone accents on the far edge and tropical planting (coconut palms, Philodendron Xanadu, bird of paradise). Keep the house facade, boundary walls, gate and neighboring buildings exactly the same, preserving original style, lighting and composition. Match the sun direction and shadows of the original photo. Eye-level perspective, 35mm lens, photorealistic architectural render, high resolution."* — PT: "Na foto enviada, transforme apenas o gramado central em piscina de areia estilo praia: água turquesa translúcida, entrada em declive suave (praia), deck de areia branca compactada, pedras naturais no fundo e vegetação tropical (coqueiros, filodendro Xanadu, estrelítzia). Mantenha fachada, muros, portão e vizinhança exatamente iguais, preservando estilo, iluminação e composição originais. Combine com a direção do sol e sombras da foto. Perspectiva à altura dos olhos, lente 35mm, render fotorrealista em alta resolução."

**(b) Lago ornamental com carpas** — EN: *"Edit this photo: replace the paved area in the foreground with an ornamental koi pond with dark natural stone edges, a small rock waterfall on the right, water lilies and papyrus, crystal-clear water showing orange and white koi, and a cumaru wood deck crossing the pond. Keep everything else exactly the same — house, walls, trees and sky. Golden hour lighting consistent with the photo, photorealistic."* — PT: "...substitua o piso em primeiro plano por um lago ornamental de carpas com bordas de pedra natural escura, pequena cascata de rochas à direita, ninfeias e papiros, água cristalina mostrando carpas laranja e brancas, e deck de cumaru atravessando o lago. Mantenha todo o resto exatamente igual..."

**(c) Piscina natural/biopiscina** — EN: *"Image 1 is the site photo; Image 2 is my reference of a natural swimming pond. Add to Image 1 a natural pool in the style of Image 2: organic curved edges mimicking a lagoon, regeneration zone with aquatic plants, large granite boulders, small waterfall. Place it in the open grass area only; do not alter the house, fence or terrain slope of Image 1. Soft overcast light matching the photo."*

**(d) Paisagismo tropical brasileiro** — EN: *"Add modern tropical Brazilian landscaping along the existing wall in this photo: areca palms, Alpinia, Heliconia, clusia hedge, white gravel path with corten steel edging and warm garden spotlights. Keep the wall material, floor and everything else unchanged, preserving the original lighting and composition."*

**(e) Variação de iluminação (Techtudo, verbatim PT)**: *"Mantenha a arquitetura da imagem, mas altere a iluminação para pôr do sol, com luz dourada e sombras suaves."*

**(f) Upgrade de qualidade (Techtudo, verbatim PT)**: *"Melhore esta imagem para um render arquitetônico profissional, com iluminação equilibrada, texturas realistas e alta definição."*

**(g) Correção iterativa** — EN: *"Keep this exact image, but make the water slightly more turquoise, reduce the waterfall height by half and remove the two boulders on the left. Do not change anything else."* — PT: "Mantenha esta imagem exata, mas deixe a água um pouco mais turquesa, reduza a cascata pela metade e remova as duas pedras à esquerda. Não mude mais nada."

**(h) Cena noturna comercial** — EN: *"Same exact image, now at night: underwater warm LED lights in the pool, path lights along the garden, blue hour sky with interior house lights on. Preserve all geometry, materials and framing."*

**Nota de incerteza**: preços e limites (ChatGPT, Higgsfield) mudam com frequência e alguns vêm de blogs de terceiros, não de tabelas oficiais; os exemplos (a)–(d), (g), (h) foram construídos aplicando os templates documentados nas fontes (não copiados prontos), enquanto (e), (f) e o template "change only the X... keep everything else exactly the same" são citações verbatim.

## FONTES
- [Ultimate prompting guide for Nano Banana — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Image generation — OpenAI API Docs (gpt-image, edits, masks, preços)](https://developers.openai.com/api/docs/guides/image-generation)
- [4o Image Generation — Prompt Engineering Guide](https://www.promptingguide.ai/guides/4o-image-generation)
- [Inpainting com máscara no gpt-image-1 recria a imagem inteira — OpenAI Developer Community](https://community.openai.com/t/image-editing-inpainting-with-a-mask-for-gpt-image-1-replaces-the-entire-image/1244275)
- [75+ Architectural Rendering Prompts: Copy-Paste Templates — ArchiGPT](https://www.archigpt.ai/blogs/architectural-rendering-prompts)
- [Google Nano Banana para arquitetura/decoração (prompts verbatim) — Ovacen](https://ovacen.com/en/google-nano-banana-architecture-and-decoration/)
- [Higgsfield AI Image Editor (modelos, referências, workflow)](https://higgsfield.ai/ai-image-editor)
- [Higgsfield AI Pricing 2026 — Imagine.art](https://www.imagine.art/blogs/higgsfield-ai-pricing)
- [Higgsfield Pricing 2026: Plans From $15/mo — Scopeful](https://www.scopeful.org/tools/higgsfield)
- [Higgsfield Soul Image To Image — WaveSpeedAI Blog](https://wavespeed.ai/blog/posts/introducing-higgsfield-soul-image-to-image-on-wavespeedai/)
- [AI Pool Design: Visualize a Backyard Pool From a Photo — GenRoom](https://genroom.io/blog/ai-pool-design)
- [AI Landscape Design: Yard Photo to Buildable Plan — AI Home Design](https://aihomedesign.com/blog/real-estate/ai-backyard-design/)
- [Prompts para renderizar projetos de arquitetura no ChatGPT — TechTudo](https://www.techtudo.com.br/listas/2026/04/prompts-para-renderizar-imagens-e-criar-projetos-de-arquitetura-no-chatgpt-edsoftwares.ghtml)
- [ChatGPT Image Limit Explained: Every Plan in 2026 — GPT Image](https://gptimg.co/blog/chatgpt-image-limits)
- [AI Landscape Design Generator — ArchiGPT](https://www.archigpt.ai/blogs/ai-landscape-design-generator)
- [15 Prompts That Improve Architectural Render Realism — Visualizee.ai](https://visualizee.ai/blog/15-prompts-improve-architectural-render-realism)
