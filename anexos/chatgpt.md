# ChatGPT / gpt-image (OpenAI) para editar fotos reais de obra: o que funciona de verdade

## 1. Estado atual da tecnologia (agosto/2026)

- O gerador de imagens do ChatGPT hoje é o **GPT Image 1.5** (lançado em **16/12/2025** junto com a nova experiência "ChatGPT Images"), que substituiu o gpt-image-1 e o DALL·E (família DALL·E aposentada em maio/2026). A OpenAI anunciou o 1.5 exatamente com o argumento que interessa ao Thiago: "edições precisas mantendo detalhes intactos", melhor obediência ao prompt e preservação de rostos/logos, além de geração até 4x mais rápida.
- Na **API**, a documentação oficial (developers.openai.com) lista atualmente: `gpt-image-2` (mais recente), `gpt-image-1.5`, `gpt-image-1` e `gpt-image-1-mini`. O `gpt-image-2` processa **toda imagem de entrada automaticamente em alta fidelidade** (parâmetro `input_fidelity` não é mais configurável nele).
- Importante entender o mecanismo: o modelo **não edita pixels — ele regenera a imagem inteira** a cada pedido, tentando reproduzir o que não deve mudar. Isso explica quase todas as limitações abaixo.

## 2. Como funciona anexar foto e editar por cima (ChatGPT)

1. Anexe a foto real do local (clipe/“+”) e escreva o pedido de edição no mesmo turno.
2. O ChatGPT gera uma nova imagem baseada na foto. Com o GPT Image 1.5, a aderência à foto original melhorou muito em relação a 2024–2025, mas ainda não é cópia pixel-perfeita.
3. **Ferramenta de seleção (inpainting visual)**: clicando na imagem gerada (ou enviada) e abrindo o editor, existe um pincel de seleção — você pinta a área a alterar, ajusta o tamanho do pincel, clica em "Next" e descreve a mudança só daquela região. Funciona no web e no app. Limitação documentada pela própria OpenAI/Help Center: "as seleções não são sempre precisas e as edições podem se estender além da área selecionada".
4. **Múltiplas imagens no mesmo pedido**: dá para anexar várias imagens numa única mensagem (foto do quintal + 1–3 referências de estilo de lago/praia) e instruir: "a imagem 1 é o local real; as imagens 2 e 3 são apenas referência de estilo". Isso funciona e é a base do sistema de prompts dele. Em Projetos, o limite é ~20 arquivos por chat, ~20 MB por imagem.

## 3. Fidelidade: preserva ou redesenha? (a pergunta central)

- **gpt-image-1 (2025)**: a OpenAI **confirmou oficialmente** no fórum de desenvolvedores que o inpainting com máscara "regenera a imagem inteira" — é uma limitação conhecida, sem prazo de correção. Usuários chamaram de "re-imagining", não inpainting. A doc atual ainda avisa: "a máscara é usada como orientação, mas pode não seguir seu formato com precisão".
- **gpt-image-1.5 / Images 2.0 (atual)**: grande melhora declarada e percebida — edita "mudando só o que foi pedido, mantendo iluminação, composição e aparência das pessoas". Na API, o 1.5 preserva **as 5 primeiras imagens de entrada em alta fidelidade** quando `input_fidelity="high"` (que é o padrão no 1.5 — e custa ~10x mais tokens de entrada que "low").
- **Na prática, para arquitetura/paisagismo** (teste real documentado no blog Addicted2Decorating, foto da fachada da própria casa): o ChatGPT transformou a entrada de carros em calçada e "devolveu uma casa inteiramente nova"; mudou o ângulo da câmera; e ao corrigir um elemento, alterava outros já aprovados. Conclusão do teste: é preciso **dizer explicitamente o que manter** — o modelo não assume que o resto fica igual. Comparativos de imprensa (TechRadar) apontaram que o Gemini/Nano Banana ainda é melhor que o ChatGPT em "colar" na foto original.
- **Drift acumulado**: como cada edição regenera tudo, editar sobre a edição degrada a foto (proporções da casa, textura do muro, vegetação). Regra de ouro: **sempre reanexar a foto original** em cada revisão importante, em vez de iterar sobre a última geração.

