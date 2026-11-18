import { Link as InertiaLink } from '@inertiajs/react';
import { crossesShell } from './navigation';

/**
 * Internal link: an Inertia visit for pages in the same shell, method="post" (e.g. sign out)
 * for actions. Links between the public site and the CMS load a fresh page.
 */
export default function Link({ href, method = 'get', children, ...rest }) {
    if (method.toLowerCase() === 'get' && crossesShell(href)) {
        const { as: _as, data: _data, preserveScroll: _scroll, preserveState: _state, only: _only, replace: _replace, ...anchor } = rest;
        return (
            <a href={href} {...anchor}>
                {children}
            </a>
        );
    }

    return (
        <InertiaLink href={href} method={method} {...rest}>
            {children}
        </InertiaLink>
    );
}
