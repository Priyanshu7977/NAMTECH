<?php

return [
    /*
    | Two-factor authentication is required for these roles before they can use the admin area.
    */
    'enforce_two_factor' => (bool) env('ADMIN_ENFORCE_2FA', true),

    'two_factor_roles' => ['super-admin', 'publisher'],

    /*
    | Addresses that receive enquiry notifications (comma separated). Falls back to the
    | "enquiry_recipients" CMS setting when empty.
    */
    'enquiry_recipients' => array_filter(array_map('trim', explode(',', (string) env('NAMTECH_ENQUIRY_RECIPIENTS', '')))),

    /*
    | Full-page cache for anonymous visitors (seconds). Invalidated whenever content is published.
    */
    'page_cache_ttl' => (int) env('PAGE_CACHE_TTL', 3600),

    'page_cache_enabled' => (bool) env('PAGE_CACHE_ENABLED', true),

    /*
    | Hosts allowed for deferred virtual-tour / video iframes.
    */
    'embed_hosts' => array_filter(array_map('trim', explode(',', (string) env('EMBED_HOSTS', 'www.youtube-nocookie.com,www.youtube.com,player.vimeo.com,my.matterport.com,kuula.co')))),

    'max_upload_kb' => (int) env('MEDIA_MAX_UPLOAD_KB', 10240),

    /*
    | Load balancer / CDN addresses whose X-Forwarded-* headers are trusted ("*" or comma-separated IPs/CIDRs).
    */
    'trusted_proxies' => env('TRUSTED_PROXIES') === '*' ? '*' : array_filter(array_map('trim', explode(',', (string) env('TRUSTED_PROXIES', '')))),
];
