import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    threshold?: number;
    delay?: number; // dalam ms
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number; // dalam ms
    style?: React.CSSProperties;
}

const Reveal: React.FC<RevealProps> = ({
    children,
    className = "",
    threshold = 0.05,
    delay = 0,
    direction = 'up',
    duration = 400,
    style
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: threshold,
                rootMargin: '0px 0px -20px 0px' // trigger earlier for faster reveal
            }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold]);

    // Tentukan transform awal berdasarkan arah
    const getTransform = () => {
        if (!isVisible) {
            switch (direction) {
                case 'up': return 'translateY(20px)';
                case 'down': return 'translateY(-20px)';
                case 'left': return 'translateX(20px)';
                case 'right': return 'translateX(-20px)';
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
                willChange: 'opacity, transform',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Reveal;
