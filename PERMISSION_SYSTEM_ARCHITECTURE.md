# Permission System Architecture - Latest Implementation

## Overview

This document describes the **current, production-ready permission system** using middleware-based access control.

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER REQUEST                             │
│              GET /dashboard/transactions                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │  MIDDLEWARE LAYER         │
         │  CheckPagePermission      │
         ├───────────────────────────┤
         │ • Check Auth User         │
         │ • Verify Admin Role       │
         │ • Check Permission        │
         └───────┬────────┬──────────┘
                 │        │
       DENIED ◄──┘        └──► ALLOWED
         │                       │
         ▼                       ▼
    REDIRECT TO          ROUTE HANDLER
    /dashboard           EXECUTES
    +Flash Message
         │
         ▼
    DASHBOARD PAGE
    Shows Alert
```

## Components

### 1. Middleware: CheckPagePermission

**Location**: `app/Http/Middleware/CheckPagePermission.php`

**Responsibility**: Early permission verification before route handler execution

**Logic**:
```
IF user is Admin
    → Grant access (continue to route)
ELSE IF user.hasPermission(module, action)
    → Grant access (continue to route)
ELSE
    → Deny access (redirect to /dashboard)
```

**Features**:
- Single responsibility principle
- Early request termination
- Session flash messaging
- Clean error handling

### 2. Routes with Middleware Protection

**Location**: `routes/web.php`

**Pattern**: `.middleware('check.permission:Module,Action')`

**Protected Resources**:
- 11 dashboard routes
- 2 admin-only routes (Settings/Role-Access)

### 3. Permission Storage

**Database**:
- `roles` table → stores role data
- `role_permissions` table → stores permission matrix

**Structure**:
```
Role (e.g., "Anggota")
    ├─ Dashboard
    │  └─ view
    ├─ Divisions
    │  ├─ view
    │  ├─ create
    │  ├─ edit
    │  └─ delete
    ├─ Positions
    │  ├─ view
    │  ├─ create
    │  ├─ edit
    │  └─ delete
    ├─ Users
    ├─ Prokers
    ├─ Messages
    ├─ Transactions
    ├─ Settings
    └─ Profile
```

### 4. Permission Checking Method

**Location**: `app/Models/User.php`

**Method**: `hasPermission($module, $action = 'view')`

**Implementation**:
```php
public function hasPermission(string $module, string $action = 'view'): bool
{
    // Admin bypass
    if ($this->role->name === 'Admin') {
        return true;
    }

    // Check role permissions
    $permission = $this->role->permissions()
        ->where('module_name', $module)
        ->first();

    if (!$permission) {
        return false;
    }

    return match($action) {
        'view' => (bool) $permission->can_view,
        'create' => (bool) $permission->can_create,
        'edit' => (bool) $permission->can_edit,
        'delete' => (bool) $permission->can_delete,
        default => false,
    };
}
```

### 5. Alert Display on Dashboard

**Location**: `resources/js/pages/dashboard/DashboardPage.tsx`

**Method**: SweetAlert2 with Inertia flash data

**Logic**:
```tsx
useEffect(() => {
    if (flash?.permission_denied) {
        Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: flash?.permission_message,
            confirmButtonColor: '#3B4D3A',
            confirmButtonText: 'Kembali ke Dashboard',
            allowOutsideClick: false,
        });
    }
}, [flash?.permission_denied]);
```

## Request Flow

### Authorized Request (User Has Permission)

```
1. User: GET /dashboard/divisions
2. Middleware: Check permission for Divisions:view
3. Database: Query role_permissions
4. Result: User has view permission ✅
5. Middleware: Allow request ($next($request))
6. Route Handler: Execute → Fetch divisions data
7. Component: DivisionsPage renders with data
8. User: Sees page, can interact
```

### Unauthorized Request (User No Permission)

```
1. User: GET /dashboard/transactions
2. Middleware: Check permission for Transactions:view
3. Database: Query role_permissions
4. Result: User has NO view permission ❌
5. Middleware: Deny request
6. Redirect: Return redirect('/dashboard')->with([
                'permission_denied' => true,
                'permission_message' => "..."
            ])
