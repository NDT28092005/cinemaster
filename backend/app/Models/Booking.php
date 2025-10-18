<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use App\Models\BookedSeat;
class Booking extends Model {
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id','booking_code','user_id','showtime_id','total_amount','discount_amount','final_amount','payment_due','status','payment_method','notes'];

    protected static function booted() {
        static::creating(function($m){ if(!$m->id) $m->id = (string) Str::uuid(); if(!$m->booking_code) $m->booking_code = 'BK'. strtoupper(Str::random(8));});
    }

    public function bookedSeats(){ return $this->hasMany(BookedSeat::class,'booking_id'); }
    public function showtime(){ return $this->belongsTo(Showtime::class,'showtime_id'); }
    public function user(){ return $this->belongsTo(User::class,'user_id'); }
}
