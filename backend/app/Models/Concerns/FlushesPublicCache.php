<?php

namespace App\Models\Concerns;

use App\Support\ContentCache;

/**
 * Any write to public-facing content invalidates the public page cache.
 */
trait FlushesPublicCache
{
    public static function bootFlushesPublicCache(): void
    {
        static::saved(fn () => ContentCache::flush());
        static::deleted(fn () => ContentCache::flush());
    }
}
