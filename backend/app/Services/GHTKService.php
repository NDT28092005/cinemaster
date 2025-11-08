<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\GhtkOrder;

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
}
