import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';

/**
 * Inertia SSR server (Node.js): renders public pages to finished HTML for search engines and
 * a fast first paint. Started with "php artisan inertia:start-ssr".
 */
createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        resolve: (name) => {
            // Only public pages are server-rendered (CMS screens render in the browser).
            const pages = import.meta.glob(['./pages/site/**/*.jsx', './pages/Error.jsx'], { eager: true });
            const module = pages[`./pages/${name}.jsx`];
            if (!module) throw new Error(`Unknown page component "${name}"`);
            return module.default;
        },
        setup: ({ App, props }) => <App {...props} />,
    }),
);
