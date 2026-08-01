# Sistema de Prompts v1 — Foto do local → projeto realista por cima

Sistema para gerar imagem fotorrealista de **lago ornamental / piscina de areia / paisagismo** editando por cima da foto real do cliente, guiado por rascunho desenhado (Paint) com legenda e por imagens de referência do portfólio.

Funciona em: **Gemini/Nano Banana** (recomendado), **Higgsfield AI Image Editor** (Nano Banana Pro com pincel) e **ChatGPT** (GPT Image, com bloco de preservação reforçado). Baseado na pesquisa em `pesquisa-completa.md`.

---

## 1. Os 5 princípios (extraídos da pesquisa)

1. **A IA regenera, não retoca** — tudo que você não mandar preservar, ela pode reinventar. Liste NOMINALMENTE o que manter.
2. **O rascunho é posicional, não literal** — sem legenda, a IA copia os traços do Paint ou os ignora. Sempre envie foto limpa + foto marcada + legenda.
3. **Referência do SEU portfólio > descrição de texto** — foto de obra sua já executada transfere material, cor de água e acabamento reais (e vende o seu padrão).
4. **Edição incremental** — um ajuste por vez ("mantenha esta imagem exata, mas..."). Prompt gigante reescrevendo tudo = casa redesenhada.
5. **Anti-drift** — a cada 3-5 gerações ou revisão grande: reanexe a FOTO ORIGINAL e recomece em chat novo. Nunca itere indefinidamente sobre imagem gerada.

---

## 2. Protocolo de captura (antes de qualquer prompt)

Mensagem pronta para o cliente (ou para você na visita):

> 📸 Para eu simular o projeto em cima da foto do seu espaço, preciso de fotos assim:
> 1. Celular na **horizontal**, câmera normal (1x), na altura dos olhos, sem inclinar;
> 2. Meio da manhã ou meio da tarde (dia nublado é ainda melhor);
> 3. Fique num **canto** do quintal e pegue o espaço todo: o chão onde vai o projeto + muro + casa + um pouco de céu;
> 4. Tire **4 fotos**, uma de cada canto olhando para o centro;
> 5. Envie como **DOCUMENTO** no WhatsApp (não como foto normal — perde qualidade).

Na visita, anote: largura × comprimento da área, distância muro↔casa, desnível. **Medidas entram no prompt.**

Drone/foto aérea: ótima para aprovar o LAYOUT (como no seu exemplo real em `exemplos/`); para o render "de capa", tenha também 1 foto no nível dos olhos.

---

## 3. Protocolo das imagens (o pacote que vai no chat)

| # | Imagem | Papel |
|---|---|---|
| 1 | **Foto limpa** do local | Base a preservar — é ela que a IA edita |
| 2 | **Foto marcada** (rascunho Paint/dedo por cima da MESMA foto) | Onde entra cada coisa (posicional) |
| 3-5 | **Referências do portfólio** (1 a 3) | Estilo, materiais, cor da água, acabamento |

### Legenda padrão das cores do rascunho (use SEMPRE as mesmas)

| Cor | Significa |
|---|---|
| 🔵 Azul | Espelho d'água (lago/piscina) |
| 🟡 Bege/amarelo | Praia de areia com entrada gradual |
| 🟤 Marrom | Borda de pedras naturais / limite do projeto |
| 🟢 Verde | Vegetação/paisagismo novo |
| 🔴 Vermelho | Cascata / queda d'água |
| ⚫ Preto | Deck de madeira |

Padronizar as cores permite reusar o mesmo prompt mestre em todos os projetos.

---

## 4. PROMPT MESTRE (copiar, preencher os [campos])

### Português (funciona em Gemini e ChatGPT; em inglês tende a ser um pouco mais estável — versão EN abaixo)

