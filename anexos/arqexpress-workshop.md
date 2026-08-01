# Anexo — Workshop ArqExpress "Projeto Completo com IA" e material público de prompts

## O evento (anúncio visto no Instagram)

- **O quê:** workshop ao vivo "Projeto Completo com IA" — ArqExpress / Renata Pocztaruk (@renatapocztaruk).
- **Quando:** 22/08/2026, 9h-16h, via Zoom.
- **Preço:** R$ 57 (Padrão) ou R$ 197 (Gold, com gravação por 1 ano). Garantia de 7 dias.
- **Conteúdo prometido:** briefing com IA → conceito/moodboard → proposta → render e apresentação → conferência técnica → precificação → orçamento/memorial. Ferramentas citadas: Claude, Gemini, ChatGPT e **ANA** (plataforma paga da própria ArqExpress).
- **Reputação:** empresa real e grande (10 mil+ projetos, 100 mil+ alunos declarados). No Reclame Aqui: reclamação de "conteúdo superficial e foco excessivo em venda da ferramenta ANA" em edição anterior, e outra de bônus não entregues. Volume de queixas baixo. Padrão "evento barato → upsell de plataforma" relatado por aluno.
- **Veredito para o Thiago:** não é pré-requisito — o foco de imagem deles é interiores/render de modelo 3D, não "foto do local + rascunho + referências". Por R$ 57, risco baixo se quiser ver o processo ao vivo.

## Material público analisado

PDF aberto do workshop anterior: [PROJETO+IA — PROMPTS v02](https://site.clubarqexpress.com.br/wp-content/uploads/2026/04/PROMPTS-Workshop-ProjetoIA-ArqExpress.pdf) (110+ páginas). Conteúdo: prompts de negócio (brand book, organização de serviços, precificação/hora técnica, proposta, briefing) + seção de imagem.

## Técnicas de imagem extraídas (incorporadas ao nosso sistema)

1. **Persona de "motor de render":** *"Você é um assistente especializado em arquitetura... Atua como um motor de renderização (V-Ray, Enscape ou Twinmotion), mantendo fidelidade total ao projeto original."* + regras imutáveis: não alterar formas/proporções/materiais; não adicionar/remover sem pedido explícito.
2. **Verbos de ação no início do prompt:** ADICIONE, TRANSFORME, MODIFIQUE, REMOVA, TROQUE, CRIE, COMBINE.
3. **Prompts em JSON** com bloco `constraints` (`preserve_geometry: true`, `preserve_materials: true`...) — formato que eles afirmam aumentar a obediência do modelo.
4. **Fluxos multi-imagem:** foto do espaço + foto de objeto/textura/moodboard → *"aplique X da segunda imagem na primeira, mantendo todos os detalhes originais"*.
5. **"Inserir Projeto em Terreno"** (o mais próximo do nosso caso, porém raso — sem marcação/legenda): *"Imagine um [projeto] nesse lote vazio da imagem, no estilo [X], com uma vista que dialogue com o entorno."*
6. **Variações como comandos separados:** render noturno ("ative apenas as fontes de luz que já existem na cena"), golden hour, croqui→render, planta→axonométrica, troca de piso/estofado/materiais.
7. **Gemini "Nano Banana"** usado por eles para edição direta de foto (trocar materiais, inserir móveis de moodboard em espaço vazio) — convergente com a conclusão da nossa pesquisa.
8. **Midjourney** para imagens conceituais do zero (prompts descritivos com câmera/lente — ex.: estilo Marcio Kogan, tilt-shift 24mm) — útil para referência de estilo quando não houver foto de obra própria.
