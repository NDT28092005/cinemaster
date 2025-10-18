<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookedSeat;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    // Luồng 1: danh sách bookings (filter, paginate)
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'showtime.movie', 'showtime.cinema'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($qbuilder) use ($q) {
                $qbuilder->where('booking_code', 'like', "%$q%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%"));
            });
        }

        $perPage = $request->get('per_page', 20);
        $data = $query->paginate($perPage);

        return response()->json($data);
    }

    // Luồng 2: chi tiết booking
    public function show($id)
    {
        $booking = Booking::with([
            'user',
            'showtime.movie',
            'showtime.auditorium',
            'bookedSeats.seat',
            'bookedSeats.seatType',
            'bookedSeats.ticketType'
        ])->findOrFail($id);

        return response()->json($booking);
    }

    // Luồng 3: cập nhật booking (chỉ cập nhật một số trường)
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'paid', 'cancelled', 'refunded', 'expired'])],
            'payment_method' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($booking, $validated) {
            $booking->fill($validated);
            $booking->save();
            // nếu đổi sang 'paid', cập nhật showtime.available_seats,.. cần logic tuỳ bạn
        });

        return response()->json(['message' => 'Updated', 'booking' => $booking]);
    }

    // Luồng 4: refund (mô phỏng)
    public function refund(Request $request, $id)
    {
        $booking = Booking::with('bookedSeats')->findOrFail($id);

        if ($booking->status !== 'paid') {
            return response()->json(['message' => 'Chỉ refund booking có trạng thái paid'], 400);
        }

        DB::transaction(function () use ($booking) {
            // 1) gọi payment gateway refund API ở đây (nếu tích hợp). Mình giả lập success.
            // 2) cập nhật trạng thái
            $booking->status = 'refunded';
            $booking->save();

            // 3) hoàn lại ghế -> tăng available_seats
            // ví dụ:
            $showtime = $booking->showtime;
            if ($showtime) {
                $refundedSeats = $booking->bookedSeats->count();
                $showtime->available_seats = $showtime->available_seats + $refundedSeats;
                $showtime->save();
            }

            // 4) tạo log/payment history nếu cần
        });

        return response()->json(['message' => 'Refund processed', 'booking' => $booking]);
    }

    // Luồng 4: xóa booking
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        DB::transaction(function () use ($booking) {
            // Nếu đã thanh toán, có thể từ chối xóa - business rule
            $booking->delete(); // sẽ cascade booked_seats nếu migration đúng
        });

        return response()->json(['message' => 'Deleted']);
    }
}
