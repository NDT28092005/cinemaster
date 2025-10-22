<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodItem extends Model
{
    use HasFactory;

    protected $table = 'food_items';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'category_id',
        'name',
        'description',
        'price',
        'image_url',
        'is_available',
        'is_popular',
        'created_at',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_popular' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(FoodCategory::class, 'category_id');
    }
}
