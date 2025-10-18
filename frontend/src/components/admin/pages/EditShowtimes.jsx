// src/pages/admin/EditShowtimes.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditShowtimes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [auditoriums, setAuditoriums] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Load dữ liệu ban đầu
  useEffect(() => {
    async function fetchData() {
      try {
        const [showtimeRes, movieRes, cinemaRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/showtimes/${id}`),
          axios.get("http://localhost:8000/api/movies"),
          axios.get("http://localhost:8000/api/cinemas"),
        ]);

        setShowtime(showtimeRes.data);
        setMovies(movieRes.data);
        setCinemas(cinemaRes.data);

        // Tải phòng chiếu tương ứng
        if (showtimeRes.data.cinema_id) {
          const audRes = await axios.get(
            `http://localhost:8000/api/auditoriums?cinema_id=${showtimeRes.data.cinema_id}`
          );
          setAuditoriums(audRes.data);
        }
      } catch (err) {
        console.error("Lỗi khi load showtime:", err);
        alert("Không thể tải suất chiếu!");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // 🏢 Khi đổi rạp → load lại phòng chiếu
  async function handleCinemaChange(e) {
    const cinema_id = e.target.value;
    setShowtime({ ...showtime, cinema_id, auditorium_id: "" });

    if (!cinema_id) return setAuditoriums([]);
    const res = await axios.get(
      `http://localhost:8000/api/auditoriums?cinema_id=${cinema_id}`
    );
    setAuditoriums(res.data);
  }

  // 💾 Lưu thay đổi
  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/showtimes/${id}`, {
        ...showtime,
        start_time: showtime.start_time?.replace("T", " "),
        end_time: showtime.end_time?.replace("T", " "),
      });
      alert("✅ Cập nhật thành công!");
      navigate("/admin/showtimes");
    } catch (err) {
      console.error(err);
      alert("❌ Cập nhật thất bại!");
    }
  }

  if (loading || !showtime) return <div>⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-primary mb-4">🎬 Chỉnh sửa Suất chiếu</h2>

      <form onSubmit={handleUpdate} className="card p-4 shadow-sm border-0">
        <div className="row g-3">
          {/* 🎞 Phim */}
          <div className="col-md-4">
            <label className="form-label">Phim</label>
            <select
              className="form-select"
              value={showtime.movie_id || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, movie_id: e.target.value })
              }
            >
              <option value="">-- Chọn phim --</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* 🏢 Rạp */}
          <div className="col-md-4">
            <label className="form-label">Rạp</label>
            <select
              className="form-select"
              value={showtime.cinema_id || ""}
              onChange={handleCinemaChange}
            >
              <option value="">-- Chọn rạp --</option>
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🪑 Phòng chiếu */}
          <div className="col-md-4">
            <label className="form-label">Phòng chiếu</label>
            <select
              className="form-select"
              value={showtime.auditorium_id || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, auditorium_id: e.target.value })
              }
            >
              <option value="">-- Chọn phòng --</option>
              {auditoriums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🕒 Thời gian bắt đầu / kết thúc */}
          <div className="col-md-6">
            <label className="form-label">Bắt đầu</label>
            <input
              type="datetime-local"
              className="form-control"
              value={showtime.start_time?.replace(" ", "T") || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, start_time: e.target.value })
              }
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Kết thúc</label>
            <input
              type="datetime-local"
              className="form-control"
              value={showtime.end_time?.replace(" ", "T") || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, end_time: e.target.value })
              }
            />
          </div>

          {/* 💰 Giá vé */}
          <div className="col-md-3">
            <label className="form-label">Giá cơ bản</label>
            <input
              type="number"
              className="form-control"
              value={showtime.base_price || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, base_price: e.target.value })
              }
            />
          </div>

          {/* 🧍‍♂️ Sức chứa / ghế trống */}
          <div className="col-md-3">
            <label className="form-label">Sức chứa</label>
            <input
              type="number"
              className="form-control"
              value={showtime.capacity || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, capacity: e.target.value })
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Ghế trống</label>
            <input
              type="number"
              className="form-control"
              value={showtime.available_seats || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, available_seats: e.target.value })
              }
            />
          </div>

          {/* 🔤 Ngôn ngữ & định dạng */}
          <div className="col-md-3">
            <label className="form-label">Ngôn ngữ</label>
            <input
              type="text"
              className="form-control"
              value={showtime.language || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, language: e.target.value })
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Định dạng</label>
            <input
              type="text"
              className="form-control"
              value={showtime.format || ""}
              onChange={(e) =>
                setShowtime({ ...showtime, format: e.target.value })
              }
            />
          </div>

          {/* 🎟️ Trạng thái */}
          <div className="col-md-3">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={showtime.status || "scheduled"}
              onChange={(e) =>
                setShowtime({ ...showtime, status: e.target.value })
              }
            >
              <option value="scheduled">Đang chiếu</option>
              <option value="cancelled">Đã hủy</option>
              <option value="finished">Đã kết thúc</option>
              <option value="sold_out">Hết vé</option>
            </select>
          </div>

          {/* 🎥 3D / IMAX */}
          <div className="col-md-3 d-flex align-items-center">
            <div className="form-check me-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={!!showtime.is_3d}
                onChange={(e) =>
                  setShowtime({ ...showtime, is_3d: e.target.checked })
                }
              />
              <label className="form-check-label">3D</label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={!!showtime.is_imax}
                onChange={(e) =>
                  setShowtime({ ...showtime, is_imax: e.target.checked })
                }
              />
              <label className="form-check-label">IMAX</label>
            </div>
          </div>

          {/* 💾 Nút lưu */}
          <div className="col-md-12 text-end mt-4">
            <button className="btn btn-primary px-4" type="submit">
              💾 Lưu thay đổi
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
