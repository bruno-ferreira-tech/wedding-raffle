---
name: aceternity-magic-ui
description: Use when building or enhancing interfaces with modern micro-interactions, celebratory animations, particle effects, shimmer borders, and dynamic component patterns from Aceternity UI and Magic UI.
---

# Aceternity UI & Magic UI Skill

## Overview

**Aceternity UI** e **Magic UI** são os dois ecossistemas mais expressivos de componentes animados e micro-interações do ecossistema React/Next.js e Tailwind CSS. Eles transformam interfaces estáticas em experiências táteis, vivas e memoráveis por meio de animações fluidas, efeitos de luz elegantes, confetes físicos, bordas com feixes luminosos e contadores rolantes.

> **Princípio da Restrição & Elegância:** Uma animação deve amplificar o significado da interface, nunca competir com ele. O segredo de usar padrões do Aceternity e Magic UI com maestria é a **dosagem refinada**: um feixe de luz delicado em um cartão de PIX transmite confiança e precisão; uma explosão de confetes dourados no sorteio transmite júbilo; mas encher a tela de efeitos simultâneos gera poluição visual.

---

## Quando Utilizar Esta Skill

Invoque esta skill **sempre que**:
- Precisar adicionar momentos de **celebração e recompensa** (ex: pagamento confirmado, número sorteado, prêmio revelado).
- For implementar **contadores dinâmicos** (Number Ticker) para arrecadação, números de cotas ou estatísticas ao vivo.
- Quiser criar **botões de alta conversão** com efeitos sutis de passagem de luz (*Shimmer Button*, *Moving Border*).
- For construir **feeds em movimento contínuo** (*Marquee / Infinite Cards*) para exibir compras recentes no telão.
- Precisar de **feixes de luz nas bordas** (*Border Beam / Shine Border*) para destacar o cartão ativo de pagamento ou o prêmio principal.
- Quiser introduzir **partículas sutis** (*Sparkles / Gold Dust*) em telas de celebração.

---

## Catálogo de Componentes & Receitas Práticas

### 1. Number Ticker (Contador Rolante Suave)
Perfeito para: valor total arrecadado, contagem regressiva e placares do telão.

```tsx
import { useEffect, useRef } from 'react';

type NumberTickerProps = {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  formatFn?: (n: number) => string;
};

export function NumberTicker({
  value,
  className = '',
  formatFn = (n) => Math.round(n).toString(),
}: NumberTickerProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    let start = 0;
    const end = value;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing suave (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;

      el.textContent = formatFn(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, formatFn]);

  return (
    <span
      ref={spanRef}
      className={`font-mono tabular-nums tracking-tight ${className}`}
    >
      {formatFn(0)}
    </span>
  );
}
```

---

### 2. Confetti Cannon (Celebração de Sorteio e Pagamento)
Disparo de confetes com física natural, ideal para quando o ganhador da rifa é revelado ou um Pix é confirmado.

```tsx
export function launchCelebrationConfetti({
  colors = ['#e5c158', '#d4af37', '#ffffff', '#f3eee6'],
  count = 60,
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '9999';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const particles = Array.from({ length: count }, () => ({
    x: w / 2 + (Math.random() - 0.5) * 100,
    y: h * 0.45,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.8) * 18,
    size: Math.random() * 8 + 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
  }));

  let frame = 0;
  function update() {
    ctx?.clearRect(0, 0, w, h);
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravidade
      p.vx *= 0.98; // atrito do ar
      p.rotation += p.rotSpeed;
      p.opacity -= 0.009;

      if (p.opacity > 0) {
        alive = true;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = Math.max(0, p.opacity);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx!.restore();
      }
    }

    frame++;
    if (alive && frame < 180) {
      requestAnimationFrame(update);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(update);
}
```

---

### 3. Border Beam (Feixe de Luz em Card Ativo)
Um facho de luz que percorre suavemente o perímetro de um cartão de pagamento PIX ou destaque de prêmio.

