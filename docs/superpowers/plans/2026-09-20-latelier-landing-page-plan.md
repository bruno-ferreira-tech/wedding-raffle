# Landing Page "L'Atelier da Festa" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir do zero a landing page do Corta-Gravata em `apps/web/src/app/page.tsx`, aplicando a nova identidade editorial "L'Atelier da Festa" governada exclusivamente por `emil-kowalski`, `impeccable`, `taste-skill` e `avoid-ai-design`.

**Architecture:** A página adota uma narrativa editorial fluida em vez de atos mecânicos. Cada seção é tratada com acabamento milimétrico, superfícies de papel e linho, ouro 18K champanhe, números estritamente tabulares e física de molas naturais em todas as microinterações.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Motion.dev (`motion/react`), Three.js / R3F (`HeroScene`), Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-20-latelier-landing-page-design.md`

## Global Constraints

- **Paleta Oficial**: Fundo base em marfim aquecido (`#faf8f5`), linho suave (`#fdfbf7`), texto em carvão mineral (`#1c1917` / Stone 900) e ouro 18K champanhe (`#c5a059`, `#b89047`, `#d4af37`). Nunca usar `#000000` puro ou amarelos fluorescentes.
- **Rigor Tipográfico**: Todos os valores monetários, cotas, contadores e datas devem utilizar estritamente `tabular-nums`. Títulos com tracking negativo refinado (`tracking-tight`).
- **Acabamento Impeccable**: Todas as superfícies de cartões e botões dourados devem possuir bordas *hairline* sutis (`border-stone-900/[0.08]`) e reflexo especular na borda superior (`box-shadow: inset 0 1px 0 rgba(255,255,255,...)`).
- **Física de Molas**: Interações de clique e hover devem usar `whileTap={{ scale: 0.96 }}` e transições de mola com amortecimento calibrado (sem curvas robóticas ou excesso de oscilação).
- **Compatibilidade de Testes**: Preservar os seletores essenciais exigidos pela suíte de testes (`.canvas-container`, `.gsap-trigger`, `.receipt-card` com `border-dashed`).

---

### Task 1: Header Editorial & Hero com Pedestal 3D das Alianças

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Produces: Header minimalista com marca e botões de ação, e Hero com manchete monumental, botões primários com mola e arena `.canvas-container` para o `HeroScene`.

- [ ] **Step 1: Escrever os testes unitários/integração para o Header e Hero**

No arquivo `apps/web/src/app/page.test.tsx`, assegurar os testes:
```tsx
it('renders the 3D canvas container in the hero pedestal', () => {
  const { container } = render(<LandingPage />);
  const canvasContainer = container.querySelector('.canvas-container');
  expect(canvasContainer).not.toBeNull();
});

it('has a gsap-trigger section for scroll animations', () => {
  const { container } = render(<LandingPage />);
  const trigger = container.querySelector('.gsap-trigger');
  expect(trigger).not.toBeNull();
});
```

- [ ] **Step 2: Executar os testes para verificar conformidade**

Executar: `cmd.exe /c "npx vitest run src/app/page.test.tsx"` no diretório `apps/web`.

- [ ] **Step 3: Implementar o Header Editorial e o Hero com Pedestal**

Em `apps/web/src/app/page.tsx`:
- Header com marca "Corta-Gravata", badge "Rifa do Casal", botão "Entrar" e botão "Criar Nossa Rifa" com `whileTap={{ scale: 0.96 }}` e reflexo especular.
- Hero com manchete monumental, SplitText, botões de ação com mola tátil, 3 garantias (sem mensalidade, saque PIX, 3 minutos) e arena `.canvas-container` contendo o `HeroScene`.

- [ ] **Step 4: Executar os testes e validar**

Executar: `cmd.exe /c "npx vitest run src/app/page.test.tsx"` no diretório `apps/web`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: implement editorial header and hero with 3D pedestal"
```

---

### Task 2: O Bilhete da Sorte (Papelaria Fina Interativa)

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `InteractiveRaffleTicket` de `@/components/wedding/interactive-raffle-ticket`.
- Produces: Seção de experiência de papelaria com bilhete interativo, carimbo elástico e validação física.

- [ ] **Step 1: Adicionar asserção do bilhete nos testes**

No arquivo `apps/web/src/app/page.test.tsx`:
```tsx
it('renders the interactive ticket section', () => {
  const { container } = render(<LandingPage />);
  const ticket = container.querySelector('[aria-label="Bilhete de rifa interativo"]');
  expect(ticket).not.toBeNull();
});
```

- [ ] **Step 2: Implementar a seção do Bilhete de Papelaria Fina**

Em `apps/web/src/app/page.tsx`:
- Seção com fundo suave em linho (`#f7f4ed`), título editorial "O Comprovante que o Convidado Guarda", texto explicativo sobre o fim do papel picotado no chão e o componente `InteractiveRaffleTicket`.

