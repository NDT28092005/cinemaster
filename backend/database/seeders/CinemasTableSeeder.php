<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CinemasTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('cinemas')->insert([
            [
                'id' => Str::uuid(),
                'code' => 'CIN001',
                'name' => 'CGV Vincom Center',
                'address' => '123 Lê Lợi, TP.HCM',
                'phone' => '0909123456',
                'email' => 'cgv@example.com',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'CIN002',
                'name' => 'Galaxy Nguyễn Du',
                'address' => '99 Nguyễn Du, TP.HCM',
                'phone' => '0909988776',
                'email' => 'galaxy@example.com',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}