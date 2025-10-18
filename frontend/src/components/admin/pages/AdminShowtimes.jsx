import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEdit} from "react-icons/fa";

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [auditoriums, setAuditoriums] = useState([]);
  const [loadingAuditoriums, setLoadingAuditoriums] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [newShowtime, setNewShowtime] = useState({
    movie_id: "",
    cinema_id: "",
    auditorium_id: "",
    start_time: "",
    end_time: "",
    base_price: "",
    language: "Tiếng Việt",
    format: "2D",
  });

  // 📦 Tải dữ liệu ban đầu
  async function fetchData() {
    try {
      setLoading(true);
      const [showtimeRes, movieRes, cinemaRes] = await Promise.all([
        axios.get("http://localhost:8000/api/showtimes"),
        axios.get("http://localhost:8000/api/movies"),
        axios.get("http://localhost:8000/api/cinemas"),
      ]);
      setShowtimes(showtimeRes.data);
      setMovies(movieRes.data);
      setCinemas(cinemaRes.data);
    } catch (error) {
      console.error(error);
      alert("Không thể tải dữ liệu từ máy chủ!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // 🔄 Khi chọn rạp, tải danh sách phòng chiếu tương ứng
  const handleCinemaChange = async (e) => {
    const cinemaId = e.target.value; // không trim
    setNewShowtime({ ...newShowtime, cinema_id: cinemaId, auditorium_id: "" });

    if (!cinemaId) return setAuditoriums([]);

    try {
      setLoadingAuditoriums(true);
      const res = await axios.get(
        `http://localhost:8000/api/auditoriums?cinema_id=${cinemaId}`
      );
      console.log("🎯 API trả về phòng chiếu:", res.data);
      setAuditoriums(res.data);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách phòng chiếu:", error);
      setAuditoriums([]);
    } finally {
      setLoadingAuditoriums(false);
    }
  };

  // ➕ Thêm suất chiếu mới
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      // Tìm phòng chiếu để lấy capacity
      const auditorium = auditoriums.find(a => a.id === newShowtime.auditorium_id);

      const payload = {
        ...newShowtime,
        id: undefined, // backend tự sinh UUID
        end_time: null, // có thể để null
        capacity: auditorium?.capacity || 100, // mặc định 100 nếu backend không có
        available_seats: auditorium?.capacity || 100,
        status: "scheduled",
        is_3d: false,
        is_imax: false,
        start_time: newShowtime.start_time.replace("T", " "), // chuyển sang 'YYYY-MM-DD HH:mm'
      };

      await axios.post("http://localhost:8000/api/showtimes", payload);
      alert("✅ Thêm suất chiếu thành công!");
      setNewShowtime({
        movie_id: "",
        cinema_id: "",
        auditorium_id: "",
        start_time: "",
        end_time: "",
        base_price: "",
        language: "Tiếng Việt",
        format: "2D",
      });
      fetchData();
    } catch (err) {
      console.error("❌ Lỗi khi thêm suất chiếu:", err.response?.data || err);
      alert("❌ Lỗi khi thêm suất chiếu! Kiểm tra console để biết chi tiết");
    }
  };

  // 🗑️ Xóa suất chiếu
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa suất chiếu này không?")) return;
    await axios.delete(`http://localhost:8000/api/showtimes/${id}`);
    fetchData();
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4 text-primary">🎥 Quản lý Suất chiếu</h2>

      {/* 🆕 Form thêm suất chiếu */}
      <form onSubmit={handleAdd} className="card p-4 mb-4 shadow-sm border-0">
        <h5 className="fw-semibold mb-3">➕ Thêm Suất chiếu mới</h5>
        <div className="row g-3">
          {/* 🎬 Chọn phim */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={newShowtime.movie_id}
              onChange={(e) =>
                setNewShowtime({ ...newShowtime, movie_id: e.target.value })
              }
              required
            >
              <option value="">🎬 Chọn phim</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* 🏢 Chọn rạp */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={newShowtime.cinema_id}
              onChange={handleCinemaChange}
              required
            >
              <option value="">🏢 Chọn rạp</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🪑 Chọn phòng chiếu */}
          <div className="col-md-3">
            <select
              className="form-select"
              value={newShowtime.auditorium_id}
              onChange={(e) =>
                setNewShowtime({ ...newShowtime, auditorium_id: e.target.value })
              }
              required
              disabled={!newShowtime.cinema_id || loadingAuditoriums}
            >
              <option value="">
                {loadingAuditoriums ? "⏳ Đang tải..." : "🪑 Chọn phòng chiếu"}
              </option>
              {auditoriums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🕒 Thời gian */}
          <div className="col-md-3">
            <input
              type="datetime-local"
              className="form-control"
              value={newShowtime.start_time}
              onChange={(e) =>
                setNewShowtime({ ...newShowtime, start_time: e.target.value })
              }
              required
            />
          </div>

          {/* 💰 Giá vé */}
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="💰 Giá vé"
              value={newShowtime.base_price}
              onChange={(e) =>
                setNewShowtime({ ...newShowtime, base_price: e.target.value })
              }
              required
            />
          </div>

          {/* ✅ Nút thêm */}
          <div className="col-md-2">
            <button
              type="submit"
              className="btn btn-success w-100 fw-semibold"
            >
              ➕ Thêm
            </button>
          </div>
        </div>
      </form>

      {/* 📋 Bảng suất chiếu */}
      <table className="table table-hover shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Phim</th>
            <th>Rạp</th>
            <th>Phòng</th>
            <th>Bắt đầu</th>
            <th>Giá vé</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {showtimes.map((s) => (
            <tr key={s.id}>
              <td>{s.movie?.title || "N/A"}</td>
              <td>{s.cinema?.name || "N/A"}</td>
              <td>{s.auditorium?.name || "N/A"}</td>
              <td>{new Date(s.start_time).toLocaleString("vi-VN")}</td>
              <td>{s.base_price?.toLocaleString()} ₫</td>
              <td>
                <span
                  className={`badge bg-${s.status === "scheduled"
                    ? "info"
                    : s.status === "sold_out"
                      ? "danger"
                      : "secondary"
                    }`}
                >
                  {s.status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => navigate(`/admin/showtimes/edit/${s.id}`)}
                >
                  <FaEdit /> Sửa
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(s.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}