<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_amount',
        'shipping_fee',
        'status',
        'delivery_address',
        'expires_at',
        'customer_name',
        'customer_phone',
        'customer_province',
        'customer_district',
        'customer_ward',
        'cancelled_at',
        'cancellation_reason',
        'wrapping_paper_id',
        'wrapping_paper',
        'decorative_accessory_id',
        'decorative_accessories',
        'card_type_id',
        'card_type',
        'card_note',
        'loyalty_points_used'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
