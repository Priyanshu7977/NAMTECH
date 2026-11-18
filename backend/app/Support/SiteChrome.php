<?php

namespace App\Support;

use App\Models\Announcement;
use App\Models\Menu;

/**
 * Site-wide data every public page needs: settings, the announcement strip and menus.
 * Shared with public pages (see HandleInertiaRequests) and cached until content changes.
 */
class SiteChrome
{
    /**
     * @return array{settings: array<string, mixed>, announcements: array<int, array<string, mixed>>, menus: array<string, mixed>}
     */
    public static function data(): array
    {
        return ContentCache::remember('site-chrome', fn () => [
            'settings' => SiteSettings::public(),
            'announcements' => Announcement::query()->current()->get(['id', 'label', 'text', 'url'])->toArray(),
            'menus' => Menu::query()->get()->mapWithKeys(fn (Menu $menu) => [$menu->location => $menu->tree()])->all(),
        ]);
    }
}
