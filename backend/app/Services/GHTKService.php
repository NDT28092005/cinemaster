<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\GhtkOrder;
use App\Models\Product;

class GHTKService
{
    protected $apiUrl;
    protected $token;

    public function __construct()
    {
        $this->apiUrl = config('services.ghtk.api_url');  // ex: https://services.giaohangtietkiem.vn/services/shipment/order/?ver=1.5
        $this->token  = config('services.ghtk.token');    // Token từ GHTK Dashboard
    }

    public function createShipment($order)
    {
        $totalWeightGrams = $order->items->sum(function ($item) {
            return ($item->product->weight_in_gram ?? 200) * $item->quantity;
        });

        if ($totalWeightGrams <= 0) $totalWeightGrams = 300;

        $payload = [
            "products" => $order->items->map(function ($item) {
                return [
                    "name"     => $item->product->name,
                    "weight"   => (int) ($item->product->weight_in_gram ?? 200),
                    "quantity" => (int) $item->quantity,
                    "price"    => (int) $item->price,
                ];
            })->toArray(),
        ];

        $orderPayload = [
            "id"            => "ORDER_" . $order->id,
            "weight"        => (int) $totalWeightGrams,
            "total_weight"  => (int) $totalWeightGrams,
            "weight_option" => "gram",
            "transport"      => "road",
            "deliver_option" => "none",
            "pick_money"     => (int) $order->total_amount,
            "value"          => (int) $order->total_amount,
            "tel"            => $order->customer_phone ?? "0905123456",
            "name"           => $order->customer_name ?? "Khách hàng",
            "address"        => $order->delivery_address,
            "province"       => $order->customer_province ?? "",
            "district"       => $order->customer_district ?? "",
            "ward"           => $order->customer_ward ?? "",
            "hamlet"         => "Khác",
            "is_freeship"    => 1,
        ];

        // ✅ Nếu bạn có pick_address_id (ưu tiên)
        if ($order->pick_address_id) {
            $orderPayload["pick_address_id"] = $order->pick_address_id;
        }
        // ❌ Nếu không có pick_address_id → phải gửi thông tin pick_xxx
        else {
            $orderPayload["pick_name"]     = "Kho sách NDTiny";
            $orderPayload["pick_address"]  = "1312, Phường 1, Bình Thạnh, TP.HCM";
            $orderPayload["pick_province"] = "TP Hồ Chí Minh";
            $orderPayload["pick_district"] = "Bình Thạnh";
            $orderPayload["pick_ward"]     = "Phường 1";
            $orderPayload["pick_tel"]      = "0946403788";
        }

        $payload["order"] = $orderPayload;


        \Log::info("GHTK PAYLOAD FINAL => " . json_encode($payload, JSON_UNESCAPED_UNICODE));

        $response = Http::withHeaders([
            "Token" => $this->token,
        ])->post($this->apiUrl, $payload);

        $data = $response->json();

        if ($response->successful() && $data["success"]) {
            return GhtkOrder::create([
                "order_id"     => $order->id,
                "order_code"   => $data["order"]["order_code"] ?? null,
                "label_id"     => $data["order"]["label"] ?? null,
                "fee"          => $data["order"]["fee"] ?? null,
                "tracking_url" => $data["order"]["url"] ?? null,
                "response"     => json_encode($data),
                "status"       => "created",
            ]);
        }

        throw new \Exception("GHTK API error: " . json_encode($data, JSON_UNESCAPED_UNICODE));
    }
    public function getOrderStatus($trackingCode)
    {
        $url = "https://services.ghtk.vn/services/shipment/v2/" . $trackingCode;

        $response = Http::withHeaders([
            "Token" => $this->token,
            "X-Client-Source" => config("services.ghtk.client_source"),
        ])->get($url);

        return $response->json();
    }
    public function syncOrderStatus(GhtkOrder $ghtkOrder)
    {
        if (!$ghtkOrder->label_id) {
            return;
        }

        $data = $this->getOrderStatus($ghtkOrder->label_id);

        if (!($data["success"] ?? false)) {
            \Log::warning("GHTK sync failed: " . json_encode($data));
            return;
        }

        $orderInfo = $data["order"];

        // Map trạng thái GHTK → trạng thái của bạn
        $map = [
            "1"   => "created",
            "2"   => "picking",
            "3"   => "delivering",
            "4"   => "delivered",
            "5"   => "returned",
            "-1"  => "cancelled",
            "-2"  => "lost",
        ];

        $newStatus = $map[$orderInfo["status"]] ?? "unknown";

        // Update bảng ghtk_orders
        $ghtkOrder->update([
            "status"   => $newStatus,
            "response" => json_encode($data),
        ]);

        // Update bảng orders (nếu cần)
        if ($newStatus === "delivered") {
            $ghtkOrder->order->update([
                "status" => "completed",
            ]);
        }

        if ($newStatus === "cancelled" || $newStatus === "returned") {
            $order = $ghtkOrder->order()->with('items.product')->first();
            
            if (!$order) {
                return $newStatus;
            }
            
            DB::beginTransaction();
            try {
                // 📦 Cộng lại tồn kho nếu đơn hàng đã được thanh toán
                $shouldRestoreStock = in_array($order->status, ['paid', 'processing']);
                
                if ($shouldRestoreStock && $order->items) {
                    foreach ($order->items as $item) {
                        $product = Product::lockForUpdate()->find($item->product_id);
                        if ($product) {
                            $product->increment('stock_quantity', $item->quantity);
                        }
                    }
                }

                $order->update([
                    "status" => "cancelled",
                ]);
                
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Error cancelling order from GHTK', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $newStatus;
    }
}
