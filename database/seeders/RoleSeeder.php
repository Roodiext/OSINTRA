<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'description' => 'Administrator dengan akses penuh ke semua modul',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ketua OSIS',
                'description' => 'Ketua OSIS dengan akses ke Prokers, Transactions, Messages',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sekretaris',
                'description' => 'Sekretaris dengan akses ke Messages dan Divisions',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bendahara',
                'description' => 'Bendahara dengan akses ke Transactions',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Anggota',
                'description' => 'Anggota OSIS dengan akses terbatas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Humas',
                'description' => 'Humas bertanggung jawab atas komunikasi dan publikasi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Medkom',
                'description' => 'Media dan Komunikasi internal (Medkom)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert roles only if they don't already exist
        foreach ($roles as $role) {
            $exists = DB::table('roles')->where('name', $role['name'])->exists();
            if (! $exists) {
                DB::table('roles')->insert($role);
            }
        }

        // Insert role permissions
        $this->seedRolePermissions();
    }

    private function seedRolePermissions(): void
    {
        $modules = ['Dashboard', 'Divisions', 'Users', 'Prokers', 'Messages', 'Transactions', 'Settings', 'Profile'];

        // Lookup role IDs by name to avoid hardcoded IDs
        $roleAdmin = DB::table('roles')->where('name', 'Admin')->value('id');
        $roleKetua = DB::table('roles')->where('name', 'Ketua OSIS')->value('id');
        $roleSekretaris = DB::table('roles')->where('name', 'Sekretaris')->value('id');
        $roleBendahara = DB::table('roles')->where('name', 'Bendahara')->value('id');
        $roleAnggota = DB::table('roles')->where('name', 'Anggota')->value('id');
        $roleHumas = DB::table('roles')->where('name', 'Humas')->value('id');
        $roleMedkom = DB::table('roles')->where('name', 'Medkom')->value('id');

        // Admin - Full access
        if ($roleAdmin) {
            foreach ($modules as $module) {
                // avoid duplicate permission rows
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleAdmin)
                    ->where('module_name', $module)
                    ->exists();
                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleAdmin,
                        'module_name' => $module,
                        'can_view' => true,
                        'can_create' => true,
                        'can_edit' => true,
                        'can_delete' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Ketua OSIS - Prokers, Transactions, Messages
        $ketuaModules = ['Dashboard', 'Prokers', 'Transactions', 'Messages', 'Profile'];
        if ($roleKetua) {
            foreach ($ketuaModules as $module) {
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleKetua)
                    ->where('module_name', $module)
                    ->exists();
                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleKetua,
                        'module_name' => $module,
                        'can_view' => true,
                        'can_create' => $module !== 'Dashboard',
                        'can_edit' => $module !== 'Dashboard',
                        'can_delete' => $module !== 'Dashboard',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Sekretaris - Messages, Divisions
        $sekretarisModules = ['Dashboard', 'Messages', 'Divisions', 'Profile'];
        if ($roleSekretaris) {
            foreach ($sekretarisModules as $module) {
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleSekretaris)
                    ->where('module_name', $module)
                    ->exists();
                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleSekretaris,
                        'module_name' => $module,
                        'can_view' => true,
                        'can_create' => $module !== 'Dashboard',
                        'can_edit' => $module !== 'Dashboard',
                        'can_delete' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Bendahara - Transactions
        $bendaharaModules = ['Dashboard', 'Transactions', 'Profile'];
        if ($roleBendahara) {
            foreach ($bendaharaModules as $module) {
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleBendahara)
                    ->where('module_name', $module)
                    ->exists();
                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleBendahara,
                        'module_name' => $module,
                        'can_view' => true,
                        'can_create' => $module === 'Transactions',
                        'can_edit' => $module === 'Transactions' || $module === 'Profile',
                        'can_delete' => $module === 'Transactions',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Anggota - Dashboard & Profile only
        $anggotaModules = ['Dashboard', 'Profile'];
        if ($roleAnggota) {
            foreach ($anggotaModules as $module) {
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleAnggota)
                    ->where('module_name', $module)
                    ->exists();
                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleAnggota,
                        'module_name' => $module,
                        'can_view' => true,
                        'can_create' => false,
                        'can_edit' => $module === 'Profile',
                        'can_delete' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Humas - Messages, Prokers (view and create posts), Dashboard
        $humasModules = ['Dashboard', 'Prokers', 'Messages', 'Profile'];
        if ($roleHumas) {
            foreach ($humasModules as $module) {
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleHumas)
                    ->where('module_name', $module)
                    ->exists();
                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleHumas,
                        'module_name' => $module,
                        'can_view' => true,
                        'can_create' => $module === 'Messages' || $module === 'Prokers',
                        'can_edit' => $module === 'Messages' || $module === 'Prokers',
                        'can_delete' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Medkom - Media & Prokers access for uploading and managing media
        $medkomModules = ['Dashboard', 'Prokers', 'Profile'];
        if ($roleMedkom) {
            foreach ($medkomModules as $module) {
                $permExists = DB::table('role_permissions')
                    ->where('role_id', $roleMedkom)
                    ->where('module_name', $module)
                    ->exists();
                if (! $permExists) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleMedkom,
                        'module_name' => $module,
                        'can_view' => true,
                        'can_create' => $module === 'Prokers',
                        'can_edit' => $module === 'Prokers' || $module === 'Profile',
                        'can_delete' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
