<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call([
            RoleSeeder::class,
            AppSettingSeeder::class,
        ]);

        // Find Admin role dynamically
        $adminRole = Role::where('name', 'Admin')->first();

        // Create or update default admin user
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator',
                'email' => 'admin@osisviska.com',
                'password' => bcrypt('password'),
                'role_id' => $adminRole?->id ?? 2,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }
}
