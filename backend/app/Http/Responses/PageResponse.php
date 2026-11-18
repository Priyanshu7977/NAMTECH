<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * An Inertia page: which React page component to render, its props, and the SEO metadata
 * for the document head (shared as the "seo" prop; the root view also reads its preloadImage).
 */
class PageResponse
{
    /**
     * @param  array<string, mixed>  $props
     * @param  array<string, mixed>|null  $seo
     */
    public static function render(string $component, array $props = [], ?array $seo = null, int $status = 200): Response
    {
        if ($seo !== null) {
            $props['seo'] = array_merge($seo, $props['seo'] ?? []);
        }

        return Inertia::render($component, $props)->toResponse(request())->setStatusCode($status);
    }
}
