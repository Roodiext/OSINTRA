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
    $heroImage = \App\Models\AppSetting::where('key', 'hero_image')->value('value');
    return Inertia::render('PublicPage', [
        'heroImage' => $heroImage
    ]);
})->name('home');

// Simple public routes for individual sections/pages
Route::get('/about', function () {
    return Inertia::render('AboutPage');
})->name('about');

Route::get('/struktur', function () {
    return Inertia::render('StrukturPage');
})->name('struktur');

Route::get('/gallery/{id?}', function ($id = null) {
    if ($id) {
        $initialMedia = \App\Models\ProkerMedia::with('proker')->find($id);
        
        if ($initialMedia) {
            // Fetch all media belonging to the same proker
            $media = \App\Models\ProkerMedia::with('proker')
                ->where('proker_id', $initialMedia->proker_id)
                ->where(function($q) {
                    $q->where('is_thumbnail', true)
                      ->orWhere('is_highlight', true);
                })
                ->orderBy('is_thumbnail', 'desc') // Show thumbnail first
                ->orderBy('is_highlight', 'desc') // Then highlights
                ->get();
            
            return Inertia::render('GalleryPage', [
                'media' => $media,
                'initialId' => (int)$id
            ]);
        }
    }
    
    // Fallback: If no ID or not found, show recent/all media gallery
    $allMedia = \App\Models\ProkerMedia::with('proker')
        ->where(function($q) {
            $q->where('is_thumbnail', true)
              ->orWhere('is_highlight', true);
        })
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('GalleryPage', [
        'media' => $allMedia, 
        'initialId' => null
    ]);
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
    // If already logged in via Sanctum token, redirect to dashboard
    if (auth('sanctum')->check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('LoginPage');
})->name('login');

/*
|--------------------------------------------------------------------------
| Protected Routes (Authentication Required)
|--------------------------------------------------------------------------
| These routes require user to be logged in via Laravel Sanctum token
| If not authenticated, will redirect to /login
*/

Route::middleware(['inertia.auth'])->group(function () {
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
                'user' => auth('sanctum')->user()
            ]
        ]);
    })->name('dashboard');
    
    // Dashboard Modules - With permission checks
    Route::get('/dashboard/divisions', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/DivisionsPage', [
            'auth' => ['user' => $user],
            'divisions' => \App\Models\Division::withCount('users')->get(),
            'permissions' => [
                'can_view' => $user?->hasPermission('Divisions', 'view') ?? false,
                'can_create' => $user?->hasPermission('Divisions', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Divisions', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Divisions', 'delete') ?? false,
            ],
        ]);
    })->middleware('check.permission:Divisions,view,Divisi')->name('dashboard.divisions');
    
    Route::get('/dashboard/positions', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/PositionsPage', [
            'auth' => ['user' => $user],
            'permissions' => [
                'can_view' => $user?->hasPermission('Positions', 'view') ?? false,
                'can_create' => $user?->hasPermission('Positions', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Positions', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Positions', 'delete') ?? false,
            ],
        ]);
    })->middleware('check.permission:Positions,view,Posisi')->name('dashboard.positions');
    
    Route::get('/dashboard/users', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/UsersPage', [
            'auth' => ['user' => $user],
            'users' => \App\Models\User::with(['role', 'position'])->get(),
            'roles' => \App\Models\Role::all(),
            'divisions' => \App\Models\Division::all(),
            'positions' => \App\Models\Position::all(),
            'permissions' => [
                'can_view' => $user?->hasPermission('Users', 'view') ?? false,
                'can_create' => $user?->hasPermission('Users', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Users', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Users', 'delete') ?? false,
            ],
        ]);
    })->middleware('check.permission:Users,view,Pengguna')->name('dashboard.users');
    
    Route::get('/dashboard/prokers', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/ProkersPage', [
            'auth' => ['user' => $user],
            'prokers' => \App\Models\Proker::with(['divisions', 'media'])->get(),
            'divisions' => \App\Models\Division::all(),
            'permissions' => [
                'can_view' => $user?->hasPermission('Prokers', 'view') ?? false,
                'can_create' => $user?->hasPermission('Prokers', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Prokers', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Prokers', 'delete') ?? false,
            ],
        ]);
    })->middleware('check.permission:Prokers,view,Program Kerja')->name('dashboard.prokers');
    
    Route::get('/dashboard/prokers/{id}', function ($id) {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/ProkerDetailPage', [
            'auth' => ['user' => $user],
            'permissions' => [
                'can_view' => $user?->hasPermission('Prokers', 'view') ?? false,
                'can_create' => $user?->hasPermission('Prokers', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Prokers', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Prokers', 'delete') ?? false,
            ],
        ]);
    })->middleware('check.permission:Prokers,view,Program Kerja')->name('dashboard.prokers.detail');
    
    Route::get('/dashboard/prokers/{id}/edit', function ($id) {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/ProkerEditPage', [
            'auth' => ['user' => $user],
            'divisions' => \App\Models\Division::all(),
            'permissions' => [
                'can_view' => $user?->hasPermission('Prokers', 'view') ?? false,
                'can_create' => $user?->hasPermission('Prokers', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Prokers', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Prokers', 'delete') ?? false,
            ],
        ]);
    })->middleware('check.permission:Prokers,edit,Program Kerja')->name('dashboard.prokers.edit');
    
    Route::get('/dashboard/messages', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/MessagesPage', [
            'auth' => ['user' => $user],
            'messages' => \App\Models\Message::orderBy('created_at', 'desc')->get(),
            'permissions' => [
                'can_view' => $user?->hasPermission('Messages', 'view') ?? false,
                'can_create' => $user?->hasPermission('Messages', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Messages', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Messages', 'delete') ?? false,
            ],
        ]);
    })->middleware('check.permission:Messages,view,Pesan')->name('dashboard.messages');
    
    Route::get('/dashboard/transactions', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        $transactions = \App\Models\Transaction::with(['creator.role', 'approver.role'])->orderBy('date', 'desc')->get();
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
            'auth' => ['user' => $user],
            'transactions' => $transactions,
            'balance' => $balance,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'monthlyData' => $monthlyData,
            'permissions' => [
                'can_view' => $user?->hasPermission('Transactions', 'view') ?? false,
                'can_create' => $user?->hasPermission('Transactions', 'create') ?? false,
                'can_edit' => $user?->hasPermission('Transactions', 'edit') ?? false,
                'can_delete' => $user?->hasPermission('Transactions', 'delete') ?? false,
                'can_approve' => $user?->hasPermission('Transactions', 'approve') ?? false,
                'is_blurred' => (bool)($user?->role?->permissions()->where('module_name', 'Transactions')->first()?->is_blurred ?? false),
            ],
        ]);
    })->middleware('check.permission:Transactions,view,Keuangan')->name('dashboard.transactions');
    
    Route::get('/dashboard/settings', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/SettingsPage', [
            'auth' => ['user' => $user?->load('role')],
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
            'auth' => ['user' => auth('sanctum')->user() ?? auth()->user()],
            'roles' => $roles,
            'modules' => $modules,
        ]);
    })->middleware('check.permission:Settings,edit,Akses Role')->name('dashboard.settings.role-access');
    
    Route::get('/dashboard/profile', function () {
        $user = auth('sanctum')->user() ?? auth()->user();
        return Inertia::render('dashboard/ProfilePage', [
            'auth' => ['user' => $user],
            'user' => $user?->load(['role', 'position'])
        ]);
    })->name('dashboard.profile');
    
    Route::get('/dashboard/audit-logs', function () {
        return Inertia::render('dashboard/AuditLogsPage', [
            'auth' => ['user' => auth('sanctum')->user() ?? auth()->user()],
            'logs' => \App\Models\AuditLog::with('user')->orderBy('created_at', 'desc')->limit(100)->get(),
        ]);
    })->middleware('check.permission:Settings,view,Log Aktivitas')->name('dashboard.audit-logs');
    
    Route::get('/dashboard/gallery', function () {
        return Inertia::render('dashboard/GalleryCmsPage', [
            'auth' => ['user' => auth('sanctum')->user() ?? auth()->user()],
        ]);
    })->name('dashboard.gallery');
});

// Enable Laravel settings routes
require __DIR__.'/settings.php';
