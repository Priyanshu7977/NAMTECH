<?php

namespace App\Services;

use App\Http\Responses\PageResponse;
use App\Models\Centre;
use App\Models\Event;
use App\Models\Faculty;
use App\Models\Gallery;
use App\Models\JobOpening;
use App\Models\Leader;
use App\Models\Media;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Program;
use App\Models\Publication;
use App\Models\School;
use App\Models\Setting;
use App\Sections\SectionPresenter;
use App\Support\HtmlSanitizer;
use App\Support\PageBlocks;
use App\Support\ProgramDetails;
use App\Support\Presenters;
use App\Support\SiteSettings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Builds the Inertia page for each public content type. Used by the public
 * controllers and by the admin preview (with unsaved pending changes applied).
 */
class PublicRenderer
{
    /** Set while rendering a CMS preview, so the page shows the preview bar. */
    private bool $preview = false;

    public function __construct(private SectionPresenter $sections) {}

    public function render(Model $model, bool $preview = false): Response
    {
        $this->preview = $preview;

        return match (true) {
            $model instanceof Page => $this->page($model),
            $model instanceof Program => $this->program($model),
            $model instanceof School => $this->school($model),
            $model instanceof Centre => $this->centre($model),
            $model instanceof Faculty => $this->faculty($model),
            $model instanceof Post => $this->post($model),
            $model instanceof Gallery => $this->gallery($model),
            $model instanceof Partner => $this->partner($model),
            $model instanceof Leader => $this->leader($model),
            $model instanceof Event => $this->event($model),
            $model instanceof Publication => $this->publication($model),
            $model instanceof JobOpening => $this->job($model),
            default => abort(404),
        };
    }

