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
                ['code' => $genre['code']], // điều kiện duy nhất
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
            DB::table('countries')->insert([
                'id' => Str::uuid(),
                'name' => $country['name'],
                'code' => $country['code'],
                'flag_url' => $country['flag_url'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ====== MOVIES ======
        $genreId = DB::table('genres')->where('code', 'action')->value('id');
        $countryId = DB::table('countries')->where('code', 'US')->value('id');

        $movies = [
            [
                'title' => 'Avengers: Endgame',
                'original_title' => 'Avengers: Endgame',
                'slug' => 'avengers-endgame',
                'duration_min' => 181,
                'director' => 'Anthony Russo, Joe Russo',
                'cast' => 'Robert Downey Jr., Chris Evans, Scarlett Johansson',
                'genre_id' => $genreId,
                'country_id' => $countryId,
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
                'genre_id' => DB::table('genres')->where('code', 'comedy')->value('id'),
                'country_id' => DB::table('countries')->where('code', 'KR')->value('id'),
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
            DB::table('movies')->insert(array_merge($movie, [
                'id' => Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // ====== MOVIE_GENRES (liên kết nhiều thể loại nếu cần) ======
        $movie1 = DB::table('movies')->where('slug', 'avengers-endgame')->value('id');
        $movie2 = DB::table('movies')->where('slug', 'parasite')->value('id');
        $genreAction = DB::table('genres')->where('code', 'action')->value('id');
        $genreComedy = DB::table('genres')->where('code', 'comedy')->value('id');

        DB::table('movie_genres')->insert([
            ['id' => Str::uuid(), 'movie_id' => $movie1, 'genre_id' => $genreAction],
            ['id' => Str::uuid(), 'movie_id' => $movie2, 'genre_id' => $genreComedy],
        ]);

        // ====== ADMIN ACCOUNT ======
        DB::table('users')->insert([
            'name' => 'admin',
            'email' => 'admin@cinema.local',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
