<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module, string $action): Response
    {
        // Check Sanctum first (from Bearer token or cookie), fallback to session
        $user = auth('sanctum')->user() ?? auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Admin has all permissions
        if ($user->role && $user->role->name === 'Admin') {
            return $next($request);
        }

        if (!$user->hasPermission($module, $action)) {
            return response()->json([
                'message' => 'You do not have permission to perform this action'
            ], 403);
        }

        return $next($request);
    }
}

