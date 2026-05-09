<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert role only if not exists
        $exists = DB::table('roles')->where('name', 'Pengawas SieBid')->exists();
        if (! $exists) {
            DB::table('roles')->insert([
                'name'        => 'Pengawas SieBid',
                'description' => 'Pengawas SieBid dengan akses pantau Prokers dan Transactions',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // Insert permissions for Pengawas SieBid
        $roleId = DB::table('roles')->where('name', 'Pengawas SieBid')->value('id');

        if ($roleId) {
            // View-only for Dashboard, Prokers, Transactions; edit Profile only
            $modules = [
                'Dashboard'    => ['can_view' => true, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'Prokers'      => ['can_view' => true, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'Transactions' => ['can_view' => true, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'Profile'      => ['can_view' => true, 'can_create' => false, 'can_edit' => true,  'can_delete' => false],
            ];

            foreach ($modules as $moduleName => $perms) {
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleId)
                    ->where('module_name', $moduleName)
                    ->exists();

                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id'     => $roleId,
                        'module_name' => $moduleName,
                        'can_view'    => $perms['can_view'],
                        'can_create'  => $perms['can_create'],
                        'can_edit'    => $perms['can_edit'],
                        'can_delete'  => $perms['can_delete'],
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $roleId = DB::table('roles')->where('name', 'Pengawas SieBid')->value('id');

        if ($roleId) {
            DB::table('role_permissions')->where('role_id', $roleId)->delete();
            DB::table('roles')->where('id', $roleId)->delete();
        }
    }
};
