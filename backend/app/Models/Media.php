<?php

namespace App\Models;

use App\Models\Concerns\FlushesPublicCache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * An uploaded image. The validated original is kept on a private disk; the public
 * disk only holds re-encoded responsive variants (AVIF, WebP and JPEG).
 */
class Media extends Model
{
    use FlushesPublicCache;

    /** Widths generated for every image (only those smaller than the original). */
    public const Widths = [400, 800, 1200, 1600, 2000];

    /** Named sizes used by templates and social metadata. */
    public const NamedSizes = ['sm' => 400, 'md' => 800, 'lg' => 1200, 'xl' => 1600];

    protected $fillable = [
        'uuid', 'kind', 'disk', 'directory', 'filename', 'original_name', 'mime_type', 'size',
        'width', 'height', 'alt', 'caption', 'credit', 'variants', 'status', 'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(MediaUsage::class);
    }

    /**
     * @return array<int, int>
     */
    public function availableWidths(): array
    {
        return array_map('intval', $this->variants['widths'] ?? []);
    }

    /**
     * @return array<int, string>
     */
    public function availableFormats(): array
    {
        return $this->variants['formats'] ?? [];
    }

    public function variantPath(int $width, string $format): string
    {
        return $this->directory.'/'.$width.'.'.$format;
    }

    /**
     * Public URL of the closest generated variant (JPEG fallback) for a named size or width.
     */
    public function url(string|int $size = 'lg', string $format = 'jpg'): ?string
    {
        $widths = $this->availableWidths();
        if ($widths === []) {
            return null;
        }

        $target = is_int($size) ? $size : (self::NamedSizes[$size] ?? 1200);
        $chosen = collect($widths)->sortBy(fn (int $w) => abs($w - $target))->first();
        $format = in_array($format, $this->availableFormats(), true) ? $format : 'jpg';

        return Storage::disk('public')->url($this->variantPath($chosen, $format));
    }

    /**
     * Data needed by the front-end <ResponsiveImage> component.
     *
     * @return array<string, mixed>|null
     */
    public function toImage(?string $altOverride = null): ?array
    {
        if ($this->status !== 'ready' || $this->availableWidths() === []) {
            return null;
        }

        $disk = Storage::disk('public');
        $sources = [];
        foreach ($this->availableFormats() as $format) {
            $sources[$format] = collect($this->availableWidths())
                ->map(fn (int $w): string => $disk->url($this->variantPath($w, $format)).' '.$w.'w')
                ->implode(', ');
        }

        return [
            'id' => $this->id,
            'src' => $this->url('lg'),
            'sources' => $sources,
            'width' => $this->width,
            'height' => $this->height,
            'alt' => $altOverride ?? (string) $this->alt,
            'caption' => $this->caption,
        ];
    }

    /**
     * Summary used by the admin media picker.
     *
     * @return array<string, mixed>
     */
    public function isDocument(): bool
    {
        return $this->kind === 'document';
    }

    /**
     * Public URL of an uploaded document (PDF).
     */
    public function documentUrl(): ?string
    {
        return $this->isDocument() ? Storage::disk('public')->url($this->directory.'/'.basename($this->filename)) : null;
    }

    public function toAdmin(): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'document_url' => $this->documentUrl(),
            'thumb' => $this->url('sm', 'webp'),
            'url' => $this->url('lg'),
            'original_name' => $this->original_name,
            'alt' => $this->alt,
            'caption' => $this->caption,
            'credit' => $this->credit,
            'width' => $this->width,
            'height' => $this->height,
            'size' => $this->size,
            'mime_type' => $this->mime_type,
            'status' => $this->status,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
