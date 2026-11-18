'use client';

import { useEffect, useRef } from 'react';

type NumberTickerProps = {
  value: number;
  className?: string;
  formatFn?: (n: number) => string;
  duration?: number;
};

export function NumberTicker({
  value,
  className = '',
  formatFn = (n) => Math.round(n).toString(),
  duration = 900,
}: NumberTickerProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const start = prevValueRef.current;
    const end = value;
    prevValueRef.current = value;

    if (start === end) {
      el.textContent = formatFn(end);
      return;
    }

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
      } else {
        el.textContent = formatFn(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, formatFn]);

  return (
    <span
      ref={spanRef}
      className={`font-mono tabular-nums tracking-tight inline-block ${className}`}
    >
      {formatFn(value)}
    </span>
  );
}
