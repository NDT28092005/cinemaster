<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_id',
        'name',
        'slug',
        'is_active',
    ];

    public $timestamps = false;

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function cinemas()
    {
        return $this->hasMany(Cinema::class);
    }
}