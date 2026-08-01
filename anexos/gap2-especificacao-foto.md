# LACUNA: Qual é a especificação ideal da FOTO de entrada para maximizar o realismo da edição — ângulo e altura de câmera, distância do terreno, horário/iluminação, resolução mínima, foto única vs. múltiplos ângulos — e o que fazer quando o cliente envia foto ruim (corrigir antes? refotografar? usar imagem de satélite como no case Arrowhead)?

# Especificação ideal da foto de entrada para edição realista com IA (lagos ornamentais e piscinas de areia)

## 1. Por que a foto de entrada é o fator nº 1

Modelos como o GPT Image (ChatGPT), o Nano Banana (Gemini) e o Higgsfield Soul Inpaint **não editam pixels como o Photoshop — eles "repintam" a cena inteira a partir da foto**. Isso significa que tudo que estiver ruim na foto (blur, sombra dura, ângulo distorcido) é herdado ou amplificado no resultado. Guias de ferramentas do setor (GenRoom, Curb Appeal AI, ArchiGPT) convergem no mesmo ponto: *"Higher-resolution inputs produce better scene analysis and more accurate renders"* e *"a blurry photo is the number one enemy of a good AI design"*.

## 2. Especificação recomendada da foto (checklist verificado)

**Ângulo e altura da câmera**
- **Nível dos olhos (1,5–1,7 m) ou levemente elevado** (ex.: janela do 2º andar/varanda). O guia da GenRoom é explícito: *"Eye-level or slightly elevated (second-floor window) angles produce the most usable results"* — e recomenda evitar ângulos extremos (muito baixo, muito inclinado, "holandês"). O ângulo levemente elevado é especialmente bom para lagos/piscinas porque mostra o **plano do chão**, onde o projeto acontece.
- Foto **frontal/estável ("straight-on")**, câmera nivelada com o horizonte, sem inclinar o celular para cima ou para baixo (isso distorce muros e fachada, e a IA reproduz a distorção).

**Distância e enquadramento**
- Posicionar-se em **um canto ou borda do terreno** e enquadrar o espaço todo em **um único disparo** — a área do futuro lago/piscina + os limites reais (muros, cercas, fachada da casa). GenRoom: *"Make sure fences, walls, the house exterior, and any permanent structures are visible"*. Esses elementos fixos são o que "ancora" o realismo, já que o objetivo do Thiago é manter casa e entorno reais.
- **Incluir o céu/linha do horizonte** — ajuda o modelo a entender profundidade e perspectiva.
- **Evitar panorâmicas costuradas e fotos cortadas** — *"Stitched panoramas and cropped photos often confuse the scene analysis"*. Se o terreno não cabe, afastar-se mais ou usar o ângulo elevado, não o modo panorama.
- Usar a lente principal (1x) do celular; a ultra-wide (0.5x) distorce bordas e a IA copia a distorção.

**Orientação e proporção**
- **Horizontal (paisagem), 4:3 ou 16:9 / 3:2.** Isso não é só estética: o GPT Image gera apenas em **1024×1024, 1536×1024 (paisagem) ou 1024×1536** — uma foto vertical de terreno seria cortada ou reenquadrada. No Nano Banana, a doc oficial do Google permite fixar proporção de saída (16:9, 3:2 etc.), então entrar já em horizontal evita reinvenção de bordas.

**Iluminação e horário**
- **Luz natural, entre ~10h e 16h**, idealmente **dia nublado ou sombra aberta** — *"Even lighting without harsh shadows gives the AI the clearest canvas"* (GenRoom). Sombras duras do meio-dia "queimam" áreas do terreno e o modelo inventa o que está na sombra.
- Evitar: contraluz forte, foto noturna/entardecer, HDR agressivo e filtros de Instagram (o modelo interpreta o filtro como "estilo" e replica).
- Nota prática: golden hour é linda para a foto FINAL de portfólio, mas para a foto de ENTRADA a luz difusa e neutra é melhor — dá liberdade para o prompt definir a iluminação do render.

**Resolução mínima**
- **Mínimo absoluto: ~1 megapixel (≥1000×1000 px)** segundo o guia GenRoom; **ideal: foto nativa de celular moderno (12 MP)**, enviada como **arquivo/documento e não como foto comprimida do WhatsApp** (a compressão do WhatsApp reduz para ~1600 px e adiciona artefatos — este é o problema mais comum com foto de cliente no Brasil). Importante: como o GPT Image devolve no máx. ~1536 px e o Nano Banana padrão devolve 1K (o Nano Banana Pro chega a 2K/4K nativos), resolução gigante de entrada não vira resolução de saída — mas melhora a análise da cena.

