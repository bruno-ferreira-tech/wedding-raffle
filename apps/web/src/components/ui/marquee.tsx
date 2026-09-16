'use client';

type MarqueeProps = {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speedSecs?: number;
};

export function Marquee({
  children,
  pauseOnHover = true,
  reverse = false,
  className = '',
  speedSecs = 25,
}: MarqueeProps) {
  return (
    <div
      style={{ '--marquee-duration': `${speedSecs}s` } as React.CSSProperties}
      className={`group flex overflow-hidden p-1.5 [gap:1rem] ${className}`}
    >
      <div
        className={`flex shrink-0 justify-around gap-4 animate-marquee ${
          reverse ? '[animation-direction:reverse]' : ''
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={`flex shrink-0 justify-around gap-4 animate-marquee ${
          reverse ? '[animation-direction:reverse]' : ''
        } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
