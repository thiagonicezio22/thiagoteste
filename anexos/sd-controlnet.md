# O caminho "profissional": Stable Diffusion / Flux com ComfyUI para renderizar projetos sobre a foto real do cliente

## Veredito em uma frase

O stack aberto (ComfyUI + Flux/SDXL com inpainting, ControlNet e IP-Adapter) é hoje a **única abordagem que garante tecnicamente** que a casa, o muro e o entorno da foto do cliente permaneçam pixel-idênticos — mas a curva de aprendizado é real, e para um profissional não-técnico o melhor custo-benefício costuma ser um **meio-termo**: modelos de edição por instrução (FLUX.1 Kontext / Qwen-Image-Edit) rodando em serviços prontos, reservando o ComfyUI completo para quando o volume de projetos justificar.

## As peças do stack (nomes exatos)

- **ComfyUI** (gratuito, open source) — interface de "nós" que virou o padrão do mercado. Já traz **templates nativos de FLUX.1 Kontext Dev** em Workflow → Browse Templates → Flux. Alternativas de interface: **A1111/Forge** (mais simples, menos atualizadas), **Fooocus** (importante: está oficialmente em *"limited long-term support, bug fixes only"*, só SDXL, sem planos de suportar novas arquiteturas — não construa um fluxo novo sobre ele) e **InvokeAI/Invoke** (desde a versão 5.0 tem o **Control Canvas**: camadas, máscaras, inpainting e ControlNet numa tela estilo Photoshop — a UI mais amigável do ecossistema para quem não é técnico).
- **Inpainting com máscara** — você pinta *só a área do quintal* que vira lago/piscina; o resto da foto não é tocado. Em ComfyUI: Load Image → botão direito → "Open in MaskEditor" → VAE Encode (for Inpainting) → KSampler. O modelo dedicado da Black Forest Labs é o **FLUX.1 Fill dev** (inpainting/outpainting de última geração, parte do pacote "FLUX.1 Tools").
- **ControlNet para travar a geometria** — extrai um **mapa de profundidade** (preprocessador Depth Anything V2, via custom node *ControlNet Auxiliary Preprocessors*, de Fannovel16) ou **bordas Canny** da foto e obriga a geração a respeitar perspectiva, linhas da casa e desníveis do terreno. Modelos: **FLUX.1 Depth dev / FLUX.1 Canny dev** (pesos abertos no Hugging Face; atenção: foram descontinuados na API da BFL, mas os checkpoints continuam disponíveis) e, para SDXL, o **controlnet-union (xinsir)**. Depth é o recomendado da própria documentação do ComfyUI para "planejamento de cena e paisagismo".
- **Referência de estilo (as fotos de inspiração do cliente)** — **IP-Adapter** (custom node clássico: *ComfyUI_IPAdapter_plus*, de cubiq) usa uma imagem como "prompt visual", copiando estilo/materiais; o equivalente moderno para Flux é o **FLUX.1 Redux**. É exatamente o recurso "usar imagem de referência do estilo desejado".
- **Atalho moderno: FLUX.1 Kontext Dev** (12B parâmetros, pesos abertos) — edita por instrução de texto, **sem máscara**: "adicione um lago ornamental aqui, mantenha a casa idêntica". Preserva consistência entre edições sequenciais, mas degrada com 6+ edições seguidas e o prompt é limitado a 512 tokens. Concorrente direto e, em vários testes comunitários, superior em edições localizadas: **Qwen-Image-Edit** (Alibaba, 20B, também roda em ComfyUI). Observação: no fim de 2025 saiu o **FLUX.2**, já oferecido por serviços como getimg.ai — verifique o estado atual, pois o ecossistema muda rápido.

## Workflow recomendado para o caso do Thiago (foto do quintal → projeto finalizado)

1. **Fotografe bem**: foto ampla, horizontal, luz de dia, mostrando casa/muro e toda a área do futuro lago.
2. **Gere o mapa de profundidade** da foto (Depth Anything V2) — isso "congela" a perspectiva.
3. **Pinte a máscara** apenas sobre a área de intervenção (gramado que vira lago/praia).
4. **Carregue a referência de estilo** do cliente no IP-Adapter/Redux com peso ~0,6–0,8.
5. **Prompt de texto** descrevendo o projeto + **denoise** entre 0,75–1,0 dentro da máscara (fora dela nada muda).
6. **Gere 4–8 variações** (batch), escolha a melhor, e refine com um segundo passe de inpainting em detalhes (bordas de pedra, cascata, deck).
7. Alternativa expressa: pule 2–5 e use **Kontext/Qwen-Image-Edit** com prompt de instrução — mais rápido, porém sem garantia absoluta de que pixels fora da edição fiquem intactos.

