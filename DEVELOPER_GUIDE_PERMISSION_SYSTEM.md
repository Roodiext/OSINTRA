# Permission System Architecture & Developer Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION (Sanctum)                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         ┌──────────────────────────────┐
         │  User + Role + Permissions   │
         │   (eager loaded)             │
         └──────────────────┬───────────┘
                            │
                            ▼
        ┌────────────────────────────────────┐
        │   User->hasPermission(module, action) │
        │   returns: boolean                   │
        └────────────────────┬─────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
            ✅ Can Access          ❌ Cannot Access
         Render Page            Abort 403
```

---

## Database Schema

### roles table
```sql
CREATE TABLE roles (
  id int PRIMARY KEY,
  name varchar(255) UNIQUE,
  description text,
  created_at timestamp,
  updated_at timestamp
);
```

### role_permissions table
```sql
CREATE TABLE role_permissions (
  id int PRIMARY KEY,
  role_id int FOREIGN KEY (roles.id),
  module_name varchar(255),  -- ⚠️ CASE SENSITIVE!
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp,
  updated_at timestamp,
  UNIQUE(role_id, module_name)
);
```

### users table (relevant columns)
```sql
CREATE TABLE users (
  id int PRIMARY KEY,
  role_id int FOREIGN KEY (roles.id),
  -- ... other columns
);
```

---

## Code Flow

### 1. User Login Flow
```php
// Login endpoint
$user = User::find($userId);

// Sanctum automatically loads:
// $user->role (BelongsTo relationship)
// $user->role->permissions (HasMany relationship)

auth()->login($user);
// User object cached in session
```

### 2. Route Permission Check Flow
```php
Route::get('/dashboard/transactions', function () {
    // Step 1: Get authenticated user
    $user = auth()->user();
    
    // Step 2: Check permission
    if (!$user->hasPermission('Transactions', 'view')) {
        // Step 3a: Abort if no permission
        abort(403, 'Anda tidak memiliki izin untuk mengakses halaman Keuangan.');
    }
    
    // Step 3b: Continue if has permission
    return Inertia::render('dashboard/TransactionsPage', [
        'auth' => ['user' => $user],
        'transactions' => Transaction::all(),
    ]);
})->name('dashboard.transactions');
```

### 3. Permission Check Implementation
```php
// User model
public function hasPermission(string $module, string $action): bool
{
    // 1. Ensure user has role
    if (!$this->role) {
        return false;
    }

    // 2. Query permission (case-sensitive!)
    $permission = $this->role->permissions()
        ->where('module_name', $module)  // 'Dashboard' !== 'dashboard'
        ->first();

    // 3. If no permission record, deny
    if (!$permission) {
        return false;
    }

    // 4. Return specific action permission
    return match($action) {
        'view' => $permission->can_view,
        'create' => $permission->can_create,
        'edit' => $permission->can_edit,
        'delete' => $permission->can_delete,
        default => false,
    };
}
```

---

## Implementation Checklist

### When Adding New Module

1. **Add to RolePermissionController::getModules()**
   ```php
   private function getModules(): array
   {
       return [
           // ... existing
           ['name' => 'NewModule', 'label' => 'New Module Label'],
       ];
   }
   ```

2. **Add to RoleSeeder::seedRolePermissions()**
   ```php
   $modules = [
       // ... existing
       'NewModule',
   ];
   ```

3. **Add to RoleAccessSetting.tsx modules prop**
   ```jsx
   const modules = [
       // ... existing
       { name: 'NewModule', label: 'New Module Label' },
   ];
   ```

4. **Add permission check in route**
   ```php
   Route::get('/dashboard/newmodule', function () {
       if (!auth()->user()->hasPermission('NewModule', 'view')) {
           abort(403, 'Tidak ada izin akses ke modul baru.');
       }
       // ... render page
   });
   ```

5. **Re-seed database**
   ```bash
   php artisan db:seed --class=RoleSeeder --force
   ```

---

## Common Patterns

### Pattern 1: View-Only Permission
```php
// User hanya bisa lihat, tidak bisa create/edit/delete
Route::get('/dashboard/transactions', function () {
    if (!auth()->user()->hasPermission('Transactions', 'view')) {
        abort(403);
    }
    return Inertia::render('dashboard/TransactionsPage', [
        'transactions' => Transaction::all(),
    ]);
})->name('dashboard.transactions');
```

### Pattern 2: Create Action
```php
// User bisa create jika punya permission
Route::post('/api/transactions', function () {
    if (!auth()->user()->hasPermission('Transactions', 'create')) {
        return response()->json(['error' => 'Forbidden'], 403);
    }
    // ... create transaction
});
```

### Pattern 3: Edit Action
```php
// User bisa edit jika punya permission
Route::put('/api/transactions/{id}', function ($id) {
    if (!auth()->user()->hasPermission('Transactions', 'edit')) {
        return response()->json(['error' => 'Forbidden'], 403);
    }
    // ... edit transaction
});
```

### Pattern 4: Delete Action
```php
// User bisa delete jika punya permission
Route::delete('/api/transactions/{id}', function ($id) {
    if (!auth()->user()->hasPermission('Transactions', 'delete')) {
        return response()->json(['error' => 'Forbidden'], 403);
    }
    // ... delete transaction
});
```

### Pattern 5: Frontend Permission Check
```jsx
// Frontend - disable button jika tidak ada permission
const canEdit = user?.role?.permissions?.some(p => 
  p.module_name === 'Transactions' && p.can_edit
);

