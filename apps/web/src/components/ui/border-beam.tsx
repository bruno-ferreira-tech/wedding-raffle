'use client';

type BorderBeamProps = {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
};

export function BorderBeam({
  className = '',
  size = 200,
  duration = 8,
  colorFrom = 'rgba(212, 175, 55, 0.7)',
  colorTo = 'transparent',
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
        className="absolute aspect-square w-[var(--size)] animate-border-beam"
        style={{
          background: 'radial-gradient(circle, var(--color-from) 10%, var(--color-to) 70%)',
        }}
      />
    </div>
  );
}
