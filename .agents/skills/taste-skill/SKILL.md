---
name: taste-skill
description: Use when making high-level aesthetic decisions, curating visual direction, establishing editorial hierarchy, exercising design restraint, and crafting distinct, high-agency frontend experiences.
---

# Taste — Editorial Curation, Restraint & Aesthetic Judgment

## Overview

*Taste* is the ability to recognize what makes an experience deeply resonant, authentic, and memorable—and having the restraint to eliminate everything that detracts from it. 

Anyone can add more gradients, more floating badges, more animations, and more components. True design taste is subtractive: it curates, focuses, and elevates a single unforgettable concept with impeccable execution.

---

## When to Use

- When defining the creative direction or visual identity of a project or landing page.
- When choosing typography pairings, color palettes, materials, and art direction.
- When an interface feels cluttered, noisy, generic, or like a template, and needs decisive editorial pruning.
- When deciding what to highlight as the "Hero" and what must defer to the background.
- When ensuring the visual language resonates with the emotional reality of the subject matter.

### When NOT to Use
- Pure mechanical refactoring or bug fixes with no visual impact.
- Standardized internal admin tables with strict corporate UI kit constraints.
- Tasks where the user has already provided a fixed, non-negotiable Figma design to implement 1:1.

---

## Core Pillars of Design Taste

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTEXTUAL RESONANCE                     │
│  Does the design honor the emotional reality of the subject? │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│     RUTHLESS RESTRAINT      │ │     SIGNATURE MOTIF         │
│  One hero per view; kill    │ │ One unforgettable element   │
│  decorative clutter         │ │ that anchors the memory     │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## Core Principles

### 1. Contextual Resonance Over Aesthetic Trends
Never apply a design trend blindly without asking: *What is the emotional context of this product?*

- **A Wedding Celebration**: Warm, intimate, romantic, tactile, ceremonial. Materials should evoke fine stationery, warm linen (`#faf8f5`), 18K gold foil, letterpress depth, and celebration.
- **A Developer Tool**: Fast, precise, dense, keyboard-driven, high contrast, monospaced accents.
- **A Fintech Portal**: Solid, trustworthy, immaculate tabular alignment, calm slate and deep navy, crisp micro-borders.

> **Rule**: If a design looks like it could belong to any arbitrary SaaS startup, it lacks taste. Ground the aesthetics in the unique domain.

---

### 2. Ruthless Restraint (One Hero at a Time)
When everything screams for attention, nothing is heard.
- **Single Focal Point**: In any given viewport, identify the single primary element (e.g. the 3D wedding rings or the grand headline). Every other element—navigation, secondary badges, background patterns—must defer to it.
- **Silence & Whitespace**: Generous whitespace is not empty space; it is the frame that gives importance to what remains.
- **Kill the "AI Bloat"**: Resist the urge to add neon gradient orbs, floating emoji pills, particle swarms, and rainbow borders unless they have a direct narrative purpose.

---

### 3. Typographic Personality & Pairing
Typography carries 80% of an interface's soul.

- **Contrast of Voice**: Pair an expressive, editorial headline typeface with an invisible, highly legible neutral workhorse for body and UI controls:
  - *Editorial luxury*: A refined serif with graceful serifs (e.g., Cormorant Garamond, Playfair, Newsreader) + a crisp geometric sans (Inter, Geist, SF Pro).
  - *Modern craftsmanship*: An engineered display sans (Geist, Neue Haas Grotesk) + monospace data accents (JetBrains Mono, Geist Mono).
- **Scale Contrast**: Create dramatic scale differences. Don't make headlines $24\text{px}$ and body $16\text{px}$. Make headlines $56\text{px}$ or $72\text{px}$ and body $16\text{px}$ with generous leading (`leading-relaxed`).

---

### 4. Cohesive, Nuanced Color Stories
Tasteless design relies on raw hex values (`#ff0000`, `#0000ff`) or trendy neon pastels. Tasteful design uses curated, physical-world palettes:

- **Organic Neutrals**: Replace cold sterile grays (`#f3f4f6`) with warm stone, linen, or alabaster (`#faf8f5`, `#f5f2eb`, `#e7e2d7`).
- **Metallic & Accent Restraint**: A luxury gold is not bright yellow (`#ffff00`); it is rich, polished champagne gold (`#c5a059`, `#b38c46`, `#dfbe7e`).
- **60-30-10 Rule**: 
  - 60% dominant neutral surface (warm canvas).
  - 30% structural secondary (deep text, subtle card backings).
  - 10% intentional accent (gold CTA, celebratory badge).

---

### 5. High-Agency Layout & Composition
Break free of predictable "hero headline $\rightarrow$ 3 generic feature cards" boilerplate.

- **Editorial Pacing**: Treat scrolling like turning pages in an art monograph or high-end magazine. Alternate between intimate moments (tight quotes, quiet details) and grand cinematic reveals (full-bleed 3D stages, interactive showcases).
- **Asymmetrical Tension**: Use deliberate asymmetry to guide the eye naturally across the screen rather than forcing everything into centered stacks.
- **Tactile Materiality**: Incorporate subtle grain, letterpress debossing, or paper elevation that makes digital pixels feel tangible.

---

### 6. The Signature Element
Every world-class website has **one signature interaction or visual motif** that users remember and talk about:
- Stripe's interactive globe.
- Apple's dynamic island / liquid glass transitions.
- Anime.js's typography morphing into geometry.
- Wedding Raffle's gleaming 18K gold aliança stage with interactive ticket simulator.

Identify your signature element and execute it with flawless fidelity.

---

## Taste & Curation Checklist

- [ ] **Domain Authenticity**: Does the visual style authentically match the product's human context?
- [ ] **Single Focal Point**: Is it immediately clear what the hero of this viewport is?
- [ ] **Restraint**: Have decorative elements that don't serve a narrative or functional purpose been removed?
- [ ] **Typographic Point-of-View**: Does the font pairing have character and deliberate scale contrast?
- [ ] **Color Nuance**: Are colors organic, harmonious, and physically grounded rather than default neon or sterile gray?
- [ ] **Signature Memory**: Is there at least one standout detail or interaction that makes this experience memorable?

---

## Common Mistakes

| Mistake | Correction |
|---|---|
| Chasing every visual trend at once (glass + bento + neon glow + 3D) | Choose one coherent aesthetic direction and commit deeply to it. |
| Making everything compete for attention | Establish strict visual hierarchy: one hero, quiet companions. |
| Using sterile cool grays for emotional or celebratory products | Use warm organic tones (stone, linen, ivory, warm amber). |
| Predictable 3-box feature grid syndrome | Design an editorial layout with varying rhythm, scale, and asymmetry. |
| Over-decorating without functional or emotional reason | Remove decoration until only the essential, beautiful core remains. |
