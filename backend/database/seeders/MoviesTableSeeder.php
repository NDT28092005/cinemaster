<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MoviesTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('movies')->insert([
            [
                'id' => Str::uuid(),
                'title' => 'Avengers: Endgame',
                'slug' => 'avengers-endgame',
                'duration_min' => 181,
                'director' => 'Anthony Russo, Joe Russo',
                'cast' => 'Robert Downey Jr., Chris Evans, Mark Ruffalo',
                'status' => 'now_showing',
                'imdb_rating' => 8.4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Inception',
                'slug' => 'inception',
                'duration_min' => 148,
                'director' => 'Christopher Nolan',
                'cast' => 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page',
                'status' => 'now_showing',
                'imdb_rating' => 8.8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
