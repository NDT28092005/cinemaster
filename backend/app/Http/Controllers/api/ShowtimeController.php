<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;
use Illuminate\Support\Str;

class ShowtimeController extends Controller
{
    // Lấy danh sách showtimes
    public function index()
    {
        $showtimes = Showtime::with(['movie', 'cinema', 'auditorium'])->get();
        return response()->json($showtimes);
    }

    // Thêm showtime mới
    public function store(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'cinema_id' => 'required|exists:cinemas,id',
            'auditorium_id' => 'required|exists:auditoriums,id',
            'start_time' => 'required|date',
            'base_price' => 'required|numeric',
        ]);

        $showtime = Showtime::create([
            'id' => Str::uuid(),
            'movie_id' => $request->movie_id,
            'cinema_id' => $request->cinema_id,
            'auditorium_id' => $request->auditorium_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'base_price' => $request->base_price,
            'capacity' => $request->capacity,
            'available_seats' => $request->capacity,
            'status' => 'scheduled',
        ]);

        return response()->json($showtime, 201);
    }

    // Cập nhật showtime
    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);
        $showtime->update($request->all());
        return response()->json($showtime);
    }

    // Xóa showtime
    public function destroy($id)
    {
        $showtime = Showtime::findOrFail($id);
        $showtime->delete();
        return response()->json(['message' => 'Showtime deleted successfully']);
    }
}