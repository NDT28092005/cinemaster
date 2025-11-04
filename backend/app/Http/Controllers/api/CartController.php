<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;

class CartController extends Controller
{
    // 🛒 Lấy giỏ hàng
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $items = Cart::with('product')->where('user_id', $user->id)->get();
        $total = $items->sum(fn($item) => ($item->product->price ?? 0) * $item->quantity);

        return response()->json(['items'=>$items,'total_amount'=>$total]);
    }

    // ➕ Thêm sản phẩm vào giỏ hàng
    public function add(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message'=>'Unauthorized'],401);

        $validated = $request->validate([
            'product_id'=>'required|exists:products,id',
            'quantity'=>'required|integer|min:1'
        ]);

        $cartItem = Cart::updateOrCreate(
            ['user_id'=>$user->id,'product_id'=>$validated['product_id']],
            ['quantity'=>DB::raw('quantity + '.$validated['quantity'])]
        );

        return response()->json(['message'=>'Thêm sản phẩm vào giỏ hàng thành công','cart_item'=>$cartItem]);
    }

    // 💳 Thanh toán
    public function checkout(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message'=>'Unauthorized'],401);

        $validated = $request->validate([
            'delivery_address'=>'required|string|max:255',
            'payment_method'=>'required|string|in:cod,momo,bank_transfer'
        ]);

        $cartItems = Cart::with('product')->where('user_id',$user->id)->get();
        if ($cartItems->isEmpty()) return response()->json(['message'=>'Giỏ hàng trống'],400);

        $total = $cartItems->sum(fn($item)=>($item->product->price??0)*$item->quantity);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id'=>$user->id,
                'delivery_address'=>$validated['delivery_address'],
                'payment_method'=>$validated['payment_method'],
                'total_amount'=>$total,
                'status'=>'pending',
                'expires_at'=>now()->addMinutes(1) // Hết hạn 5 phút
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id'=>$order->id,
                    'product_id'=>$item->product_id,
                    'quantity'=>$item->quantity,
                    'price'=>$item->product->price ?? 0
                ]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message'=>'Lỗi khi tạo đơn hàng','error'=>$e->getMessage()],500);
        }

        $bankCode="ACB";
        $accountNo="22751921";
        $accountName="NGUYEN DAI TUNG";
        $amountInt=intval($total);
        $randomSuffix=strtoupper(Str::random(6));
        $addInfo="Order{$order->id}{$randomSuffix}";
        $qrUrl="https://img.vietqr.io/image/{$bankCode}-{$accountNo}-compact2.png"
            ."?amount={$amountInt}&addInfo=".urlencode($addInfo)
            ."&accountName=".urlencode($accountName);

        return response()->json([
            'message'=>'Tạo mã thanh toán thành công',
            'order_id'=>$order->id,
            'amount'=>$amountInt,
            'addInfo'=>$addInfo,
            'qr_code'=>$qrUrl
        ]);
    }

    // 🧹 Clear cart
    public function clearCart(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message'=>'Unauthorized'],401);

        Cart::where('user_id',$user->id)->delete();

        return response()->json(['message'=>'Giỏ hàng đã xóa']);
    }

    // 🔁 Tự động hủy các order pending hết hạn (sẽ dùng trong Scheduler)
    public static function cancelExpiredOrders()
    {
        $expiredOrders = Order::where('status','pending')
            ->where('expires_at','<=', now())
            ->get();

        foreach ($expiredOrders as $order) {
            $order->status = 'cancelled';
            $order->save();
        }
    }
}