**Exemplo de prompt (inpainting SDXL/Flux):** `natural swimming pond with sandy beach entry, ornamental koi pond, natural stone edges, tropical Brazilian landscaping, photorealistic, golden hour light matching original photo` (+ negativo: `cartoon, painting, blurry, distorted house`).

**Exemplo de prompt (Kontext, estilo instrução — guia oficial da BFL recomenda declarar o que preservar):** `Replace the lawn area with a natural swimming pond with white sand beach entry and natural stone borders, while keeping the house, walls, fence and lighting exactly the same`.

## Hardware e custos (dados de meados de 2026 — preços mudam)

- **Local**: FLUX.1 dev pleno pede ~24 GB de VRAM (RTX 3090/4090); versões FP8 rodam bem com 16 GB; quantizações GGUF Q4/Q5 funcionam com 8–12 GB com perda pequena. Kontext Dev completo roda numa RTX 4090, porém devagar. Um PC de trabalho com RTX 4090 custa alto no Brasil (R$ 15–25 mil), difícil de justificar só para isso.
- **Nuvem "crua" (exige configuração técnica)**: RunPod aluga RTX 4090 por ~US$ 0,34/h — algumas horas de uso saem mais barato que uma mensalidade do ChatGPT Plus, mas montar o ambiente não é trivial.
- **ComfyUI hospedado (liga e usa)**: RunComfy ~US$ 2,34/h de GPU (cobrança por segundo); ThinkDiffusion e MimicPC operam na mesma faixa de ~US$ 1–2/h (não confirmei o preço exato atual dos dois — checar nos sites); Comfy Cloud (oficial) tem plano na casa de ~US$ 20/mês.
- **Serviços "embrulhados" (o meio-termo real)**: **Krea AI** — canvas em tempo real (você rabisca sobre a foto e vê o render mudar ao vivo), acesso a Flux e dezenas de modelos: grátis limitado, US$ 9/mês (Basic) ou US$ 35/mês (Pro). **getimg.ai** — inpainting/outpainting num editor web com FLUX e SD, a partir de ~US$ 10–12/mês. **Invoke** tem versão local gratuita e planos cloud. Menção honrosa: o plugin **Krita AI Diffusion** (Acly, gratuito) dá inpainting com ControlNet numa interface de pintura, usando ComfyUI escondido por trás.

## Avaliação honesta: vale a pena versus ChatGPT?

**O que o stack aberto dá a mais:** (1) garantia matemática de preservação — com máscara, os pixels da casa não são regenerados, enquanto ChatGPT/DALL·E redesenha a imagem inteira e frequentemente altera a casa; (2) controle de geometria via depth/canny — o terreno e a perspectiva reais são respeitados; (3) referência de estilo com peso ajustável; (4) resolução e variações ilimitadas sem custo por imagem (rodando local); (5) reprodutibilidade: o mesmo workflow vira um "carimbo" para todos os clientes.

**O que custa:** a curva do ComfyUI é a mais íngreme do mercado (instalar modelos, custom nodes via ComfyUI Manager, entender denoise/CFG/samplers). Estimativa realista: 2–4 fins de semana de estudo até um fluxo confiável, contra 10 minutos no ChatGPT. Erros de licença também importam: **FLUX.1 dev e Kontext Dev têm licença não-comercial** — para usar em propostas de clientes é preciso comprar a licença comercial da BFL ou usar via APIs/serviços que já embutem esse licenciamento (Krea, getimg, Together, Replicate, fal).

**Recomendação prática para o Thiago:** começar por **Krea (Realtime + Flux Kontext, US$ 9–35/mês)** ou **Invoke/getimg.ai** para ter inpainting com máscara sem instalar nada — isso já resolve ~80% do problema "editar por cima da foto mantendo o entorno". Migrar para **ComfyUI hospedado (RunComfy/ThinkDiffusion)** com workflow pronto de archviz (há templates públicos de "sketch-to-render" com ControlNet + IP-Adapter no runcomfy.com e comfyui.org) somente se: o volume passar de ~10 renders/mês, ou os clientes exigirem fidelidade que os serviços simples não entregam. ComfyUI local com GPU própria só faz sentido com volume alto e apetite técnico — para um paisagista, é exagero no primeiro ano.

**Incertezas declaradas:** preços citados vêm de fontes de terceiros datadas de 2026 e mudam com frequência; o ranking Kontext vs Qwen-Image-Edit vs FLUX.2 é disputado e evolui mês a mês; preços exatos de ThinkDiffusion/MimicPC não foram confirmados na fonte oficial.

