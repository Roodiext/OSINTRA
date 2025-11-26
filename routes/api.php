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
Route::post('/messages', [MessageController::class, 'store']); // Public contact form

// Public data endpoints
Route::get('/divisions', [DivisionController::class, 'index']);
Route::get('/proker-media', [ProkerController::class, 'getAllMedia']);

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
    Route::apiResource('divisions', DivisionController::class)->except(['index']);

    // Users
    Route::apiResource('users', UserController::class);

        Route::get('/users/search', [UserController::class, 'search']);

    // Prokers
    Route::apiResource('prokers', ProkerController::class);
    Route::post('/prokers/{proker}/anggota', [ProkerController::class, 'addAnggota']);
    Route::delete('/prokers/{proker}/anggota/{anggota}', [ProkerController::class, 'removeAnggota']);
    Route::post('/prokers/{proker}/media', [ProkerController::class, 'addMedia']);
    Route::delete('/prokers/{proker}/media/{media}', [ProkerController::class, 'removeMedia']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/statistics', [MessageController::class, 'statistics']);
    Route::get('/messages/{message}', [MessageController::class, 'show']);
    Route::put('/messages/{message}/status', [MessageController::class, 'updateStatus']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);
    Route::get('/transactions-statistics', [TransactionController::class, 'statistics']);
    Route::get('/transactions-monthly', [TransactionController::class, 'monthlyData']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::get('/roles', [SettingController::class, 'getRoles']);
    Route::put('/roles/{role}/permissions', [SettingController::class, 'updateRolePermissions']);
    Route::get('/audit-logs', [SettingController::class, 'getAuditLogs']);
    
    // Positions
    Route::apiResource('positions', \App\Http\Controllers\Api\PositionController::class)->except(['show']);
});
