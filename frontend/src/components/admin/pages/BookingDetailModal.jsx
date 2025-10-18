import { useState, useEffect } from "react";
import axios from "axios";

export default function BookingDetailModal({ bookingId, onClose }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi fetch booking:", err);
        alert("Không thể tải chi tiết booking!");
        onClose();
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) loadBooking();
  }, [bookingId, onClose]);

  if (loading) return <div>Đang tải chi tiết...</div>;
  if (!booking) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chi tiết booking: {booking.booking_code}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>Người đặt:</strong> {booking.user?.name || "Khách vãng lai"}</p>
            <p><strong>Suất chiếu:</strong> {booking.showtime?.movie?.title || "N/A"} - {booking.showtime?.auditorium?.name || "N/A"}</p>
            <p><strong>Tổng tiền:</strong> {booking.final_amount?.toLocaleString()} ₫</p>
            <p><strong>Trạng thái:</strong> {booking.status}</p>
            <h6>Ghế đã đặt:</h6>
            <ul>
              {booking.booked_seats?.map((s) => (
                <li key={s.id}>{s.seat_label_snapshot} - {s.ticket_type_id}</li>
              )) || <li>Chưa có ghế</li>}
            </ul>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}
