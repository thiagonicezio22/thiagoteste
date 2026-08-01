# Pesquisa completa — Foto do local → imagem realista do projeto com IA

**Para:** Thiago Nicézio (lagos ornamentais, piscinas de areia/praia e paisagismo)
**Objetivo:** fundamentar um sistema de prompts que parta da **foto real do local do cliente** (com ou sem rascunho desenhado por cima) e gere uma **imagem fotorrealista do projeto finalizado**, preservando casa, muros e entorno, guiada por **imagens de referência** do estilo.
**Método:** 12 agentes de pesquisa em paralelo (docs oficiais, fóruns, YouTube, imprensa BR/EN, comunidades de archviz e do setor de piscinas) + análise do material público do workshop ArqExpress. Data: agosto/2026. Preços e limites mudam rápido — sempre confirmar antes de assinar.

---

## 1. Resumo executivo (a resposta curta)

1. **O melhor motor para o seu caso NÃO é o ChatGPT — é o Nano Banana (Google Gemini)**. É o consenso de fóruns de arquitetura (r/ArchViz via Architizer), da imprensa brasileira (Exame, TechTudo em teste comparativo), dos tutoriais mais completos do YouTube e do próprio setor de piscinas nos EUA. O Nano Banana edita a foto real preservando o que existe; o ChatGPT **regenera a imagem inteira** a cada pedido (limitação confirmada pela própria OpenAI) e tende a "redesenhar" a casa do cliente.
2. **O Higgsfield serve, mas não pelo modelo próprio (Soul, focado em moda/pessoas)** — e sim porque é um agregador: dá acesso ao Nano Banana Pro **com pincel de máscara** (você pinta só a área do lago; o resto da foto fica intocado), aceita várias imagens de referência, muda ângulo de câmera (Angles) e anima o resultado em vídeo. É o "canivete suíço" pago.
3. **O ChatGPT continua útil** como segunda opção e como assistente para escrever/refinar prompts — com o GPT Image 1.5/2 melhorou muito, mas exige prompt de preservação rigoroso e vigilância contra distorções da casa.
4. **Seu requisito da marcação no Paint + legenda é validado pela prática**: o padrão vencedor é enviar **foto limpa + foto marcada + legenda explicando cada cor + 1-3 referências do seu portfólio**, avisando que o desenho é posicional e não deve aparecer no resultado. Está sistematizado no `sistema-de-prompts.md`.
5. **Juridicamente, o render vincula como oferta (art. 30 do CDC)** — "imagem meramente ilustrativa" em letra miúda não protege. A defesa é o conjunto: selo ostensivo na imagem + cláusula específica na proposta + render fiel ao escopo orçado + aceite do cliente. Modelos prontos na seção 8.

---

## 2. ChatGPT (OpenAI) — o que funciona e o que não funciona

**Estado atual (ago/2026):** o gerador do ChatGPT é o **GPT Image 1.5** (dez/2025); na API existem `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1` e `mini`. O modelo **não edita pixels: regenera a imagem inteira** tentando reproduzir o que não deve mudar — isso explica todas as limitações.

**Funciona:**
- Anexar várias imagens num pedido (foto do local + referências) e numerá-las no texto.
- Ferramenta de seleção (pincel) para pedir mudança só numa região — mas a própria OpenAI documenta que a seleção é **orientativa**: "as edições podem se estender além da área selecionada".
- O 1.5 melhorou muito a preservação ("mantém iluminação, composição e aparência"); na API, `input_fidelity: "high"` preserva as 5 primeiras imagens de entrada com alta fidelidade (custa ~10x mais tokens de entrada).

**Não funciona / cuidados:**
- Teste real documentado (blog Addicted2Decorating, foto da própria casa): o ChatGPT devolveu "uma casa inteiramente nova", mudou o ângulo da câmera e, ao corrigir um item, alterava outros já aprovados. Threads no fórum oficial da OpenAI confirmam: o inpainting com máscara "regenera a imagem inteira".
- **Drift acumulado**: editar sobre a edição degrada a foto. Regra de ouro: reanexar a foto original a cada revisão importante e abrir chat novo por projeto (há relatos de degradação após 3-5 gerações na mesma conversa).
- Saídas só em 1024×1024, 1536×1024 ou 1024×1536 (gpt-image-2 vai além) — fotografe em **horizontal**.

