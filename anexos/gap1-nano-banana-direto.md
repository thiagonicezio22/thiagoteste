# LACUNA: Usar o Nano Banana/Gemini DIRETO (app Gemini, Google AI Studio ou API), sem passar pelo Higgsfield: quais são hoje os limites práticos — resolução máxima de saída e preservação do aspect ratio da foto original, número máximo de imagens de referência por pedido, franquia de gerações nos planos gratuito/AI Pro/AI Ultra e custo via API — e em que cenário compensa mais que acessar o mesmo modelo dentro do Higgsfield? (todos os 8 relatórios apontam o Nano Banana como o motor ideal, mas nenhum detalha seu uso direto)

# Nano Banana / Gemini direto (app, AI Studio ou API): limites práticos e quando compensa vs. Higgsfield

## 1. Qual "Nano Banana" estamos falando (nomes exatos, ago/2026)

A família atual de modelos de imagem do Google, segundo a documentação oficial da Gemini API, é:

- **Nano Banana Pro** (`gemini-3-pro-image`) — o modelo premium, ideal para o caso do Thiago (edição sobre foto real com múltiplas referências, realismo fotográfico, 4K).
- **Nano Banana 2** (`gemini-3.1-flash-image`) — o "cavalo de batalha" versátil, mais barato e rápido.
- **Nano Banana 2 Lite** (`gemini-3.1-flash-lite-image`) — o mais barato, só 1K/0.5K.
- **Nano Banana original** (`gemini-2.5-flash-image`) — legado (Google recomenda migrar); saída ~1024 px, US$ 0,039/imagem.

## 2. Resolução máxima e preservação do aspect ratio da foto original

- **Resolução:** Nano Banana Pro gera nativamente em **1K (1024 px), 2K (2048 px) e 4K (4096 px, ~16 MP)** via parâmetro `image_size`/`imageSize` (`"1K"`, `"2K"`, `"4K"`). Nano Banana 2 também chega a 4K (e desce até 512 px).
- **Aspect ratio:** suporta **10 proporções fixas** (21:9, 16:9, 3:2, 4:3, 5:4, 1:1, 4:5, 3:4, 2:3, 9:16) **mais o modo `auto` (padrão)**. Ponto crucial para o fluxo do Thiago: **no modo de edição (foto de entrada + instrução), se você NÃO passar `aspect_ratio`, a API detecta a proporção da foto original e devolve o resultado nas mesmas proporções** — exatamente o que ele precisa para "pintar por cima" da foto do quintal sem cortar casa/muro. Integradores como Replicate expõem isso como `match_input_image`.
- **Ressalva real:** no **app Gemini** (consumidor) há relatos recorrentes em fóruns de suporte do Google de geração travando em 1:1 quando o pedido é só por texto; na **edição de foto enviada** o app normalmente respeita a proporção da foto, mas o controle fino e confiável de proporção/resolução só existe mesmo no **AI Studio/API**. Custo em tokens: 1K e 2K consomem 1.120 tokens de saída; 4K consome 2.000; cada imagem de entrada custa 560 tokens.

## 3. Número máximo de imagens de referência por pedido

- **API (Nano Banana Pro):** até **14 imagens de referência em uma única chamada**, com sub-limites de fidelidade divulgados pelo Google: consistência de até **5 pessoas/personagens** e alta fidelidade para até **6 objetos** (fontes terceiras citam ainda ~3 referências de estilo). Aviso prático: 14 é o teto de anexos, não garantia de precisão igual para todos; guias recomendam **3 a 5 referências com papel definido** (ex.: 1 foto do local + 2–3 fotos de lagos/piscinas de areia já executados + 1 referência de material).
- **App Gemini:** cerca de **10 arquivos por prompt**.
- Isso cobre com folga o fluxo do Thiago: foto do terreno + referências do estilo praia + textura do porcelanato/pedra.

## 4. Franquias nos planos Gemini (gratuito / AI Plus / AI Pro / AI Ultra)

Os números oficiais publicados pelo Google (Central de Ajuda, set/2025, atualizados depois) e compilados por Android Central/Search Engine Journal e guias de 2026 — **com a ressalva explícita do próprio Google de que os limites são dinâmicos e mudam com a demanda**:

