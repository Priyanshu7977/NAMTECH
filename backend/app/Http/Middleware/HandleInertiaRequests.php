<?php

namespace App\Http\Middleware;

use App\Support\AdminSession;
use App\Support\SiteChrome;
use Illuminate\Http\Request;
use Inertia\Middleware;

/**
 * Shared props for every page: the site chrome (settings, announcements, menus) on public
 * pages, the signed-in user and sidebar on CMS screens, and one-time flash messages.
 */
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    /**
     * CMS screens render in the browser only; public pages (and CMS previews of them) are
     * server-rendered for search engines and a fast first paint.
     *
     * @var array<int, string>
     */
    protected $withoutSsr = ['admin', 'admin/*'];

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $isAdmin = $request->is('admin', 'admin/*');
        $isCmsScreen = $isAdmin && ! $request->is('admin/preview/*');

        return [
            ...parent::share($request),
            'site' => $isCmsScreen ? null : fn () => SiteChrome::data(),
            'auth' => $isAdmin ? fn () => AdminSession::user($request) : null,
            'navigation' => $isCmsScreen ? fn () => AdminSession::navigation($request) : [],
            'flash' => fn () => $this->flash($request),
        ];
    }

    /**
     * Messages set with ->with('success', …) etc. "form_success" carries {form, message}
     * for the public enquiry and newsletter forms.
     *
     * @return array<string, mixed>
     */
    private function flash(Request $request): array
    {
        if (! $request->hasSession()) {
            return [];
        }

        $session = $request->session();

        return array_filter([
            'success' => $session->get('success'),
            'error' => $session->get('error'),
            'status' => $session->get('status'),
            'form' => $session->get('form_success'),
        ], fn ($value) => $value !== null);
    }
}