> Você atuará como um motor de renderização fotorrealista (como V-Ray ou Lumion) especializado em paisagismo, lagos ornamentais e piscinas de areia estilo praia.
>
> **IMAGEM 1** é a foto real do local do meu cliente. Ela é a base: o resultado deve ser ESTA MESMA FOTO com o projeto construído.
> **IMAGEM 2** é a mesma foto com um rascunho desenhado por cima. O desenho é apenas um mapa de POSIÇÃO — ele NÃO deve aparecer no resultado. Legenda do desenho:
> - ÁREA AZUL = espelho d'água de [lago ornamental / piscina natural de areia], água [turquesa translúcida / verde-esmeralda cristalina], profundidade aparente suave;
> - ÁREA BEGE = praia de areia clara compactada com entrada gradual na água (declive suave, estilo praia);
> - CONTORNO MARROM = borda de pedras naturais [tipo São Tomé / matacões de granito] e limite exato do projeto — NADA fora deste contorno pode ser alterado;
> - [demais cores usadas, conforme a legenda padrão].
> **IMAGENS 3[-5]** são obras já executadas por mim: use-as como referência FIEL de estilo, materiais, cor de água e acabamento.
>
> **Construa o projeto assim:** [descreva: ex. lago ornamental de 9×6 m com cascata baixa de pedra à esquerda, praia de areia na face sul, deck de cumaru de 2 m na borda leste, paisagismo tropical com coqueiros, filodendro Xanadu e helicônias].
> As medidas reais da área são [X × Y m]; respeite a escala usando o muro e a casa como referência.
>
> **PRESERVE EXATAMENTE, SEM NENHUMA ALTERAÇÃO:** a casa, telhado, janelas e portas; os muros e cercas; o portão; o piso existente fora do contorno marrom; as construções vizinhas; as árvores existentes fora da área do projeto; o céu; o ângulo e a altura da câmera; o enquadramento e a proporção da foto; a direção do sol e as sombras.
>
> Resultado: uma única imagem fotorrealista, como uma FOTOGRAFIA REAL do projeto concluído, mesma hora do dia da foto original, alta resolução, sem pessoas, sem textos, sem marca d'água, sem traços de desenho.

### English (para Higgsfield / quando quiser máxima estabilidade)

> Act as a photorealistic rendering engine (like V-Ray or Lumion) specialized in landscaping, ornamental ponds and beach-style sand pools.
>
> **IMAGE 1** is the real photo of my client's site. It is the base: the output must be THIS SAME PHOTO with the project built.
> **IMAGE 2** is the same photo with a rough sketch drawn on top. The sketch is only a POSITION map — it must NOT appear in the result. Sketch legend:
> - BLUE AREA = water surface of a [natural sand-bottom pool / ornamental pond], [translucent turquoise] water;
> - BEIGE AREA = light compacted sand beach with gradual zero-entry slope into the water;
> - BROWN OUTLINE = natural stone border and the exact project boundary — NOTHING outside this outline may change;
> - [other colors as per the standard legend].
> **IMAGES 3[-5]** are projects I have actually built: use them as FAITHFUL reference for style, materials, water color and finish.
>
> **Build the project as follows:** [e.g. 9×6 m ornamental pond with a low rock waterfall on the left, sand beach on the south face, 2 m cumaru wood deck on the east edge, tropical planting with coconut palms, Philodendron Xanadu and heliconias]. Real dimensions of the area: [X × Y m]; keep the scale using the wall and the house as reference.
>
> **PRESERVE EXACTLY, WITH NO CHANGES:** the house, roof, windows and doors; walls and fences; the gate; existing paving outside the brown outline; neighboring buildings; existing trees outside the project area; the sky; camera angle and height; framing and aspect ratio; sun direction and shadows.
>
> Output: one photorealistic image, like a REAL PHOTOGRAPH of the finished project, same time of day as the original photo, high resolution, no people, no text, no watermark, no sketch lines.

---

## 5. Ajustes por ferramenta

