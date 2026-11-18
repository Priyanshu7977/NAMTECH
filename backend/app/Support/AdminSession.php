<?php

namespace App\Support;

use App\Admin\ResourceRegistry;
use App\Enums\Permission;
use Illuminate\Http\Request;

/**
 * The signed-in CMS user, their permissions and the sidebar navigation they may see,
 * shared with every CMS page (see HandleInertiaRequests). Guests get null and no navigation.
 */
class AdminSession
{
    /**
     * @return array<string, mixed>|null
     */
    public static function user(Request $request): ?array
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roleLabel(),
            ],
            'permissions' => collect(Permission::all())->filter(fn (string $permission) => $user->can($permission))->values(),
        ];
    }

    /**
     * Sidebar navigation filtered by what the user may access.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function navigation(Request $request): array
    {
        $user = $request->user();
        if (! $user) {
            return [];
        }
        $groups = [];

        foreach (ResourceRegistry::all() as $resource) {
            if ($user->can($resource->permission())) {
                $groups[$resource->navigationGroup()][] = [
                    'label' => $resource->label(),
                    'url' => route('admin.resources.index', $resource->slug()),
                    'match' => 'admin/content/'.$resource->slug(),
                ];
            }
        }

        if ($user->can(Permission::NavigationManage)) {
            $groups['Website'][] = ['label' => 'Menus', 'url' => route('admin.menus.index'), 'match' => 'admin/menus'];
        }
        if ($user->can(Permission::MediaManage)) {
            $groups['Website'][] = ['label' => 'Media library', 'url' => route('admin.media.index'), 'match' => 'admin/media'];
        }
        if ($user->can(Permission::EnquiriesView)) {
            $groups['Leads'][] = ['label' => 'Enquiries', 'url' => route('admin.enquiries.index'), 'match' => 'admin/enquiries'];
            $groups['Leads'][] = ['label' => 'Newsletter', 'url' => route('admin.newsletter.index'), 'match' => 'admin/newsletter'];
            $groups['Leads'][] = ['label' => 'Job applications', 'url' => route('admin.applications.index'), 'match' => 'admin/applications'];
        }
        if ($user->can(Permission::SettingsManage)) {
            $groups['Administration'][] = ['label' => 'Settings', 'url' => route('admin.settings.edit'), 'match' => 'admin/settings'];
        }
        if ($user->can(Permission::UsersManage)) {
            $groups['Administration'][] = ['label' => 'Users', 'url' => route('admin.users.index'), 'match' => 'admin/users'];
        }
        if ($user->can(Permission::AuditView)) {
            $groups['Administration'][] = ['label' => 'Audit log', 'url' => route('admin.audit'), 'match' => 'admin/audit'];
        }

        $order = ['Website', 'Academics', 'People', 'Partnerships', 'Editorial', 'Careers', 'Campus', 'Mission', 'Leads', 'Administration'];

        return collect($groups)
            ->sortBy(fn ($items, $group) => array_search($group, $order, true))
            ->map(fn ($items, $group) => ['group' => $group, 'items' => $items])
            ->values()->all();
    }
}
