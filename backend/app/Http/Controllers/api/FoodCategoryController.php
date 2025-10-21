<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FoodCategoryController extends Controller
{
    public function index()
    {
        $query = FoodCategory::query();

        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:100']);

        $category = FoodCategory::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'code' => strtoupper(Str::slug($request->name, '_')),
            'description' => $request->description,
            'is_active' => true,
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = FoodCategory::findOrFail($id);
        $category->update($request->only('name', 'description', 'is_active'));

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        FoodCategory::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}