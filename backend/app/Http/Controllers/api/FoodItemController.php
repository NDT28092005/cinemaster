<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class FoodItemController extends Controller
{
    public function index(Request $request)
    {
        $query = FoodItem::with('category');

        if ($search = $request->search) {
            $query->where('name', 'like', "%$search%");
        }

        if ($categoryId = $request->category_id) {
            $query->where('category_id', $categoryId);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('foods', 'public');
        }

        $item = FoodItem::create([
            'id' => Str::uuid(),
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'image_url' => $imagePath,
            'is_available' => true,
            'is_popular' => $request->is_popular ?? false,
            'created_at' => now(),
        ]);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = FoodItem::findOrFail($id);

        if ($request->hasFile('image')) {
            if ($item->image_url) {
                Storage::disk('public')->delete($item->image_url);
            }
            $item->image_url = $request->file('image')->store('foods', 'public');
        }

        $item->update($request->only('name', 'price', 'description', 'is_available', 'is_popular'));

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $item = FoodItem::findOrFail($id);
        if ($item->image_url) {
            Storage::disk('public')->delete($item->image_url);
        }
        $item->delete();

        return response()->json(['success' => true]);
    }
}