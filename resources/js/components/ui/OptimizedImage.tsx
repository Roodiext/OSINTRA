import React, { useState, useCallback } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    /** Extra classes applied to the wrapper div */
    wrapperClassName?: string;
    /** Priority loading (e.g. hero images) — sets fetchpriority="high" & loading="eager" */
    priority?: boolean;
    /** Fallback element when no src is provided */
    fallback?: React.ReactNode;
    /** Style object for the img tag */
    style?: React.CSSProperties;
    /** onClick handler */
    onClick?: () => void;
}

/**
 * A reusable image component that shows a subtle pulse placeholder
 * while the image loads, then smoothly fades in the image.
 * Does NOT reduce quality — purely a UX improvement.
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    wrapperClassName = '',
    priority = false,
    fallback,
    style,
    onClick,
}) => {
    const [loaded, setLoaded] = useState(false);

    const handleLoad = useCallback(() => {
        setLoaded(true);
    }, []);

    if (!src && fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className={`relative overflow-hidden ${wrapperClassName}`} onClick={onClick}>
            {/* Placeholder pulse — visible while image is loading */}
            {!loaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                {...(priority ? { fetchPriority: 'high' as any } : {})}
                onLoad={handleLoad}
                style={style}
                className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            />
        </div>
    );
};

export default OptimizedImage;