- [ ] **Step 3: Executar testes e validar**

Executar: `cmd.exe /c "npx vitest run src/app/page.test.tsx"` em `apps/web`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: implement fine stationery ticket section"
```

---

### Task 3: A Dupla Dinâmica: Modo Padrinhos & O Telão da Festa

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `LiveTelaoPreview` de `@/components/wedding/live-telao-preview`.
- Produces: Vitrine dupla com demonstração tátil da ferramenta de bolso do padrinho (registro em 2 toques) e da projeção ao vivo do telão no salão (`LiveTelaoPreview`).

- [ ] **Step 1: Adicionar asserção dos componentes de vitrine nos testes**

No arquivo `apps/web/src/app/page.test.tsx`:
```tsx
it('renders the padrinho pocket mock and telao preview', () => {
  const { container } = render(<LandingPage />);
  const telao = container.querySelector('.live-telao');
  expect(telao).not.toBeNull();
});
```

- [ ] **Step 2: Implementar a vitrine dupla**

Em `apps/web/src/app/page.tsx`:
- Coluna 1 (Modo Padrinhos): interface de celular de bolso que simula o padrinho na mesa selecionando 2 cotas e recebendo PIX instantâneo.
- Coluna 2 (O Telão da Festa): painel com fundo em veludo espresso escuro (`#161311`), rim light dourado e componente `LiveTelaoPreview`.

- [ ] **Step 3: Executar testes e validar**

Executar: `cmd.exe /c "npx vitest run src/app/page.test.tsx"` em `apps/web`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: implement dual showcase for padrinhos mode and live telao"
```

---

### Task 4: Calculadora da Lua de Mel em Formato de Recibo

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `NumberTicker` de `@/components/ui/number-ticker`, `formatBRL` de `@/lib/money`.
- Produces: `.receipt-card` com `border-dashed`, sliders responsivos, valores tabulares (`tabular-nums`) e reação cinética no valor líquido.

- [ ] **Step 1: Verificar asserções do simulador nos testes**

No arquivo `apps/web/src/app/page.test.tsx`:
```tsx
it('simulator card has tactile motion classes and dashed border', () => {
  const { container } = render(<LandingPage />);
  const simulator = container.querySelector('.receipt-card');
  expect(simulator).not.toBeNull();
  expect(simulator?.className).toContain('border-dashed');
});
```

- [ ] **Step 2: Implementar a Calculadora da Lua de Mel**

Em `apps/web/src/app/page.tsx`:
- Card em formato de recibo com bordas pontilhadas, sombra física de papel de 3 paradas, sliders estilizados com feedback elástico e cálculo instantâneo do valor bruto, taxa de 4.9% e valor líquido para a lua de mel.

- [ ] **Step 3: Executar testes e validar**

Executar: `cmd.exe /c "npx vitest run src/app/page.test.tsx"` em `apps/web`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: implement honeymoon receipt calculator"
```

---

### Task 5: Grand Finale, Fita Marquee Acetinada & Rodapé

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `Marquee` de `@/components/ui/marquee`.
- Produces: Chamada final para ação com botão dourado e mola, fita contínua em cetim dourado e rodapé editorial com copyright.

- [ ] **Step 1: Implementar o Grand Finale, a Fita Marquee e o Rodapé**

Em `apps/web/src/app/page.tsx`:
- Seção de celebração com convite caloroso para os noivos, botões de ação com mola tátil, fita marquee contínua em tom de cetim artesanal e rodapé limpo.

- [ ] **Step 2: Executar testes completos e checagem de tipos**

Executar:
1. `cmd.exe /c "npx vitest run src/app/page.test.tsx"` em `apps/web`.
2. `cmd.exe /c "npx tsc --noEmit"` em `apps/web`.

- [ ] **Step 3: Commit final**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: complete L'Atelier da Festa landing page implementation"
```
