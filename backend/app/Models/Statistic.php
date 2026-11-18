<?php

namespace App\Models;

use App\Models\Concerns\FlushesPublicCache;
use Illuminate\Database\Eloquent\Model;

/**
 * A figure shown on the site. Only statistics marked approved are ever rendered publicly,
 * so unverified numbers can be drafted without appearing on the site.
 */
class Statistic extends Model
{
    use FlushesPublicCache;

    protected $fillable = ['group', 'value', 'label', 'source_note', 'is_approved', 'sort_order'];

    protected function casts(): array
    {
        return ['is_approved' => 'boolean'];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function approvedFor(?string $group): array
    {
        if (! $group) {
            return [];
        }

        return static::query()->where('group', $group)->where('is_approved', true)->orderBy('sort_order')
            ->get(['value', 'label'])->toArray();
    }

    public function displayTitle(): string
    {
        return $this->value.' '.$this->label;
    }
}
