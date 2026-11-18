/**
 * <picture> with AVIF/WebP sources and a JPEG fallback. Explicit width/height prevent
 * layout shift; `priority` loads eagerly with high fetch priority (use for the LCP image only).
 */
export default function ResponsiveImage({ image, sizes = '100vw', priority = false, alt, className }) {
    if (!image) {
        return null;
    }

    const text = alt ?? image.alt ?? '';

    return (
        <picture className={className}>
            {image.sources?.avif ? <source type="image/avif" srcSet={image.sources.avif} sizes={sizes} /> : null}
            {image.sources?.webp ? <source type="image/webp" srcSet={image.sources.webp} sizes={sizes} /> : null}
            <img
                src={image.src}
                srcSet={image.sources?.jpg}
                sizes={sizes}
                width={image.width}
                height={image.height}
                alt={text}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : undefined}
            />
        </picture>
    );
}

export function Media({ image, sizes, priority, alt, className = '', style }) {
    return (
        <div className={`nt-media ${className}`} style={style}>
            <ResponsiveImage image={image} sizes={sizes} priority={priority} alt={alt} />
        </div>
    );
}
