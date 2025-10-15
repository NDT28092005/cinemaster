<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GenreController extends Controller
{
    public function index()
    {
        return response()->json(Genre::where('is_active', true)->get());
    }

    public function store(Request $request)
    {
        $genre = Genre::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json($genre, 201);
    }
}