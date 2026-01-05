<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    /**
     * Canonical module list - must match database module names
     */
    private function getModules(): array
    {
        return [
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
    }

    public function index()
    {
        $modules = $this->getModules();
        $roles = Role::with(['permissions' => function ($query) {
            $query->orderBy('module_name');
        }])->orderBy('name')->get();

        return Inertia::render('settings/RoleAccessSetting', [
            'roles' => $roles,
            'modules' => $modules,
        ]);
    }

    /**
     * Update permissions for a specific role
     */
    public function update(Request $request, Role $role)
    {
        // Validate input
        $data = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'array',
            'permissions.*.can_view' => 'boolean',
            'permissions.*.can_create' => 'boolean',
            'permissions.*.can_edit' => 'boolean',
            'permissions.*.can_delete' => 'boolean',
        ]);

        $permissions = $data['permissions']; // structure: ['module_name' => ['can_view'=>true, ...], ...]
        $modules = $this->getModules();
        $moduleNames = array_column($modules, 'name');

        // Update permissions for each module
        foreach ($permissions as $moduleName => $perms) {
            // Validate module name exists in canonical list
            if (!in_array($moduleName, $moduleNames)) {
                continue; // Skip invalid module names
            }

            // Use firstOrCreate to avoid duplicates and ensure atomicity
            $rp = RolePermission::updateOrCreate(
                [
                    'role_id' => $role->id,
                    'module_name' => $moduleName,
                ],
                [
                    'can_view' => (bool)($perms['can_view'] ?? false),
                    'can_create' => (bool)($perms['can_create'] ?? false),
                    'can_edit' => (bool)($perms['can_edit'] ?? false),
                    'can_delete' => (bool)($perms['can_delete'] ?? false),
                ]
            );
        }

        // Log the change
        \Illuminate\Support\Facades\Log::info("Permissions updated for role {$role->name} (ID: {$role->id}) by user " . auth()->id());

        return response()->json([
            'message' => 'Permissions updated successfully',
            'role_id' => $role->id,
            'role_name' => $role->name,
        ], 200);
    }
}
