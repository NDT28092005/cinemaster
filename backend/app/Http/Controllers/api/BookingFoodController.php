<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BookingFood;

class BookingFoodController extends Controller
{
    // Danh sách booking food theo booking
    public function index(Request $request)
    {
        $bookingId = $request->query('booking_id');
        $query = BookingFood::with('foodItem');

        if ($bookingId) {
            $query->where('booking_id', $bookingId);
        }

        return response()->json($query->get());
    }

    // Thêm booking food mới
    public function store(Request $request)
    {
        $data = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'food_item_id' => 'required|exists:food_items,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
        ]);

        $bookingFood = BookingFood::create($data);

        return response()->json($bookingFood, 201);
    }

    // Xóa
    public function destroy($id)
    {
        $bookingFood = BookingFood::findOrFail($id);
        $bookingFood->delete();
        return response()->json(['message' => 'Deleted']);
    }
}