**Preços:** Free ~2-3 imagens/dia; **ChatGPT Go R$ 39,99/mês** (Brasil); Plus US$ 20/mês (~40-50 imagens/3h); API gpt-image-1.5: US$ 0,009/0,034/0,133 por imagem (low/medium/high) — uma edição em alta fidelidade sai ~US$ 0,15-0,25.

---

## 3. Nano Banana / Gemini (Google) — o motor recomendado

**Modelos (nomes exatos):** **Nano Banana Pro** (`gemini-3-pro-image`) — o premium, 1K/2K/**4K nativo**; **Nano Banana 2** (`gemini-3.1-flash-image`) — mais barato e rápido; versões Lite e legada.

**Por que é o melhor para o seu caso:**
- Edita a foto real **preservando o que existe** — mantém árvore, muro, patamar e insere só o elemento novo, com reflexos d'água e sombras coerentes com o sol da foto original (consenso da comunidade de arquitetura).
- **Aceita até 14 imagens de referência por chamada na API** (~10 no app) — foto do local + rascunho marcado + referências de estilo + textura de pedra, tudo junto. Recomendação prática: 3-5 referências com papel definido.
- No modo edição, se você não fixar proporção, **devolve o resultado na mesma proporção da foto original** (`aspect_ratio: auto`) — nada de cortar a casa.
- Template de preservação recomendado pelo próprio Google: *"Using the provided image, change only the [elemento] to [novo elemento]. Keep everything else exactly the same, preserving original style, lighting, and composition."*

**Onde usar:** app Gemini (PT-BR, celular, grátis com limites; **Google AI Plus ~R$ 24,99/mês**, **AI Pro R$ 96,99/mês** amplia para ~100 imagens Pro/dia) ou **Google AI Studio / API** (Nano Banana Pro: US$ 0,134/imagem 1K-2K, US$ 0,24 em 4K; sem tier grátis de API). Para ~10 projetos/mês × 15 tentativas: ~US$ 20/mês via API. Toda imagem carrega marca d'água invisível SynthID.

**Caso real do setor:** a Arrowhead Deck and Pools (EUA, 13 funcionários, 400+ projetos/ano — case publicado no blog da JobTread) gera render fotorrealista + vídeo antes/depois em ~15 segundos durante a visita comercial, usando **Gemini** automatizado via Make.com. A Pool Magazine confirma a prática como padrão emergente do setor.

---

## 4. Higgsfield — o que é de verdade e quando compensa

- Plataforma de imagem+vídeo (avaliada em US$ 1,3 bi, jan/2026), nascida para **marketing/moda/vídeo**, não para arquitetura. O modelo próprio **Soul** é de estética editorial/pessoas — pouco útil para paisagismo.
- O valor real para você é o **AI Image Editor**: pincel de máscara (**Draw-to-Edit / Nano Banana Pro Inpaint** — edita só a área pintada, "máscaras precisas não são necessárias"), **até 8 referências**, **Banana Placement** (inserir objeto de uma referência na foto com sombra coerente), **Angles** (gera outros ângulos da mesma cena — o blog oficial cita exatamente o caso imobiliário) e **vídeo** (dolly-in/órbita com Veo/Kling — ótimo fechamento de venda).
- **Preços divergem entre fontes** (confirme em higgsfield.ai/pricing): Basic ~US$ 5/70 créditos; Starter ~US$ 15; Plus US$ 39/1.000 créditos; Ultra US$ 99-129/3.000. Créditos não acumulam; atenção ao checkout com plano anual pré-selecionado (houve reclamações). Nano Banana lá custa ~2 créditos/geração, mas a saída é 2K com upscale a 4K (não 4K nativo como na API do Google).
- **Custo-benefício:** para volume de imagens, o acesso direto ao Gemini é uma ordem de grandeza mais barato. O Higgsfield compensa se você quiser **máscara visual + multi-referência + vídeo num lugar só**.

---

## 5. Ferramentas especializadas (foto → render sem modelo 3D)

| Ferramenta | Destaque | Preço (aprox.) | Veredito |
|---|---|---|---|
| **PromeAI** | Region Rendering (edita só a região), Erase & Replace, Creative Fusion (referência de estilo com intensidade) | Grátis limitado; Standard US$ 29/mês (uso comercial) | **Melhor especializada** para o seu caso |
| **Veras (EvolveLAB)** | Geometry Override Slider — melhor controle de fidelidade à foto do mercado | US$ 59/mês; trial 30 renders | Qualidade pro; sem referência por imagem |
| **Krea AI + Magnific** | Canvas em tempo real + inpainting + style reference; Magnific como upscale/realismo final | Krea grátis-US$ 35; Magnific US$ 39+ | Combinação flexível, mais curva |
| **MyArchitectAI** | Simples, presets de paisagismo, 10 renders grátis | US$ 29/mês | Bom para testar rápido |
| **Neighborbrite** | Grátis, desenha seleção sobre a foto do quintal | Grátis; Pro ~US$ 15 | Demo no celular; às vezes vaza fora da seleção |
| **iScape** | Colagem manual AR (preserva 100% a casa) | ~US$ 29,99/mês | Não-generativo; biblioteca sem estilo BR |
| **PoolPix / GenRoom / Pool Planner** | Nicho piscina (reforma, catálogo EUA) | US$ 9,99-99/mês | **Nenhum tem preset "piscina de praia" ou "lago com biofiltro"** — seu nicho exige prompt livre + referência, o que favorece Gemini/Higgsfield/ChatGPT |
| **ArqRender / AuE Expert (BR)** | Nacionais, suporte PT | sob consulta | Vale testar |
| D5 / Lumion / Maket | Exigem modelo 3D ou fazem plantas | — | Fora do caso de uso |

---

## 6. O caminho "profissional" (Stable Diffusion / Flux) — quando crescer

Único stack com **garantia matemática de preservação**: com máscara de inpainting, os pixels da casa não são regenerados. Peças: **ComfyUI** (ou Invoke, mais amigável) + **FLUX.1 Fill** (inpainting) + **ControlNet Depth** (trava a perspectiva da foto) + **IP-Adapter/Redux** (suas fotos de referência como "prompt visual") + atalho **FLUX.1 Kontext / Qwen-Image-Edit** (edição por instrução).

Custos: GPU local 24 GB (R$ 15-25 mil) ou nuvem (~US$ 0,34-2,34/h; Krea/getimg.ai a partir de US$ 9-12/mês embrulham isso). **Atenção: FLUX.1 dev/Kontext Dev têm licença não-comercial** — para propostas de clientes, use via serviços que embutem a licença (Krea, getimg, Replicate, fal).

**Recomendação honesta:** exagero para começar. Migre só se o volume passar de ~10 renders/mês ou os clientes exigirem fidelidade que Gemini/Higgsfield não entregam. Estimativa: 2-4 fins de semana de aprendizado.

---

## 7. A foto de entrada — o fator nº 1 de realismo

**Checklist (síntese de GenRoom, Yardzen, Curb Appeal AI):**
- **Horizontal (4:3 ou 16:9)**, câmera 1x (sem ultra-wide), nivelada com o horizonte.
- **Altura dos olhos (1,5-1,7 m) ou levemente elevada** (janela do 2º andar) — mostra o plano do chão onde o projeto acontece.
- De **um canto do terreno**, pegando a área do projeto + muros + fachada + um pouco de céu (esses elementos "ancoram" o realismo e a escala).
- **Luz difusa entre ~10h e 16h** (nublado é melhor que sol duro); sem filtros, sem HDR agressivo, sem panorâmica costurada.
- **≥12 MP, enviada como DOCUMENTO no WhatsApp** (a compressão de foto normal do WhatsApp derruba para ~1600 px — o problema mais comum no Brasil).
- Cena limpa: sem lixeira, mangueira, entulho, carro, pessoas.
- **3-5 ângulos + medidas reais anotadas** (largura do quintal, distância muro-casa) — cite as medidas no prompt para a IA não errar a escala.
- Foto ruim: exposição/resolução se corrige (Snapseed, Upscayl grátis); **enquadramento errado se refotografa**. Satélite/Google Earth serve para layout aéreo conceitual, não para o render final.
- **Foto aérea de drone** (como o seu exemplo): excelente para masterplan/layout e aprovação do desenho do lago; para o "render de capa" que vende, complemente com 1 foto no nível dos olhos.

---

## 8. Uso comercial e risco jurídico no Brasil (importante)

- **Os termos das três plataformas permitem uso comercial** em propostas (OpenAI: "you own all Input and Output"; Google: não reivindica propriedade; Higgsfield §4.4: uso comercial e sublicenciamento ao cliente liberados). Todas proíbem apresentar a imagem como "real/humana" — identifique como simulação de IA.
- **Privacidade:** nos planos gratuitos, OpenAI e Google podem usar suas fotos (do imóvel do cliente!) para treinar modelos. Use plano pago/API ou desative o treinamento nas configurações. Na Higgsfield, conteúdo não-enterprise pode treinar modelos.
- **CDC art. 30:** informação "suficientemente precisa" **vincula o fornecedor** — um render fotorrealista anexado ao orçamento é exatamente isso; pelo art. 35 o cliente pode exigir o que foi mostrado. Jurisprudência (STJ, TJSP, TJDFT — casos de apartamento decorado) rejeita a defesa do "meramente ilustrativo" em letra miúda.
- **Prática segura (adote as 5):**
  1. **Selo na imagem** (ostensivo): *"SIMULAÇÃO DIGITAL GERADA POR IA — imagem conceitual, sem valor contratual. O resultado seguirá o memorial descritivo."*
  2. **Cláusula na proposta**: as imagens ilustram estilo e atmosfera; vinculam apenas memorial descritivo, lista de materiais e dimensões; tonalidade da água, pedras naturais e porte da vegetação (mostrada adulta) variam.
  3. **Render fiel ao escopo orçado** — não mostre cascata/deck/iluminação que não estão no orçamento (ou marque como opcionais).
  4. **Aceite do cliente** ("declaro ciência de que as imagens são simulações ilustrativas").
  5. **Guarde foto original, prompts e versões** como prova de boa-fé.

---

## 9. Workshop ArqExpress (o anúncio que você viu)

"Projeto Completo com IA" (Renata Pocztaruk, 22/08/2026, Zoom, R$ 57/R$ 197): cobre o fluxo do escritório inteiro (briefing → conceito → proposta → render → precificação). No Reclame Aqui há relato de "conteúdo superficial com foco em vender a plataforma ANA" e de bônus não entregues (volume baixo de queixas). **O material de prompts do workshop anterior é público** (PDF "PROJETO+IA — PROMPTS v02") e as técnicas de imagem foram extraídas e incorporadas ao nosso sistema: persona de "motor de render" (V-Ray/Enscape) + regras imutáveis de preservação; verbos de ação (ADICIONE, TRANSFORME, REMOVA, TROQUE); prompts em JSON com `constraints` (`preserve_geometry: true`); fluxos multi-imagem (foto + textura/moodboard); "Inserir Projeto em Terreno". A parte de imagem deles foca interiores e render de 3D — **não cobre** foto do local + rascunho + legenda, que é o seu diferencial. O workshop não é pré-requisito; por R$ 57 o risco é baixo se quiser ver o processo ao vivo.

---

## 10. Recomendação final de stack (custo x resultado)

| Cenário | Stack | Custo mensal aprox. |
|---|---|---|
| **Começar agora (recomendado)** | App Gemini (Nano Banana) grátis → Google AI Plus R$ 24,99 ou AI Pro R$ 96,99 quando o volume subir + ChatGPT Go R$ 39,99 como apoio para redigir prompts | R$ 0-137 |
| **Máximo controle visual** | Higgsfield Plus (pincel de máscara + referências + Angles + vídeo) | ~US$ 39 |
| **Automatizar depois** (integrar ao fluxo de orçamentos) | API Gemini (`gemini-3-pro-image`, 4K, proporção automática) | ~US$ 20 no seu volume |
| **Escala/fidelidade extrema** | ComfyUI + Flux Fill + ControlNet + Redux (nuvem) | ~US$ 10-35 + aprendizado |

**Fluxo comercial vencedor no nicho** (cases do setor): render sobre a foto real, entregue na visita ou em 24h, formato **antes/depois com a casa do cliente reconhecível** — é o reconhecimento do próprio quintal que gera o "efeito uau" — + vídeo curto do "depois" + selo de simulação + orçamento em que o TEXTO define o escopo. O projeto executivo continua sendo entregável técnico separado (e cobrado à parte).

---

## Anexos

Relatórios brutos por ângulo (com todas as fontes): pasta [`anexos/`](anexos/) — `chatgpt.md`, `higgsfield.md`, `ferramentas.md`, `youtube.md` (8 workflows de vídeo com links), `foruns.md`, `sd-controlnet.md`, `prompts.md` (10 prompts prontos PT/EN), `nicho-piscinas.md`, `gap1-nano-banana-direto.md`, `gap2-especificacao-foto.md`, `gap3-juridico-comercial.md`.
