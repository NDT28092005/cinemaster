<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TicketType extends Model
{
    use HasFactory;

    protected $table = 'ticket_types';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',       // ví dụ: Adult, Child, Senior
        'description',
        'price_modifier', // điều chỉnh giá vé
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
    public function bookedSeats()
    {
        return $this->hasMany(BookedSeat::class, 'ticket_type_id');
    }
}