## 4. Limitações concretas conhecidas

- **Proporção/enquadramento**: saídas só em tamanhos fixos (1024x1024, 1536x1024, 1024x1536; no gpt-image-2 até 3840px, lados múltiplos de 16, razão ≤ 3:1). Foto vertical de celular será reenquadrada; há relato no fórum de viés de corte no topo em 1024x1024. Para quintais, fotografar em **paisagem (horizontal)** e pedir 1536x1024.
- **Rostos e texto**: melhoraram no 1.5, mas texto pequeno (placas, logos) ainda falha; evitar pessoas na foto do local.
- **Bugs reportados no Images 2.0** (thread coletiva no fórum OpenAI): padrões de ruído/artefatos visíveis em superfícies estruturadas, **degradação após 3–5 gerações na mesma sessão** (o gerador reaproveita dados da conversa e amplifica ruído), pouca variação entre tentativas. Workarounds da comunidade: **abrir chat novo** a cada projeto/rodada, simplificar o prompt, e um passe final "remova o ruído mantendo todas as linhas".
- **Latência**: prompts complexos podem levar até ~2 minutos.

## 5. Planos e preços (verificar na data — câmbio varia)

- **ChatGPT Free**: ~2–3 imagens por 24h (número não oficial, relatos da comunidade). Inviável para uso profissional.
- **ChatGPT Go**: **R$ 39,99/mês** no Brasil (plano intermediário cobrado em reais, lançado no fim de 2025) — limites maiores de imagem; bom custo-benefício para começar.
- **ChatGPT Plus**: US$ 20/mês (~R$ 110+ conforme câmbio; App Store BR costuma cobrar R$ 119,90). Sem teto oficial; relatos apontam ~50 imagens/3h.
- **API** (para automatizar depois): gpt-image-1.5 a **US$ 0,009 / 0,034 / 0,133** por imagem 1024x1024 (low/medium/high); gpt-image-2 a US$ 0,006 / 0,053 / 0,211. Com `input_fidelity="high"` (necessário para preservar a foto), o custo de entrada sobe ~10x. Uma edição high fica em torno de US$ 0,15–0,25.

## 6. Workflow recomendado para o Thiago (ChatGPT Plus/Go)

1. Fotografe o local em horizontal, boa luz, sem pessoas; escolha 1 ângulo "hero".
2. Abra um **chat novo** por projeto. Anexe: foto do local + 1–2 referências de estilo (lago/praia já executados por ele).
3. Prompt-base (PT funciona bem): *"A imagem 1 é a foto real do quintal do meu cliente. As imagens 2 e 3 são APENAS referência de estilo. Edite por cima da imagem 1: substitua o gramado central por um lago ornamental com bordas de pedra natural, cascata baixa à esquerda e plantas aquáticas. NÃO altere: a casa, o muro, o telhado, a churrasqueira, o ângulo da câmera, a iluminação e as proporções da foto original. Resultado fotorrealista, como foto real do projeto concluído. Formato paisagem 1536x1024."*
4. Avalie; para ajustes locais, use a **ferramenta de seleção** (pincel) só na área do lago.
5. Para revisão maior, **reanexe a foto original** e reescreva o prompt completo (não empilhe edições).
6. Se surgir ruído/queda de qualidade após 3–5 gerações, abra chat novo e recomece da foto original.
7. Padronize um "template de prompt" com blocos fixos: [descrição do local] + [o que construir] + [lista NÃO ALTERE] + [estilo/materiais da referência] + [fotorrealismo/ângulo].

## 7. Veredito do ângulo OpenAI

