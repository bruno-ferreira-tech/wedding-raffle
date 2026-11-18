# Spec: Anime.js Inspired Pinned Stage Landing Page

## Contexto e Diagnóstico
A landing page anterior utilizava um canvas Three.js fixo em tela cheia que ficava posicionado diretamente atrás dos cartões e textos da página, prejudicando a legibilidade e criando um aspecto desorganizado ("aliança flutuando atrás das coisas"). 

O objetivo desta reestruturação é adotar o modelo consagrado do **animejs.com** e dos lançamentos da **Apple**: um **Palco Central Pinned (fixado)** controlado pelo scroll, onde a cena central se transforma em 5 atos temáticos sequenciais, sem nunca sobrepor o modelo 3D ao texto de leitura, garantindo máxima sofisticação e clareza.

---

## 1. Arquitetura do Palco Central Pinned (GSAP ScrollTrigger)
- **Container Sticky:** A página hospeda uma seção com altura de rolagem expandida (`h-[500vh]`) que trava um viewport `sticky top-0 h-dvh` durante a rolagem.
- **Scroll Timeline Controller:** O GSAP ScrollTrigger mapeia a rolagem de 0.0 a 1.0 em 5 fases distintas (`phase 0` a `phase 4`).
- **Navegador de Atos (Top Act Bar):** Pílula minimalista suspensa no topo do palco com indicador de progresso ativo:
  1. O Vínculo
  2. O Bilhete
  3. A Arrecadação
  4. O Telão
  5. A Celebração

---

## 2. Os 5 Atos da Apresentação

### Ato 1: O Vínculo (Hero 3D Limpo)
- **Espaço Dedicado:** As alianças 3D giram majestosamente em seu próprio pedestal central (`HeroScene`), iluminadas por luzes douradas e partículas sutis.
- **Tipografia:** Título monumental acima do pedestal usando `SplitText` ("O Corta-Gravata que arrecada mais e alegra a festa") e subtítulo explicativo com espaçamento editorial generoso.
- **Zero Interferência:** Nenhum card ou texto passa por cima das alianças.

### Ato 2: O Bilhete Tátil (`InteractiveRaffleTicket`)
- O scroll move a cena 3D suavemente e coloca em destaque central o **Bilhete Físico de Papelaria** (`ui-forager-skill`):
  - Recortes de picote nas laterais e textura de papel de linho.
  - Carimbo interativo `✓ CONFIRMADO • PAGO` com animação de impacto elástico (Anime.js v4) e vibração tátil ao toque.
  - Informações de cota, número de série (`№ 0482`) e valor claramente visíveis.

### Ato 3: A Matemática da Lua de Mel (`Simulador da Festa`)
- A cena central transiciona com física de mola (`motion.dev`) para o **Simulador de Receita**:
  - Sliders táteis de convidados e valor da cota.
  - Tickers numéricos tabulares (`tabular-nums`) que sobem em tempo real com reação cinética do GSAP (`scale` e brilho dourado).

### Ato 4: A Pista de Dança & Telão (`LiveTelaoPreview`)
- O palco escurece suavemente para o tom veludo noturno da festa (`#171513`), exibindo a projeção do salão nobre:
  - Total arrecadado monumental em dourado champanhe (`#d4af37`).
  - Feed de compras em tempo real com entradas fluidas.
  - Botão interativo para testar o disparo de nova cota no telão.

### Ato 5: O Brinde & Chamada para Ação
- As alianças 3D retornam ao centro unidas e com o solitário lapidado cintilando.
- Surge a chamada final de celebração e o botão com brilho dourado (`wedding-shimmer`) convidando os noivos a criar a rifa gratuitamente.

---

## 3. Diretrizes de Design & Anti-AI
- **Paleta Orgânica:** Marfim aquecido (`#faf8f5`), linho suave (`#fdfbf7`), carvão suave (`#262320`) e ouro champanhe (`#b89047`).
- **Sem clichês de IA:** Zero esferas de neon desfocadas no fundo, zero gradientes fluorescentes, zero glassmorphism excessivo (`avoid-ai-design`).
- **Física Real:** Curvas de aceleração de mola (`spring physics`) em todos os toques e arrastes.

---

## 4. Plano de Verificação
- Testes unitários com Vitest para renderização de cada ato.
- Verificação de ausência de erros de tipagem com TypeScript (`tsc --noEmit`).
- Teste de responsividade em viewports mobile e desktop.
