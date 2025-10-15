<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Str;

class Showtime extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = [
        'movie_id', 'cinema_id', 'auditorium_id', 
        'start_time', 'end_time', 'base_price', 'format', 'language', 'status'
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid(); // tự sinh UUID
            }
        });
    }
    public function movie() {
        return $this->belongsTo(Movie::class, 'movie_id');
    }

    public function cinema() {
        return $this->belongsTo(Cinema::class, 'cinema_id');
    }

    public function auditorium() {
        return $this->belongsTo(Auditorium::class, 'auditorium_id');
    }
}
