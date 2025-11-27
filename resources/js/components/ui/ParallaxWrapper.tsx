import React, { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  speed?: number; // parallax speed factor
}

const ParallaxWrapper: React.FC<Props> = ({ children, speed = 0.3 }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let mounted = true;
    const handle = () => {
      if (!mounted || !node) return;
      const rect = node.getBoundingClientRect();
      const offset = rect.top * speed;
      node.style.transform = `translateY(${offset}px)`;
    };

    handle();
    window.addEventListener('scroll', handle, { passive: true });
    return () => { mounted = false; window.removeEventListener('scroll', handle); };
  }, [speed]);

  return (
    <div ref={ref} style={{ transform: 'translateY(0)', transition: 'transform 0.15s linear' }}>
      {children}
    </div>
  );
};

export default ParallaxWrapper;
