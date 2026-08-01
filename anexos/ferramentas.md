# Ferramentas especializadas de foto→render para paisagismo e lagos ornamentais

## Resumo do problema do Thiago

O objetivo é: partir de **uma única foto real** do quintal/terreno do cliente, gerar uma imagem fotorrealista do projeto finalizado (lago ornamental, piscina de areia, paisagismo), **preservando casa, muros e entorno reais**, idealmente usando **imagens de referência de estilo**. Isso exige três recursos técnicos: (1) image-to-image a partir de foto, sem modelo 3D; (2) máscara/inpainting ou "region rendering" para editar só a área do projeto; (3) aceitação de imagem de referência de estilo. Poucas ferramentas entregam os três juntos.

## Comparativo das ferramentas investigadas

### Ferramentas de arquitetura (foto/sketch → render)

**PromeAI (promeai.pro)** — a mais completa para o caso. Funciona a partir de foto real ou sketch, sem modelo 3D. Recursos-chave verificados: **Region Rendering** (renderiza apenas a região selecionada, mantendo o resto da foto intacto — exatamente o que preserva a casa), **Erase & Replace** (inpainting por pincel: você pinta a área e descreve o que quer no lugar), **Creative Fusion** (aceita **imagem de referência de estilo** e mistura com sua foto, com controle de intensidade), slider de "criatividade" (quanto a IA respeita as linhas originais) e **TextureLock** (mantém texturas). Preços: grátis com 10 coins/mês e marca d'água; Base ~US$16–19/mês (500 coins); Standard US$29/mês (2.000 coins, direitos comerciais e vídeo); Pro US$59/mês (6.000 coins). Limitação: uso comercial parece restrito aos planos Standard/Pro; qualidade varia com a foto de entrada.

**Veras, da EvolveLAB (evolvelab.io/veras)** — foco em arquitetura profissional. O **web app (veras.evolvelab.io) aceita upload de foto direta, sem BIM/3D**, além de plugins para SketchUp, Revit, Rhino, Archicad, Vectorworks e Forma. Recursos: **Render Selection** (seleciona uma porção da imagem, aplica novo prompt e renderiza só ali) e **Geometry Override Slider** (em valores baixos, mantém a geometria fiel à foto e muda só materiais/vegetação — ótimo para preservar a casa). Não documenta oficialmente referência de estilo por imagem. Preço: US$59/mês (licença nominal; há citações de ~US$49/mês e US$408–612/ano em fontes secundárias — os valores variam entre fontes, trate como aproximados); estudante US$149/ano; **trial grátis de 30 renders/15 dias**. Limitação real: resolução máxima ~2K.

**MyArchitectAI (myarchitectai.com)** — simples e barato: upload de foto/sketch, presets de exterior e paisagismo, render em ~10 segundos. **Grátis: 10 renders + 10 edições**; Pro US$29/mês com renders ilimitados, 4K e licença comercial. Menos controle fino de máscara do que PromeAI/Veras.

**Rendair AI (rendair.ai)** — Creator US$20/mês, Pro US$50/mês, TeamPro US$200/mês; 20 créditos grátis; tem chat de edição, inpainting, upscale (anuncia 8K) e animação. Reviews independentes apontam que os resultados frequentemente exigem retrabalho e texturas podem parecer artificiais.

**ArkoAI (US$39/mês)** e **LookX (grátis limitado; pago a partir de ~US$20/mês, por créditos)** — funcionam melhor plugados em SketchUp/Rhino/Revit (ArkoAI) ou via web (LookX). Teste prático da Hayne Architects concluiu que o ArkoAI "não é plug-and-play" e que o LookX obedece prompts melhor que o ArkoAI. Nenhum dos dois se destaca em preservar foto real com máscara — são mais para conceito.

**Maket** — gera plantas baixas esquemáticas por IA (grátis; Pro US$30/mês). **Não serve** para foto→render de quintal; descarte para este caso.

**D5 Render (Community grátis; Pro US$38/mês ou US$360/ano)** e **Lumion 2026** — são renderizadores 3D completos: **exigem modelo 3D**, não funcionam a partir de uma foto só. O D5 3.0 tem suíte de IA interessante (AI Atmosphere Match com foto de referência, AI Inpainting, Style Transfer, SmartPlanting); o Lumion 2026 tem basicamente AI Upscaler (até 16K). Só valem a pena se o Thiago um dia modelar os lagos em SketchUp.

