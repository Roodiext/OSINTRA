<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InertiaAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated via Sanctum
        if (!$request->user()) {
            \Log::info('InertiaAuth: User not authenticated', [
                'path' => $request->path(),
                'header' => $request->header('Authorization') ? 'Has Bearer' : 'No Bearer',
                'x-inertia' => $request->header('X-Inertia'),
            ]);
            
            // If it's an Inertia request, redirect to login
            if ($request->header('X-Inertia')) {
                return redirect()->route('login');
            }
            
            // For API requests, return 401
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        \Log::info('InertiaAuth: User authenticated', [
            'user_id' => $request->user()->id,
            'path' => $request->path(),
        ]);

        return $next($request);
    }
}