## FONTES
- [ComfyUI Docs — Depth ControlNet Usage Example](https://docs.comfy.org/tutorials/controlnet/depth-controlnet)
- [RunComfy — Mastering ComfyUI ControlNet: A Complete Guide (também em PT)](https://www.runcomfy.com/tutorials/mastering-controlnet-in-comfyui)
- [ComfyUI Wiki — FLUX.1 Kontext (Dev, Pro, Max) Complete Guide](https://comfyui-wiki.com/en/tutorial/advanced/image/flux/flux-1-kontext)
- [ThinkDiffusion — Total Image Control with Flux Kontext: Complete Tutorial](https://learn.thinkdiffusion.com/total-image-control-with-flux-kontext-complete-tutorial/)
- [Black Forest Labs — Introducing FLUX.1 Tools (Fill, Depth, Canny, Redux)](https://bfl.ai/flux-1-tools/)
- [Black Forest Labs — Introducing FLUX.1 Kontext and the BFL Playground](https://bfl.ai/announcements/flux-1-kontext)
- [BFL — Prompting Guide: Image-to-Image (Kontext)](https://docs.bfl.ml/guides/prompting_guide_kontext_i2i)
- [Together AI — FLUX.1 Kontext: precise image editing without fine-tuning](https://www.together.ai/blog/flux-1-kontext)
- [Fooocus (GitHub) — README com status de Limited Long-Term Support](https://github.com/lllyasviel/Fooocus)
- [Invoke 5.0 — Control Canvas, Raster Layers e suporte a Flux](https://alternativeto.net/news/2024/10/invoke-5-0-launches-with-control-canvas-raster-layers-and-flux-support)
- [Comflowy — Como aplicar ComfyUI a design de interiores (ControlNet + inpainting)](https://www.comflowy.com/blog/generate-interior-design-renderings)
- [Promptus — Sketch to Image: Style Transfer in ComfyUI with IP-Adapters](https://www.promptus.ai/blog/sketch-to-image-style-transfer-comfyui-ip-adapters)
- [ComfyUI.org — SDXL Architecture Visuals Workflow (ControlNet + IPAdapter + LoRA)](https://comfyui.org/en/stable-diffusion-xl-architecture-visuals)
- [RunComfy — FLUX Kontext Dev ComfyUI Workflow](https://www.runcomfy.com/comfyui-workflows/flux-kontext-dev-comfyui-workflow-ai-image-editing-tool)
- [MyAIForce — Inpainting, Outpainting e Style Transfer com Flux Tools + ControlNet](https://myaiforce.com/flux-tools-workflow/)
- [ComfyUI_IPAdapter_plus (custom node de cubiq, GitHub)](https://github.com/cubiq/ComfyUI_IPAdapter_plus)
- [Krita AI Diffusion (plugin gratuito de inpainting com ControlNet sobre ComfyUI)](https://github.com/Acly/krita-ai-diffusion)
- [Local AI Master — FLUX VRAM Requirements by GPU (8GB a 24GB)](https://localaimaster.com/blog/flux-vram-requirements-by-gpu)
- [Jarvis Labs — Best GPU for FLUX: VRAM, velocidade e preços em nuvem](https://jarvislabs.ai/ai-faqs/best-gpu-for-flux)
- [GPUHosted — RunPod Pricing Guide 2026 (RTX 4090 ~US$0,34/h)](https://gpuhosted.com/en/runpod-pricing-guide/)
- [RunComfy — Pricing (GPU por segundo, ~US$2,34/h)](https://www.runcomfy.com/pricing)
- [Comfy Cloud — Pricing (oficial)](https://comfy.org/cloud/pricing/)
- [AIToolTier — Krea AI Pricing 2026 (Free/US$9/US$35/US$105)](https://aitooltier.com/pricing/krea-ai)
- [GeniusFirms — Getimg AI: Features, Pricing e alternativas (FLUX.2, inpainting)](https://www.geniusfirms.com/blog/getimg-ai-features-pricing-and-alternatives/)
- [MimicPC — Qwen Image Edit vs Flux Kontext: qual é melhor para edição](https://www.mimicpc.com/learn/qwen-image-edit-vs-flux-kontext-which-better-for-image-editing)
- [MimicPC — Flux Kontext Prompt Guide (20+ exemplos)](https://www.mimicpc.com/learn/flux-kontext-prompt-guide-how-to-edit-images)
- [Stable Diffusion Art — ControlNet ComfyUI workflows](https://stable-diffusion-art.com/controlnet-comfyui/)
- [Roomagen — Adição e Design de Piscina Virtual sobre foto real (PT-BR)](https://roomagen.com/pt-BR/tools/pool-addition)
