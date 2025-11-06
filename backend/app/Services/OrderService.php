<?php

namespace App\Services;

use App\Models\Order;
use Carbon\Carbon;

class OrderService
{
    public function cancelExpiredOrders()
    {
        $expiredOrders = Order::where('status', 'pending')
            ->where('created_at', '<', Carbon::now()->subMinutes(30))
            ->get();

        foreach ($expiredOrders as $order) {
            $order->update(['status' => 'cancelled']);
        }

        return $expiredOrders->count();
    }
}
