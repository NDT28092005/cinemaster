<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewController extends Controller
{
    // 🧾 Lấy tất cả review (kèm product, user) - cho admin
    public function index()
    {
        return ProductReview::with(['product:id,name', 'user:id,name'])
            ->orderByDesc('created_at')
            ->get();
    }

    // ➕ Người dùng thêm review
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review = ProductReview::create($data);
        return response()->json($review->load(['product', 'user']), 201);
    }

    // 🔍 Xem chi tiết 1 review
    public function show(ProductReview $productReview)
    {
        return $productReview->load(['product', 'user']);
    }

    // ✏️ Cập nhật nội dung review
    public function update(Request $request, ProductReview $productReview)
    {
        $data = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $productReview->update($data);
        return response()->json($productReview);
    }

    // 🚫 Chặn review xấu (set is_blocked = true)
    public function block(ProductReview $productReview)
    {
        $productReview->update(['is_blocked' => true]);
        return response()->json([
            'message' => 'Review đã bị chặn',
            'review' => $productReview
        ]);
    }

    // ♻️ Bỏ chặn review (set is_blocked = false)
    public function unblock(ProductReview $productReview)
    {
        $productReview->update(['is_blocked' => false]);
        return response()->json([
            'message' => 'Review đã được mở lại',
            'review' => $productReview
        ]);
    }

    // 🗑️ Xóa review
    public function destroy(ProductReview $productReview)
    {
        $productReview->delete();
        return response()->json(['message' => 'Review đã bị xóa'], 204);
    }
}