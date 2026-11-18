import { useEffect, useRef } from 'react';

type AnimeV3 = ((params: Record<string, unknown>) => void) & {
  stagger?: (value: number) => unknown;
};

interface AnimeModuleExports {
  default?: AnimeV3;
  animate?: (targets: unknown, params: Record<string, unknown>) => void;
  stagger?: (value: number) => unknown;
}

export function SplitText({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import('animejs').then((animeModule) => {
      const moduleRecord = animeModule as unknown as AnimeModuleExports;
      const targets = containerRef.current?.querySelectorAll('.anime-char');
      if (!targets || targets.length === 0) return;

      const anime = moduleRecord.default ?? (typeof animeModule === 'function' ? (animeModule as unknown as AnimeV3) : undefined);

      if (typeof anime === 'function') {
        anime({
          targets,
          opacity: [0, 1],
          translateY: [20, 0],
          easing: 'easeOutExpo',
          duration: 800,
          delay: anime.stagger ? anime.stagger(30) : 30,
        });
      } else if (typeof moduleRecord.animate === 'function') {
        const { animate, stagger } = moduleRecord;
        animate(targets, {
          opacity: [0, 1],
          translateY: [20, 0],
          ease: 'easeOutExpo',
          duration: 800,
          delay: stagger ? stagger(30) : 30,
        });
      }
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
