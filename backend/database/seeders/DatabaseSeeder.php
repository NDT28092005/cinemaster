<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // ====== GENRES ======
        $genres = [
            ['name' => 'Hành động', 'code' => 'action', 'description' => 'Phim hành động gay cấn'],
            ['name' => 'Hài hước', 'code' => 'comedy', 'description' => 'Phim hài nhẹ nhàng vui vẻ'],
            ['name' => 'Kinh dị', 'code' => 'horror', 'description' => 'Phim kinh dị rùng rợn'],
            ['name' => 'Tình cảm', 'code' => 'romance', 'description' => 'Phim tình cảm lãng mạn'],
            ['name' => 'Khoa học viễn tưởng', 'code' => 'sci-fi', 'description' => 'Phim khoa học viễn tưởng hấp dẫn'],
        ];

        foreach ($genres as $genre) {
            DB::table('genres')->updateOrInsert(
                ['code' => $genre['code']],
                [
                    'id' => Str::uuid(),
                    'name' => $genre['name'],
                    'description' => $genre['description'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // ====== COUNTRIES ======
        $countries = [
            ['name' => 'Hoa Kỳ', 'code' => 'US', 'flag_url' => 'https://flagcdn.com/us.svg'],
            ['name' => 'Hàn Quốc', 'code' => 'KR', 'flag_url' => 'https://flagcdn.com/kr.svg'],
            ['name' => 'Nhật Bản', 'code' => 'JP', 'flag_url' => 'https://flagcdn.com/jp.svg'],
            ['name' => 'Việt Nam', 'code' => 'VN', 'flag_url' => 'https://flagcdn.com/vn.svg'],
            ['name' => 'Anh', 'code' => 'UK', 'flag_url' => 'https://flagcdn.com/gb.svg'],
        ];

        foreach ($countries as $country) {
            DB::table('countries')->updateOrInsert(
                ['code' => $country['code']],
                [
                    'id' => Str::uuid(),
                    'name' => $country['name'],
                    'flag_url' => $country['flag_url'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // ====== MOVIES ======
        $genreAction = DB::table('genres')->where('code', 'action')->value('id');
        $genreComedy = DB::table('genres')->where('code', 'comedy')->value('id');
        $countryUS = DB::table('countries')->where('code', 'US')->value('id');
        $countryKR = DB::table('countries')->where('code', 'KR')->value('id');

        $movies = [
            [
                'title' => 'Avengers: Endgame',
                'original_title' => 'Avengers: Endgame',
                'slug' => 'avengers-endgame',
                'duration_min' => 181,
                'director' => 'Anthony Russo, Joe Russo',
                'cast' => 'Robert Downey Jr., Chris Evans, Scarlett Johansson',
                'genre_id' => $genreAction,
                'country_id' => $countryUS,
                'language' => 'English',
                'subtitle_language' => 'Vietnamese',
                'rating' => 'PG-13',
                'age_rating' => 'T13',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
                'description' => 'Trận chiến cuối cùng chống lại Thanos để cứu lấy vũ trụ.',
                'synopsis' => 'Sau cú búng tay, các Avengers còn lại hợp lực để đảo ngược thảm họa.',
                'release_date' => '2019-04-26',
                'end_date' => '2019-09-01',
                'status' => 'archived',
                'imdb_rating' => 8.4,
                'is_featured' => true,
            ],
            [
                'title' => 'Parasite',
                'original_title' => 'Gisaengchung',
                'slug' => 'parasite',
                'duration_min' => 132,
                'director' => 'Bong Joon-ho',
                'cast' => 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong',
                'genre_id' => $genreComedy,
                'country_id' => $countryKR,
                'language' => 'Korean',
                'subtitle_language' => 'English',
                'rating' => 'R',
                'age_rating' => 'C18',
                'poster_url' => 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
                'banner_url' => 'https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg',
                'trailer_url' => 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
                'description' => 'Phim xã hội đen tối pha lẫn hài hước về sự bất bình đẳng.',
                'synopsis' => 'Một gia đình nghèo Hàn Quốc xâm nhập vào nhà của người giàu.',
                'release_date' => '2019-05-30',
                'status' => 'now_showing',
                'imdb_rating' => 8.6,
                'is_featured' => false,
            ],
        ];

        foreach ($movies as $movie) {
            DB::table('movies')->updateOrInsert(
                ['slug' => $movie['slug']],
                array_merge($movie, [
                    'id' => Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // ====== CINEMAS ======
        $cinemas = [
            ['code' => 'CGV-HCM-1', 'name' => 'CGV Vincom Đồng Khởi', 'address' => '72 Lê Thánh Tôn, Q.1, TP.HCM'],
            ['code' => 'CINESTAR-HCM', 'name' => 'Cinestar Nguyễn Trãi', 'address' => '135 Hai Bà Trưng, Q.1, TP.HCM'],
        ];

        foreach ($cinemas as $cinema) {
            DB::table('cinemas')->updateOrInsert(
                ['code' => $cinema['code']],
                [
                    'id' => Str::uuid(),
                    'name' => $cinema['name'],
                    'address' => $cinema['address'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // ====== AUDITORIUMS ======
        $cinema1 = DB::table('cinemas')->where('code', 'CGV-HCM-1')->value('id');
        $cinema2 = DB::table('cinemas')->where('code', 'CINESTAR-HCM')->value('id');

        $auditoriums = [
            ['cinema_id' => $cinema1, 'name' => 'Phòng Chiếu 1', 'row_count' => 10, 'col_count' => 15, 'screen_type' => 'IMAX'],
            ['cinema_id' => $cinema2, 'name' => 'Phòng Chiếu 2', 'row_count' => 8, 'col_count' => 12, 'screen_type' => '2D'],
        ];

        foreach ($auditoriums as $aud) {
            DB::table('auditoriums')->insert([
                'id' => Str::uuid(),
                'cinema_id' => $aud['cinema_id'],
                'name' => $aud['name'],
                'row_count' => $aud['row_count'],
                'col_count' => $aud['col_count'],
                'screen_type' => $aud['screen_type'],
                'is_active' => true,
                'created_at' => now(),
            ]);
        }

        // ====== SHOWTIMES ======
        $movie1 = DB::table('movies')->where('slug', 'avengers-endgame')->value('id');
        $movie2 = DB::table('movies')->where('slug', 'parasite')->value('id');
        $aud1 = DB::table('auditoriums')->where('name', 'Phòng Chiếu 1')->value('id');
        $aud2 = DB::table('auditoriums')->where('name', 'Phòng Chiếu 2')->value('id');

        $showtimes = [
            [
                'movie_id' => $movie1,
                'cinema_id' => $cinema1,
                'auditorium_id' => $aud1,
                'start_time' => '2025-10-15 14:00:00',
                'end_time' => '2025-10-15 17:15:00',
                'format' => 'IMAX 3D',
                'language' => 'English',
                'base_price' => 120000,
                'available_seats' => 150,
                'status' => 'scheduled',
                'is_3d' => true,
                'is_imax' => true,
            ],
            [
                'movie_id' => $movie2,
                'cinema_id' => $cinema2,
                'auditorium_id' => $aud2,
                'start_time' => '2025-10-15 19:00:00',
                'end_time' => '2025-10-15 21:30:00',
                'format' => '2D',
                'language' => 'Korean',
                'base_price' => 90000,
                'available_seats' => 96,
                'status' => 'scheduled',
                'is_3d' => false,
                'is_imax' => false,
            ],
        ];

        foreach ($showtimes as $show) {
            DB::table('showtimes')->insert(array_merge($show, [
                'id' => Str::uuid(),
                'created_at' => now(),
            ]));
        }

        // ====== ADMIN ACCOUNT ======
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@cinema.local'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}