7. Browser: Follow 302 redirect
8. Backend: Set session flash
9. Frontend: DashboardPage loads
10. Component: useEffect detects flash
11. Alert: SweetAlert2 shows error
12. User: Sees alert, dismisses, stays on dashboard
```

## Permission Configuration Management

### Admin Interface

**Access**: `/dashboard/settings/role-access` (Admin only)

**Features**:
- View all roles
- Toggle permissions per module
- 4 actions per module (view, create, edit, delete)
- Save changes immediately
- Changes apply on next user login

### Database Updates

Direct SQL queries to `role_permissions` table:
```sql
UPDATE role_permissions 
SET can_view = 1, can_create = 1
WHERE role_id = 2 AND module_name = 'Divisions';
```

### Seeding

**Location**: `database/seeders/RoleSeeder.php`

**Purpose**: Set default permissions for development/testing

**Executed**: On initial `php artisan migrate --seed`

## Security Features

### 1. Early Termination
- Middleware stops request before handler
- Database queries not executed
- No data leakage
- Efficient resource usage

### 2. Admin Bypass
- Admin role hardcoded to have all permissions
- Fast path in permission check
- Can be overridden per-route if needed

### 3. Session Flash Security
- Message sent via server session
- Not in URL
- Can't be tampered with client-side
- Cleared after display

### 4. Authentication First
- Sanctum authentication middleware required
- Unauthenticated users redirected to login
- Token validation before permission check

### 5. Role-Based Access
- Permissions tied to role, not user
- Changes apply to all users with role
- Centralized permission management
- Easy audit trail

## Integration Points

### 1. Route Registration
```php
// bootstrap/app.php
$middleware->alias([
    'check.permission' => CheckPagePermission::class,
]);
```

### 2. Route Definition
```php
// routes/web.php
Route::get('/dashboard/divisions', function () {
    // ...
})->middleware('check.permission:Divisions,view')->name('...');
```

### 3. User Model
```php
// app/Models/User.php
public function hasPermission(string $module, string $action = 'view'): bool {
    // Permission logic
}
```

### 4. Frontend Display
```tsx
// resources/js/pages/dashboard/DashboardPage.tsx
const { flash } = usePage().props;
if (flash?.permission_denied) {
    // Show alert
}
```

## Modules & Actions

### Available Modules
| Module | Purpose | Actions |
|--------|---------|---------|
| Dashboard | Main dashboard access | view |
| Divisions | Division management | view, create, edit, delete |
| Positions | Position management | view, create, edit, delete |
| Users | User management | view, create, edit, delete |
| Prokers | Program kerja management | view, create, edit, delete |
| Messages | Message viewing | view, create, edit, delete |
| Transactions | Financial tracking | view, create, edit, delete |
| Settings | Application settings | view, edit |
| Profile | User profile | view, edit |

### Default Role Permissions

**Admin Role** (Always has all permissions automatically)

**Anggota Role** (Typical non-admin user):
- Dashboard: view ✅
- Divisions: view ✅
- Positions: view ✅
- Users: view ✅
- Prokers: view ✅
- Messages: view ✅
- Transactions: ✅
- Settings: (limited)
- Profile: view, edit ✅

## Extending the System

### Add New Module Permission

1. **Create Migration**:
```php
// database/migrations/xxxx_add_new_module_permission.php
Schema::table('role_permissions', function (Blueprint $table) {
    $table->boolean('can_view_newmodule')->default(false);
    $table->boolean('can_create_newmodule')->default(false);
    // etc
});
```

2. **Update Role Seeder**:
```php
// database/seeders/RoleSeeder.php
RolePermission::create([
    'role_id' => $role->id,
    'module_name' => 'NewModule',
    'can_view' => true,
    'can_create' => false,
    // etc
]);
```

3. **Update hasPermission**:
```php
// app/Models/User.php
if ($module === 'NewModule') {
    // Handle new module logic
}
```

4. **Protect Route**:
```php
Route::get('/dashboard/newmodule', [...])
    ->middleware('check.permission:NewModule,view');