return (
  <button 
    onClick={handleEdit}
    disabled={!canEdit}
  >
    Edit
  </button>
);
```

---

## Error Handling

### Route-level Error
```php
// User tidak punya akses ke halaman
Route::get('/dashboard/transactions', function () {
    if (!auth()->user()->hasPermission('Transactions', 'view')) {
        // Returns 403 with message
        abort(403, 'Anda tidak memiliki izin untuk mengakses halaman Keuangan.');
    }
    // ...
})->name('dashboard.transactions');

// Result: 403 response + error message di frontend
```

### API-level Error
```php
// API endpoint - return JSON error
Route::post('/api/transactions', function (Request $request) {
    if (!auth()->user()->hasPermission('Transactions', 'create')) {
        return response()->json([
            'error' => 'Forbidden',
            'message' => 'Anda tidak memiliki izin untuk membuat transaksi baru.'
        ], 403);
    }
    // ...
});

// Result: 403 JSON response
```

---

## Testing Patterns

### Unit Test: hasPermission()
```php
public function test_user_can_view_permission()
{
    $user = User::factory()->create();
    $user->role->permissions()->create([
        'module_name' => 'Transactions',
        'can_view' => true,
        'can_create' => false,
        'can_edit' => false,
        'can_delete' => false,
    ]);

    $this->assertTrue($user->hasPermission('Transactions', 'view'));
    $this->assertFalse($user->hasPermission('Transactions', 'create'));
}
```

### Feature Test: Route Permission
```php
public function test_user_without_permission_cannot_access_route()
{
    $user = User::factory()->create();
    // User tidak punya permission
    
    $response = $this->actingAs($user)
        ->get('/dashboard/transactions');
    
    $response->assertStatus(403);
}

