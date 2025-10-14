<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Movie extends Model
{
    use HasFactory;

    protected $table = 'movies';
    protected $keyType = 'string';
    protected $fillable = [
        'id',
        'title', 'slug', 'duration_min', 'director', 'cast', 'language',
        'poster_url', 'banner_url', 'trailer_url', 'description',
        'release_date', 'end_date', 'status', 'imdb_rating', 'genre_id', 'country_id'
    ];

    public $incrementing = false;

    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }
}