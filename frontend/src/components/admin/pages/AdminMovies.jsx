import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  // 📦 Lấy danh sách phim
  const fetchMovies = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/movies");
      setMovies(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy phim:", err);
    }
  };

  // 🎭 Lấy danh sách thể loại
  const fetchGenres = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/genres");
      setGenres(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy thể loại:", err);
    }
  };

  // 🗑 Xóa phim
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phim này không?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/movies/${id}`);
      setMovies(movies.filter((m) => m.id !== id));
    } catch (err) {
      console.error("❌ Lỗi khi xóa phim:", err);
    }
  };

  // 🔍 Lọc phim
  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? movie.genre_id === filter : true)
  );

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">🎬 Quản lý Phim</h2>
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/movies/create")}
        >
          <FaPlus className="me-2" /> Thêm phim mới
        </button>
      </div>

      {/* Bộ lọc & tìm kiếm */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Tất cả thể loại</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Poster</th>
                <th>Tiêu đề</th>
                <th>Thời lượng</th>
                <th>Thể loại</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <tr key={movie.id}>
                    <td style={{ width: "80px" }}>
                      <img
                        src={
                          movie.poster_url
                            ? `http://localhost:8000${movie.poster_url}`
                            : "/default-poster.png"
                        }
                        alt={movie.title}
                        className="img-fluid rounded"
                      />
                    </td>
                    <td className="fw-semibold">{movie.title}</td>
                    <td>{movie.duration_min} phút</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {movie.genre?.name ||
                          genres.find((g) => g.id === movie.genre_id)?.name ||
                          "Không rõ"}
                      </span>
                    </td>
                    <td>
                      {movie.status === "now_showing" ? (
                        <span className="badge bg-success">Đang chiếu</span>
                      ) : (
                        <span className="badge bg-secondary">Sắp chiếu</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() =>
                          navigate(`/admin/movies/edit/${movie.id}`)
                        }
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(movie.id)}
                      >
                        <FaTrash /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    Không có phim nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