- **Gemini (app) / AI Studio**: anexe as imagens na ordem 1→5 e cole o prompt. No AI Studio/API use `gemini-3-pro-image`, resolução 2K (apresentação) ou 4K (fechamento/impressão) e NÃO fixe aspect ratio (herda o da foto). Rascunhos baratos: `gemini-3.1-flash-image`.
- **Higgsfield (AI Image Editor)**: suba a foto limpa como base, escolha **Nano Banana Pro**, **pinte com o pincel apenas a área do projeto** (o pincel substitui a imagem 2 — mas mantenha a legenda no texto para descrever o que entra em cada zona), anexe as referências e use a versão EN do prompt. Finalize com upscale 4K; gere o vídeo dolly-in para a proposta.
- **ChatGPT**: cole o prompt mestre + acrescente ao final: *"Não recrie a cena: trate esta tarefa como EDIÇÃO da imagem 1."* Confira a casa a cada geração; se algo escorregar, use a ferramenta de seleção (pincel) só na área errada. Formato 1536×1024.

---

## 6. Prompts de iteração (um ajuste por vez)

- *"Mantenha esta imagem exata, mas deixe a água um pouco mais [turquesa/verde]. Não mude mais nada."*
- *"Mantenha esta imagem exata, mas reduza a cascata pela metade e remova as duas pedras à esquerda."*
- *"Mantenha esta imagem exata, mas restaure o muro à cor original da foto que enviei primeiro."* (quando a IA "escorregar")
- *"Mantenha esta imagem exata, mas aumente a faixa de praia em ~1 metro para dentro da água."*
- Escala errada: *"A piscina ficou grande demais: a área real tem [X×Y m] e a largura do muro ao fundo é [Z m]. Reduza o projeto para a escala correta sem alterar mais nada."*

## 7. Variações comerciais (depois de aprovar a imagem-base)

- **Entardecer:** *"Mesma imagem exata, agora em golden hour: luz dourada baixa, sombras longas, reflexos quentes na água. Não altere geometria nem materiais."*
- **Noturna:** *"Mesma imagem exata, à noite: LEDs quentes submersos no lago, balizadores no paisagismo, luzes internas da casa acesas, céu blue hour. Ative apenas luzes plausíveis; não crie estruturas novas."*
- **Antes/depois:** monte lado a lado (foto original × render) — é o formato que mais converte segundo os cases do setor.
- **Vídeo (Higgsfield):** animar a imagem aprovada com dolly-in lento de 4-8 s.

## 8. Selo e cláusula (obrigatórios — CDC art. 30)

- **Na imagem:** `SIMULAÇÃO DIGITAL GERADA POR IA — imagem conceitual, sem valor contratual. O resultado final seguirá o memorial descritivo.`
- **Na proposta:** *"As imagens desta proposta são simulações conceituais geradas por computador (IA) sobre fotografia do local, destinadas a ilustrar estilo e atmosfera. Vinculam esta proposta apenas: (i) o memorial descritivo, (ii) a lista de materiais e equipamentos e (iii) as dimensões e quantitativos especificados. Tonalidade da água, coloração de pedras naturais, porte da vegetação (representada adulta) e acabamentos podem variar por se tratar de materiais naturais e organismos vivos."*
- Não mostre no render itens fora do orçamento (ou marque como OPCIONAL) e colha o aceite do cliente.

## 9. Checklist de qualidade antes de enviar ao cliente

- [ ] Casa, muro, portão e vizinhança idênticos à foto original (compare lado a lado com zoom)
- [ ] Perspectiva e sombras coerentes com o sol da foto
- [ ] Escala do lago/piscina compatível com as medidas reais
- [ ] Nenhum traço do rascunho visível; nenhum elemento "flutuante" ou planta irreal
- [ ] Só aparece o que está no orçamento (extras marcados como opcionais)
- [ ] Selo de simulação aplicado; foto original + prompts arquivados

---

## 10. Caso de teste oficial

`exemplos/exemplo-drone-marcacao.jpg` — foto aérea de drone com rascunho no Paint (azul = espelho d'água, bege = praia de areia, marrom = borda/limite). Preenchimento do prompt mestre para este caso: projeto = *"lago ornamental estilo piscina natural com praia de areia clara na face inferior (mais próxima da casa), borda de pedras naturais acompanhando o contorno marrom, água verde-esmeralda translúcida"*; preservar = *"a casa e telhado na parte inferior, a cerca viva à direita, as árvores (incluindo o flamboyant florido à esquerda), os quintais vizinhos, os fios elétricos, o ângulo aéreo do drone e o enquadramento"*.
