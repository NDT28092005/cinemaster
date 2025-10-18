import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import BookingDetailModal from "./BookingDetailModal";

export default function AdminBooking() {
  const [bookings, setBookings] = useState([]);
  const [_meta, setMeta] = useState({});
  const [_page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // 🔄 Fetch danh sách booking
  const fetchBookings = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/bookings", {
        params: { q, page: p },
      });
      setBookings(res.data.data || []);
      setMeta({ total: res.data.total || 0, per_page: res.data.per_page || 10 });
      setPage(p);
    } catch (error) {
      console.error("❌ Lỗi khi tải booking:", error);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  // 🔍 Search
  const handleSearch = (e) => setQ(e.target.value);

  // 🖼 Open modal
  const openBookingDetail = (booking) => {
    if (!booking?.id) return alert("❌ Booking không hợp lệ!");
    setSelectedBooking(booking.id); // Chỉ lưu ID, fetch trong modal
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4 text-primary">📋 Quản lý Đặt chỗ</h2>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm booking..."
          value={q}
          onChange={handleSearch}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={() => fetchBookings(1)}
        >
          🔍 Tìm
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status"></div>
          <span className="ms-2">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <table className="table table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Mã booking</th>
              <th>Người đặt</th>
              <th>Suất chiếu</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.booking_code}</td>
                <td>{b.user?.name || "Khách vãng lai"}</td>
                <td>{b.showtime?.movie?.title || "N/A"}</td>
                <td>{b.final_amount?.toLocaleString()} ₫</td>
                <td>
                  <span
                    className={`badge bg-${
                      b.status === "pending"
                        ? "info"
                        : b.status === "paid"
                        ? "success"
                        : b.status === "cancelled"
                        ? "danger"
                        : "secondary"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => openBookingDetail(b)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal chi tiết booking */}
      {selectedBooking && (
        <BookingDetailModal
          bookingId={selectedBooking} // Chỉ truyền ID
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