**Limpeza da cena**
- Tirar do quadro lixeiras, mangueiras, entulho, brinquedos, carros. O modelo pode manter esses objetos no render final ou substituí-los de forma estranha.

**Foto única vs. múltiplos ângulos**
- **Cada render usa UMA foto "hero"** — os modelos de edição trabalham sobre um único quadro por vez.
- Porém, a prática das empresas de design remoto (Yardzen, referência do setor nos EUA) é **coletar 3–5 fotos de ângulos diferentes + um vídeo em panorâmica lenta** cobrindo o terreno inteiro (*"include your entire yard – no blank spots"*), com fotos extras de áreas críticas. Para **terrenos em declive** (comum em lago ornamental), a Yardzen recomenda uma foto **perpendicular ao declive, com muro ou cerca ao fundo**, para deixar a inclinação legível.
- Uso prático para o Thiago: escolher a melhor foto como hero para o render principal e gerar 1–2 renders extras de outros ângulos; as demais fotos servem de contexto (o Nano Banana Pro aceita **até 8–14 imagens de referência** numa mesma geração — foto do local + referências de estilo de praia/lago juntas; no GPT Image via API, a 1ª imagem da lista é a que preserva mais detalhe).
- **Medidas aproximadas** (largura do quintal, distância muro-casa) devem ser anotadas e citadas no prompt — Curb Appeal AI: medir *"widths and distances roughly… helps scale the visualization"*. Isso evita o erro clássico de a IA gerar uma piscina fora de escala.

## 3. O que fazer quando o cliente manda foto ruim (árvore de decisão)

**a) Defeito corrigível → corrigir antes de editar (5 min):**
- *Baixa resolução/compressão do WhatsApp*: upscale com **Upscayl** (gratuito, open source, Real-ESRGAN) ou **Let's Enhance / Topaz Photo AI** (pagos). Ressalva dos próprios testes comparativos: *"best results come from moderate upscaling of reasonably good sources"* — upscale não salva foto realmente ruim.
- *Escura ou com contraluz*: levantar sombras no Snapseed/Lightroom Mobile (grátis) antes de subir.
- *Levemente torta*: nivelar horizonte e corrigir perspectiva vertical no próprio editor do celular.

**b) Defeito estrutural → refotografar (não tentar salvar):** terreno cortado no enquadramento, ângulo extremo, blur de movimento, panorâmica distorcida, foto noturna, foto vertical que amputa os limites do lote. A solução profissional é enviar ao cliente um **mini-guia de captura** (mensagem padrão de WhatsApp): "1) meio da manhã ou meio da tarde, de preferência dia nublado; 2) celular na horizontal, na altura dos olhos, câmera 1x; 3) fique num canto do terreno e pegue o espaço todo, incluindo muro, casa e um pouco de céu; 4) tire 4 fotos: uma de cada canto olhando para o centro; 5) envie como *documento* no WhatsApp, não como foto". Isso replica o processo da Yardzen e custa zero.

**c) Fallback com imagem de satélite (Google Earth/Maps):** sobre o "case Arrowhead" citado — **não encontrei registro público verificável** de um case com esse nome usando satélite; trate essa referência como não confirmada. Mas a técnica em si é real e documentada: a Rendair mantém FAQ específica sobre renderizar a partir de screenshot do Google Maps, e ferramentas como SimplyScapes dizem explicitamente que você pode *"take a photo on-site or grab one from Google Earth"*. **Limitação honesta**: satélite/vista 3D do Google Earth serve para render de **masterplan/vista aérea** (layout do lago no lote, aprovação de conceito) — a resolução no Brasil raramente permite fotorrealismo, e não substitui a foto no nível dos olhos para o render "de capa". Workflow recomendado: satélite → render aéreo conceitual para fechar o layout → foto real do local (tirada pelo Thiago na visita técnica, seguindo a spec acima) → render fotorrealista final. A ArchiGPT também admite que *"steep terrain, multi-level retaining walls, and complex drainage scenarios still challenge AI models"* — em terreno complexo, a visita com foto própria é obrigatória.

