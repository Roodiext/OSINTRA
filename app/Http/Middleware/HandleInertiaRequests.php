<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() 
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'username' => $request->user()->username,
                        'email' => $request->user()->email,
                        'profile_picture' => $request->user()->profile_picture,
                        'role' => $request->user()->role ? [
                            'id' => $request->user()->role->id,
                            'name' => $request->user()->role->name,
                            'permissions' => $request->user()->role->permissions,
                        ] : null,
                    ]
                    : (auth('sanctum')->user() 
                        ? [
                            'id' => auth('sanctum')->user()->id,
                            'name' => auth('sanctum')->user()->name,
                            'username' => auth('sanctum')->user()->username,
                            'email' => auth('sanctum')->user()->email,
                            'profile_picture' => auth('sanctum')->user()->profile_picture,
                            'role' => auth('sanctum')->user()->role ? [
                                'id' => auth('sanctum')->user()->role->id,
                                'name' => auth('sanctum')->user()->role->name,
                                'permissions' => auth('sanctum')->user()->role->permissions,
                            ] : null,
                        ]
                        : null),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'permission_denied' => session('permission_denied'),
                'permission_message' => session('permission_message'),
                'success' => session('success'),
                'error' => session('error'),
            ],
        ];
    }
}
