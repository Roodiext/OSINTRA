<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProkerController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/public-settings', [SettingController::class, 'getPublicSettings']); // Public config
Route::post('/messages', [MessageController::class, 'store']); // Public contact form

// Public data endpoints
Route::get('/divisions', [DivisionController::class, 'index']);
Route::get('/proker-media', [ProkerController::class, 'getAllMedia']);
Route::get('/prokers/{proker}', [ProkerController::class, 'show']);
Route::get('/prokers', [ProkerController::class, 'index']);
Route::get('/positions', [\App\Http\Controllers\Api\PositionController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Divisions
    Route::post('divisions', [DivisionController::class, 'store'])
        ->middleware('permission:Divisions,create');
    Route::get('divisions/{division}', [DivisionController::class, 'show']);
    Route::put('divisions/{division}', [DivisionController::class, 'update'])
        ->middleware('permission:Divisions,edit');
    Route::delete('divisions/{division}', [DivisionController::class, 'destroy'])
        ->middleware('permission:Divisions,delete');

    // Users
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store'])
        ->middleware('permission:Users,create');
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::put('users/{user}', [UserController::class, 'update'])
        ->middleware('permission:Users,edit');
    Route::delete('users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:Users,delete');
    Route::get('/users/search', [UserController::class, 'search']);

    // Prokers (protected routes)
    Route::post('/prokers', [ProkerController::class, 'store'])
        ->middleware('permission:Prokers,create');
    Route::get('/prokers/{proker}', [ProkerController::class, 'show']);
    Route::put('/prokers/{proker}', [ProkerController::class, 'update'])
        ->middleware('permission:Prokers,edit');
    Route::patch('/prokers/{proker}', [ProkerController::class, 'update'])
        ->middleware('permission:Prokers,edit');
    Route::delete('/prokers/{proker}', [ProkerController::class, 'destroy'])
        ->middleware('permission:Prokers,delete');
    Route::post('/prokers/{proker}/anggota', [ProkerController::class, 'addAnggota'])
        ->middleware('permission:Prokers,edit');
    Route::delete('/prokers/{proker}/anggota/{anggota}', [ProkerController::class, 'removeAnggota'])
        ->middleware('permission:Prokers,edit');
    Route::post('/prokers/{proker}/media/upload', [ProkerController::class, 'uploadMedia'])
        ->middleware('permission:Prokers,edit');
    Route::post('/prokers/{proker}/media', [ProkerController::class, 'addMedia'])
        ->middleware('permission:Prokers,edit');
    Route::delete('/prokers/{proker}/media/{media}', [ProkerController::class, 'removeMedia'])
        ->middleware('permission:Prokers,edit');
    Route::put('/prokers/{proker}/media/{media}/thumbnail', [ProkerController::class, 'setThumbnail'])
        ->middleware('permission:Prokers,edit');
    Route::put('/prokers/{proker}/media/{media}/highlight', [ProkerController::class, 'toggleHighlight'])
        ->middleware('permission:Prokers,edit');

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/statistics', [MessageController::class, 'statistics']);
    Route::get('/messages/{message}', [MessageController::class, 'show']);
    Route::put('/messages/{message}/status', [MessageController::class, 'updateStatus'])
        ->middleware('permission:Messages,edit');
    Route::post('/messages/{message}/reply', [MessageController::class, 'reply'])
        ->middleware('permission:Messages,edit');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy'])
        ->middleware('permission:Messages,delete');

    // Transactions
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::post('transactions', [TransactionController::class, 'store'])
        ->middleware('permission:Transactions,create');
    Route::get('transactions/{transaction}', [TransactionController::class, 'show']);
    Route::put('transactions/{transaction}', [TransactionController::class, 'update'])
        ->middleware('permission:Transactions,edit');
    Route::patch('transactions/{transaction}/approve', [TransactionController::class, 'approveTransaction'])
        ->middleware('permission:Transactions,edit');
    Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])
        ->middleware('permission:Transactions,delete');
    Route::get('/transactions-statistics', [TransactionController::class, 'statistics']);
    Route::get('/transactions-monthly', [TransactionController::class, 'monthlyData']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::post('/settings/logo', [SettingController::class, 'uploadLogo']);
    Route::post('/settings/ketos-image', [SettingController::class, 'uploadKetosImage']);
    Route::post('/settings/hero-image', [SettingController::class, 'uploadHeroImage']);
    Route::put('/settings/roles/{role}', [\App\Http\Controllers\Settings\RolePermissionController::class, 'update'])
        ->middleware(\App\Http\Middleware\EnsureUserIsAdmin::class);
    Route::get('/roles', [SettingController::class, 'getRoles']);
    Route::put('/roles/{role}/permissions', [SettingController::class, 'updateRolePermissions']);
    Route::get('/audit-logs', [SettingController::class, 'getAuditLogs']);
    
    // Positions
    Route::post('positions', [\App\Http\Controllers\Api\PositionController::class, 'store'])
        ->middleware('permission:Positions,create');
    Route::put('positions/{position}', [\App\Http\Controllers\Api\PositionController::class, 'update'])
        ->middleware('permission:Positions,edit');
    Route::delete('positions/{position}', [\App\Http\Controllers\Api\PositionController::class, 'destroy'])
        ->middleware('permission:Positions,delete');
});