O ChatGPT com GPT Image 1.5 **já é utilizável** para apresentações comerciais de lagos/piscinas de areia sobre foto real, com custo baixo (Go/Plus) e interface simples — mas **não garante fidelidade geométrica** da casa/muro em 100% dos casos: espere reenquadramentos, pequenas mudanças de fachada e necessidade de 2–4 tentativas por imagem. A seleção/inpainting é "orientativa", não cirúrgica (confirmado pela OpenAI). Para venda (impressão artística do projeto) é suficiente; para compromisso técnico de proporções, não. Informações de limites de imagens por plano são relatos de comunidade, não números oficiais; preços de API e câmbio devem ser reconfirmados na assinatura.

## FONTES
- [OpenAI — Image generation guide (docs oficiais: edits endpoint, input_fidelity, máscaras, tamanhos, modelos gpt-image-2/1.5/1/mini)](https://developers.openai.com/api/docs/guides/image-generation)
- [OpenAI — The new ChatGPT Images is here (anúncio do GPT Image 1.5, dez/2025)](https://openai.com/index/new-chatgpt-images-is-here/)
- [OpenAI API Reference — Create image edit](https://developers.openai.com/api/reference/python/resources/images/methods/edit)
- [OpenAI Developer Community — Inpainting com máscara no gpt-image-1 regenera a imagem inteira (limitação confirmada pela OpenAI)](https://community.openai.com/t/image-editing-inpainting-with-a-mask-for-gpt-image-1-replaces-the-entire-image/1244275)
- [OpenAI Developer Community — Coletânea de bugs e workarounds do gerador de imagens 2.0 (ruído, degradação por sessão)](https://community.openai.com/t/collection-of-gpt-image-generator-2-0-issues-bugs-and-work-around-tips-check-first-post/1379535)
- [OpenAI Developer Community — GPT-Image-1.5 rolling out in the API and ChatGPT](https://community.openai.com/t/gpt-image-1-5-rolling-out-in-the-api-and-chatgpt/1369443)
- [OpenAI Developer Community — Viés de corte/enquadramento do gpt-image-1 em 1024x1024](https://community.openai.com/t/gpt-image-1-bias-towards-cropping-with-1024x1024-aspect-ratio/1318395)
- [OpenAI Help Center — Editing your images with ChatGPT Images (ferramenta de seleção/pincel)](https://help.openai.com/en/articles/9055440-editing-your-images-with-dall-e)
- [OpenAI Help Center — Images in ChatGPT](https://help.openai.com/en/articles/11084440-images-in-chatgpt)
- [Addicted 2 Decorating — Teste real de paisagismo com foto da própria casa no ChatGPT (problemas de preservação)](https://www.addicted2decorating.com/how-to-use-chat-gpt-for-decorating-and-landscaping-ideas.html)
- [TechRadar — Comparação Gemini vs ChatGPT em fidelidade de edição de imagem](https://www.techradar.com/computing/artificial-intelligence/i-compared-google-geminis-new-image-editing-feature-to-chatgpts-and-its-much-better-at-sticking-to-the-original)
- [TechTudo — Prompts para renderizar projetos de arquitetura no ChatGPT (em português)](https://www.techtudo.com.br/listas/2026/04/prompts-para-renderizar-imagens-e-criar-projetos-de-arquitetura-no-chatgpt-edsoftwares.ghtml)
- [PiAPI — GPT Image 1 vs 1.5: comparação de preços por imagem (2026)](https://piapi.ai/blogs/gpt-image-1-5-vs-gpt-image-1-api-2026)
- [GPT Image — Limites de imagens por plano do ChatGPT em 2026 (Free/Go/Plus/Pro)](https://gptimg.co/blog/chatgpt-image-limits)
- [CometAPI — Preço da assinatura do ChatGPT Plus no Brasil (guia 2026, inclui ChatGPT Go R$ 39,99)](https://www.cometapi.com/chatgpt-plus-subscription-price-in-brazil-2026-guide/)
- [Fello AI — Tudo sobre o update GPT-Image-1.5](https://felloai.com/the-gpt-image-1-5-update-that-changes-everything/)
- [Olhar Digital — 6 prompts para editar fotos no ChatGPT (PT-BR)](https://olhardigital.com.br/2026/01/03/inteligencia-artificial/6-prompts-para-editar-fotos-no-chatgpt/)
