<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Showtime extends Model
{
    use HasFactory;

    protected $table = 'showtimes';
    protected $fillable = [
        'movie_id',
        'cinema_id',
        'auditorium_id',
        'start_time',
        'end_time',
        'format',
        'language',
        'base_price',
        'capacity',
        'available_seats',
        'status',
        'is_3d',
        'is_imax',
    ];

    public $timestamps = true;

    // Relations
    public function movie() {
        return $this->belongsTo(Movie::class);
    }

    public function cinema() {
        return $this->belongsTo(Cinema::class);
    }

    public function auditorium() {
        return $this->belongsTo(Auditorium::class);
    }
}