| Plano | Imagens/dia (modelo padrão) | Nano Banana Pro | Resolução |
|---|---|---|---|
| **Gratuito** | ~20–100/dia (fontes divergem; Google publicou 100/dia em 2025, guias de mar/2026 citam ~20/dia com Nano Banana 2) | **~2–3/dia**, depois cai automaticamente para o modelo padrão | 1K |
| **Google AI Plus** (~R$ 24,99/mês no Brasil) | ~50/dia | ~50/dia | até 2K |
| **Google AI Pro** (R$ 96,99/mês) | até 1.000/dia (número de 2025); guias de 2026 citam ~100/dia com Nano Banana Pro | ~100/dia | até 2K |
| **Google AI Ultra** (R$ 999,90/mês) | até 1.000/dia | até 1.000/dia | até 4K |

Todas as imagens carregam marca d'água invisível SynthID; a remoção da marca visível ("sparkle") é benefício dos planos superiores (Ultra; informação sobre o Pro varia por período — incerta). **Esses tetos por plano são a parte mais volátil deste relatório**; vale conferir na página de assinaturas do Gemini Brasil antes de decidir.

## 5. Custo via API (Google AI Studio / Gemini API)

- **Nano Banana Pro (`gemini-3-pro-image`):** **US$ 0,134/imagem em 1K–2K** e **US$ 0,24 em 4K** (≈ R$ 0,75 e R$ 1,35). **Não há tier gratuito de API** para este modelo — exige billing ativo; com cartão cadastrado (Tier 1), guias citam ~250 requisições/dia. Na **interface do AI Studio** dá para testar de graça (~2–3 imagens Pro/dia).
- **Nano Banana 2 (`gemini-3.1-flash-image`):** ~**US$ 0,045–0,151/imagem** conforme resolução (US$ 0,067 no 1K padrão) — ótimo para rascunhos baratos antes de finalizar no Pro.
- **Batch API: 50% de desconto** em tudo (processamento em até 24 h) — irrelevante para atendimento ao vivo, útil para gerar variações em lote à noite.
- Para o volume do Thiago (digamos 10 projetos/mês × 15 tentativas em 2K): ~150 × US$ 0,134 ≈ **US$ 20/mês** — na prática, similar ao AI Pro, mas sem limite diário e com controle total de parâmetros.

## 6. Comparação com o mesmo modelo dentro do Higgsfield

No Higgsfield, Nano Banana Pro/2 custam ~**2 créditos por geração**; planos partem de ~US$ 9–15/mês (Starter anual: 200 créditos ≈ 100 imagens/mês; Plus US$ 39: 1.000 créditos ≈ 500 imagens). A página oficial do Higgsfield indica **saída nativa 2K com upscale "inteligente" para 4K** (ou seja, o 4K não é necessariamente nativo como na API do Google) e mantém os mesmos 14 objetos/5 personagens do modelo.

**Quando o acesso direto compensa mais:**
1. **Custo por volume:** Google AI Pro (R$ 96,99) dá ~100 imagens Pro/DIA (~3.000/mês) vs. ~100–500/MÊS nos planos básicos do Higgsfield — diferença de ordem de grandeza.
2. **Fidelidade à foto:** só na API/AI Studio você garante `aspect_ratio: auto` (mantém a proporção exata da foto do cliente) e **4K nativo** para impressão de propostas.
3. **Automação:** para o "sistema de prompts" que Thiago quer montar, a API permite template fixo (foto + referências + prompt padronizado) e integração futura com o fluxo de orçamentos.
4. **Simplicidade:** app Gemini em PT-BR no celular, direto na obra, sem camada intermediária.

**Quando o Higgsfield compensa:** se Thiago também quiser **vídeo** (flythrough do lago com Veo/Kling/Seedance), efeitos prontos, inpainting com máscara visual e vários modelos num só lugar — o valor do Higgsfield é o agregado, não o Nano Banana em si.

## 7. Workflow direto recomendado (numerado)

1. Fotografe o local em 16:9 ou 4:3, luz de dia, câmera na altura do olho, alta resolução.
2. No **Google AI Studio** (aistudio.google.com), selecione `gemini-3-pro-image`; anexe a foto do local + 2–4 referências nomeadas.
3. Deixe aspect ratio em **auto** (herda a foto); use **2K** para apresentação, **4K** para fechamento/impressão.
4. Prompt-modelo (funciona em PT, inglês tende a ser um pouco mais estável): *"Edit the first image (client's backyard). Keep the house, walls, floor and all existing structures EXACTLY as they are. Replace only the lawn area with a natural-style sand-bottom pool like in reference images 2 and 3: turquoise water, white sand beach entry, natural stone edges, tropical landscaping with palms. Photorealistic, same camera angle, same daylight. Do not change the input aspect ratio."*
5. Itere em multi-turno ("aumente a praia", "adicione cascata de pedra à esquerda") — o modelo mantém o contexto.
6. Rascunhos baratos com `gemini-3.1-flash-image`; versão final com o Pro em 4K.

