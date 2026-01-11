import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    threshold?: number;
    delay?: number; // dalam ms
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number; // dalam ms
}

const Reveal: React.FC<RevealProps> = ({
    children,
    className = "",
    threshold = 0.1,
    delay = 0,
    direction = 'up',
    duration = 800
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: threshold,
                rootMargin: '0px 0px -50px 0px' // offset sedikit agar tidak terlalu mepet bawah
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    // Tentukan transform awal berdasarkan arah
    const getTransform = () => {
        if (!isVisible) {
            switch (direction) {
                case 'up': return 'translateY(40px)';
                case 'down': return 'translateY(-40px)';
                case 'left': return 'translateX(40px)';
                case 'right': return 'translateX(-40px)';
                default: return 'none';
            }
        }
        return 'none';
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransform(),
                transition: `all ${duration}ms cubic-bezier(0.5, 0, 0, 1) ${delay}ms`,
                willChange: 'opacity, transform'
            }}
        >
            {children}
        </div>
    );
};

export default Reveal;
