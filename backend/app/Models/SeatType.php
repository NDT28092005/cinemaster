<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SeatType extends Model
{
    use HasFactory;

    protected $table = 'seat_types';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',      // ví dụ: Normal, VIP, Couple
        'description',
        'price_multiplier', // nhân với giá gốc
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // 🎯 Quan hệ
    public function seats()
    {
        return $this->hasMany(Seat::class, 'seat_type_id');
    }

    public function bookedSeats()
    {
        return $this->hasMany(BookedSeat::class, 'seat_type_id');
    }
}