### Ferramentas gerais úteis como apoio

**Krea AI** — não é de arquitetura, mas tem Realtime Canvas (render em <50 ms enquanto você desenha sobre a foto), inpainting por região, **style reference** e acesso a 64+ modelos (Flux, Krea 1 etc.). Grátis: 100 créditos/dia; Basic ~US$9–10/mês; Pro US$35/mês; Max US$70/mês (fontes divergem levemente entre US$63/ano-promo e US$9/mês — confirme no site). **Magnific AI** (Pro US$39/mês, Premium US$99, Business US$299) é upscaler/enhancer: excelente **etapa final** para dar realismo/nitidez ao render de qualquer outra ferramenta antes de mostrar ao cliente.

### Apps específicos de quintal/paisagismo

**Neighborbrite** — grátis e ilimitado, sem cadastro: sobe a foto do quintal, **desenha uma seleção sobre a área a redesenhar**, escolhe entre 16+ estilos. Pro ~US$15/mês adiciona "Magic Edit" e listas de plantas. Limitação documentada (queixa nº 1 dos usuários): **às vezes altera áreas fora da seleção** — ou seja, a preservação da casa não é 100% confiável. Voltado a proprietários, não a profissionais.

**DreamzAR** — US$19,99/mês (iOS): modo "AI Photo Redesign" (foto → conceito estilizado em <2 min, 38+ estilos), editor 2D com 2.000+ plantas/objetos e modo AR. Nota 3,1/5 com reclamações de travamento. Bom para ideação rápida, controle limitado sobre lagos/piscinas específicos.

**iScape** — o mais "pro" dos apps: 4,6/5 no iOS, 29 mil+ avaliações. Porém o design é **manual** (você posiciona plantas/pedras sobre a foto, estilo colagem/AR) — isso **preserva a casa perfeitamente**, mas não é generativo e a biblioteca dificilmente cobre lago ornamental estilo praia brasileiro. Pro US$29,99/mês ou US$299,99/ano (uma fonte cita US$9,99/mês — dado conflitante, confirme no app). Inclui ferramentas de proposta comercial para paisagistas.

**Yardzen** — não é ferramenta de IA self-service: é serviço com designers humanos (pacotes de ~US$295 a US$3.495, entrega em 2–3 semanas), com um gerador gratuito limitado (YardAI). Só faz sentido como benchmark. **PlantAI**: não encontrei dados confiáveis e verificáveis sobre essa ferramenta específica — informação indisponível/incerta.

**Opções brasileiras**: **ArqRender (arqrenderapp.com.br)** — plataforma nacional foto/print→render, com paisagismo e áreas externas, sistema de créditos (1 crédito = 1 imagem), créditos grátis no cadastro, plugins SketchUp/Revit; preços não publicados no site. **AuE Expert** (AuE Paisagismo) — IA integrada aos softwares brasileiros de paisagismo da AuE. Vale testar por suporte em português.

## As 3 melhores para o caso do Thiago

1. **PromeAI (Standard, US$29/mês)** — única que reúne os três requisitos: foto única, Region Rendering/Erase & Replace para preservar casa e muros, e Creative Fusion com imagem de referência de estilo. Melhor custo-benefício.
2. **Veras web app (US$59/mês; comece pelo trial de 30 renders)** — qualidade arquitetônica superior e o Geometry Override é o melhor controle de fidelidade à foto do mercado; falta referência por imagem.
3. **Krea AI (Pro US$35/mês) + Magnific como finalizador** — combinação mais flexível: inpainting preciso sobre a foto + style reference + upscale final fotorrealista. Exige mais aprendizado que as duas acima.

Neighborbrite (grátis) serve como validação rápida/venda no celular na frente do cliente, mas sem confiabilidade para a arte final.

## Workflow sugerido (PromeAI como exemplo)