```tsx
type BorderBeamProps = {
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
};

export function BorderBeam({
  size = 180,
  duration = 8,
  colorFrom = 'rgba(212, 175, 55, 0.85)',
  colorTo = 'transparent',
  className = '',
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          '--size': `${size}px`,
          '--duration': `${duration}s`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] [animation:border-beam_var(--duration)_infinite_linear]"
        style={{
          background: `radial-gradient(circle, var(--color-from) 10%, var(--color-to) 70%)`,
        }}
      />
    </div>
  );
}
```

---

### 4. Shimmer Button (Botão de Chamada com Passagem de Brilho)
Destaca o botão de checkout, confirmação de compra ou registro de cota sem ser apelativo.

```css
/* Keyframe no CSS global */
@keyframes shimmer-sweep {
  0% {
    transform: translateX(-150%);
  }
  50%, 100% {
    transform: translateX(150%);
  }
}

.shimmer-button {
  position: relative;
  overflow: hidden;
}

.shimmer-button::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.28) 50%,
    transparent 100%
  );
  transform: translateX(-150%);
  animation: shimmer-sweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  pointer-events: none;
}
```

---

### 5. Marquee / Infinite Ticker (Feed Contínuo de Compras)
Ideal para a barra de "Últimas Participações" no telão ou no rodapé do painel.

```tsx
type MarqueeProps = {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
};

export function Marquee({
  children,
  pauseOnHover = true,
  reverse = false,
  className = '',
}: MarqueeProps) {
  return (
    <div
      className={`group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] ${className}`}
    >
      <div
        className={`flex shrink-0 justify-around [gap:var(--gap)] animate-marquee ${
          reverse ? '[animation-direction:reverse]' : ''
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={`flex shrink-0 justify-around [gap:var(--gap)] animate-marquee ${
          reverse ? '[animation-direction:reverse]' : ''
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
```

---

### 6. Ripple Effect (Ondas Táteis de Toque)
Feedback tátil para toques no mobile ou cliques em botões de cópia rápida.

```tsx
import { useState } from 'react';

type Ripple = {
  x: number;
  y: number;
  id: number;
};

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const RippleElements = () => (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-primary/25 animate-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: 120,
            height: 120,
            transform: 'translate(-50%, -50%) scale(0)',
          }}
        />
      ))}
    </>
  );

  return { createRipple, RippleElements };
}
```

---

## Regras de Harmonização com o Tema e Contexto

1. **Cores dos Efeitos Sempre Seguem os Tokens:**
   - Use cores de tema para confetes e feixes: Ouro champanhe (`#e5c158`, `#d4af37`), marfim quente (`#faf8f5`) e acentos de marca.
   - NUNCA use neon roxo ou ciano genérico em contextos de papelaria e casamento tradicional (respeitando a skill `avoid-ai-design`).
2. **Respeito a `prefers-reduced-motion`:**
   - Usuários com sensibilidade vestibular devem ter animações desativadas ou atenuadas para `fade` simples.
   - Adicione `@media (prefers-reduced-motion: reduce)` para pausar marquees e feixes rotativos.
3. **Performance a 60 FPS:**
   - Anime exclusivamente propriedades tratadas pela GPU: `transform` e `opacity`.
   - Evite animar `width`, `height`, `top`, `left`, `margin` ou `filter: blur` durante interações contínuas.

---

## Checklist de Aplicação

Antes de publicar qualquer efeito do Aceternity UI / Magic UI:
- [ ] O efeito celebra uma ação real do usuário (ex: revelação do sorteio, compra aprovada, clique no Pix)?
- [ ] A velocidade da animação é agradável (entre 300ms e 600ms para micro-interações; ciclos lentos de 4s a 8s para feixes)?
- [ ] O componente não concorre com a legibilidade das informações essenciais (número da cota, valor em reais, nome do convidado)?
- [ ] O código utiliza aceleração por hardware (`transform`, `opacity`) sem causar travamentos em celulares modestos?
