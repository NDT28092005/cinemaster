<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cinema extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'name',
        'location',
        'description',
    ];

    public function auditoriums()
    {
        return $this->hasMany(Auditorium::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
