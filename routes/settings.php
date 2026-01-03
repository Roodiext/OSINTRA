<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    // Role permissions management (admin only)
    Route::get('settings/roles', [\App\Http\Controllers\Settings\RolePermissionController::class, 'index'])
        ->middleware(\App\Http\Middleware\EnsureUserIsAdmin::class)
        ->name('settings.roles.index');



    // Module / Page access management (admin only)
    Route::get('settings/modules-access', [\App\Http\Controllers\Settings\ModuleAccessController::class, 'index'])
        ->middleware(\App\Http\Middleware\EnsureUserIsAdmin::class)
        ->name('settings.modules.index');

    Route::put('settings/modules-access/{module}', [\App\Http\Controllers\Settings\ModuleAccessController::class, 'update'])
        ->middleware(\App\Http\Middleware\EnsureUserIsAdmin::class)
        ->name('settings.modules.update');



    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
