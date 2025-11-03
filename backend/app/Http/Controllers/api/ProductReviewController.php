<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    public function index()
    {
        // Lấy tất cả review kèm product và user
        return ProductReview::with(['product', 'user'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review = ProductReview::create($data);
        return response()->json($review, 201);
    }

    public function show(ProductReview $productReview)
    {
        return $productReview->load(['product', 'user']);
    }

    public function update(Request $request, ProductReview $productReview)
    {
        $data = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $productReview->update($data);
        return response()->json($productReview);
    }

    public function destroy(ProductReview $productReview)
    {
        $productReview->delete();
        return response()->json(null, 204);
    }

    // Optional: Block review (is_active false)
    public function block(ProductReview $productReview)
    {
        $productReview->update(['is_active' => false]);
        return response()->json($productReview);
    }
}
