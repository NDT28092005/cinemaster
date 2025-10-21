<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;

class ShowtimeController extends Controller
{
    // Lấy toàn bộ danh sách
    public function index()
    {
        $showtimes = Showtime::with(['movie', 'cinema', 'auditorium'])
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json($showtimes);
    }

    // Lấy 1 showtime theo id
    public function show($id)
    {
        $showtime = Showtime::with(['movie', 'cinema', 'auditorium'])->findOrFail($id);
        return response()->json($showtime);
    }

    // Tạo mới
    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'cinema_id' => 'required|exists:cinemas,id',
            'auditorium_id' => 'required|exists:auditoriums,id',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after:start_time',
            'format' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:50',
            'base_price' => 'required|numeric|min:0',
            'capacity' => 'nullable|integer|min:0',
            'available_seats' => 'nullable|integer|min:0',
            'status' => 'nullable|in:scheduled,cancelled,finished,sold_out',
            'is_3d' => 'boolean',
            'is_imax' => 'boolean',
        ]);

        $showtime = Showtime::create($validated);
        return response()->json($showtime, 201);
    }

    // Cập nhật (chỉnh sửa) một showtime
    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);

        $validated = $request->validate([
            'movie_id' => 'sometimes|exists:movies,id',
            'cinema_id' => 'sometimes|exists:cinemas,id',
            'auditorium_id' => 'sometimes|exists:auditoriums,id',
            'start_time' => 'sometimes|date',
            'end_time' => 'nullable|date|after:start_time',
            'format' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:50',
            'base_price' => 'sometimes|numeric|min:0',
            'capacity' => 'nullable|integer|min:0',
            'available_seats' => 'nullable|integer|min:0',
            'status' => 'nullable|in:scheduled,cancelled,finished,sold_out',
            'is_3d' => 'boolean',
            'is_imax' => 'boolean',
        ]);

        $showtime->update($validated);
        return response()->json($showtime);
    }

    // Xóa
    public function destroy($id)
    {
        $showtime = Showtime::findOrFail($id);
        $showtime->delete();

        return response()->json(['message' => 'Showtime deleted successfully']);
    }
}
