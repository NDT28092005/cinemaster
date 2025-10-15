<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cinema;

class CinemaController extends Controller
{
    /**
     * 📽️ Danh sách tất cả rạp (kèm thành phố và quận)
     */
    public function index()
    {
        $cinemas = Cinema::with(['city', 'district'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($cinemas);
    }
}