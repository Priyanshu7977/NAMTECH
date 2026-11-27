@php
    // CMS screens use the admin style sheet; the public site and CMS previews use the site one.
    $isAdmin = request()->is('admin', 'admin/*') && ! request()->is('admin/preview/*');
    $preload = $page['props']['seo']['preloadImage'] ?? null;
    $seo = $page['props']['seo'] ?? [];
    $pageTitle = $seo['title'] ?? ($page['props']['program']['title'] ?? ($page['props']['page']['title'] ?? config('app.name', 'NAMTECH')));
    $pageDesc = $seo['description'] ?? null;
    $pageCanonical = $seo['canonical'] ?? url()->current();
    $pageImage = $seo['image'] ?? null;
    $jsonLd = $seo['jsonLd'] ?? null;
@endphp
<!DOCTYPE html>
<html lang="en-IN">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#5D24FC">
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
        <title>{{ $pageTitle }}</title>
        @if ($pageDesc)
            <meta name="description" content="{{ $pageDesc }}">
            <meta property="og:description" content="{{ $pageDesc }}">
            <meta name="twitter:description" content="{{ $pageDesc }}">
        @endif
        <meta property="og:title" content="{{ $pageTitle }}">
        <meta name="twitter:title" content="{{ $pageTitle }}">
        <meta property="og:type" content="{{ $seo['type'] ?? 'website' }}">
        <meta property="og:url" content="{{ $pageCanonical }}">
        <link rel="canonical" href="{{ $pageCanonical }}">
        @if ($pageImage)
            <meta property="og:image" content="{{ $pageImage }}">
            <meta name="twitter:image" content="{{ $pageImage }}">
            <meta name="twitter:card" content="summary_large_image">
        @endif
        @if ($isAdmin || !empty($seo['noindex']))
            <meta name="robots" content="noindex, nofollow">
        @endif
        @if ($jsonLd)
            @foreach ((array) $jsonLd as $schema)
                <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
            @endforeach
        @endif
        @if ($preload)
            <link rel="preload" as="image" type="{{ $preload['type'] }}" imagesrcset="{{ $preload['srcset'] }}" imagesizes="{{ $preload['sizes'] }}" fetchpriority="high">
        @endif
        @viteReactRefresh
        @vite([$isAdmin ? 'src/styles/admin.scss' : 'src/styles/site.scss', 'src/app.jsx'])
        @inertiaHead
        @unless ($isAdmin)
            <script src="/nt-fixes.js?v=24" defer></script>
        @endunless
    </head>
    <body>
        @inertia
        @unless ($isAdmin)
            <noscript>
                <div class="nt-noscript-content" style="padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: sans-serif;">
                    <h1>{{ $pageTitle }}</h1>
                    @if ($pageDesc)
                        <p style="font-size: 1.15rem; color: #555;">{{ $pageDesc }}</p>
                    @endif
                    @if (!empty($page['props']['program']['overview']))
                        <p>{!! $page['props']['program']['overview'] !!}</p>
                    @endif
                    @if (!empty($page['props']['sections']))
                        @foreach ($page['props']['sections'] as $sec)
                            @if (!empty($sec['data']['heading']))
                                <h2>{{ $sec['data']['heading'] }}</h2>
                            @elseif (!empty($sec['data']['title']))
                                <h2>{{ $sec['data']['title'] }}</h2>
                            @endif
                            @if (!empty($sec['data']['body']))
                                <p>{{ strip_tags($sec['data']['body']) }}</p>
                            @endif
                        @endforeach
                    @endif
                </div>
            </noscript>
        @endunless
    </body>
</html>