## 4. Amarração com a ferramenta de edição

- **ChatGPT/GPT Image**: usar prompt com cláusula de preservação explícita e repetida a cada iteração: *"Mantenha exatamente a casa, o muro, o portão e a vegetação de fundo; altere apenas a área gramada central, substituindo-a por..."*. Na API, existe o parâmetro **`input_fidelity="high"`** no endpoint de edição (custo extra de ~4.096 tokens de entrada em imagem quadrada / 6.144 em não quadrada), criado exatamente para preservar detalhes do original.
- **Nano Banana (alternativa forte)**: a doc do Google recomenda o template *"Using the provided image, change only the [elemento] to [novo elemento]. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition."*
- **Higgsfield Soul Inpaint**: aceita upload de fotos reais e edição por máscara pintada — a área fora da máscara fica intocada, o que dá a maior garantia mecânica de preservar casa/muro; a foto de entrada precisa das mesmas qualidades acima porque o trecho gerado precisa casar com a luz e a perspectiva do restante.

**Resumo em uma linha**: foto horizontal 4:3/3:2, nível dos olhos ou levemente elevada, de um canto do terreno, dia claro-difuso entre 10h–16h, ≥12 MP enviada sem compressão, mostrando muros + casa + chão + céu, cena limpa; 4 ângulos + medidas; foto ruim se corrige só quando o defeito é de exposição/resolução — enquadramento errado se refotografa; satélite é fallback de layout, não de render final.

## FONTES
- [GenRoom — AI Backyard Design: Transform Your Yard From a Photo (guia de foto de entrada)](https://genroom.io/blog/ai-backyard-design-from-photo)
- [Yardzen — How to Successfully Work with An Online Landscape Designer (instruções de fotos/vídeo do quintal)](https://yardzen.com/yzblog/online-landscape-designer)
- [Curb Appeal AI — AI Landscape Design Before And After (foto straight-on, medidas, pontos de referência)](https://www.curbappealai.co/home-improvement/ai-landscape-design-before-and-after)
- [OpenAI Cookbook — Generate images with high input fidelity (input_fidelity='high' no gpt-image-1)](https://developers.openai.com/cookbook/examples/generate_images_with_high_input_fidelity)
- [OpenAI API Reference — Create image edit (tamanhos suportados 1024x1024/1536x1024/1024x1536)](https://developers.openai.com/api/reference/resources/images/methods/edit)
- [Google — Gemini API docs: Nano Banana image generation (edição, proporções, 1K/2K/4K, imagens de referência, prompt de preservação)](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google DeepMind — Gemini 3 Pro Image / Nano Banana Pro (até 8 referências, 2K/4K)](https://deepmind.google/models/gemini-image/pro/)
- [Higgsfield — SOUL Inpaint: Editing with AI Realism (edição por máscara em fotos reais)](https://higgsfield.ai/blog/Higgsfield-SOUL-Inpaint-Editing-with-AI-Realism)
- [Rendair AI — Can I render using a Google Maps screenshot? (FAQ sobre render a partir de satélite)](https://rendair.ai/faq/can-i-render-using-a-google-maps-screenshot)
- [Rendair AI — GPT Image 1 for Landscape Designers](https://rendair.ai/blog/models-gpt-image-1-for-landspace-designers)
- [SimplyScapes — Landscape Design Software (foto no local ou do Google Earth)](https://www.simplyscapes.com/)
- [ArchiGPT — AI Landscape Design Generator (requisitos de imagem, segmentação de cena, limitações em terreno íngreme)](https://www.archigpt.ai/blogs/ai-landscape-design-generator)
- [Sammapix — Topaz Gigapixel AI: Pricing + 7 Free Alternatives Tested (Upscayl/Real-ESRGAN para melhorar foto ruim)](https://www.sammapix.com/blog/best-free-topaz-gigapixel-alternatives-2026)
- [Skywork — How to Replace Backgrounds & Fix Colors in Nano Banana (boas práticas de edição preservando o original)](https://skywork.ai/blog/how-to-replace-background-nano-banana-guide/)
- [My Modern Met — Yardzen Review (processo real de captura de fotos e vídeos pelo cliente)](https://mymodernmet.com/yardzen-online-landscape-design-review/)
- [Tibor Blaho — custo extra do high input fidelity no gpt-image-1 (4096/6144 tokens)](https://x.com/btibor91/status/1945823058645983329)
