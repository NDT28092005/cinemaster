<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Showtime;

class ShowtimeController extends Controller
{
    public function index()
    {
        $showtimes = Showtime::with(['movie', 'cinema', 'auditorium'])->get();
        return response()->json($showtimes);
    }

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
            'status' => 'in:scheduled,cancelled,finished,sold_out',
            'is_3d' => 'boolean',
            'is_imax' => 'boolean',
        ]);

        $showtime = Showtime::create($validated);
        return response()->json($showtime, 201);
    }

    public function update(Request $request, $id)
    {
        $showtime = Showtime::findOrFail($id);

        $validated = $request->validate([
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
            'base_price' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:scheduled,cancelled,finished,sold_out',
        ]);

        $showtime->update($validated);
        return response()->json($showtime);
    }

    public function destroy($id)
    {
        $showtime = Showtime::findOrFail($id);
        $showtime->delete();
        return response()->json(['message' => 'Showtime deleted successfully']);
    }
}