import React, { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  origin?: 'top' | 'bottom' | 'left' | 'right';
  distance?: string;
  duration?: number;
  delay?: number;
}

const ScrollReveal: React.FC<Props> = ({ children, className = '', origin = 'bottom', distance = '20px', duration = 600, delay = 0 }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let sr: any = null;
    const node = ref.current;
    if (!node) return;

    // dynamic import to avoid build errors if not installed
    import('scrollreveal')
      .then((ScrollRevealModule) => {
        const ScrollReveal = ScrollRevealModule.default || ScrollRevealModule;
        sr = ScrollReveal();
        sr.reveal(node, {
          origin,
          distance,
          duration,
          delay,
          easing: 'cubic-bezier(.22,.61,.36,1)'
        });
      })
      .catch(() => {
        // fallback: simple CSS animation
        node.style.opacity = '0';
        node.style.transform = `translateY(${origin === 'bottom' ? distance : '0'})`;
        requestAnimationFrame(() => {
          node.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
          node.style.opacity = '1';
          node.style.transform = 'translateY(0)';
        });
      });

    return () => {
      if (sr && sr.destroy) sr.destroy();
    };
  }, [origin, distance, duration, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
