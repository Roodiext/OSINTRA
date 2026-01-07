<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPagePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module, string $action = 'view', string $label = null): Response
    {
        // Check Sanctum first (from Bearer token or cookie), fallback to session
        $user = auth('sanctum')->user() ?? auth()->user();
        
        if (!$user) {
            return redirect('/login');
        }

        // Admin has all permissions
        if ($user->role->name === 'Admin') {
            return $next($request);
        }

        // Check if user has permission
        if (!$user->hasPermission($module, $action)) {
            $displayName = $label ?? $module;
            // Return alert response
            return redirect('/dashboard')->with([
                'permission_denied' => true,
                'permission_message' => "Anda tidak memiliki izin untuk mengakses halaman {$displayName}.",
            ]);
        }

        return $next($request);
    }
}
