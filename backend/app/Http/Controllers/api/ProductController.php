<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function show($id)
    {
        $product = Product::with('images', 'category', 'occasion')->find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        return response()->json($product);
    }
    public function index(Request $request)
    {
        $query = Product::with('images', 'category', 'occasion');

        // Lọc theo category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo occasion
        if ($request->filled('occasion_id')) {
            $query->where('occasion_id', $request->occasion_id);
        }

        // Lọc theo tên sản phẩm (search)
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock_quantity' => 'required|integer',
            'category_id' => 'nullable|exists:categories,id',
            'occasion_id' => 'nullable|exists:occasions,id',
            'is_active' => 'required|boolean',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        DB::beginTransaction();
        try {
            // ✅ Tạo product
            $product = Product::create([
                'name' => $validatedData['name'],
                'short_description' => $validatedData['short_description'] ?? null,
                'full_description' => $validatedData['full_description'] ?? null,
                'price' => $validatedData['price'],
                'stock_quantity' => $validatedData['stock_quantity'],
                'category_id' => $validatedData['category_id'] ?? null,
                'occasion_id' => $validatedData['occasion_id'] ?? null,
                'is_active' => $validatedData['is_active'],
            ]);

            // ✅ Lưu ảnh (nếu có)
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('products', 'public'); // -> storage/app/public/products
                    $url = asset('storage/' . $path);

                    // Lưu vào bảng product_images
                    $product->images()->create(['image_url' => $url]);
                }

                // ✅ Ảnh đại diện (ảnh đầu tiên)
                $firstImage = $product->images()->first();
                if ($firstImage) {
                    $product->update(['image_url' => $firstImage->image_url]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product->load('images')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Validate dữ liệu
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock_quantity' => 'nullable|integer',
            'category_id' => 'nullable|exists:categories,id',
            'occasion_id' => 'nullable|exists:occasions,id',
            'is_active' => 'required|boolean',
            'images.*' => 'nullable|image|max:2048',
        ]);

        $product->name = $request->name;
        $product->price = $request->price;
        $product->stock_quantity = $request->stock_quantity ?? 0;
        $product->category_id = $request->category_id;
        $product->occasion_id = $request->occasion_id;
        $product->is_active = $request->is_active;

        // Xử lý ảnh mới
        if ($request->hasFile('images')) {
            // Xóa ảnh cũ
            if ($product->image_url && file_exists(public_path($product->image_url))) {
                unlink(public_path($product->image_url));
            }

            $uploaded = $request->file('images')[0]; // lấy ảnh đầu tiên nếu nhiều
            $path = $uploaded->store('products', 'public');
            $product->image_url = 'http://localhost:8000/storage/' . $path;
        }

        $product->save();

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image_url) {
            Storage::delete(str_replace('storage/', 'public/', $product->image_url));
        }
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
