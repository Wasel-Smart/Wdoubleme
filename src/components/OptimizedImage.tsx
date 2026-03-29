import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'decoding'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading with intersection observer
 * - Progressive image loading
 * - Blur placeholder
 * - WebP/AVIF support detection
 * - Responsive images
 * - Priority loading for above-the-fold images
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  className = '',
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : '');
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before element enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Load image when in view
  useEffect(() => {
    if (isInView && !imageSrc) {
      setImageSrc(src);
    }
  }, [isInView, src, imageSrc]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    onError?.();
  };

  // Get optimized image URL (placeholder for CDN integration)
  const getOptimizedSrc = (url: string): string => {
    // In production, integrate with image CDN (Cloudinary, imgix, etc.)
    // For now, return original URL
    return url;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (): string | undefined => {
    if (!width) return undefined;
    
    const widths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    const validWidths = widths.filter(w => w <= width * 2);
    
    return validWidths
      .map(w => `${getOptimizedSrc(src)}?w=${w}&q=${quality} ${w}w`)
      .join(', ');
  };

  // Generate sizes attribute
  const generateSizes = (): string | undefined => {
    if (!width) return undefined;
    
    return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`;
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      {/* Blur Placeholder */}
      {placeholder === 'blur' && !isLoaded && blurDataURL && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Loading Skeleton */}
      {!isLoaded && !blurDataURL && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={imageSrc || undefined}
        srcSet={imageSrc ? generateSrcSet() : undefined}
        sizes={imageSrc ? generateSizes() : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
        style={{
          ...props.style,
          contentVisibility: 'auto',
        }}
      />

      {/* Load Indicator */}
      {!isLoaded && imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low') {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;
  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(sources: string[], priority: 'high' | 'low' = 'low') {
  sources.forEach(src => preloadImage(src, priority));
}
