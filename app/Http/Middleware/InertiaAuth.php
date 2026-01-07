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
        // First, check if user is authenticated via Sanctum bearer token (from header)
        $user = auth('sanctum')->user();
        
        // If no user from bearer token, try to authenticate with cookie if present
        if (!$user) {
            $token = $request->cookie('auth_token');
            if ($token) {
                // Temporarily add Authorization header for Sanctum to check the token
                $request->headers->set('Authorization', "Bearer $token");
                $user = auth('sanctum')->user();
            }
        }
        
        if (!$user) {
            \Log::warning('InertiaAuth: User not authenticated', [
                'path' => $request->path(),
                'has_bearer' => $request->header('Authorization') ? 'yes' : 'no',
                'has_cookie' => $request->cookie('auth_token') ? 'yes' : 'no',
            ]);
            
            // Redirect to login
            return redirect()->route('login');
        }

        // Set authenticated user to request so it can be accessed via $request->user()
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        \Log::info('InertiaAuth: User authenticated', [
            'user_id' => $user->id,
            'path' => $request->path(),
        ]);

        return $next($request);
    }
}