    public function page(Page $page): Response
    {
        $page->loadMissing('sections');
        $isHome = $page->template === 'home';
        $hero = $page->sections->firstWhere('type', 'page_hero') ?? $page->sections->firstWhere('type', 'home_hero');

        $seo = $page->seo(['description' => $page->excerpt]);
        if ($isHome) {
            $seo['title'] = $page->meta_title ?: SiteSettings::public()['site_name'] ?? 'NAMTECH';
            $seo['canonical'] = url('/');
            $seo['jsonLd'] = [$this->organizationSchema()];
        } else {
            $seo['jsonLd'] = [$this->breadcrumbs($this->pageTrail($page))];
        }

        return $this->respond('site/Page', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'template' => $page->template,
                'breadcrumbs' => $isHome ? [] : $this->pageTrail($page),
                'has_hero' => $hero !== null,
            ],
            'sections' => $this->sections->present($page->sections),
        ], $seo);
    }

    public function program(Program $program): Response
    {
        $program->loadMissing('image', 'school', 'faculty.photo', 'sections');
        $trail = [['label' => 'Programs', 'url' => '/programs'], ['label' => $program->title, 'url' => $program->publicPath()]];
        $seo = $program->seo(['description' => $program->summary, 'image' => $program->image]);
        $seo['jsonLd'] = [$this->breadcrumbs($trail), array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Course',
            'name' => $program->title,
            'description' => $program->summary,
            'url' => url($program->publicPath()),
            'provider' => ['@type' => 'CollegeOrUniversity', 'name' => 'NAMTECH', 'sameAs' => url('/')],
        ])];

        return $this->respond('site/programs/Show', [
            'program' => Presenters::programCard($program) + [
                'body' => $program->body,
                'apply_url' => $program->apply_url,
                'school' => $program->school ? ['title' => $program->school->name, 'url' => $program->school->isLive() ? $program->school->publicPath() : null] : null,
                'image' => $program->image?->toImage($program->title),
            ],
            'details' => $this->withProgramPartners(ProgramDetails::present($program->details)),
            'tabs' => ProgramDetails::Tabs,
            'faculty' => $program->faculty->filter->isLive()->map(Presenters::facultyCard(...))->values(),
            'sections' => $this->sections->present($program->sections),
            'hidden' => PageBlocks::hidden($program),
            'breadcrumbs' => $trail,
            'programs' => Program::query()->published()->orderBy('title')->get(['id', 'title']),
        ], $seo);
    }

    /**
     * Program partners: the program's own list, with logos and photos filled in from the Partners
     * library by name; without a list, NAMTECH's featured partners are shown.
     *
     * @param  array<string, mixed>  $details
     * @return array<string, mixed>
     */
    private function withProgramPartners(array $details): array
    {
        $library = Partner::query()->published()->with('logo', 'image', 'category')->orderBy('sort_order')->get();
        $items = $details['partners']['items'] ?? [];

        if ($items === []) {
            $items = $library->filter(fn (Partner $p) => $p->is_featured && $p->image)->take(8)->map(fn (Partner $p) => [
                'image' => $p->image->toImage($p->name),
                'tag' => $p->category ? Str::title(Str::singular($p->category->name)) : null,
                'logo' => $p->logo?->toImage($p->name),
                'title' => $p->name,
                'text' => $p->summary,
                'link_url' => $p->publicPath(),
            ])->values()->all();
        } else {
            $items = array_map(function (array $item) use ($library): array {
                $plain = fn (?string $text) => ' '.trim(preg_replace('/[^a-z0-9]+/', ' ', mb_strtolower((string) $text))).' ';
                $match = $library->first(fn (Partner $p) => str_contains($plain($item['title'] ?? ''), $plain($p->name)));
                if ($match) {
                    $item['logo'] ??= $match->logo?->toImage($match->name);
                    $item['image'] ??= $match->image?->toImage($match->name);
                }

                return $item;
            }, $items);
        }

        $details['partners'] = ['heading' => $details['partners']['heading'] ?? null, 'items' => $items];

        return $details;
    }

    public function school(School $school): Response
    {
        $school->loadMissing('image', 'sections');
        $trail = [['label' => 'Schools & centres', 'url' => '/schools'], ['label' => $school->name, 'url' => $school->publicPath()]];
        $seo = $school->seo(['description' => $school->summary, 'image' => $school->image]);
        if ($school->sections->isNotEmpty()) {
            return $this->landing($school->name, $trail, $school->sections, $seo);
        }
        $seo['jsonLd'] = [$this->breadcrumbs($trail)];

        return $this->respond('site/schools/Show', [
            'unit' => Presenters::schoolCard($school) + ['body' => $school->body, 'kind' => 'School'],
            'programs' => $school->programs()->published()->with('image')->get()->map(Presenters::programCard(...)),
            'centres' => $school->centres()->published()->with('image')->get()->map(Presenters::centreCard(...)),
            'faculty' => $school->faculty()->published()->with('photo')->limit(12)->get()->map(Presenters::facultyCard(...)),
            'hidden' => PageBlocks::hidden($school),
            'breadcrumbs' => $trail,
        ], $seo);
    }

    public function centre(Centre $centre): Response
    {
        $centre->loadMissing('image', 'school', 'sections');
        $trail = [['label' => 'Schools & centres', 'url' => '/schools'], ['label' => $centre->name, 'url' => $centre->publicPath()]];
        $seo = $centre->seo(['description' => $centre->summary, 'image' => $centre->image]);
        if ($centre->sections->isNotEmpty()) {
            return $this->landing($centre->name, $trail, $centre->sections, $seo);
        }
        $seo['jsonLd'] = [$this->breadcrumbs($trail)];

        return $this->respond('site/schools/Show', [
            'unit' => Presenters::centreCard($centre) + ['body' => $centre->body, 'kind' => 'Centre'],
            'programs' => [],
            'centres' => [],
            'faculty' => [],
            'hidden' => PageBlocks::hidden($centre),
            'breadcrumbs' => $trail,
        ], $seo);
    }

    public function faculty(Faculty $faculty): Response
    {
        $faculty->loadMissing('photo', 'school', 'programs');
        $trail = [['label' => 'Faculty', 'url' => '/faculty'], ['label' => $faculty->name, 'url' => $faculty->publicPath()]];
        $seo = $faculty->seo(['description' => $faculty->summary ?? $faculty->designation, 'image' => $faculty->photo, 'type' => 'profile']);
        $seo['jsonLd'] = [$this->breadcrumbs($trail), array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Person',
            'name' => $faculty->name,
            'jobTitle' => $faculty->designation,
            'worksFor' => ['@type' => 'CollegeOrUniversity', 'name' => 'NAMTECH'],
            'url' => url($faculty->publicPath()),
        ])];

        return $this->respond('site/faculty/Show', [
            'person' => Presenters::facultyCard($faculty) + [
                'summary' => $faculty->summary,
                'bio' => $faculty->bio,
                'qualifications' => $faculty->qualifications ?? [],
                'experience' => $faculty->experience ?? [],
                'research' => $faculty->research,
                'publications' => $faculty->publications,
                'awards' => $faculty->awards ?? [],
                'category' => Faculty::Categories[$faculty->category] ?? null,
                'research_interests' => $faculty->research_interests,
                'profile_url' => $faculty->profile_url,
                'school' => $faculty->school?->isLive() ? ['title' => $faculty->school->name, 'url' => $faculty->school->publicPath()] : null,
                'programs' => $faculty->programs->filter->isLive()->map(fn (Program $p) => ['title' => $p->title, 'url' => $p->publicPath()])->values(),
            ],
            'hidden' => PageBlocks::hidden($faculty),
            'breadcrumbs' => $trail,
        ], $seo);
    }

    public function post(Post $post): Response
    {
        $post->loadMissing('image', 'category', 'author.photo', 'tags', 'sections');
        $prefix = Post::prefixFor($post->type);
        $label = match ($post->type) {
            'blog' => 'Blogs',
            'story' => 'Impact Stories',
            'press' => 'Press Releases',
            'announcement' => 'Announcements',
            default => 'News',
        };
        $trail = [['label' => $label, 'url' => '/'.$prefix], ['label' => $post->title, 'url' => $post->publicPath()]];
        $seo = $post->seo(['description' => $post->excerpt, 'image' => $post->image, 'type' => 'article']);
        $seo['jsonLd'] = [$this->breadcrumbs($trail), array_filter([
            '@context' => 'https://schema.org',
            '@type' => $post->type === 'blog' ? 'BlogPosting' : 'NewsArticle',
            'headline' => $post->title,
            'datePublished' => $post->published_at?->toIso8601String(),
            'dateModified' => $post->updated_at?->toIso8601String(),
            'image' => $post->image ? url($post->image->url('lg')) : null,
            'author' => $post->author ? ['@type' => 'Person', 'name' => $post->author->name] : ['@type' => 'Organization', 'name' => 'NAMTECH'],
            'publisher' => ['@type' => 'Organization', 'name' => 'NAMTECH'],
            'mainEntityOfPage' => url($post->publicPath()),
        ])];
        $seo['article'] = ['published_time' => $post->published_at?->toIso8601String(), 'modified_time' => $post->updated_at?->toIso8601String()];

        return $this->respond('site/posts/Show', [
            'post' => Presenters::postCard($post) + [
                'body' => ($anchored = HtmlSanitizer::withHeadingAnchors($post->body))['html'],
                'toc' => $anchored['toc'],
                'author_name' => $post->author?->name,
                'author' => $post->author ? ['name' => $post->author->name, 'designation' => $post->author->designation, 'photo' => $post->author->photo?->toImage($post->author->name)] : null,
                'tags' => $post->tags->pluck('name'),
                'kind' => $post->type,
            ],
            'sections' => $this->sections->present($post->sections),
            'latest' => $post->type === 'blog'
                ? Post::query()->published()->with('image')->where('type', 'blog')->whereKeyNot($post->id ?? 0)->latest('published_at')->limit(5)->get()->map(Presenters::postCard(...))
                : [],
            'related' => Post::query()->published()->with('image', 'category')->where('type', $post->type)
                ->whereKeyNot($post->id ?? 0)->latest('published_at')->limit(3)->get()->map(Presenters::postCard(...)),
            'hidden' => PageBlocks::hidden($post),
            'breadcrumbs' => $trail,
            'listing' => ['label' => $label, 'url' => '/'.$prefix],
        ], $seo);
    }

    public function gallery(Gallery $gallery): Response
    {
        $gallery->loadMissing('items.media', 'cover');
        $trail = [['label' => 'Campus', 'url' => '/campus'], ['label' => $gallery->title, 'url' => $gallery->publicPath()]];
        $seo = $gallery->seo(['description' => $gallery->description, 'image' => $gallery->cover]);
        $seo['jsonLd'] = [$this->breadcrumbs($trail)];

        return $this->respond('site/Gallery', [
            'gallery' => Presenters::gallery($gallery),
            'breadcrumbs' => $trail,
            'embedHosts' => config('namtech.embed_hosts'),
        ], $seo);
    }

    public function partner(Partner $partner): Response
    {
        abort_if($partner->publicPath() === null, 404);
        $partner->loadMissing('logo', 'image', 'category');
        $trail = [['label' => 'Partnerships', 'url' => '/partnerships'], ['label' => $partner->name, 'url' => $partner->publicPath()]];
        $seo = $partner->seo(['description' => $partner->summary, 'image' => $partner->image]);
        $seo['jsonLd'] = [$this->breadcrumbs($trail)];

        return $this->respond('site/PartnerStory', [
            'partner' => Presenters::partnerCard($partner) + [
                'story' => $partner->story,
                'logo' => $partner->logo?->toImage($partner->name),
                'website_url' => $partner->website_url,
                'category' => $partner->category?->name,
            ],
            'breadcrumbs' => $trail,
        ], $seo);
    }

    /**
     * A school or centre landing page built from sections (School Landing Page template).
     *
     * @param  array<int, array{label: string, url: string}>  $trail
     * @param  iterable<PageSection>  $sections
     * @param  array<string, mixed>  $seo
     */
    private function landing(string $title, array $trail, iterable $sections, array $seo, array $jsonLd = []): Response
    {
        $seo['jsonLd'] = [$this->breadcrumbs($trail), ...$jsonLd];

        return $this->respond('site/Page', [
            'page' => ['id' => null, 'title' => $title, 'template' => 'default', 'breadcrumbs' => $trail, 'has_hero' => true],
            'sections' => $this->sections->present($sections),
        ], $seo);
    }

    public function leader(Leader $leader): Response
    {
        $leader->loadMissing('photo');
        $trail = [['label' => 'About Us', 'url' => '/about'], ['label' => $leader->name, 'url' => $leader->publicPath()]];
        $seo = $leader->seo(['description' => $leader->summary ?? $leader->designation, 'image' => $leader->photo, 'type' => 'profile']);
        $seo['jsonLd'] = [$this->breadcrumbs($trail), array_filter([
            '@context' => 'https://schema.org', '@type' => 'Person', 'name' => $leader->name, 'jobTitle' => $leader->designation,
            'worksFor' => ['@type' => 'Organization', 'name' => $leader->organisation ?: 'NAMTECH'], 'url' => url($leader->publicPath()),
        ])];

        return $this->respond('site/Leader', [
            'person' => Presenters::leaderCard($leader) + [
                'organisation' => $leader->organisation,
                'group' => Leader::Groups[$leader->group] ?? null,
                'bio' => $leader->bio,
                'achievements' => $leader->achievements ?? [],
            ],
            'hidden' => PageBlocks::hidden($leader),
            'breadcrumbs' => $trail,
        ], $seo);
    }

    public function event(Event $event): Response
    {
        $event->loadMissing('image', 'school');
        $trail = [['label' => 'Events', 'url' => '/events'], ['label' => $event->title, 'url' => $event->publicPath()]];
        $seo = $event->seo(['description' => $event->summary, 'image' => $event->image]);
        $seo['jsonLd'] = [$this->breadcrumbs($trail), array_filter([
            '@context' => 'https://schema.org', '@type' => 'Event', 'name' => $event->title,
            'startDate' => $event->starts_at?->toIso8601String(), 'endDate' => $event->ends_at?->toIso8601String(),
            'location' => $event->venue ? ['@type' => 'Place', 'name' => $event->venue, 'address' => 'NAMTECH, Gandhinagar, Gujarat, India'] : null,
            'organizer' => ['@type' => 'CollegeOrUniversity', 'name' => 'NAMTECH', 'url' => url('/')],
            'description' => $event->summary,
        ])];
        $speaker = $event->speaker ?? [];
        $photo = isset($speaker['photo']) ? Media::query()->find($speaker['photo']) : null;

        return $this->respond('site/events/Show', [
            'event' => Presenters::eventCard($event) + [
                'overview' => $event->overview,
                'outcomes' => collect($event->outcomes ?? [])->pluck('text')->filter()->values(),
                'speaker' => array_filter($speaker) ? array_merge($speaker, ['photo' => $photo?->toImage($speaker['name'] ?? '')]) : null,
            ],
            'related' => Event::query()->published()->with('image')->whereKeyNot($event->id ?? 0)
                ->where('starts_at', '>=', now()->startOfDay())->orderBy('starts_at')->limit(6)->get()->map(Presenters::eventCard(...)),
            'hidden' => PageBlocks::hidden($event),
            'breadcrumbs' => $trail,
        ], $seo);
    }

    public function publication(Publication $publication): Response
    {
        $publication->loadMissing('image', 'school');
        $trail = [['label' => 'Research and Publications', 'url' => '/research-and-consultancy/publications'], ['label' => $publication->title, 'url' => $publication->publicPath()]];
        $seo = $publication->seo(['description' => $publication->summary, 'image' => $publication->image, 'type' => 'article']);
        $seo['jsonLd'] = [$this->breadcrumbs($trail), array_filter([
            '@context' => 'https://schema.org', '@type' => 'ScholarlyArticle', 'headline' => $publication->title,
            'author' => $publication->authors, 'publisher' => $publication->publisher, 'datePublished' => $publication->published_on?->toDateString(),
            'url' => $publication->url ?: url($publication->publicPath()),
        ])];

        return $this->respond('site/research/Show', [
            'publication' => Presenters::publicationCard($publication) + ['body' => $publication->body],
            'breadcrumbs' => $trail,
        ], $seo);
    }

    public function job(JobOpening $job): Response
    {
        $trail = [['label' => 'Careers', 'url' => '/careers'], ['label' => $job->title, 'url' => $job->publicPath()]];
        $seo = $job->seo(['description' => $job->summary]);
        $seo['jsonLd'] = [$this->breadcrumbs($trail), array_filter([
            '@context' => 'https://schema.org', '@type' => 'JobPosting', 'title' => $job->title,
            'description' => $job->description ?: $job->summary, 'datePosted' => $job->published_at?->toDateString(),
            'validThrough' => $job->closes_on?->toDateString(),
            'hiringOrganization' => ['@type' => 'CollegeOrUniversity', 'name' => 'NAMTECH', 'sameAs' => url('/')],
            'jobLocation' => ['@type' => 'Place', 'address' => ['@type' => 'PostalAddress', 'addressRegion' => 'Gujarat', 'addressCountry' => 'IN']],
        ])];

        return $this->respond('site/careers/Show', [
            'job' => Presenters::jobCard($job) + ['description' => $job->description, 'is_open' => $job->isOpen(), 'category_label' => JobOpening::Categories[$job->category] ?? null],
            'breadcrumbs' => $trail,
        ], $seo);
    }

    /**
     * @param  array<string, mixed>  $props
     * @param  array<string, mixed>  $seo
     */
    public function respond(string $component, array $props, array $seo): Response
    {
        $seo = $this->completeSeo($seo);

        $props += $this->preview ? ['preview' => true] : [];

        return PageResponse::render($component, $props + ['seo' => $seo], $seo + ['preloadImage' => $this->heroImage($props)]);
    }

    /**
     * The above-the-fold hero image, preloaded so the browser fetches it before scripts.
     *
     * @param  array<string, mixed>  $props
     * @return array{srcset: string, type: string, sizes: string}|null
     */
    private function heroImage(array $props): ?array
    {
        if (in_array('hero_image', $props['hidden'] ?? [], true)) {
            return null;
        }

        $first = $props['sections'][0] ?? null;
        $image = match (true) {
            ($first['type'] ?? null) === 'home_hero' => $first['data']['slides'][0]['image'] ?? null,
            ($first['type'] ?? null) === 'page_hero' => $first['data']['image'] ?? null,
            default => $props['program']['image'] ?? $props['post']['image'] ?? $props['person']['photo'] ?? $props['unit']['image'] ?? $props['partner']['image'] ?? null,
        };

        if (! is_array($image) || empty($image['sources'])) {
            return null;
        }

        $type = isset($image['sources']['avif']) ? 'avif' : (isset($image['sources']['webp']) ? 'webp' : 'jpg');

        return [
            'srcset' => $image['sources'][$type],
            'type' => $type === 'jpg' ? 'image/jpeg' : 'image/'.$type,
            'sizes' => ($first['type'] ?? null) === 'home_hero' || ($first['type'] ?? null) === 'page_hero' || ! isset($props['sections'])
                ? '(min-width: 992px) 50vw, 100vw'
                : '100vw',
        ];
    }

    /**
     * @param  array<string, mixed>  $seo
     * @return array<string, mixed>
     */
    public function completeSeo(array $seo): array
    {
        $settings = SiteSettings::public();
        $siteName = $settings['site_name'] ?? 'NAMTECH';
        $title = $seo['title'] ?? $siteName;

        return [
            'title' => $title === $siteName ? $siteName.' – '.($settings['site_tagline'] ?? 'Institute of Manufacturing Innovation') : $title.' | '.$siteName,
            'description' => $seo['description'] ?? Setting::get('default_meta_description'),
            'image' => ($image = $seo['image'] ?? SiteSettings::defaultImage()?->url('lg')) ? url($image) : null,
            'canonical' => $seo['canonical'] ?? url()->current(),
            'noindex' => (bool) ($seo['noindex'] ?? false),
            'type' => $seo['type'] ?? 'website',
            'siteName' => $siteName,
            'article' => $seo['article'] ?? null,
            'jsonLd' => $seo['jsonLd'] ?? [],
        ];
    }

    /**
     * @return array<int, array{label: string, url: string}>
     */
    private function pageTrail(Page $page): array
    {
        $trail = [];
        $current = $page;
        $guard = 0;
        while ($current && $guard++ < 10) {
            array_unshift($trail, ['label' => $current->title, 'url' => $current->publicPath()]);
            $current = $current->parent_id ? Page::query()->find($current->parent_id) : null;
        }

        return $trail;
    }

    /**
     * @param  array<int, array{label: string, url: string}>  $trail
     * @return array<string, mixed>
     */
    private function breadcrumbs(array $trail): array
    {
        $items = array_merge([['label' => 'Home', 'url' => '/']], $trail);

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn (array $item, int $index) => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['label'],
                'item' => url($item['url']),
            ], $items, array_keys($items)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function organizationSchema(): array
    {
        $settings = SiteSettings::public();

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'CollegeOrUniversity',
            'name' => $settings['site_name'] ?? 'NAMTECH',
            'alternateName' => $settings['site_tagline'] ?? null,
            'url' => url('/'),
            'logo' => asset('images/namtech-logo.svg'),
            'email' => $settings['email'] ?? null,
            'telephone' => $settings['phones'][0]['number'] ?? null,
            'address' => isset($settings['address']) ? ['@type' => 'PostalAddress', 'streetAddress' => $settings['address'], 'addressCountry' => 'IN'] : null,
            'sameAs' => array_values(array_filter([
                $settings['linkedin_url'] ?? null, $settings['x_url'] ?? null, $settings['youtube_url'] ?? null,
                $settings['instagram_url'] ?? null, $settings['facebook_url'] ?? null,
            ])),
        ]);
    }
}
