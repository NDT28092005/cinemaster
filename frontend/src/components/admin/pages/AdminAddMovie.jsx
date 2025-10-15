import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminAddMovie() {
  const [form, setForm] = useState({
    title: "",
    original_title: "",
    slug: "",
    duration_min: "",
    director: "",
    cast: "",
    genre_id: "",
    country_id: "",
    language: "",
    subtitle_language: "",
    rating: "",
    age_rating: "P",
    poster_url: null,
    banner_url: null,
    trailer_url: "",
    description: "",
    synopsis: "",
    release_date: "",
    end_date: "",
    status: "coming_soon",
    is_featured: false,
  });

  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/genres").then(res => setGenres(res.data));
    axios.get("http://localhost:8000/api/countries").then(res => setCountries(res.data));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "poster") {
      setForm({ ...form, poster_url: file });
      setPosterPreview(URL.createObjectURL(file));
    } else if (type === "banner") {
      setForm({ ...form, banner_url: file });
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);
      await axios.post("http://localhost:8000/api/movies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Thêm phim thành công!");
      setForm({
        title: "",
        original_title: "",
        slug: "",
        duration_min: "",
        director: "",
        cast: "",
        genre_id: "",
        country_id: "",
        language: "",
        subtitle_language: "",
        rating: "",
        age_rating: "P",
        poster_url: null,
        banner_url: null,
        trailer_url: "",
        description: "",
        synopsis: "",
        release_date: "",
        end_date: "",
        status: "coming_soon",
        is_featured: false,
      });
      setPosterPreview(null);
      setBannerPreview(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi thêm phim!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🎥 Thêm Phim Mới</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Tên phim" required />
        <input type="text" name="original_title" value={form.original_title} onChange={handleChange} placeholder="Tên gốc" />
        <input type="text" name="slug" value={form.slug} onChange={handleChange} placeholder="Slug" />
        <input type="number" name="duration_min" value={form.duration_min} onChange={handleChange} placeholder="Thời lượng" />
        <input type="text" name="director" value={form.director} onChange={handleChange} placeholder="Đạo diễn" />
        <input type="text" name="cast" value={form.cast} onChange={handleChange} placeholder="Diễn viên" />
        <select name="genre_id" value={form.genre_id} onChange={handleChange}>
          <option value="">-- Thể loại --</option>
          {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select name="country_id" value={form.country_id} onChange={handleChange}>
          <option value="">-- Quốc gia --</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="text" name="language" value={form.language} onChange={handleChange} placeholder="Ngôn ngữ" />
        <input type="text" name="subtitle_language" value={form.subtitle_language} onChange={handleChange} placeholder="Phụ đề" />
        <input type="text" name="rating" value={form.rating} onChange={handleChange} placeholder="Rating" />
        <select name="age_rating" value={form.age_rating} onChange={handleChange}>
          <option value="P">P</option>
          <option value="K">K</option>
          <option value="T13">T13</option>
          <option value="T16">T16</option>
          <option value="C18">C18</option>
        </select>
        <input type="file" accept="image/*" onChange={e => handleFileChange(e, "poster")} />
        {posterPreview && <img src={posterPreview} alt="Poster Preview" width={120} />}
        <input type="file" accept="image/*" onChange={e => handleFileChange(e, "banner")} />
        {bannerPreview && <img src={bannerPreview} alt="Banner Preview" width={240} />}
        <input type="url" name="trailer_url" value={form.trailer_url} onChange={handleChange} placeholder="Trailer URL" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả"></textarea>
        <textarea name="synopsis" value={form.synopsis} onChange={handleChange} placeholder="Synopsis"></textarea>
        <input type="date" name="release_date" value={form.release_date} onChange={handleChange} />
        <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="coming_soon">Coming Soon</option>
          <option value="now_showing">Now Showing</option>
          <option value="archived">Archived</option>
        </select>
        <label>
          <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} /> Phim nổi bật
        </label>
        <button type="submit" disabled={loading}>{loading ? "Đang thêm..." : "Thêm Phim"}</button>
      </form>
    </div>
  );
}