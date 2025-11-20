<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use App\Services\GHTKService;

class OrderController extends Controller
{
    /**
     * 🧾 Danh sách đơn hàng
     */
    public function calcShipping(Request $request)
{
    $weight = $request->weight ?? 500; // gram
    $province = $request->province;
    $district = $request->district;
    $ward = $request->ward;

    $client = new \GuzzleHttp\Client();
    $response = $client->post("https://services.ghtk.vn/services/shipment/fee", [
        "headers" => [
            "Token" => env("GHTK_TOKEN"),
            "Content-Type" => "application/json",
        ],
        "json" => [
            "province" => $province,
            "district" => $district,
            "ward" => $ward,
            "pick_province" => "Đà Nẵng",
            "pick_district" => "Hải Châu",
            "weight" => $weight,
        ]
    ]);

    $result = json_decode($response->getBody(), true);
    return response()->json([
        "shipping_fee" => $result['fee']['fee']
    ]);
}
    public function index(Request $request)
    {
        $orders = Order::with(['user', 'items.product.images'])
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
            'delivery_address'   => 'required|string|max:255',
            'customer_name'      => 'required|string|max:100',
            'customer_phone'     => 'required|string|max:20',
            'customer_province'  => 'required|string|max:100',
            'customer_district'  => 'required|string|max:100',
            'customer_ward'      => 'required|string|max:100',
            'shipping_fee'       => 'required|numeric|min:0',
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
            'user_id'            => $user->id,
            'total_amount'       => $total,
            'shipping_fee' => $request->shipping_fee,
            'delivery_address'   => $request->delivery_address,
            'customer_name'      => $request->customer_name,
            'customer_phone'     => $request->customer_phone,
            'customer_province'  => $request->customer_province,
            'customer_district'  => $request->customer_district,
            'customer_ward'      => $request->customer_ward,
            'expires_at'         => now()->addMinutes(5),
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
            'addInfo' => $transferContent,
            'shipping_fee' => $order->shipping_fee,
            'amount' => $order->total_amount + $order->shipping_fee,
        ]);
    }

    /**
     * ✅ Đánh dấu đã thanh toán
     */
    public function markPaid(Request $request, GHTKService $ghtkService)
    {
        $request->validate(['order_id' => 'required|integer']);
        $order = Order::find($request->order_id);

        if (!$order || $order->status !== 'pending') {
            return response()->json(['message' => 'Không thể cập nhật đơn hàng'], 400);
        }

        $order->update(['status' => 'paid']);

        // 🚚 Tạo vận đơn GHTK
        try {
            $ghtkOrder = $ghtkService->createShipment($order);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Thanh toán thành công nhưng tạo đơn GHTK thất bại',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Thanh toán & tạo đơn GHTK thành công',
            'order' => $order,
            'ghtk_order' => $ghtkOrder
        ]);
    }


    /**
     * 🔍 Xem chi tiết đơn hàng
     */
    public function show($id)
    {
        $order = Order::with(['user', 'items.product.images', 'payment'])
            ->findOrFail($id);
        
        return response()->json($order);
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
