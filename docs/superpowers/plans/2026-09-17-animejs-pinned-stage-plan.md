# Anime.js Inspired Pinned Stage Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page into a clean, theatrical pinned-stage experience inspired by animejs.com, completely eliminating 3D text collisions and presenting the wedding raffle in 5 clearly choreographed acts.

**Architecture:** A sticky stage viewport (`sticky top-0 h-dvh`) pinned by GSAP ScrollTrigger inside an expanded scroll runway (`h-[500vh]`). The scroll position drives a stage phase (`0` to `4`), cleanly transitioning the central scene between the 3D emblem pedestal, the physical ticket stub, the honeymoon revenue simulator, the night telão projection, and the grand finale.

**Tech Stack:** Next.js (App Router), GSAP (ScrollTrigger), Three.js (HeroScene), Motion.dev, Anime.js v4, Tailwind CSS, Open Props.

**Spec:** `docs/superpowers/specs/2026-09-17-animejs-pinned-stage-design.md`

## Global Constraints

- Never place the 3D canvas directly behind text or interactive controls; the 3D model must inhabit its own dedicated visual arena.
- Retain warm ivory/linen backgrounds (`#faf8f5`, `#fdfbf7`) and layered paper elevation shadows; strictly no generic AI glowing neon orbs (`avoid-ai-design`).
- All currency and numerical statistics must use tabular lining numerals (`tabular-nums`).

---

### Task 1: Pinned Stage Architecture & Act Phase Controller

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: GSAP ScrollTrigger.
- Produces: A sticky stage container (`.pinned-stage`) with `activeAct` state (0 to 4) controlled by scroll progress and an interactive top act navigation bar.

- [ ] **Step 1: Write failing test**

```tsx
// apps/web/src/app/page.test.tsx
it('renders the pinned stage container and act indicator', () => {
  const { container } = render(<LandingPage />);
  const stage = container.querySelector('.pinned-stage');
  const actIndicator = container.querySelector('.act-indicator');
  expect(stage).not.toBeNull();
  expect(actIndicator).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: FAIL.

- [ ] **Step 3: Implement minimal code**

Modify `apps/web/src/app/page.tsx` to establish the runway container (`h-[450vh]`), the sticky stage container (`sticky top-0 h-dvh pinned-stage`), the top act pill navigation bar (`.act-indicator`), and GSAP ScrollTrigger updating `activeAct` from 0 to 4.

- [ ] **Step 4: Run test to verify pass**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: setup pinned stage architecture and act controller"
```

---

### Task 2: Act 1 (O Vínculo) - Clean 3D Pedestal Stage

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `HeroScene`, `SplitText`.
- Produces: Dedicated 3D pedestal view where the rings rotate cleanly below the title without any overlapping text or background collisions.

- [ ] **Step 1: Write failing test**

```tsx
// apps/web/src/app/page.test.tsx
it('renders dedicated 3D pedestal stage in Act 1 without background overlap', () => {
  const { container } = render(<LandingPage />);
  const pedestal = container.querySelector('.pedestal-stage');
  expect(pedestal).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: FAIL.

- [ ] **Step 3: Implement minimal code**

In `page.tsx`, mount `HeroScene` strictly within `.pedestal-stage` in Act 1, with clear negative space, elegant serif typography, and clear action button.

- [ ] **Step 4: Run test to verify pass**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: implement clean 3D pedestal stage for Act 1"
```

---

### Task 3: Act 2 & 3 - Physical Ticket & Honeymoon Simulator Stages

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `InteractiveRaffleTicket`, calculator sliders.
- Produces: Focused stage transitions where the ticket stub takes center stage in Act 2, and the revenue simulator takes center stage in Act 3.

- [ ] **Step 1: Write failing test**

```tsx
// apps/web/src/app/page.test.tsx
it('renders ticket and simulator stages in dedicated act viewports', () => {
  const { container } = render(<LandingPage />);
  const ticketAct = container.querySelector('.stage-act-ticket');
  const simAct = container.querySelector('.stage-act-simulator');
  expect(ticketAct).not.toBeNull();
  expect(simAct).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: FAIL.

- [ ] **Step 3: Implement minimal code**

Implement the AnimatePresence / Motion stage transitions between Act 2 (`stage-act-ticket` displaying `InteractiveRaffleTicket`) and Act 3 (`stage-act-simulator` displaying the simulator card with Open Props elevation and dashed borders).

- [ ] **Step 4: Run test to verify pass**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: implement dedicated ticket and simulator act stages"
```

---

### Task 4: Act 4 & 5 - Night Telão & Grand Finale Stages

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `LiveTelaoPreview`, primary CTA.
- Produces: Velvet night projection in Act 4, followed by final 3D rings celebration reunion and CTA in Act 5.

- [ ] **Step 1: Write failing test**

```tsx
// apps/web/src/app/page.test.tsx
it('renders telao and finale stages in dedicated act viewports', () => {
  const { container } = render(<LandingPage />);
  const telaoAct = container.querySelector('.stage-act-telao');
  const finaleAct = container.querySelector('.stage-act-finale');
  expect(telaoAct).not.toBeNull();
  expect(finaleAct).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: FAIL.

- [ ] **Step 3: Implement minimal code**

Implement Act 4 with dark velvet background transition and `LiveTelaoPreview`, and Act 5 with reunited rings, golden sparkle particles, and primary CTA.

- [ ] **Step 4: Run test to verify pass**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: implement night telao and finale stages"
```

---

### Task 5: Mobile Ergonomics & Production Verification

**Files:**
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: Seamless touch navigation on mobile (with swipe / step buttons), verifying all 16+ tests pass and `next build` compiles cleanly with zero warnings.

- [ ] **Step 1: Verify test suite**

Run: `cmd /c "npm run test --workspace=@wedding/web -- run"`
Expected: PASS (all tests).

- [ ] **Step 2: Verify TypeScript strict check**

Run: `cmd /c "npx tsc --noEmit --project apps/web/tsconfig.json"`
Expected: PASS (0 errors).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat: finalize animejs-style pinned stage landing page"
```
