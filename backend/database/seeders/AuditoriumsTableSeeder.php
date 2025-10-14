<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuditoriumsTableSeeder extends Seeder
{
    public function run()
    {
        $cinemas = DB::table('cinemas')->get();

        foreach ($cinemas as $cinema) {
            DB::table('auditoriums')->insert([
                [
                    'id' => Str::uuid(),
                    'cinema_id' => $cinema->id,
                    'code' => 'AUD001',
                    'name' => 'Phòng 1',
                    'row_count' => 10,
                    'col_count' => 15,
                    'screen_type' => '2D',
                    'sound_system' => 'Dolby Atmos',
                    'created_at' => now(),
                ],
                [
                    'id' => Str::uuid(),
                    'cinema_id' => $cinema->id,
                    'code' => 'AUD002',
                    'name' => 'Phòng 2',
                    'row_count' => 12,
                    'col_count' => 20,
                    'screen_type' => '3D',
                    'sound_system' => 'Dolby Atmos',
                    'created_at' => now(),
                ],
            ]);
        }
    }
}
