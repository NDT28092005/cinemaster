import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function AdminFoodItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [selectedItem, setSelectedItem] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/food/items");
      setItems(res.data.data || res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/food/categories");
      setCategories(res.data.data || res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchItems(); fetchCategories(); }, [fetchItems, fetchCategories]);

  const resetForm = () => { setSelectedItem(null); setName(""); setPrice(""); setCategoryId(""); setImage(null); };

  const handleSave = async () => {
    if (!name || !price) return alert("Vui lòng điền tên và giá món ăn");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    if (image) formData.append("image", image);

    try {
      if (selectedItem) {
        formData.append("_method", "PUT"); // đảm bảo Laravel nhận PUT
        await axios.post(`http://localhost:8000/api/food/items/${selectedItem.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await axios.post("http://localhost:8000/api/food/items", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      resetForm();
      fetchItems();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lưu món ăn. Kiểm tra console để xem chi tiết");
    }
  };


  const handleEdit = (item) => { setSelectedItem(item); setName(item.name); setPrice(item.price); setCategoryId(item.category_id); };
  const handleDelete = async (item) => {
    if (!window.confirm("Bạn có chắc muốn xóa món này?")) return;
    await axios.delete(`http://localhost:8000/api/food/items/${item.id}`);
    fetchItems();
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4 text-primary">🍔 Quản lý món Food</h2>

      {/* Form */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-2">
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Tên món" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="col-md-2">
            <input type="number" className="form-control" placeholder="Giá" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <input type="file" className="form-control" onChange={e => setImage(e.target.files[0])} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100" onClick={handleSave}>{selectedItem ? "💾 Lưu" : "➕ Thêm"}</button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? <p>Đang tải...</p> :
        <table className="table table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Tên món</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Hình ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category?.name || "N/A"}</td>
                <td>{Number(item.price).toLocaleString()} ₫</td>
                <td>{item.image_url && <img src={`http://localhost:8000/storage/${item.image_url}`} width={50} />}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(item)}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
    </div>
  );
}
