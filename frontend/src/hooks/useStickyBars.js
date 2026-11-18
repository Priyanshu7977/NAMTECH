import { useEffect } from 'react';

/**
 * Sticky bars (.nt-subnav, .nt-prog-tabs, .nt-tabs) sit just below whatever part of the site header is on
 * screen: this keeps --nt-header-offset up to date for them. Choosing a tab on a stuck bar also returns to the
 * top of the bar's content, so a new tab or filter doesn't open halfway down.
 */
export default function useStickyBars(headerRef, hidden) {
    useEffect(() => {
        const header = headerRef.current;
        if (!header) return undefined;
        // When the header collapses, only its navbar is still on screen.
        const place = () => {
            const collapse = hidden ? (header.querySelector('.nt-mainbar')?.offsetTop ?? 0) : 0;
            document.documentElement.style.setProperty('--nt-header-offset', `${header.offsetHeight - collapse}px`);
        };
        place();
        const observer = new ResizeObserver(place);
        observer.observe(header);
        return () => observer.disconnect();
    }, [headerRef, hidden]);

    useEffect(() => {
        const onClick = (event) => {
            const bar = event.target.closest?.('.nt-tabs');
            if (!bar || !event.target.closest('a, button')) return;
            // Where the bar sits in the page when it isn't stuck.
            const position = bar.style.position;
            bar.style.position = 'static';
            const natural = bar.getBoundingClientRect().top + window.scrollY;
            bar.style.position = position;
            const above = (headerRef.current?.offsetHeight ?? 0) + (document.querySelector('.nt-subnav')?.offsetHeight ?? 0);
            const target = natural - above;
            if (window.scrollY > target) window.scrollTo({ top: target, behavior: 'auto' });
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, [headerRef]);
}
