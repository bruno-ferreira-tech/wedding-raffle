# Spec: Cinematic Scroll Landing Page

## Contexto e Objetivo
Transformar a landing page do Corta-Gravata (`apps/web/src/app/page.tsx`) em uma experiência "cinematográfica" e de altíssimo luxo. O objetivo é eliminar o "padrão genérico de SaaS" e atingir a complexidade e coesão de grandes marcas (Apple, Stripe), utilizando `three.js`, `gsap`, `motion.dev` e `anime.js` de forma coreografada.

## 1. O Motor da Experiência (Three.js + GSAP)
- **Fundo Fixo (Pinned Canvas):** O canvas do `three.js` será desacoplado do grid HTML. Ele ficará em `position: fixed` preenchendo toda a tela no `z-0`. 
- **O Material Base:** Fundo em tom quente de papelaria (`#faf8f5`), garantindo aconchego (`avoid-ai-design`). Zero fundos escuros sintéticos ou neons espaciais.
- **Scroll Coreografado:** O conteúdo HTML rolará normalmente sobre o 3D. Utilizaremos o **GSAP ScrollTrigger** com `scrub: true` para ler a posição de rolagem e animar a câmera e a rotação/distância das alianças 3D em sincronia perfeita com as seções que passam por cima.

## 2. Interface Tátil e Iluminação Compartilhada
- **Sincronia de Luz:** A luz direcional virtual aplicada às alianças no WebGL terá o mesmo ângulo simulado pelas `box-shadow` CSS dos cartões de interface, criando a ilusão subconsciente de que os cartões e as alianças dividem o mesmo espaço físico.
- **Micro-interações (Motion.dev):** Todos os cartões interativos (Simulador, Funcionalidades) e o botão principal utilizarão molas físicas pesadas de alta precisão (`stiffness: 400`, `damping: 30`) no evento de `hover` ou `tap`, passando inércia e qualidade física.

## 3. Arquitetura dos Componentes de Interface
- **O Herói (Topo):** Tipografia serifada "editorial". Usaremos **Anime.js** para dividir o título ("O Corta-Gravata que arrecada mais") caractere por caractere (Split-text) e revelá-lo com suavidade.
- **Simulador de Lua de Mel:** Inspirado no arquétipo *"O Ticket de Papelaria"* da skill `ui-forager-skill`. Não será um painel de "dashboard", mas sim um cartão com textura sutil e bordas pontilhadas. As alterações no *slider* farão o cartão responder à pressão (Motion.dev), enquanto o **GSAP** cuidará da rolagem dramática dos números tabulares finais.
- **Telão e Funcionalidades:** Múltiplos painéis translúcidos ou opacos que entram na tela interceptando a visão das alianças (que neste momento estarão recuadas nas bordas via ScrollTrigger).

## 4. Estruturação do Código
- `apps/web/src/app/page.tsx`: Passará a ser o contêiner mestre com o `ScrollTrigger` global e o Canvas.
- Os cartões de features e simulador serão otimizados para evitar re-renderizações que engasguem a thread de animação (WebGL + DOM requer alta performance de 60fps).
- **Sem poluição IA:** Todas as propriedades CSS utilizarão os tokens quentes e físicos do `open-props` pré-mapeados (`var(--shadow-4)`, `var(--surface-canvas)`). Nenhuma tag de blur exagerada será aplicada aos fundos sem contexto.

## Verificação e Escopo
- Estão previstos apenas ajustes na camada de front-end visual de `page.tsx` e `hero-scene.tsx`. Nenhuma regra de negócio de API ou banco de dados será alterada. Escopo perfeitamente delimitado (Bounded/Architectural UI change).
