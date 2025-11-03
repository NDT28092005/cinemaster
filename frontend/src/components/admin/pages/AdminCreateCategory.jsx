import React, { useState } from "react";
import { createCategory } from "../../../api/category";
import { useNavigate } from "react-router-dom";

export default function AdminCreateCategory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createCategory(form);
    navigate("/admin/categories");
  };

  return (
    <div className="p-6">
      <h2>➕ Thêm danh mục</h2>
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
        <button type="submit">Lưu</button>
      </form>
    </div>
  );
}
