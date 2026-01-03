<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{


    public function index()
    {
        // Canonical module list (use same names as seeded permissions)
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

        return Inertia::render('settings/RoleAccessSetting', [
            'roles' => $roles,
            'modules' => $modules,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'permissions' => 'required|array',
        ]);

        $permissions = $data['permissions']; // structure: ['module_name' => ['can_view'=>true, ...], ...]

        foreach ($permissions as $module => $perms) {
            $rp = RolePermission::firstOrNew([
                'role_id' => $role->id,
                'module_name' => $module,
            ]);

            $rp->can_view = !empty($perms['can_view']);
            $rp->can_create = !empty($perms['can_create']);
            $rp->can_edit = !empty($perms['can_edit']);
            $rp->can_delete = !empty($perms['can_delete']);
            $rp->save();
        }

        return response()->json(['message' => 'Permissions updated']);
    }
}
