<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ShowtimesTableSeeder extends Seeder
{
    public function run()
    {
        $movies = DB::table('movies')->get();
        $auditoriums = DB::table('auditoriums')->get();

        foreach ($movies as $movie) {
            foreach ($auditoriums as $auditorium) {
                DB::table('showtimes')->insert([
                    'id' => Str::uuid(),
                    'movie_id' => $movie->id,
                    'cinema_id' => $auditorium->cinema_id,
                    'auditorium_id' => $auditorium->id,
                    'start_time' => now()->addDays(1)->setHour(14),
                    'end_time' => now()->addDays(1)->setHour(16),
                    'format' => $auditorium->screen_type,
                    'language' => 'Vietnamese',
                    'base_price' => 80000,
                    'capacity' => $auditorium->row_count * $auditorium->col_count,
                    'available_seats' => $auditorium->row_count * $auditorium->col_count,
                    'status' => 'scheduled',
                    'is_3d' => $auditorium->screen_type === '3D',
                    'is_imax' => $auditorium->screen_type === 'IMAX',
                    'created_at' => now(),
                ]);
            }
        }
    }
}
