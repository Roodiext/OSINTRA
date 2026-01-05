<?php

namespace App\Http\Helpers;

use Inertia\Inertia;

class PermissionHelper
{
    /**
     * Check permission and redirect to permission denied page with alert
     * 
     * @param string $module
     * @param string $action
     * @param string|null $errorMessage
     * @param string|null $redirectUrl
     */
    public static function checkOrDeny(
        string $module, 
        string $action, 
        string $errorMessage = null,
        string $redirectUrl = null
    ): bool {
        $user = auth()->user();

        if (!$user->hasPermission($module, $action)) {
            $message = $errorMessage ?? "Anda tidak memiliki izin untuk mengakses halaman ini.";
            $redirect = $redirectUrl ?? route('dashboard');

            // Redirect to permission denied page with alert
            return response()->redirectTo(
                route('permission-denied', [
                    'message' => urlencode($message),
                    'redirect' => $redirect
                ])
            )->send();
        }

        return true;
    }

    /**
     * Render permission denied page with SweetAlert2
     */
    public static function renderDenied(string $message = null, string $redirect = null)
    {
        return Inertia::render('PermissionDenied', [
            'message' => $message ?? 'Anda tidak memiliki izin untuk mengakses halaman ini.',
            'redirect' => $redirect ?? route('dashboard'),
        ]);
    }
}
