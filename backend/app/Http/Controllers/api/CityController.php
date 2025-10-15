<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;

class CityController extends Controller
{
    /**
     * 🏙️ Lấy danh sách tất cả thành phố (kèm quận nếu có)
     */
    public function index()
    {
        $cities = City::with('districts')
            ->orderBy('name')
            ->get();

        return response()->json($cities);
    }
}
