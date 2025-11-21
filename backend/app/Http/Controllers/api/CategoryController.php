<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // Xử lý upload ảnh
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $data['image_url'] = asset('storage/' . $path);
        }

        $category = Category::create($data);
        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return $category;
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // Xử lý upload ảnh mới
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($category->image_url) {
                $oldPath = str_replace(asset('storage/'), '', $category->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('categories', 'public');
            $data['image_url'] = asset('storage/' . $path);
        }

        $category->update($data);
        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        // Xóa ảnh nếu tồn tại
        if ($category->image_url) {
            $oldPath = str_replace(asset('storage/'), '', $category->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $category->delete();
        return response()->json(null, 204);
    }
}
