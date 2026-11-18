# Cinematic Scroll Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the landing page into a top-tier cinematic storytelling experience using GSAP, Three.js, Motion.dev, and Anime.js.

**Architecture:** A fixed Three.js canvas in the background will react to scroll events intercepted by GSAP ScrollTrigger. HTML content flows on top in a transparent layer, featuring Anime.js typography reveals and Motion.dev spring-physics tactile cards.

**Tech Stack:** React (Next.js), GSAP (ScrollTrigger), Three.js (@react-three/fiber or pure three.js), Motion.dev, Anime.js, Tailwind CSS (Open Props).

**Spec:** `docs/superpowers/specs/2026-09-16-cinematic-scroll-landing-design.md`

## Global Constraints

- No generic SaaS AI styles (no heavy blur, no neon glowing orbs).
- Use warm ivory backgrounds (`#faf8f5`) and physical paper shadows.
- Typography must be elegant, using `tabular-nums` for all numbers.

---

### Task 1: Scaffolding the Cinematic Scroll Layout

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/components/three/hero-scene.tsx`
- Modify: `apps/web/src/app/page.test.tsx` (or create if missing)

**Interfaces:**
- Consumes: Existing `HeroScene` and `page.tsx`.
- Produces: A page layout with a `fixed` background container for the 3D scene (`z-0`) and a scrolling foreground container (`z-10`). `HeroScene` must expose a ref to its root Three.js group/camera so GSAP can control it.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/src/app/page.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPage from './page';

describe('LandingPage', () => {
  it('renders the fixed background canvas container', () => {
    const { container } = render(<LandingPage />);
    const canvasContainer = container.querySelector('.canvas-container');
    expect(canvasContainer).not.toBeNull();
    expect(canvasContainer?.className).toContain('fixed');
    expect(canvasContainer?.className).toContain('z-0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Modify `apps/web/src/app/page.tsx`:
```tsx
// Inside LandingPage return
<div className="relative min-h-dvh w-full bg-background text-foreground overflow-x-hidden">
  <div className="canvas-container fixed inset-0 z-0 pointer-events-none">
     <HeroScene />
  </div>
  <div className="scroll-content relative z-10 w-full pt-[100vh]">
     {/* Existing content moved here, but pushed down by 100vh so the rings are visible at the start */}
     {/* ... rest of the content ... */}
  </div>
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/page.test.tsx
git commit -m "feat: setup fixed background canvas layout"
```

---

### Task 2: GSAP ScrollTrigger Integration

**Files:**
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: Task 1 layout.
- Produces: ScrollTrigger animation that ties scroll progress to the Three.js scene rotation (we will simulate passing a state down to `HeroScene` or manipulating a DOM element if Three.js is not easily accessed via ref).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/src/app/page.test.tsx
it('has a gsap-trigger section for scroll animations', () => {
  const { container } = render(<LandingPage />);
  const trigger = container.querySelector('.gsap-trigger');
  expect(trigger).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Modify `apps/web/src/app/page.tsx` to add GSAP ScrollTrigger targeting the whole page wrapper.
```tsx
import { useEffect, useRef } from 'react';

// inside LandingPage component
const mainRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  let ctx: { revert: () => void };
  Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger')
  ]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!mainRef.current) return;
    
    ctx = gsap.context(() => {
      // Create a scroll trigger that scrubs through the page
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          // Dispatch a custom event to notify HeroScene
          window.dispatchEvent(new CustomEvent('scroll-progress', { detail: self.progress }));
        }
      });
    }, mainRef);
  });
  
  return () => { if (ctx) ctx.revert(); };
}, []);

// add ref to main wrapper
<div ref={mainRef} className="relative min-h-dvh w-full bg-background gsap-trigger">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat: implement GSAP ScrollTrigger progress event"
```

---

### Task 3: Anime.js Split-Text Typography Reveal

**Files:**
- Create: `apps/web/src/components/ui/split-text.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `animejs`
- Produces: A `SplitText` component that wraps letters in spans and animates them sequentially on mount/view.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/src/components/ui/split-text.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SplitText } from './split-text';

