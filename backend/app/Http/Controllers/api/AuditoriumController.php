<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Auditorium;

class AuditoriumController extends Controller
{
    // 📋 Lấy danh sách phòng chiếu (lọc theo rạp nếu có)
    public function index(Request $request)
    {
        try {
            $cinemaId = $request->query('cinema_id');

            $query = Auditorium::query()->with('cinema');

            if ($cinemaId) {
                $query->where('cinema_id', $cinemaId);
            }

            $auditoriums = $query->orderBy('name')->get();

            return response()->json($auditoriums);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Lỗi khi lấy danh sách phòng chiếu',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}