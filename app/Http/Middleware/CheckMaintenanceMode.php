<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AppSetting;
use Inertia\Inertia;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // 1. Check if maintenance mode is enabled
            $maintenanceMode = AppSetting::get('maintenance_mode');
            
            // Robust boolean check
            $isMaintenance = filter_var($maintenanceMode, FILTER_VALIDATE_BOOLEAN);

            if (!$isMaintenance) {
                return $next($request);
            }

            // 2. Allow Essential Routes (Login, Dashboard, APIs, Sanctum, and Maintenance itself if we were to use a route)
            if ($request->is('dashboard*', 'login', 'api/*', 'sanctum/*', 'storage/*')) {
                return $next($request);
            }

            // 3. Admin Bypass Check
            $token = $request->cookie('auth_token');
            if ($token) {
                // Temporarily set the header to allow auth check
                $request->headers->set('Authorization', "Bearer $token");
                if (auth('sanctum')->check()) {
                    $user = auth('sanctum')->user();
                    if ($user && $user->role && in_array($user->role->name, ['Admin', 'Administrator'])) {
                        return $next($request);
                    }
                }
            }

            // 4. Block Access - Render Maintenance Page
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Service Unavailable - Maintenance Mode'], 503);
            }

            $logo = AppSetting::get('site_logo');

            return Inertia::render('MaintenancePage', [
                'logo' => $logo,
            ])
                ->toResponse($request)
                ->setStatusCode(503);

        } catch (\Throwable $e) {
             \Illuminate\Support\Facades\Log::error('Maintenance Middleware Error: ' . $e->getMessage());
             throw $e;
        }
    }
}
