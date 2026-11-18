<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Version-based invalidation for cached public content. Every cache key for public
 * output includes the current version, so bumping it invalidates everything at once
 * without requiring a tag-capable cache store.
 */
class ContentCache
{
    private const VersionKey = 'public-content-version';

    public static function version(): int
    {
        try {
            return (int) Cache::rememberForever(self::VersionKey, fn (): int => 1);
        } catch (\Throwable) {
            return 1;
        }
    }

    public static function flush(): void
    {
        try {
            Cache::forever(self::VersionKey, self::version() + 1);
        } catch (\Throwable) {
            // Ignore if cache table is not yet created or dropped during migrations
        }
    }

    public static function key(string $key): string
    {
        return 'public:v'.self::version().':'.$key;
    }

    /**
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    public static function remember(string $key, callable $callback, int $seconds = 3600): mixed
    {
        return Cache::remember(self::key($key), $seconds, $callback);
    }
}
