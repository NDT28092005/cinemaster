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
        $this->apiUrl = config('services.ghtk.api_url');
        $this->token = config('services.ghtk.token');
    }

    public function createShipment($order)
    {
        $payload = [
            "products" => [
                [
                    "name" => $order->items->first()->product->name ?? 'Book',
                    "weight" => 500,
                    "quantity" => 1,
                    "price" => $order->total_amount,
                ]
            ],
            "order" => [
                "id" => "ORDER_" . $order->id,
                "pick_name" => "Kho sách NDTiny",
                "pick_address" => "123 Lê Duẩn, Đà Nẵng",
                "pick_province" => "Đà Nẵng",
                "pick_district" => "Hải Châu",
                "pick_tel" => "0905123456",
                "tel" => $order->customer_phone ?? '0000000000',
                "name" => $order->customer_name ?? 'Khách hàng',
                "address" => $order->delivery_address,
                "province" => $order->customer_province ?? 'Đà Nẵng',
                "district" => $order->customer_district ?? 'Hải Châu',
                "ward" => $order->customer_ward ?? 'Phường Thạch Thang',
                "hamlet" => "Khác",
                "is_freeship" => 1,
                "pick_money" => $order->total_amount,
                "note" => "Giao hàng cẩn thận, không bóp méo",
            ]
        ];

        $response = Http::withHeaders([
            'Token' => $this->token,
            'Content-Type' => 'application/json'
        ])->post($this->apiUrl, $payload);

        $data = $response->json();

        if ($response->successful() && isset($data['success']) && $data['success']) {
            return GhtkOrder::create([
                'order_id' => $order->id,
                'order_code' => $data['order']['order_code'] ?? null,
                'label_id' => $data['order']['label'] ?? null,
                'fee' => $data['order']['fee'] ?? null,
                'tracking_url' => $data['order']['url'] ?? null,
                'response' => json_encode($data),
                'status' => 'created',
            ]);
        }

        throw new \Exception('GHTK API error: ' . json_encode($data));
    }
}
