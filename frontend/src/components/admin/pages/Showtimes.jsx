import { useState, useEffect } from "react";

export default function Showtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [auditoriums, setAuditoriums] = useState([]);
  const [form, setForm] = useState({
    movie_id: "",
    cinema_id: "",
    auditorium_id: "",
    start_time: "",
    base_price: "",
    capacity: "",
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const token = localStorage.getItem("adminToken");

  // ----- Fetch dữ liệu -----
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMovies, resCinemas, resAuditoriums] = await Promise.all([
          fetch("http://localhost:8000/api/movies", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:8000/api/cinemas", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:8000/api/auditoriums", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setMovies(await resMovies.json());
        setCinemas(await resCinemas.json());
        setAuditoriums(await resAuditoriums.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  const fetchShowtimes = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/showtimes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowtimes(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  // ----- Thêm showtime -----
  const handleAdd = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setShowtimes([...showtimes, data]);
        setForm({ movie_id: "", cinema_id: "", auditorium_id: "", start_time: "", base_price: "", capacity: "" });
      } else alert(data.message || "Có lỗi xảy ra");
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ");
    }
  };

  // ----- Xóa showtime -----
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa showtime này?")) return;
    try {
      await fetch(`http://localhost:8000/api/admin/showtimes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowtimes(showtimes.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ----- Bắt đầu sửa -----
  const handleEdit = (showtime) => {
    setEditId(showtime.id);
    setEditData({
      start_time: showtime.start_time,
      base_price: showtime.base_price,
      capacity: showtime.capacity,
    });
  };

  // ----- Lưu chỉnh sửa -----
  const handleSave = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/showtimes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowtimes(showtimes.map((s) => (s.id === id ? { ...s, ...data } : s)));
        setEditId(null);
        setEditData({});
      } else alert(data.message || "Có lỗi xảy ra");
    } catch (err) {
      console.error(err);
    }
  };

  const getMovieTitle = (id) => movies.find((m) => m.id === id)?.title || "N/A";
  const getCinemaName = (id) => cinemas.find((c) => c.id === id)?.name || "N/A";
  const getAuditoriumName = (id) => auditoriums.find((a) => a.id === id)?.name || "N/A";

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quản lý Showtimes</h2>

      {/* Form thêm showtime */}
      <div style={{ marginBottom: "20px" }}>
        <select value={form.movie_id} onChange={(e) => setForm({ ...form, movie_id: e.target.value })}>
          <option value="">Chọn phim</option>
          {movies.map((m) => (<option key={m.id} value={m.id}>{m.title}</option>))}
        </select>

        <select value={form.cinema_id} onChange={(e) => setForm({ ...form, cinema_id: e.target.value })}>
          <option value="">Chọn rạp</option>
          {cinemas.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>

        <select value={form.auditorium_id} onChange={(e) => setForm({ ...form, auditorium_id: e.target.value })}>
          <option value="">Chọn phòng chiếu</option>
          {auditoriums.filter(a => a.cinema_id === form.cinema_id).map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
        <input type="number" placeholder="Giá cơ bản" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
        <input type="number" placeholder="Sức chứa" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />

        <button onClick={handleAdd}>Thêm showtime</button>
      </div>

      {/* Bảng danh sách showtimes */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Phim</th>
            <th>Rạp</th>
            <th>Phòng chiếu</th>
            <th>Thời gian</th>
            <th>Giá</th>
            <th>Sức chứa</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {showtimes.map((s) => (
            <tr key={s.id}>
              <td>{getMovieTitle(s.movie_id)}</td>
              <td>{getCinemaName(s.cinema_id)}</td>
              <td>{getAuditoriumName(s.auditorium_id)}</td>
              <td>
                {editId === s.id ? (
                  <input type="datetime-local" value={editData.start_time} onChange={(e) => setEditData({ ...editData, start_time: e.target.value })} />
                ) : new Date(s.start_time).toLocaleString()}
              </td>
              <td>
                {editId === s.id ? (
                  <input type="number" value={editData.base_price} onChange={(e) => setEditData({ ...editData, base_price: e.target.value })} />
                ) : s.base_price}
              </td>
              <td>
                {editId === s.id ? (
                  <input type="number" value={editData.capacity} onChange={(e) => setEditData({ ...editData, capacity: e.target.value })} />
                ) : s.capacity}
              </td>
              <td>
                {editId === s.id ? (
                  <>
                    <button onClick={() => handleSave(s.id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button onClick={() => handleDelete(s.id)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}