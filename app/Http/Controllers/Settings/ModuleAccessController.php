<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleAccessController extends Controller
{
    public function __construct()
    {
        // Ensure only admin role can access
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (! $user || ! $user->role || strtolower($user->role->name) !== 'admin') {
                abort(403, 'Unauthorized.');
            }
            return $next($request);
        });
    }

    public function index()
    {
        // Canonical module list used across the dashboard
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

        $roles = Role::with('permissions')->get();

        // Build matrix[module_name][role_id] => permissions
        $matrix = [];
        foreach ($modules as $m) {
            $matrix[$m['name']] = [];
            foreach ($roles as $r) {
                $found = $r->permissions->firstWhere('module_name', $m['name']);
                $matrix[$m['name']][$r->id] = [
                    'can_view' => (bool) ($found?->can_view ?? false),
                    'can_create' => (bool) ($found?->can_create ?? false),
                    'can_edit' => (bool) ($found?->can_edit ?? false),
                    'can_delete' => (bool) ($found?->can_delete ?? false),
                ];
            }
        }

        return Inertia::render('settings/modules/Index', [
            'modules' => $modules,
            'roles' => $roles,
            'matrix' => $matrix,
        ]);
    }

    public function update(Request $request, $moduleName)
    {
        $data = $request->validate([
            'permissions' => 'required|array', // permissions[role_id] => ['can_view'=>true,...]
        ]);

        foreach ($data['permissions'] as $roleId => $perms) {
            $rp = RolePermission::firstOrNew([
                'role_id' => $roleId,
                'module_name' => $moduleName,
            ]);

            $rp->can_view = !empty($perms['can_view']);
            $rp->can_create = !empty($perms['can_create']);
            $rp->can_edit = !empty($perms['can_edit']);
            $rp->can_delete = !empty($perms['can_delete']);
            $rp->save();
        }

        return response()->json(['message' => 'Module access updated']);
    }
}
