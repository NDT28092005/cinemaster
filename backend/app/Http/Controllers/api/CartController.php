<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\QueryException;

class CartController extends Controller
{
    /**
     * 🛒 Lấy giỏ hàng của người dùng
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        return response()->json($this->buildCartSnapshot($user->id));
    }

    /**
     * ➕ Thêm sản phẩm vào giỏ hàng (hoặc cập nhật số lượng)
     * quantity có thể âm để giảm số lượng
     */
    public function add(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer'
        ]);

        $quantityDelta = (int) $validated['quantity'];
        $status = null;

        try {
            DB::transaction(function () use ($user, $validated, $quantityDelta, &$status) {
                $cartItem = Cart::where('user_id', $user->id)
                    ->where('product_id', $validated['product_id'])
                    ->lockForUpdate()
                    ->first();

                if ($cartItem) {
                    $newQuantity = $cartItem->quantity + $quantityDelta;

                    if ($newQuantity <= 0) {
                        $cartItem->delete();
                        $status = 'removed';
                        return;
                    }

                    $cartItem->update(['quantity' => $newQuantity]);
                    $status = 'updated';
                    return;
                }

                if ($quantityDelta <= 0) {
                    $status = 'invalid';
                    return;
                }

                $status = 'added';

                Cart::create([
                    'user_id' => $user->id,
                    'product_id' => $validated['product_id'],
                    'quantity' => $quantityDelta
                ]);
            });
        } catch (QueryException $exception) {
            if ($exception->getCode() !== '23000') {
                throw $exception;
            }

            $cartItem = Cart::where('user_id', $user->id)
                ->where('product_id', $validated['product_id'])
                ->first();

            if ($cartItem) {
                $newQuantity = $cartItem->quantity + $quantityDelta;

                if ($newQuantity <= 0) {
                    $cartItem->delete();
                    $status = 'removed';
                    $cartItem = null;
                } else {
                    $cartItem->update(['quantity' => $newQuantity]);
                    $status = 'updated';
                }
            } else {
                throw $exception;
            }
        }

        if ($status === 'invalid') {
            return response()->json([
                'message' => 'Không thể giảm số lượng sản phẩm chưa có trong giỏ hàng'
            ], 400);
        }

        $cartSnapshot = $this->buildCartSnapshot($user->id);

        switch ($status) {
            case 'removed':
                $message = 'Sản phẩm đã được xóa khỏi giỏ hàng';
                break;
            case 'updated':
                $message = 'Cập nhật số lượng thành công';
                break;
            default:
                $message = 'Thêm sản phẩm vào giỏ hàng thành công';
        }

        return response()->json([
            'message' => $message,
            'items' => $cartSnapshot['items'],
            'total_amount' => $cartSnapshot['total_amount'],
        ]);
    }


    /**
     * 💳 Thanh toán (tạo order)
     */
    public function checkout(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $validated = $request->validate([
            'delivery_address' => 'required|string|max:255',
            'payment_method'   => 'required|string|in:cod,momo,bank_transfer',
            'customer_name'    => 'nullable|string|max:255',
            'customer_phone'   => 'nullable|string|max:20',
            'customer_province' => 'nullable|string|max:255',
            'customer_district' => 'nullable|string|max:255',
            'customer_ward'    => 'nullable|string|max:255',
        ]);

        $cartItems = Cart::with('product')->where('user_id', $user->id)->get();
        if ($cartItems->isEmpty()) return response()->json(['message' => 'Giỏ hàng trống'], 400);

        $total = $cartItems->sum(fn($item) => ($item->product->price ?? 0) * $item->quantity);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'           => $user->id,
                'delivery_address'  => $validated['delivery_address'],
                'customer_name'     => $validated['customer_name'] ?? null,
                'customer_phone'    => $validated['customer_phone'] ?? null,
                'customer_province' => $validated['customer_province'] ?? null,
                'customer_district' => $validated['customer_district'] ?? null,
                'customer_ward'     => $validated['customer_ward'] ?? null,
                'total_amount'      => $total,
                'status'            => 'pending',
                'expires_at'        => now()->addMinutes(5), // hết hạn 5 phút
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item->product_id,
                    'quantity'   => $item->quantity,
                    'price'      => $item->product->price ?? 0,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi tạo đơn hàng',
                'error'   => $e->getMessage()
            ], 500);
        }

        // Tạo mã QR thanh toán
        $bankCode = "ACB";
        $accountNo = "22751921";
        $accountName = "NGUYEN DAI TUNG";
        $amountInt = intval($total);
        $randomSuffix = strtoupper(Str::random(6));
        $addInfo = "Order{$order->id}{$randomSuffix}";
        $qrUrl = "https://img.vietqr.io/image/{$bankCode}-{$accountNo}-compact2.png"
            . "?amount={$amountInt}&addInfo=" . urlencode($addInfo)
            . "&accountName=" . urlencode($accountName);

        return response()->json([
            'message'  => 'Tạo mã thanh toán thành công',
            'order_id' => $order->id,
            'amount'   => $amountInt,
            'addInfo'  => $addInfo,
            'qr_code'  => $qrUrl,
        ]);
    }

    /**
     * ❌ Hủy đơn hàng quá hạn (tự động)
     */
    public function cancelOrder(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $orderId = $request->input('order_id');
        if (!$orderId) return response()->json(['message' => 'Thiếu order_id'], 400);

        $order = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);

        if ($order->status === 'pending' && now()->greaterThanOrEqualTo($order->expires_at)) {
            DB::beginTransaction();
            try {
                // Đơn hàng pending chưa thanh toán nên không cần cộng lại tồn kho
                $order->update(['status' => 'cancelled']);
                DB::commit();
                return response()->json(['message' => 'Đơn hàng đã bị hủy do hết thời gian thanh toán']);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Lỗi khi hủy đơn hàng',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        return response()->json(['message' => 'Đơn hàng chưa hết hạn hoặc đã được xử lý']);
    }

    /**
     * 🧹 Xóa toàn bộ giỏ hàng
     */
    public function clearCart(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        Cart::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Giỏ hàng đã được xóa']);
    }

    /**
     * 🔁 Tự động hủy đơn hàng pending hết hạn (cron job hoặc schedule)
     */
    public static function cancelExpiredOrders()
    {
        $expiredOrders = Order::with('items.product')
            ->where('status', 'pending')
            ->where('expires_at', '<=', now())
            ->get();

        foreach ($expiredOrders as $order) {
            DB::beginTransaction();
            try {
                // Đơn hàng pending chưa thanh toán nên không cần cộng lại tồn kho
                $order->update(['status' => 'cancelled']);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Error cancelling expired order', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
    public function updateQuantity(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $validated = $request->validate([
            'cart_id' => 'required|exists:carts,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = Cart::where('id', $validated['cart_id'])
            ->where('user_id', $user->id)
            ->first();

        if (!$cartItem) return response()->json(['message' => 'Item not found'], 404);

        $cartItem->update(['quantity' => $validated['quantity']]);

        $cartSnapshot = $this->buildCartSnapshot($user->id);

        return response()->json([
            'message' => 'Cart updated',
            'items' => $cartSnapshot['items'],
            'total_amount' => $cartSnapshot['total_amount']
        ]);
    }
    public function removeItem(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $validated = $request->validate([
            'cart_id' => 'required|exists:carts,id'
        ]);

        Cart::where('id', $validated['cart_id'])
            ->where('user_id', $user->id)
            ->delete();

        $cartSnapshot = $this->buildCartSnapshot($user->id);

        return response()->json([
            'message' => 'Item removed',
            'items' => $cartSnapshot['items'],
            'total_amount' => $cartSnapshot['total_amount']
        ]);
    }

    private function buildCartSnapshot(int $userId): array
    {
        $items = Cart::with('product')->where('user_id', $userId)->get();
        $total = $items->sum(fn($item) => ($item->product->price ?? 0) * $item->quantity);

        return [
            'items' => $items,
            'total_amount' => $total,
        ];
    }
}