public function test_user_with_permission_can_access_route()
{
    $user = User::factory()->create();
    $user->role->permissions()->create([
        'module_name' => 'Transactions',
        'can_view' => true,
        'can_create' => false,
        'can_edit' => false,
        'can_delete' => false,
    ]);
    
    $response = $this->actingAs($user)
        ->get('/dashboard/transactions');
    
    $response->assertStatus(200);
}
```

---

## Performance Considerations

### Current Implementation
```php
// Good - Permission cached in User instance
$user = auth()->user(); // Already loaded with permissions
$user->hasPermission('Transactions', 'view'); // O(n) where n = num permissions
```

### Potential Optimization
```php
// Cache permission in session/Redis for better performance
// If implementing, remember to clear cache on permission change
Cache::put("user_permissions_{$userId}", $permissions, $minutes = 60);
```

---

## Security Best Practices

1. ✅ **Always check permission before action**
   ```php
   if (!$user->hasPermission('Transactions', 'delete')) {
       abort(403);
   }
   ```

2. ✅ **Check at route level AND action level**
   - Route level: Prevent page load
   - Action level: Prevent API calls

3. ✅ **Use specific error messages**
   ```php
   abort(403, 'Anda tidak memiliki izin untuk mengakses halaman Keuangan.');
   // Not: abort(403); // Too generic
   ```

4. ✅ **Log important permission checks**
   ```php
   Log::warning("User {$user->id} denied access to Transactions");
   ```

5. ✅ **Validate module names**
   ```php
   $allowedModules = array_column($this->getModules(), 'name');
   if (!in_array($moduleName, $allowedModules)) {
       abort(400, 'Invalid module name');
   }
   ```

---

## Debugging

### Check User Permissions
```php
$user = User::with(['role.permissions'])->find($userId);
dd($user->role->permissions);
```

### Check Single Permission
```php
$user = auth()->user();
dd($user->hasPermission('Transactions', 'view'));
```

### Check All Modules
```php
$modules = (new RolePermissionController)->getModules();
dd($modules);
```

### Query Database
```sql
-- Check permissions for specific role
SELECT * FROM role_permissions 
WHERE role_id = 5 
ORDER BY module_name;

-- Check all modules
SELECT DISTINCT module_name FROM role_permissions 
ORDER BY module_name;
```

---

## Common Mistakes to Avoid

❌ **Wrong: Case-insensitive module name**
```php
if (!$user->hasPermission('dashboard', 'view')) {  // WRONG - lowercase
    abort(403);
}
```

✅ **Right: Case-sensitive module name**
```php
if (!$user->hasPermission('Dashboard', 'view')) {  // CORRECT - Pascal Case
    abort(403);
}
```

---

❌ **Wrong: Hardcoded role checking**
```php
if ($user->role->name !== 'Admin') {  // WRONG
    abort(403);
}
```

✅ **Right: Permission-based checking**
```php
if (!$user->hasPermission('Settings', 'edit')) {  // CORRECT
    abort(403);
}
```

---

❌ **Wrong: No permission check in API**
```php
Route::post('/api/transactions', function () {
    // WRONG - no permission check
    return Transaction::create($request->all());
});
```

✅ **Right: Permission check in API**
```php
Route::post('/api/transactions', function () {
    // CORRECT - check permission
    if (!auth()->user()->hasPermission('Transactions', 'create')) {
        return response()->json(['error' => 'Forbidden'], 403);
    }
    return Transaction::create($request->all());
});
```

---

## Relationship Diagram

```
┌──────────────┐
│    User      │
├──────────────┤
│ id           │
│ role_id ────────┐
│ name         │  │
│ email        │  │
└──────────────┘  │
                  │ BelongsTo
                  │
                  ▼
            ┌──────────────┐
            │    Role      │
            ├──────────────┤
            │ id           │
            │ name         │
            │ description  │
            └──────────────┘
                  │
                  │ HasMany
                  │
                  ▼
        ┌──────────────────────┐
        │  RolePermission      │
        ├──────────────────────┤
        │ id                   │
        │ role_id              │
        │ module_name          │  ← case-sensitive!
        │ can_view             │
        │ can_create           │
        │ can_edit             │
        │ can_delete           │
        └──────────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Old | Initial permission system (broken) |
| 2.0 | 2025-01-04 | Fixed routes, standardized modules, added Positions |

---

**Status:** ✅ Ready for developers  
**Last Updated:** 2025-01-04
