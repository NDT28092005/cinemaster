<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Exports\OrdersExport;
use App\Imports\OrdersImport;
use Maatwebsite\Excel\Facades\Excel;

class OrderController extends Controller
{
    /**
     * 🧾 Lấy danh sách đơn hàng (có filter & search)
     */
    public function index(Request $request)
    {
        $orders = Order::with(['user', 'items.product', 'payment'])
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->search, function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->whereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('email', 'like', "%{$request->search}%");
                    })->orWhere('id', 'like', "%{$request->search}%");
                });
            })
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }
    public function store(Request $request)
    {
        $order = Order::create([
            'user_id' => $request->user_id,
            'total_amount' => $request->total_amount,
            'delivery_address' => $request->delivery_address,
            'status' => $request->status,
        ]);

        foreach ($request->items as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        if ($request->payment) {
            $order->payment()->create([
                'payment_method' => $request->payment['payment_method'],
                'status' => $request->payment['status'],
                'transaction_id' => $request->payment['transaction_id'] ?? null,
            ]);
        }

        return response()->json($order->load('items.product', 'payment', 'user'));
    }
    /**
     * 🔍 Xem chi tiết 1 đơn hàng
     */
    public function show($id)
    {
        $order = Order::with(['user', 'items.product', 'payment'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * 🔄 Cập nhật trạng thái đơn hàng
     * status = pending | processing | completed | cancelled
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    /**
     * ❌ Xóa đơn hàng
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }
    public function export()
    {
        return Excel::download(new OrdersExport, 'orders.xlsx');
    }

    /**
     * 📥 Import orders từ Excel file
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:10240' // max 10MB
        ]);

        try {
            Excel::import(new OrdersImport, $request->file('file'));
            
            return response()->json([
                'message' => 'Orders imported successfully',
                'success' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed: ' . $e->getMessage(),
                'success' => false
            ], 400);
        }
    }
}
