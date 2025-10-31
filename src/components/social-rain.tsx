'use client';
import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';

const ICONS_TO_RENDER = 20;

export function SocialRain() {
  const [icons, setIcons] = useState<
    { Icon: any; style: React.CSSProperties }[]
  >([]);

  useEffect(() => {
    // Generate icons on the client-side only to avoid hydration mismatch
    const generatedIcons = Array.from({ length: ICONS_TO_RENDER }).map(
      (_, i) => {
        const Icon = Icons.social[i % Icons.social.length];
        const style = {
          left: `${Math.random() * 100}vw`,
          animationDuration: `${Math.random() * 5 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: Math.random() * 0.5 + 0.1,
          transform: `scale(${Math.random() * 0.8 + 0.4})`,
        };
        return { Icon, style };
      }
    );
    setIcons(generatedIcons);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
      {icons.map(({ Icon, style }, i) => (
        <Icon
          key={i}
          className="absolute text-primary/50 animate-fall"
          style={style}
        />
      ))}
    </div>
  );
}