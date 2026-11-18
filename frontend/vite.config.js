import inertia from '@inertiajs/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

// The Laravel application lives in ../backend. Builds are written into it (public/build for the
// browser, bootstrap/ssr for the SSR server) and the dev server announces itself in public/hot.
const backend = '../backend';

export default defineConfig(({ command }) => ({
    envDir: backend,
    plugins: [
        laravel({
            // The public site and the CMS each get their own style sheet; the root view links the right one.
            input: ['src/app.jsx', 'src/styles/site.scss', 'src/styles/admin.scss'],
            ssr: 'src/ssr.jsx',
            publicDirectory: `${backend}/public`,
            hotFile: `${backend}/public/hot`,
            ssrOutputDirectory: `${backend}/bootstrap/ssr`,
            refresh: [`${backend}/resources/views/**`, `${backend}/routes/**`],
        }),
        // Inertia SSR: served by the Vite dev server in development, built as a Node.js server for production.
        inertia({ ssr: 'src/ssr.jsx' }),
        react(),
    ],
    // The production SSR bundle runs from backend/bootstrap/ssr, away from node_modules, so it
    // includes its packages. The dev server loads them from node_modules as usual.
    ssr: command === 'build' ? { noExternal: true } : {},
    css: {
        preprocessorOptions: {
            scss: {
                // Bootstrap 5.3 still uses @import internally.
                silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
                quietDeps: true,
            },
        },
    },
}));
