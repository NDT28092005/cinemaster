<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;

class DistrictController extends Controller
{
    /**
     * 🏘️ Lấy danh sách quận (có thể lọc theo city_id nếu có query param)
     * VD: /api/districts?city_id=1
     */
    public function index()
    {
        $query = District::query();

        if (request()->has('city_id')) {
            $query->where('city_id', request('city_id'));
        }

        $districts = $query->orderBy('name')->get();

        return response()->json($districts);
    }
}