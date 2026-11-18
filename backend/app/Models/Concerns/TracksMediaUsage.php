<?php

namespace App\Models\Concerns;

use App\Models\MediaUsage;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Records which media items a record references so the media library can block
 * deletion of in-use assets and show where an asset is used.
 */
trait TracksMediaUsage
{
    public static function bootTracksMediaUsage(): void
    {
        static::saved(fn ($model) => $model->syncMediaUsage());
        static::deleted(fn ($model) => $model->mediaUsages()->delete());
    }

    public function mediaUsages(): MorphMany
    {
        return $this->morphMany(MediaUsage::class, 'usable');
    }

    /**
     * Media foreign-key columns on this model.
     *
     * @return array<int, string>
     */
    public function mediaColumns(): array
    {
        return array_values(array_filter(
            $this->getFillable(),
            fn (string $attribute): bool => str_ends_with($attribute, '_id') && in_array($attribute, ['image_id', 'logo_id', 'photo_id', 'cover_id', 'og_image_id', 'document_id'], true),
        ));
    }

    /**
     * Additional media references (e.g. inside sections or related items), keyed by field name.
     *
     * @return array<string, array<int, int>>
     */
    public function additionalMediaReferences(): array
    {
        return [];
    }

    public function syncMediaUsage(): void
    {
        $references = [];
        foreach ($this->mediaColumns() as $column) {
            if ($this->getAttribute($column)) {
                $references[$column] = [(int) $this->getAttribute($column)];
            }
        }

        foreach ($this->additionalMediaReferences() as $field => $ids) {
            $references[$field] = array_merge($references[$field] ?? [], $ids);
        }

        if (method_exists($this, 'workingCopy') && $working = $this->workingCopy()->first()) {
            foreach (($working->data['media'] ?? []) as $id) {
                $references['working-copy'][] = (int) $id;
            }
        }

        MediaUsage::syncFor($this, $references);
    }
}
