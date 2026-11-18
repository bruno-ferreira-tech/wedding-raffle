# Apple Design System & Human Interface Guidelines (HIG) Reference

Comprehensive guide to applying Apple's design principles, visual language, and interaction models to modern web and SaaS applications.

---

## 1. The Core Design Themes (The Apple Triad)

Apple’s interface philosophy across iOS, macOS, iPadOS, and visionOS rests on three foundational pillars:

### Clarity
- **Unambiguous Purpose**: Every interface element exists for a distinct reason. If an icon, badge, border, or text line does not aid comprehension or user progress, remove it.
- **Negative Space**: Generous whitespace gives elements room to breathe. High visual density produces cognitive fatigue; Apple interfaces emphasize intentional spacing over cramming.
- **Legibility**: Text must remain crisp and readable at all sizes with sufficient optical weight, dynamic contrast ratios, and purposeful typographic hierarchy.

### Deference
- **Content is Hero**: The chrome (navigation bars, sidebars, dividers, buttons) steps back. The user’s core content (photos, tickets, numbers, revenue metrics, celebratory moments) takes center stage.
- **Unobtrusive Overlays**: Toolbars, floating headers, and controls use translucency and background blur rather than opaque blocking colors, hinting at continuous content beneath.
- **Fluid Layout**: Layouts adapt organically to screen orientations, window resizing, and device classes rather than forcing artificial boundaries.

### Depth
- **Spatial Hierarchy**: Visual layers (base canvas $\rightarrow$ grouped cards $\rightarrow$ floating control bars $\rightarrow$ modal sheets $\rightarrow$ toast notifications) clarify context and location.
- **Translucency & Refraction**: Surfaces reflect and refract what lies behind them through real-time backdrop blur and subtle border highlights.
- **Realistic Motion**: Elements don't pop abruptly into view; they glide, expand, or settle using realistic spring physics.

---

## 2. The Six Interaction Principles

1. **Aesthetic Integrity**: How seamlessly visual design aligns with an app’s purpose. A premium wedding raffle must evoke celebration, luxury, elegance, and trust—not an arcade slot machine or a bland database table.
2. **Consistency**: Use standardized interaction idioms. Buttons look clickable, badges convey state, navigation remains predictable, and system typography stays uniform.
3. **Direct Manipulation**: Users interact with digital items directly (toggling cards, selecting raffle numbers, dragging sliders, swiping drawers) rather than filling out decoupled mechanical forms.
4. **Immediate Feedback**: Every user interaction (click, hover, purchase, copy) receives instantaneous, perceptible feedback (visual scale down on press, subtle highlight, sound/haptic or toast confirmation).
5. **Real-World Metaphors**: Ground digital concepts in familiar physical objects—such as raffle tickets with perforation lines, physical greeting cards, velvet finishes, gold emboss, and celebratory confetti.
6. **User Empowerment & Control**: The user remains the driver. Destructive operations require confirmation; actions are reversible; processes show clear cancellation paths.

---

## 3. Visual Language & Foundations

### 3.1 Materials & Liquid Glass (WWDC 2025 / 2026)
Moving beyond flat design and simple frosted glass, Apple’s **Liquid Glass** architecture treats interface surfaces as dynamic optical lenses:

| Property | Value (CSS) | Effect |
|---|---|---|
| **Backdrop Blur** | `backdrop-filter: blur(20px) saturate(180%)` | Softens background content while preserving vibrancy |
| **Material Tint** | `rgba(20, 24, 38, 0.65)` (Dark) / `rgba(255, 255, 255, 0.72)` (Light) | Provides base tonal tint |
| **Specular Rim Light** | `border: 1px solid rgba(255, 255, 255, 0.12)` | Simulates edge reflection on glass |
| **Inner Bevel Glow** | `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15)` | Optical top edge refraction |
| **Ambient Depth Shadow**| `box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.5)` | Separates surface from background |

