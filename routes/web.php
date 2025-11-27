<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Public Page - OSINTRA (Accessible without login)
Route::get('/', function () {
    return Inertia::render('PublicPage');
})->name('home');

// Simple public routes for individual sections/pages
Route::get('/about', function () {
    return Inertia::render('AboutPage');
})->name('about');

Route::get('/struktur', function () {
    return Inertia::render('StrukturPage');
})->name('struktur');

Route::get('/gallery', function () {
    return Inertia::render('GalleryPage');
})->name('gallery');

Route::get('/contact', function () {
    return Inertia::render('ContactPage');
})->name('contact');

// Login Page - OSINTRA (Accessible without login)
Route::get('/login', function () {
    // If already logged in, redirect to dashboard
    if (request()->bearerToken() || session()->has('auth_token')) {
        return redirect()->route('dashboard');
    }
    // Temporary: Use simple test login
    return Inertia::render('LoginPage');
})->name('login');

/*
|--------------------------------------------------------------------------
| Protected Routes (Authentication Required)
|--------------------------------------------------------------------------
| These routes require user to be logged in via Laravel Sanctum token
| If not authenticated, will redirect to /login
*/

Route::middleware(['auth:sanctum'])->group(function () {
    // Dashboard Home
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard/DashboardPage', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    })->name('dashboard');
    
    // Dashboard Modules
    Route::get('/dashboard/divisions', function () {
        return Inertia::render('dashboard/DivisionsPage', [
            'auth' => ['user' => auth()->user()],
            'divisions' => \App\Models\Division::withCount('users')->get()
        ]);
    })->name('dashboard.divisions');
    
    Route::get('/dashboard/positions', function () {
        $user = auth()->user();
        $role = strtolower(optional($user->role)->name ?? '');
        // Only allow admin, ketua, wakil ketua to access Positions page
        if (!in_array($role, ['admin', 'ketua', 'wakil ketua'])) {
            abort(403);
        }
        return Inertia::render('dashboard/PositionsPage', [
            'auth' => ['user' => $user],
        ]);
    })->name('dashboard.positions');
    
    Route::get('/dashboard/users', function () {
        return Inertia::render('dashboard/UsersPage', [
            'auth' => ['user' => auth()->user()],
            'users' => \App\Models\User::with(['role', 'position'])->get(),
            'roles' => \App\Models\Role::all(),
            'divisions' => \App\Models\Division::all(),
            'positions' => \App\Models\Position::orderBy('id')->get()
        ]);
    })->name('dashboard.users');
    
    Route::get('/dashboard/prokers', function () {
        return Inertia::render('dashboard/ProkersPage', [
            'auth' => ['user' => auth()->user()],
            'prokers' => \App\Models\Proker::with(['divisions'])->get(),
            'divisions' => \App\Models\Division::all()
        ]);
    })->name('dashboard.prokers');
    
    Route::get('/dashboard/prokers/{id}', function ($id) {
        return Inertia::render('dashboard/ProkerDetailPage', [
            'auth' => ['user' => auth()->user()],
        ]);
    })->name('dashboard.prokers.detail');
    
    Route::get('/dashboard/prokers/{id}/edit', function ($id) {
        return Inertia::render('dashboard/ProkerEditPage', [
            'auth' => ['user' => auth()->user()],
            'divisions' => \App\Models\Division::all()
        ]);
    })->name('dashboard.prokers.edit');
    
    Route::get('/dashboard/messages', function () {
        return Inertia::render('dashboard/MessagesPage', [
            'auth' => ['user' => auth()->user()],
            'messages' => \App\Models\Message::orderBy('created_at', 'desc')->get()
        ]);
    })->name('dashboard.messages');
    
    Route::get('/dashboard/transactions', function () {
        $transactions = \App\Models\Transaction::with('creator')->orderBy('date', 'desc')->get();
        $balance = $transactions->where('type', 'income')->sum('amount') - $transactions->where('type', 'expense')->sum('amount');
        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        
        // Monthly data for chart
        $monthlyData = \App\Models\Transaction::selectRaw(
            "DATE_FORMAT(date, '%Y-%m') as month, 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense"
        )
        ->groupBy('month')
        ->orderBy('month', 'desc')
        ->limit(6)
        ->get()
        ->reverse()
        ->values();
        
        return Inertia::render('dashboard/TransactionsPage', [
            'auth' => ['user' => auth()->user()],
            'transactions' => $transactions,
            'balance' => $balance,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'monthlyData' => $monthlyData
        ]);
    })->name('dashboard.transactions');
    
    Route::get('/dashboard/settings', function () {
        return Inertia::render('dashboard/SettingsPage', [
            'auth' => ['user' => auth()->user()]
        ]);
    })->name('dashboard.settings');
    
    Route::get('/dashboard/profile', function () {
        return Inertia::render('dashboard/ProfilePage', [
            'auth' => ['user' => auth()->user()],
            'user' => auth()->user()->load(['role', 'position'])
        ]);
    })->name('dashboard.profile');
    
    Route::get('/dashboard/audit-logs', function () {
        return Inertia::render('dashboard/AuditLogsPage', [
            'auth' => ['user' => auth()->user()],
            'logs' => \App\Models\AuditLog::with('user')->orderBy('created_at', 'desc')->limit(100)->get()
        ]);
    })->name('dashboard.audit-logs');
});

// Disable Laravel Fortify settings routes for now
// require __DIR__.'/settings.php';
