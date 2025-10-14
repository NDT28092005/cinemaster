<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Movie;

class MovieController extends Controller
{
    /**
     * 📜 Danh sách phim (có thể kèm filter theo status)
     */
    public function index(Request $request)
    {
        $query = Movie::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $movies = $query->with('showtimes')->get();

        return response()->json($movies);
    }

    /**
     * 🎬 Tạo phim mới
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:movies,slug',
            'duration_min' => 'nullable|integer|min:1',
            'director' => 'nullable|string|max:255',
            'cast' => 'nullable|string',
            'language' => 'nullable|string|max:50',
            'poster_url' => 'nullable|string',
            'banner_url' => 'nullable|string',
            'trailer_url' => 'nullable|string',
            'description' => 'nullable|string',
            'release_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:release_date',
            'status' => 'in:coming_soon,now_showing,archived',
            'imdb_rating' => 'nullable|numeric|between:0,10',
            'genre_id' => 'nullable|exists:genres,id',
            'country_id' => 'nullable|exists:countries,id',
        ]);

        // Nếu không có slug, tự động sinh từ title
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);
        $validated['id'] = (string) Str::uuid();

        $movie = Movie::create($validated);

        return response()->json($movie, 201);
    }

    /**
     * 🔍 Chi tiết 1 phim (kèm suất chiếu)
     */
    public function show($id)
    {
        $movie = Movie::with('showtimes')->findOrFail($id);
        return response()->json($movie);
    }

    /**
     * ✏️ Cập nhật thông tin phim
     */
    public function update(Request $request, $id)
    {
        $movie = Movie::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:movies,slug,' . $id,
            'duration_min' => 'sometimes|integer|min:1',
            'director' => 'nullable|string|max:255',
            'cast' => 'nullable|string',
            'language' => 'nullable|string|max:50',
            'poster_url' => 'nullable|string',
            'banner_url' => 'nullable|string',
            'trailer_url' => 'nullable|string',
            'description' => 'nullable|string',
            'release_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:release_date',
            'status' => 'in:coming_soon,now_showing,archived',
            'imdb_rating' => 'nullable|numeric|between:0,10',
            'genre_id' => 'nullable|exists:genres,id',
            'country_id' => 'nullable|exists:countries,id',
        ]);

        $movie->update($validated);

        return response()->json($movie);
    }

    /**
     * ❌ Xóa phim
     */
    public function destroy($id)
    {
        $movie = Movie::findOrFail($id);
        $movie->delete();

        return response()->json(['message' => 'Movie deleted successfully']);
    }
}