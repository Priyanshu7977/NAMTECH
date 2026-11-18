import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';

/**
 * Browser entry. Public pages arrive server-rendered (Inertia SSR) and are hydrated; CMS
 * screens are rendered in the browser. Each page component loads as its own chunk.
 */
createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx');
        const page = pages[`./pages/${name}.jsx`];
        if (!page) throw new Error(`Unknown page component "${name}"`);
        return page();
    },
    setup({ el, App, props }) {
        const app = <App {...props} />;
        if (el.hasChildNodes()) hydrateRoot(el, app);
        else createRoot(el).render(app);
    },
    progress: { color: '#B528D3', delay: 250 },
});
