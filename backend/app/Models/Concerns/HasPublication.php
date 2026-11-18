<?php

namespace App\Models\Concerns;

use App\Enums\ContentStatus;
use App\Models\ContentRevision;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

/**
 * Draft / review / schedule / publish workflow with revision history.
 *
 * Live content lives on the model itself. Edits made to already-published content are
 * stored as a "working" revision until a publisher publishes them, so editors can never
 * change the live site without review.
 *
 * @property ContentStatus $status
 */
trait HasPublication
{
    use FlushesPublicCache;

    public static function bootHasPublication(): void
    {
        static::creating(function ($model): void {
            $model->created_by ??= auth()->id();
            $model->updated_by ??= auth()->id();
        });

        static::updating(function ($model): void {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });

        static::deleting(function ($model): void {
            $model->revisions()->delete();
        });
    }

    public function initializeHasPublication(): void
    {
        $this->mergeCasts([
            'status' => ContentStatus::class,
            'published_at' => 'datetime',
            'scheduled_for' => 'datetime',
        ]);
    }

    /**
     * Content visible to the public right now.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where($this->qualifyColumn('status'), ContentStatus::Published->value)
            ->where(fn (Builder $query) => $query->whereNull($this->qualifyColumn('published_at'))
                ->orWhere($this->qualifyColumn('published_at'), '<=', now()));
    }

    public function isLive(): bool
    {
        return $this->status === ContentStatus::Published
            && ($this->published_at === null || $this->published_at->lte(now()));
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function revisions(): MorphMany
    {
        return $this->morphMany(ContentRevision::class, 'revisionable')->latest('id');
    }

    public function workingCopy(): MorphOne
    {
        return $this->morphOne(ContentRevision::class, 'revisionable')->where('kind', ContentRevision::KindWorking);
    }

    /**
     * Attribute names captured in revisions and editable through the CMS.
     *
     * @return array<int, string>
     */
    public function revisionableAttributes(): array
    {
        return array_values(array_diff($this->getFillable(), ['status', 'review_state', 'published_at', 'scheduled_for']));
    }

    /**
     * Related data captured in revisions (sections, tags, ...). Override per model.
     *
     * @return array<string, mixed>
     */
    public function snapshotRelations(): array
    {
        return [];
    }

    /**
     * Persist related data from a snapshot. Override per model.
     *
     * @param  array<string, mixed>  $relations
     */
    public function restoreRelations(array $relations): void
    {
        //
    }

    /**
     * Hydrate in-memory relations from a snapshot for previews (nothing is saved).
     *
     * @param  array<string, mixed>  $relations
     */
    public function previewRelations(array $relations): void
    {
        //
    }

    /**
     * @return array{attributes: array<string, mixed>, relations: array<string, mixed>}
     */
    public function toSnapshot(): array
    {
        $attributes = [];
        foreach ($this->revisionableAttributes() as $attribute) {
            $value = $this->getAttribute($attribute);
            $attributes[$attribute] = $value instanceof \DateTimeInterface ? $value->format('Y-m-d H:i:s') : $value;
        }

        return ['attributes' => $attributes, 'relations' => $this->snapshotRelations()];
    }

    /**
     * Relative public URL path, or null when the content type has no detail page.
     */
    abstract public function publicPath(): ?string;

    /**
     * Human-readable title for admin lists and audit logs.
     */
    public function displayTitle(): string
    {
        $attributes = $this->getAttributes();

        return (string) ($attributes['title'] ?? $attributes['name'] ?? '#'.$this->getKey());
    }
}
