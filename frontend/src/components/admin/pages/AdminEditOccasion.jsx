import React, { useState, useEffect } from "react";
import { getOccasion, updateOccasion } from "../../../api/occasion";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminEditOccasion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getOccasion(id);
    setForm(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateOccasion(id, form);
    navigate("/admin/occasions");
  };

  return (
    <div className="p-6">
      <h2>✏️ Sửa dịp</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên dịp:</label>
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
