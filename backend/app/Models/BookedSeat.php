<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class BookedSeat extends Model
{
    use HasFactory;

    protected $table = 'booked_seats';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'booking_id',
        'seat_id',
        'seat_label_snapshot',
        'seat_type_id',
        'ticket_type_id',
        'unit_price',
        'discount_amount',
        'final_price',
        'ticket_code',
        'qr_code',
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

    public function booking() { return $this->belongsTo(Booking::class, 'booking_id'); }
    public function seat() { return $this->belongsTo(Seat::class, 'seat_id'); }
    public function seatType() { return $this->belongsTo(SeatType::class, 'seat_type_id'); }
    public function ticketType() { return $this->belongsTo(TicketType::class, 'ticket_type_id'); }
}