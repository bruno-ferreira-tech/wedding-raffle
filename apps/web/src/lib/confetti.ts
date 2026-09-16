'use client';

type ConfettiOptions = {
  colors?: string[];
  count?: number;
  spread?: number;
};

export function launchCelebrationConfetti({
  colors = ['#e5c158', '#d4af37', '#ffffff', '#f4ede4', '#c5a059'],
  count = 70,
  spread = 1,
}: ConfettiOptions = {}) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '99999';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const particles = Array.from({ length: count }, () => {
    const angle = (Math.random() * 0.8 + 0.1) * Math.PI; // Para cima e pros lados
    const speed = (Math.random() * 14 + 10) * spread;
    return {
      x: w / 2 + (Math.random() - 0.5) * 120,
      y: h * 0.4,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(angle) * speed,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
    };
  });

  let frame = 0;
  function update() {
    ctx?.clearRect(0, 0, w, h);
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravidade suave
      p.vx *= 0.98; // resistência do ar
      p.rotation += p.rotSpeed;
      p.opacity -= 0.008;

      if (p.opacity > 0 && p.y < h + 50) {
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
    if (alive && frame < 200) {
      requestAnimationFrame(update);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(update);
}
