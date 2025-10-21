import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function AdminFoodCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/food/categories");
      setCategories(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSave = async () => {
    try {
      if (selectedCategory) {
        await axios.put(`http://localhost:8000/api/food/categories/${selectedCategory.id}`, { name });
      } else {
        await axios.post(`http://localhost:8000/api/food/categories`, { name });
      }
      setName(""); setSelectedCategory(null);
      fetchCategories();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (cat) => { setSelectedCategory(cat); setName(cat.name); };
  const handleDelete = async (cat) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    await axios.delete(`http://localhost:8000/api/food/categories/${cat.id}`);
    fetchCategories();
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary fw-bold mb-4">🍔 Quản lý danh mục Food</h2>
      
      <div className="mb-3 d-flex gap-2">
        <input 
          type="text" className="form-control" placeholder="Tên danh mục" 
          value={name} onChange={(e)=>setName(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleSave}>
          {selectedCategory ? "💾 Lưu" : "➕ Thêm"}
        </button>
      </div>

      {loading ? <p>Đang tải...</p> :
      <table className="table table-hover">
        <thead className="table-dark">
          <tr>
            <th>Tên danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat=>(
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={()=>handleEdit(cat)}>✏️</button>
                <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(cat)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}