1. Fotografe o local com boa luz, na altura dos olhos, ângulo que mostre a área do projeto E parte da casa (para ancorar o realismo).
2. Suba a foto no PromeAI → ferramenta **Erase & Replace** ou **Region Rendering**; pinte SOMENTE a área onde entra o lago/piscina.
3. Prompt (funciona melhor em inglês): *"photorealistic natural swimming pond with sandy beach entry, natural stone edges, tropical Brazilian landscaping, palm trees and philodendrons, crystal clear water, waterfall feature, keep existing house, walls and background unchanged, golden hour light, professional landscape photography"*.
4. Se tiver foto de obra sua anterior como referência de estilo, use **Creative Fusion** com intensidade de estilo em ~40–60%.
5. Gere 4–8 variações; escolha a melhor; corrija detalhes com novo Erase & Replace pontual.
6. Finalize no **Magnific AI** (upscale + realismo) antes de enviar ao cliente.

**Ressalva honesta**: nenhuma dessas ferramentas garante 100% de fidelidade da casa em toda geração — sempre haverá gerações descartáveis; conte com 3–10 tentativas por imagem final. Preços citados foram verificados entre abril–agosto/2026 em fontes secundárias e podem mudar; valores conflitantes foram sinalizados no texto.

## FONTES
- [PromeAI Review 2026: Sketch to Render (Free vs Pro) — TechJarvis](https://techjarvisai.com/promeai-review/)
- [PromeAI — Creative Fusion (referência de estilo)](https://www.promeai.pro/creative-fusion)
- [PromeAI — Region Rendering](https://www.promeai.pro/region-rendering)
- [PromeAI — TextureLock AI Rendering](https://www.promeai.pro/texturelock-rendering)
- [PromeAI Pricing & Plans — SaaSworthy](https://www.saasworthy.com/product/promeai/pricing)
- [VERAS — EvolveLAB (página oficial)](https://www.evolvelab.io/veras)
- [Veras by EvolveLAB — features & pricing (BIM Tools Hub)](https://bimtoolshub.com/veras-by-evolvelab)
- [MyArchitectAI Pricing (oficial)](https://www.myarchitectai.com/pricing)
- [Rendair AI Pricing (oficial)](https://rendair.ai/pricing)
- [Rendair AI Review 2026 — Rendershop](https://rendershop.ai/rendair-ai-review)
- [Exploring AI Rendering: Hands-On Test of ArkoAI and LookX — Hayne Architects](https://www.haynearchitects.com/exploring-ai-rendering-a-hands-on-test-of-arkoai-and-lookx/)
- [ArkoAI Reviews — SourceForge](https://sourceforge.net/software/product/ArkoAI/)
- [D5 Render vs. Lumion: In-Depth 2026 Comparison — MyArchitectAI](https://www.myarchitectai.com/blog/d5-render-vs-lumion)
- [D5 Render Pricing 2026 — Visualizee](https://visualizee.ai/blog/d5-render-pricing)
- [Krea AI Pricing 2026 — CostBench](https://costbench.com/software/ai-image-generators/krea/)
- [Magnific vs Krea (2026) — Photo AI](https://photoai.com/compare/magnific-vs-krea)
- [Best AI Landscaping Tools 2026: 10 Reviewed and Ranked — AI Tools Bakery](https://aitoolsbakery.com/blog/best-ai-landscaping-tools/)
- [Neighborbrite Review (2026) — AI Tools Bakery](https://aitoolsbakery.com/blog/neighborbrite-review/)
- [iScape Review 2026 — AI Tools Bakery](https://aitoolsbakery.com/blog/iscape-review/)
- [Best AI landscape design apps in 2026 — Remodel AI (conteúdo autopromocional, ler com ressalva)](https://www.remodelai.io/blog/best-ai-landscape-design-apps)
- [Yardzen Review (2026): Is It Worth the Price? — AI Tools Bakery](https://aitoolsbakery.com/blog/yardzen-review/)
- [Best DreamzAR alternatives (2026) — OutdoorBrite](https://www.outdoorbrite.com/blog/dreamzar-alternatives)
- [ArqRender — Renderização realista com IA (Brasil)](https://www.arqrenderapp.com.br/)
- [AuE Paisagismo — Como utilizar a IA para melhorar seu projeto](https://auepaisagismo.com/?id=visualplan-2022:-como-utilizar-a-ia-para-melhorar-seus-projetos&in=3361)
- [Prompts para renderizar projetos de arquitetura com IA — TechTudo](https://www.techtudo.com.br/listas/2026/04/prompts-para-renderizar-imagens-e-criar-projetos-de-arquitetura-no-chatgpt-edsoftwares.ghtml)
