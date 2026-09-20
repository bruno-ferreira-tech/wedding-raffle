---
name: emil-kowalski
description: Use when designing or implementing animations on the web, micro-interactions, spring physics, gesture-driven interfaces, fluid layout transitions, drawer and toast behaviors, or perceived performance optimizations.
---

# Emil Kowalski — Animations on the Web & Micro-Interactions

## Overview

Inspired by Emil Kowalski's philosophy on web animations, interface craft, and physical interactions (creator of Vaul, Sonner, and *Animations on the Web*).

Great UI animations are not decorative flourish—they provide spatial continuity, tactile confirmation, direct manipulation, and perceived speed. When done right, users don't think "that's a nice animation"; they think "this app feels incredible to use."

---

## When to Use

- When animating interactive components: buttons, toggles, dropdowns, dialogs, drawers, toasts, and segmented controls.
- When orchestrating page transitions, layout shifts, or shared element transitions (`layout`, `layoutId`).
- When implementing gesture-driven or drag-to-dismiss interactions (sheets, carousels, cards).
- When tuning spring physics (stiffness, damping, mass) to replace robotic CSS cubic-beziers.
- When optimizing perceived performance: optimistic updates, skeleton-to-content transitions, and micro-staggers.

### When NOT to Use
- Pure business logic, API queries, or database migrations.
- Static documents or print stylesheets.
- Heavy decorative animations that block user interaction or exceed 400ms without physical justification.

---

## Core Principles

### 1. Springs Over Easing Curves
Natural objects in the physical world have mass, inertia, and elasticity. They don't follow static cubic-bezier time curves; they react with spring dynamics.

- **Damping & Stiffness**:
  - High stiffness + high damping = Snappy, responsive, zero wobble (ideal for UI controls, dropdowns, switches).
  - Moderate stiffness + slight bounce = Friendly, tactile (ideal for celebrations, like/bookmark buttons, badge popups).
  - Never use extreme underdamping (excessive rubber-band oscillation) for structural UI—it slows the user down.

```typescript
// Motion.dev / Framer Motion Spring Presets

// 1. Snappy & Crisp (controls, menus, drawers)
export const springSnappy = {
  type: "spring",
  stiffness: 400,
  damping: 35,
  mass: 0.8,
};

// 2. Tactile & Bouncy (feedback icons, likes, badges)
export const springBouncy = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

// 3. Smooth & Heavy (large dialogs, page sheets)
export const springSmooth = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 1.2,
};
```

---

### 2. Interruptibility
**Every animation must be interruptible.**
If a user taps "Open", then immediately taps "Close", the modal or drawer must not wait for the open animation to finish before reversing. It must seamlessly transition from its current mid-flight velocity and position.

- Use physics-based engines (`motion/react`, `motion.dev`) that preserve velocity on interruption.
- Avoid CSS keyframes for interactions that can be reversed mid-transition.

---

### 3. Spatial Continuity & FLIP Transitions
Never let an element suddenly vanish and reappear elsewhere. Connect states visually:
- When a card expands into a modal, use `layoutId` so the card *physically becomes* the modal.
- When list items are reordered or removed, animate siblings to their new positions using FLIP (`layout`).
- When tabs change, slide an active pill indicator (`layoutId="active-pill"`) across the bar.

```tsx
// Active tab indicator with spatial continuity
{tabs.map((tab) => (
  <button
    key={tab.id}
    onClick={() => setActiveTab(tab.id)}
    className="relative px-4 py-2 text-sm font-medium transition-colors"
  >
    {activeTab === tab.id && (
      <motion.div
        layoutId="active-pill"
        className="absolute inset-0 rounded-full bg-stone-900 shadow-sm"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
    <span className={cn("relative z-10", activeTab === tab.id ? "text-white" : "text-stone-600")}>
      {tab.label}
    </span>
  </button>
))}
```

---

### 4. Direct Manipulation & Gesture Preservation
When dragging a drawer (Vaul pattern) or swiping a toast (Sonner pattern):
- The element must track 1:1 with the pointer position while dragging.
- When released, calculate the release **velocity**: if flicked quickly downward, dismiss even if it hasn't passed the 50% distance threshold.
- Apply rubber-banding (logarithmic resistance) when dragged past boundary limits.

---

### 5. Scale & Micro-Press Feedback
Every clickable control needs instant physical feedback on pointer down:
- Scale down slightly on press: `active:scale-[0.97]` or `whileTap={{ scale: 0.96 }}`.
- Transition out quickly, return with a crisp spring.
- Don't scale text or iconography independently—scale the container surface to preserve crisp rendering.

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.96 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-md"
>
  Confirm Action
</motion.button>
```

---

### 6. Perceived Performance & Micro-Staggers
- **Entrance animations must be fast**: Enter in 150–250ms. Never make users wait 1 second for text to reveal itself.
- **Stagger subtly**: 20ms to 40ms stagger between list items. Staggers above 80ms feel sluggish.
- **Exit faster than enter**: Exit animations should be 20–30% faster than entrance animations (120–180ms) and fade out cleanly.

```tsx
// Micro-stagger container
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // 30ms stagger, snappy and continuous
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 28 },
  },
};
```

---

## Design & Motion Checklist

- [ ] **Instant Response**: Does the UI react within 16ms of user touch/click?
- [ ] **Spring Dynamics**: Are motion curves governed by natural springs rather than linear or abrupt easings?
- [ ] **No Layout Thrashing**: Are animations using GPU-accelerated properties (`transform: translate3d/scale/rotate`, `opacity`)?
- [ ] **Interruptible**: Can the user cancel or reverse the animation mid-stream without glitches?
- [ ] **Spatial Grounding**: Does the element enter from where it originated (e.g. menu spawns from its trigger button)?
- [ ] **Reduced Motion**: Is `prefers-reduced-motion` honored with simple instant fades?

---

## Common Mistakes

| Mistake | Correction |
|---|---|
| Overly slow floaty transitions (>500ms) | Keep micro-interactions under 200ms; structural under 350ms. |
| Excessive bouncy wobble on data tables/forms | Use critically damped springs (`damping: 30-35`, `stiffness: 350-400`). |
| Animating `width`, `height`, `top`, or `margin` directly | Use `transform` with scale or FLIP/`layout` animations. |
| Forgetting `whileTap` / active state feedback | Every primary button and interactive card must register touch down. |
| Making the user wait for an animation to click a button | Interactive elements must be clickable immediately upon rendering. |