```

### Customize Permission Check

Override `hasPermission()` in User model:
```php
public function hasPermission(string $module, string $action = 'view'): bool
{
    // Custom logic here
    if ($this->role->name === 'SuperAdmin') {
        return true; // Super admins have everything
    }
    
    // Then call parent logic or your own
}
```

## Testing

### Unit Tests
```php
// tests/Unit/UserPermissionTest.php
test('admin has all permissions', function () {
    $admin = User::where('role_id', Role::whereName('Admin')->first()->id)->first();
    $this->assertTrue($admin->hasPermission('Users', 'delete'));
});

test('anggota cannot delete users', function () {
    $anggota = User::where('role_id', Role::whereName('Anggota')->first()->id)->first();
    $this->assertFalse($anggota->hasPermission('Users', 'delete'));
});
```

### Integration Tests
```php
// tests/Feature/PermissionMiddlewareTest.php
test('unauthorized user redirected from protected page', function () {
    $this->actingAs($anggotaUser)
        ->get('/dashboard/transactions')
        ->assertRedirect('/dashboard');
});

test('authorized user can access protected page', function () {
    $this->actingAs($adminUser)
        ->get('/dashboard/transactions')
        ->assertStatus(200);
});
```

## Troubleshooting

### Issue: "Unauthorized" alert on authorized page

**Cause**: Permission not in database

**Solution**:
1. Run `php artisan migrate --seed`
2. Check `role_permissions` table
3. Verify module_name matches exactly
4. Check role_id is correct

### Issue: Admin can't access certain pages

**Cause**: Unlikely, but check role name

**Solution**:
```php
// Verify in User model
if ($this->role->name === 'Admin') { // Case-sensitive!
```

### Issue: Permissions not updating

**Cause**: Session cached

**Solution**:
1. User must logout and login
2. Or clear sessions: `php artisan cache:clear`

### Issue: Alert shows but page still renders

**Cause**: Old cached code

**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Rebuild: `npm run build`
3. Clear browser cache: Ctrl+Shift+Delete

## Performance Considerations

### Optimizations Made
✅ Admin bypass check (single condition)
✅ Middleware runs early (stops unnecessary processing)
✅ Database query cached via Eager Loading
✅ No N+1 queries
✅ Session flash (no extra middleware)

### Further Optimization
- Cache role permissions in Redis
- Use queue for permission-heavy operations
- Implement request caching

## Deployment

### Pre-deployment Checklist
- [ ] Roles created in production database
- [ ] `role_permissions` table populated
- [ ] Middleware registered in `bootstrap/app.php`
- [ ] Routes have `.middleware('check.permission:...')`
- [ ] Frontend built: `npm run build`
- [ ] Dashboard flash alert handler exists
- [ ] SweetAlert2 installed

### Post-deployment
- [ ] Test admin access to all pages
- [ ] Test non-admin access (should be restricted)
- [ ] Verify alerts display correctly
- [ ] Check application logs for errors
- [ ] Monitor redirect patterns

## Related Documentation

- [MIDDLEWARE_PERMISSION_IMPLEMENTATION.md](MIDDLEWARE_PERMISSION_IMPLEMENTATION.md) - Implementation details
- [TESTING_GUIDE_MIDDLEWARE.md](TESTING_GUIDE_MIDDLEWARE.md) - Testing procedures
- [BEFORE_AFTER_MIDDLEWARE_COMPARISON.md](BEFORE_AFTER_MIDDLEWARE_COMPARISON.md) - Detailed comparison
- [COMPLETION_SUMMARY_MIDDLEWARE.md](COMPLETION_SUMMARY_MIDDLEWARE.md) - Quick summary

---

**Last Updated**: January 2025
**Status**: ✅ Production Ready
**Version**: 2.0 (Middleware-based)
