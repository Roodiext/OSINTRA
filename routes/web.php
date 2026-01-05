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

Route::get('/prokers', function () {
    return Inertia::render('PublicProkersPage');
})->name('prokers');

Route::get('/prokers/{id}', function ($id) {
    return Inertia::render('PublicProkerDetailPage');
})->name('prokers.detail');

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
    // Permission Denied Page - Show SweetAlert2 with backdrop blur
    Route::get('/permission-denied', function () {
        $message = request()->query('message', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        $redirect = request()->query('redirect', route('dashboard'));
        
        // Validate redirect URL is safe (starts with / or domain)
        if (!str_starts_with($redirect, '/') && !str_starts_with($redirect, url('/'))) {
            $redirect = route('dashboard');
        }
        
        return Inertia::render('PermissionDenied', [
            'message' => $message,
            'redirect' => $redirect,
        ]);
    })->name('permission-denied');
    
    // Dashboard Home - Everyone can view
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard/DashboardPage', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    })->name('dashboard');
    
    // Dashboard Modules - With permission checks
    Route::get('/dashboard/divisions', function () {
        return Inertia::render('dashboard/DivisionsPage', [
            'auth' => ['user' => auth()->user()],
            'divisions' => \App\Models\Division::withCount('users')->get(),
        ]);
    })->middleware('check.permission:Divisions,view,Divisi')->name('dashboard.divisions');
    
    Route::get('/dashboard/positions', function () {
        return Inertia::render('dashboard/PositionsPage', [
            'auth' => ['user' => auth()->user()],
        ]);
    })->middleware('check.permission:Positions,view,Posisi')->name('dashboard.positions');
    
    Route::get('/dashboard/users', function () {
        return Inertia::render('dashboard/UsersPage', [
            'auth' => ['user' => auth()->user()],
            'users' => \App\Models\User::with(['role', 'position'])->get(),
            'roles' => \App\Models\Role::all(),
            'divisions' => \App\Models\Division::all(),
            'positions' => \App\Models\Position::all(),
        ]);
    })->middleware('check.permission:Users,view,Pengguna')->name('dashboard.users');
    
    Route::get('/dashboard/prokers', function () {
        return Inertia::render('dashboard/ProkersPage', [
            'auth' => ['user' => auth()->user()],
            'prokers' => \App\Models\Proker::with(['divisions', 'media'])->get(),
            'divisions' => \App\Models\Division::all(),
        ]);
    })->middleware('check.permission:Prokers,view,Program Kerja')->name('dashboard.prokers');
    
    Route::get('/dashboard/prokers/{id}', function ($id) {
        return Inertia::render('dashboard/ProkerDetailPage', [
            'auth' => ['user' => auth()->user()],
        ]);
    })->middleware('check.permission:Prokers,view,Program Kerja')->name('dashboard.prokers.detail');
    
    Route::get('/dashboard/prokers/{id}/edit', function ($id) {
        return Inertia::render('dashboard/ProkerEditPage', [
            'auth' => ['user' => auth()->user()],
            'divisions' => \App\Models\Division::all(),
        ]);
    })->middleware('check.permission:Prokers,edit,Program Kerja')->name('dashboard.prokers.edit');
    
    Route::get('/dashboard/messages', function () {
        return Inertia::render('dashboard/MessagesPage', [
            'auth' => ['user' => auth()->user()],
            'messages' => \App\Models\Message::orderBy('created_at', 'desc')->get(),
        ]);
    })->middleware('check.permission:Messages,view,Pesan')->name('dashboard.messages');
    
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
            'monthlyData' => $monthlyData,
        ]);
    })->middleware('check.permission:Transactions,view,Keuangan')->name('dashboard.transactions');
    
    Route::get('/dashboard/settings', function () {
        return Inertia::render('dashboard/SettingsPage', [
            'auth' => ['user' => auth()->user()->load('role')],
        ]);
    })->middleware('check.permission:Settings,view,Pengaturan')->name('dashboard.settings');

    Route::get('/dashboard/settings/role-access', function () {
        $modules = [
            ['name' => 'Dashboard', 'label' => 'Dashboard'],
            ['name' => 'Divisions', 'label' => 'Divisi'],
            ['name' => 'Positions', 'label' => 'Posisi'],
            ['name' => 'Users', 'label' => 'Pengguna'],
            ['name' => 'Prokers', 'label' => 'Program Kerja'],
            ['name' => 'Messages', 'label' => 'Pesan'],
            ['name' => 'Transactions', 'label' => 'Keuangan'],
            ['name' => 'Settings', 'label' => 'Pengaturan'],
            ['name' => 'Profile', 'label' => 'Profil'],
        ];
        
        $roles = \App\Models\Role::with('permissions')->get();

        return Inertia::render('dashboard/RoleAccessSetting', [
            'roles' => $roles,
            'modules' => $modules,
        ]);
    })->middleware('check.permission:Settings,edit,Akses Role')->name('dashboard.settings.role-access');
    
    Route::get('/dashboard/profile', function () {
        return Inertia::render('dashboard/ProfilePage', [
            'auth' => ['user' => auth()->user()],
            'user' => auth()->user()->load(['role', 'position'])
        ]);
    })->name('dashboard.profile');
    
    Route::get('/dashboard/audit-logs', function () {
        return Inertia::render('dashboard/AuditLogsPage', [
            'auth' => ['user' => auth()->user()],
            'logs' => \App\Models\AuditLog::with('user')->orderBy('created_at', 'desc')->limit(100)->get(),
        ]);
    })->middleware('check.permission:Settings,view,Log Aktivitas')->name('dashboard.audit-logs');
    
    Route::get('/dashboard/gallery', function () {
        return Inertia::render('dashboard/GalleryCmsPage', [
            'auth' => ['user' => auth()->user()],
        ]);
    })->name('dashboard.gallery');
});

// Enable Laravel settings routes
require __DIR__.'/settings.php';
