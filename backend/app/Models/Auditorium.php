<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auditorium extends Model
{
    use HasFactory;

    protected $table = 'auditoriums';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'cinema_id', 'code', 'name', 'row_count', 'col_count',
        'seat_map', 'screen_type', 'sound_system', 'is_active',
        'screen_size', 'description'
    ];

    protected $casts = [
        'seat_map' => 'array',
        'is_active' => 'boolean',
    ];

    // Quan hệ: phòng chiếu thuộc 1 rạp
    public function cinema()
    {
        return $this->belongsTo(Cinema::class);
    }

    // Quan hệ ngược: phòng chiếu có nhiều suất chiếu
    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }
}