**Incertezas declaradas:** os tetos diários por plano do app Gemini mudam com frequência (números de 2025 vs. guias de mar/2026 divergem); o preço/estrutura de créditos do Higgsfield também muda com promoções; confirme ambos antes de assinar.

## FONTES
- [Gemini API – Image generation (documentação oficial: modelos, image_size, aspect ratio, 14 referências)](https://ai.google.dev/gemini-api/docs/image-generation)
- [Gemini API – Pricing (preços oficiais por modelo/resolução)](https://ai.google.dev/gemini-api/docs/pricing)
- [Google Blog – Nano Banana Pro: Gemini 3 Pro Image model](https://blog.google/innovation-and-ai/products/nano-banana-pro/)
- [Android Central – Google breaks down Gemini's daily limits for prompts and image creation](https://www.androidcentral.com/apps-software/google-breaks-down-geminis-daily-limits-for-prompts-and-image-creation)
- [Search Engine Journal – Google Publishes Exact Gemini Usage Limits Across All Tiers](https://www.searchenginejournal.com/google-publishes-exact-gemini-usage-limits-across-all-tiers/555433/)
- [AI Free API – Nano Banana Pro Rate Limits 2026: Gemini App Caps vs API Quotas (atualizado mar/2026)](https://www.aifreeapi.com/en/posts/nano-banana-pro-rate-limits)
- [AI Free API – Nano Banana Pro Maximum Resolution Guide (4K, matriz de resoluções e custos)](https://www.aifreeapi.com/en/posts/nano-banana-pro-maximum-resolution)
- [GlobalGPT – How Many Images Can You Upload to Nano Banana Pro at Once? (14 na API, ~10 no app)](https://www.glbgpt.com/hub/how-many-images-can-you-upload-to-nano-banana-pro-at-once/)
- [Apiyi – Nano Banana Pro API Original Aspect Ratio Output Guide (comportamento auto = proporção da foto de entrada)](https://help.apiyi.com/en/nano-banana-pro-original-aspect-ratio-output-en.html)
- [Replicate – google/nano-banana-2 (parâmetro match_input_image e resoluções)](https://replicate.com/google/nano-banana-2)
- [Higgsfield – Nano Banana Pro & Nano Banana 2 (página oficial: créditos, 2K nativo com upscale 4K)](https://higgsfield.ai/nano-banana-intro)
- [Imagine.art – Higgsfield AI Pricing in 2026: Plans, Credits](https://www.imagine.art/blogs/higgsfield-ai-pricing)
- [Apiyi – Higgsfield AI Nano Banana Pro API: comparação de custos com API oficial](https://help.apiyi.com/en/higgsfield-nano-banana-pro-api-low-cost-alternative-en.html)
- [Gemini (Brasil) – Planos Google AI Pro e Ultra (preços em R$)](https://gemini.google/br/subscriptions/?hl=pt-BR)
- [O Antagonista – Os planos do Gemini do Google em 2026 (gratuito, Pro e Ultra no Brasil)](https://oantagonista.com.br/ladooa/tecnologia/os-planos-do-gemini-do-google-em-2026-incluem-versao-gratuita-e-assinaturas-pro-e-ultra-com-vantagens-extras/)
- [Canaltech – 8 formas de assinar o Gemini mais barato ou de graça (preços BR)](https://canaltech.com.br/inteligencia-artificial/como-assinar-o-gemini-mais-barato-ou-de-graca/)
- [LaoZhang – Gemini 3 Pro Image API Pricing (US$ 0,134 / 0,24; sem free tier de API)](https://blog.laozhang.ai/en/posts/gemini-3-pro-image-api-pricing)
- [GlobalGPT – Nano Banana 2 Limits: Gemini 3.1 Flash Image Daily Quotas](https://www.glbgpt.com/hub/nano-banana-2-limits-the-ultimate-guide-to-gemini-3-1-flash-image-daily-quotas/)
- [Google AI Developers Forum – Nano Banana Auto Aspect Ratio issue (limitações reais reportadas)](https://discuss.ai.google.dev/t/gemini-2-5-flash-nano-banana-auto-aspect-ratio-issue-output-image-has-different-aspect-ratio/108225)
- [Datastudios – Google Nano Banana Free vs Pro: quotas, resolution caps, pricing tiers](https://www.datastudios.org/post/google-nano-banana-free-vs-pro-daily-quotas-resolution-caps-pricing-tiers-and-partner-bundles)
