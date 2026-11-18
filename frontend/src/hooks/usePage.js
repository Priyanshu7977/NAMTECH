import { usePage as useInertiaPage } from '@inertiajs/react';

/** { component, url, props } where props holds the page data plus site, auth, navigation, flash and errors. */
export default function usePage() {
    return useInertiaPage();
}
