<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'school_name',
                'value' => 'SMKN 6 Surakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'theme_color',
                'value' => '#FFD700',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'primary_color',
                'value' => '#1E3A8A',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'logo_url',
                'value' => '/uploads/logo.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'osis_vision',
                'value' => 'Menjadi organisasi siswa yang profesional, inovatif, dan berprestasi',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'osis_mission',
                'value' => 'Mengembangkan potensi siswa melalui kegiatan yang positif dan bermanfaat',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'contact_email',
                'value' => 'osis@smkn6solo.sch.id',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'contact_phone',
                'value' => '(0271) 123456',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'contact_address',
                'value' => 'Jl. LU Adisucipto No. 42, Surakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('app_settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'updated_at' => now(),
                ]
            );
        }
    }
}