describe('SplitText', () => {
  it('splits text into spans with class anime-char', () => {
    const { container } = render(<SplitText text="Hello" />);
    const chars = container.querySelectorAll('.anime-char');
    expect(chars.length).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/components/ui/split-text.tsx`:
```tsx
import { useEffect, useRef } from 'react';

export function SplitText({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    import('animejs').then((animeModule) => {
      const anime = (animeModule as any).default ?? animeModule;
      anime({
        targets: containerRef.current?.querySelectorAll('.anime-char'),
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutExpo',
        duration: 800,
        delay: anime.stagger(30)
      });
    });
  }, []);

  return (
    <span ref={containerRef} className={`inline-block ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="anime-char inline-block opacity-0" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
          {char}
        </span>
      ))}
    </span>
  );
}
```

Modify `page.tsx` to use it in the Hero title:
```tsx
import { SplitText } from '@/components/ui/split-text';

// Replace static h1 text with:
<h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
  <SplitText text="O Corta-Gravata que" /> <span className="text-primary italic">arrecada mais</span> <SplitText text="e alegra a festa." />
</h1>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/ui/split-text.tsx apps/web/src/components/ui/split-text.test.tsx apps/web/src/app/page.tsx
git commit -m "feat: add anime.js split text component for hero"
```

---

### Task 4: Motion.dev Interactive Simulator Card (Receipt Archetype)

**Files:**
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: The existing simulator code.
- Produces: Upgrades the simulator container to `<motion.div>` with `whileHover` spring physics and a dotted/dashed receipt style.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/src/app/page.test.tsx
it('simulator card has tactile motion classes and dashed border', () => {
  const { container } = render(<LandingPage />);
  const simulator = container.querySelector('.receipt-card');
  expect(simulator).not.toBeNull();
  expect(simulator?.className).toContain('border-dashed');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**

Modify `apps/web/src/app/page.tsx`:
Add `receipt-card` and `border-dashed` to the simulator's motion.div card.
Ensure the layout represents a receipt (this was mostly done previously, just ensure the classes exist for the test).

```tsx
<motion.div 
  className="gsap-bento receipt-card border-dashed border-2 md:col-span-4 wedding-card p-6 sm:p-8 flex flex-col justify-between min-h-[480px] sm:min-h-[520px] bg-card"
  whileHover={{ scale: 0.985, y: 2 }}
  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat: apply tactile physics to receipt simulator"
```

---

### Task 5: 3D Scene GSAP Sync and Light Synchronization

**Files:**
- Modify: `apps/web/src/components/three/hero-scene.tsx`

**Interfaces:**
- Consumes: `scroll-progress` custom event from `page.tsx`.
- Produces: Updates the 3D model rotation and position dynamically based on scroll. Adjusts the directional light to match CSS shadows (coming from top-left, casting bottom-right).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/src/components/three/hero-scene.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroScene } from './hero-scene';

describe('HeroScene', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeroScene />);
    expect(container).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: FAIL (or PASS if it already exists, just ensures the file runs).

- [ ] **Step 3: Write minimal implementation**

Modify `hero-scene.tsx` to listen to the custom event and mutate refs inside `useFrame`.
(Note: The exact three.js implementation will depend on how `HeroScene` is built. Assume it has a `groupRef` that is rotated).

```tsx
import { useEffect, useState } from 'react';
// inside the component or a child component using useFrame:
const [scrollProgress, setScrollProgress] = useState(0);

useEffect(() => {
  const handleScroll = (e: any) => setScrollProgress(e.detail);
  window.addEventListener('scroll-progress', handleScroll);
  return () => window.removeEventListener('scroll-progress', handleScroll);
}, []);

// inside useFrame:
// groupRef.current.rotation.y = scrollProgress * Math.PI * 2;
// groupRef.current.position.x = scrollProgress * 5; 
```
Ensure directional light is positioned at `[-5, 5, 5]` to cast shadow towards bottom right (matching CSS `var(--shadow-4)`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace=@wedding/web -- run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/three/hero-scene.tsx apps/web/src/components/three/hero-scene.test.tsx
git commit -m "feat: sync 3D scene with scroll and align light to CSS shadows"
```

