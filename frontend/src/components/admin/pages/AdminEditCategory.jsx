import React, { useState, useEffect } from "react";
import { getCategory, updateCategory } from "../../../api/category";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminEditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    loadCategory();
  }, []);

  const loadCategory = async () => {
    const res = await getCategory(id);
    setForm(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCategory(id, form);
    navigate("/admin/categories");
  };

  return (
    <div className="p-6">
      <h2>✏️ Sửa danh mục</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên danh mục:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Mô tả:</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          ></textarea>
        </div>
        <button type="submit">Cập nhật</button>
      </form>
    </div>
  );
}
