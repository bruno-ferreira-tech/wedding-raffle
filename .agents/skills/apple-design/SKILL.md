---
name: apple-design
description: Use when designing, building, or refining user interfaces, web applications, components, visual themes, typography, or micro-interactions following Apple Human Interface Guidelines and Apple Design Principles (clarity, deference, depth, materials, liquid glass, spring physics, and accessibility)
---

# Apple Design System & Human Interface Guidelines (HIG)

## Overview

Design interfaces with the craftsmanship, restraint, and tactile delight of Apple’s Human Interface Guidelines (HIG) and Liquid Glass design system. This skill ensures web applications embody the three Apple themes—**Clarity**, **Deference**, and **Depth**—while delivering fluid physics-based interactions, optical precision, and accessible hierarchy.

---

## When to Use

- When building or refactoring user interfaces, landing pages, or SaaS dashboards to feel refined, premium, and native.
- When creating cards, modals, sheets, segmented controls, forms, or data displays.
- When implementing visual themes, blur materials, glassmorphism, or elevation layers.
- When designing motion, button press states, page transitions, or celebration animations.
- When organizing typography, spacing, or color palettes to meet high aesthetic and accessibility standards.

### When NOT to Use
- Pure backend tasks (database schemas, worker queues, API routing logic).
- Mechanical command-line scripts or headless services.
- Deliberately brutalist or retro 90s visual styles that reject polish and hierarchy.

---

## The Three Core Pillars

```
┌─────────────────────────────────────────────────────────────┐
│                       CLARITY                               │
│  Unambiguous purpose, generous whitespace, legible text     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│         DEFERENCE           │ │           DEPTH             │
│ Chrome steps back; content  │ │ Visual layers, Liquid Glass │
│ is the hero of the screen   │ │ materials & realistic motion│
└─────────────────────────────┘ └─────────────────────────────┘
```

1. **Clarity**: Eliminate clutter. Every element on screen must have a distinct, immediately obvious purpose. High contrast, precise iconography, and optical alignment.
2. **Deference**: The interface never competes with the user's content. Headers, controls, and footers stay translucent or minimalist so user data and actions remain the focus.
3. **Depth**: Use layers (canvas $\rightarrow$ card $\rightarrow$ floating bar $\rightarrow$ modal sheet) to establish place. Translucency and ambient shadows provide spatial hierarchy without rigid solid dividers.

---

## Design Principles Checklist

- [ ] **Aesthetic Integrity**: Does the visual design match the emotional context of the product (e.g. luxury wedding celebration vs utilitarian spreadsheet)?
- [ ] **Direct Manipulation**: Can the user directly touch, click, toggle, and drag elements rather than relying on abstract forms?
- [ ] **Immediate Feedback**: Does every button, tile, or card respond immediately on touch/pointer-down (`active:scale-[0.97]`)?
- [ ] **Continuous Curvature**: Are border radii rounded with continuous superellipse curves (squircles / `rounded-2xl` / `rounded-3xl` / `rounded-full`) rather than harsh small cuts?
- [ ] **SF Typographic Hierarchy**: Are headers tightly tracked (`tracking-tight`), body text readable, and numbers strictly tabular (`tabular-nums`)?
- [ ] **Materials & Liquid Glass**: Are surfaces styled with subtle backdrop blurs, specular rim borders (`rgba(255,255,255,0.12)`), and inner top glows?
- [ ] **Spring Physics**: Are transitions governed by damped cubic-bezier curves instead of robotic linear easing?
- [ ] **Accessibility (WCAG AA)**: Do all text and interactive elements pass contrast requirements? Are interactive targets $\ge 44 \times 44\text{px}$ on touch devices?

---

## Core Visual Patterns & Recipes

### 1. Liquid Glass Surface (WWDC 2025/2026 Material)
Use for floating navigation headers, quick-access cards, and control panels:

```tsx
// Tailwind Recipe for Apple Liquid Glass Card
<div className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
  {children}
</div>
```

### 2. Tactile Interactive Button (Spring Press)
Buttons must react instantly to pointer contact:

```tsx
<button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-105 active:scale-[0.97] disabled:opacity-50">
  {label}
</button>
```

### 3. Apple Segmented Control (Pill Switcher)
For mode selection, view switching, or filters:

```tsx
<div className="inline-flex rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-md">
  {options.map((option) => (
    <button
      key={option.value}
      onClick={() => setSelected(option.value)}
      className={`relative rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        selected === option.value
          ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
          : 'text-muted-foreground hover:text-white'
      }`}
    >
      {option.label}
    </button>
  ))}
</div>
```

### 4. Tabular Financial & Metric Counter
Prevents layout shifts as numbers animate:

```tsx
<span className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
  {formattedValue}
</span>
```

---

## Common Mistakes & Antipatterns

| Mistake | Apple HIG Fix |
|---|---|
| **Crammed, edge-to-edge elements** | Add generous padding (`p-6` / `p-8`) and whitespace; let the screen breathe. |
| **Heavy opaque black borders** | Use subtle translucent specular borders: `border border-white/10` with `inset 0 1px 0 rgba(255,255,255,0.1)`. |
| **Linear, robotic transitions** | Replace with spring curves: `ease-[cubic-bezier(0.16,1,0.3,1)]` and `duration-200` to `duration-300`. |
| **Jittery numbers during updates** | Apply `tabular-nums` / `font-variant-numeric: tabular-nums`. |
| **Tiny touch targets on mobile** | Ensure click/tap hitboxes are at least $44 \times 44\text{px}$ (`min-h-[44px] min-w-[44px]`). |
| **Decorations competing with content** | Strip non-functional badges, noisy patterns, and gradients; make the user's primary content heroic. |

---

## References & Supporting Files

- **Detailed Technical Guide**: [`references/guidelines.md`](references/guidelines.md) — Comprehensive reference on HIG typography scales, Liquid Glass tokens, and motion specifications.
- **Ready-to-Use CSS Classes**: [`resources/apple-ui-patterns.css`](resources/apple-ui-patterns.css) — Drop-in classes for `.apple-glass`, `.apple-pressable`, and `.apple-segmented-control`.
