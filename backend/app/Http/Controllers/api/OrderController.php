<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * 🧾 Danh sách đơn hàng
     */
    public function index(Request $request)
    {
        $orders = Order::with(['user', 'items.product'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * 🧾 Tạo đơn hàng khi checkout
     */
    public function store(Request $request)
    {
        $request->validate([
            'delivery_address' => 'required|string|max:255',
        ]);

        $user = $request->user();

        // Tính tổng tiền từ giỏ hàng
        $cartItems = DB::table('cart_items')
            ->join('products', 'cart_items.product_id', '=', 'products.id')
            ->where('cart_items.user_id', $user->id)
            ->select('cart_items.*', 'products.price')
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng trống'], 400);
        }

        $total = $cartItems->sum(fn($item) => $item->price_per_unit * $item->quantity);

        // Tạo order
        $order = Order::create([
            'user_id' => $user->id,
            'total_amount' => $total,
            'delivery_address' => $request->delivery_address,
            'expires_at' => now()->addMinutes(5),
        ]);

        // Thêm order_items
        foreach ($cartItems as $item) {
            $order->items()->create([
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->price_per_unit,
            ]);
        }

        // Xóa giỏ hàng sau khi checkout
        DB::table('cart_items')->where('user_id', $user->id)->delete();

        // Tạo VietQR fake (mô phỏng)
        $transferContent = "ORDER_" . $order->id . "_" . strtoupper(substr(md5($user->email), 0, 5));
        $qrCode = "https://api.vietqr.io/image/$transferContent.png";

        return response()->json([
            'order_id' => $order->id,
            'qr_code' => $qrCode,
            'amount' => $total,
            'addInfo' => $transferContent,
        ]);
    }

    /**
     * ✅ Đánh dấu đã thanh toán
     */
    public function markPaid(Request $request)
    {
        $request->validate(['order_id' => 'required|integer']);
        $order = Order::find($request->order_id);

        if (!$order || $order->status !== 'pending') {
            return response()->json(['message' => 'Không thể cập nhật đơn hàng'], 400);
        }

        $order->update(['status' => 'paid']);
        return response()->json(['message' => 'Thanh toán thành công', 'order' => $order]);
    }

    /**
     * ❌ Hủy các đơn quá hạn (tự động)
     */
    public function cancelExpired()
    {
        $count = Order::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->update(['status' => 'cancelled']);

        return response()->json(['message' => "Đã hủy $count đơn hàng quá hạn"]);
    }
}