### 3.2 Continuous Curvature ("Squircle")
Apple does not use standard circular border radii where lines suddenly bend. It uses continuous curvature (superellipses):
- Small Buttons / Badges: `border-radius: 9999px` (Pill shape)
- Medium Cards / Inputs: `border-radius: 16px` to `20px`
- Large Modal Sheets: `border-radius: 24px` to `32px`

### 3.3 Typography & Hierarchy (SF Pro System)
Apple’s San Francisco typeface relies on strict visual scale and optical tracking:

| Style | Font Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|
| **Large Title** | 34px (2.125rem) | Bold (700) | 41px (1.2) | `-0.025em` | Top-level page headers |
| **Title 1** | 28px (1.75rem) | Bold (700) | 34px (1.2) | `-0.02em` | Section headers, card titles |
| **Title 2** | 22px (1.375rem) | Semibold (600) | 28px (1.25) | `-0.015em` | Subsection titles, modal headers |
| **Headline** | 17px (1.0625rem) | Semibold (600) | 22px (1.3) | `-0.01em` | Card labels, emphasized items |
| **Body** | 17px (1.0625rem) | Regular (400) | 22px (1.3) | `0em` | Primary reading text |
| **Callout** | 16px (1rem) | Regular (400) | 21px (1.3) | `0em` | Explanatory banners, tooltips |
| **Subheadline** | 15px (0.9375rem) | Regular (400) | 20px (1.3) | `0em` | Metadata, secondary descriptions |
| **Footnote** | 13px (0.8125rem) | Regular (400) | 18px (1.35) | `+0.005em` | Timestamps, legal fine print |
| **Caption 1** | 12px (0.75rem) | Medium (500) | 16px (1.35) | `+0.01em` | Badges, small tags, tab bars |

#### Tabular Numerals
Always specify `font-variant-numeric: tabular-nums` or Tailwind `tabular-nums` for financial numbers, raffle number badges, clocks, countdowns, and balances to prevent layout jitter as digits change.

---

## 4. Physics, Motion & Spring Animations

Apple interactions feel organic because they simulate physical mass, friction, and tension:

```css
/* Core Apple Spring Transitions */
--apple-spring: cubic-bezier(0.16, 1, 0.3, 1);
--apple-spring-snappy: cubic-bezier(0.25, 1, 0.5, 1);
--apple-spring-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Micro-Interactions:
- **Button Press Affordance**: On pointer down, elements contract: `active:scale-[0.97]` with `transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`.
- **Card Hover Elevation**: Lift gently: `hover:-translate-y-1 hover:shadow-2xl`.
- **Dynamic Segmented Controls**: Sliding pill indicator with smooth width/position interpolation.
- **Success Celebrations**: Staggered bounce and particle bursts celebrating key moments (e.g. winning a raffle or completing a payment).

---

## 5. Tailoring to the Wedding Raffle ("Corta-Gravata") Experience

| Area | Traditional Clunky Pattern | Apple HIG / Liquid Glass Transformation |
|---|---|---|
| **Convidados (`/e/[slug]`)** | Flat matrix of raw checkboxes or ugly colored squares | Elegant glass grid of numbered tiles with micro-press animations, glowing gold selection halos, and live purchase counters |
| **Checkout PIX** | Dull static form | Clean Apple Pay-style checkout sheet with segmented key copy, glowing QR card, and celebratory checkmark morph upon webhook confirmation |
| **Telão (`/e/[slug]/telao`)** | Static projector text or clunky slides | Cinematic widescreen experience with ambient gradient refraction, particle confetti, and dynamic winner reveal card |
| **Padrinho Console** | Dense desktop form | High-touch mobile pad with oversized tactile number pad (iOS Calculator aesthetic), quick amount pills, and instant SMS/WhatsApp share |
| **Dashboard Noivos** | Generic SaaS dashboard with cold grey boxes | Luxury financial overview with frosted glass balance card, gold foil accents, instant PIX cashout drawer, and live revenue dials |
