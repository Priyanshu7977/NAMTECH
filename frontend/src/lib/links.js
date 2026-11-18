/** True for links that leave the site (absolute http(s) URLs to another host). */
export function isExternal(url) {
    if (!url || !/^https?:\/\//i.test(url)) return false;
    if (typeof window === 'undefined') return true;
    try {
        return new URL(url).host !== window.location.host;
    } catch {
        return true;
    }
}

/** Links Inertia can handle as client-side visits. */
export function isInternalPage(url) {
    return Boolean(url) && url.startsWith('/') && !url.startsWith('//') && !/\.(pdf|xml|txt|jpg|png|zip)$/i.test(url);
}
