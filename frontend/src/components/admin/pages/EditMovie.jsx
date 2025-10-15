import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSave, FaArrowLeft } from "react-icons/fa";

export default function EditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [movieRes, genreRes, countryRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/movies/${id}`),
        axios.get("http://localhost:8000/api/genres"),
        axios.get("http://localhost:8000/api/countries"),
      ]);
      setMovie(movieRes.data);
      setGenres(genreRes.data);
      setCountries(countryRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/movies/${id}`, movie);
      alert("✅ Cập nhật phim thành công!");
      navigate("/admin/movies");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  if (!movie) return <p className="text-center mt-5">Đang tải dữ liệu...</p>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">✏️ Chỉnh sửa phim</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/admin/movies")}>
          <FaArrowLeft className="me-2" /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Thông tin cơ bản */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light fw-semibold">📘 Thông tin cơ bản</div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Tiêu đề</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={movie.title || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tên gốc</label>
              <input
                type="text"
                name="original_title"
                className="form-control"
                value={movie.original_title || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Thể loại</label>
              <select
                name="genre_id"
                className="form-select"
                value={movie.genre_id || ""}
                onChange={handleChange}
              >
                <option value="">-- Chọn thể loại --</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Quốc gia</label>
              <select
                name="country_id"
                className="form-select"
                value={movie.country_id || ""}
                onChange={handleChange}
              >
                <option value="">-- Chọn quốc gia --</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Ngôn ngữ</label>
              <input
                type="text"
                name="language"
                className="form-control"
                value={movie.language || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Độ tuổi</label>
              <select
                name="age_rating"
                className="form-select"
                value={movie.age_rating || ""}
                onChange={handleChange}
              >
                <option value="">Chọn</option>
                <option value="P">P</option>
                <option value="K">K</option>
                <option value="T13">T13</option>
                <option value="T16">T16</option>
                <option value="C18">C18</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Thời lượng (phút)</label>
              <input
                type="number"
                name="duration_min"
                className="form-control"
                value={movie.duration_min || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Ngày chiếu</label>
              <input
                type="date"
                name="release_date"
                className="form-control"
                value={movie.release_date || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Kết thúc</label>
              <input
                type="date"
                name="end_date"
                className="form-control"
                value={movie.end_date || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Mô tả ngắn</label>
              <textarea
                name="description"
                className="form-control"
                rows="2"
                value={movie.description || ""}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="col-md-12">
              <label className="form-label">Tóm tắt nội dung</label>
              <textarea
                name="synopsis"
                className="form-control"
                rows="4"
                value={movie.synopsis || ""}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Hình ảnh & Media */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light fw-semibold">🖼️ Hình ảnh & Trailer</div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Poster URL</label>
              <input
                type="text"
                name="poster_url"
                className="form-control"
                value={movie.poster_url || ""}
                onChange={handleChange}
              />
              {movie.poster_url && (
                <img
                  src={movie.poster_url}
                  alt="Poster"
                  className="img-fluid rounded mt-2 shadow-sm"
                  style={{ maxHeight: "250px" }}
                />
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Banner URL</label>
              <input
                type="text"
                name="banner_url"
                className="form-control"
                value={movie.banner_url || ""}
                onChange={handleChange}
              />
              {movie.banner_url && (
                <img
                  src={movie.banner_url}
                  alt="Banner"
                  className="img-fluid rounded mt-2 shadow-sm"
                />
              )}
            </div>

            <div className="col-md-12">
              <label className="form-label">Trailer URL (YouTube)</label>
              <input
                type="text"
                name="trailer_url"
                className="form-control"
                value={movie.trailer_url || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Thông tin khác */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light fw-semibold">⭐ Thông tin khác</div>
          <div className="card-body row g-3">
            <div className="col-md-3">
              <label className="form-label">IMDB Rating</label>
              <input
                type="number"
                step="0.1"
                name="imdb_rating"
                className="form-control"
                value={movie.imdb_rating || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Trạng thái</label>
              <select
                name="status"
                className="form-select"
                value={movie.status || ""}
                onChange={handleChange}
              >
                <option value="coming_soon">Sắp chiếu</option>
                <option value="now_showing">Đang chiếu</option>
                <option value="archived">Ngừng chiếu</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Nổi bật</label>
              <select
                name="is_featured"
                className="form-select"
                value={movie.is_featured ? "true" : "false"}
                onChange={(e) =>
                  setMovie({ ...movie, is_featured: e.target.value === "true" })
                }
              >
                <option value="false">Không</option>
                <option value="true">Có</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-success px-4">
          <FaSave className="me-2" /> Lưu thay đổi
        </button>
      </form>
    </div>
  );
}