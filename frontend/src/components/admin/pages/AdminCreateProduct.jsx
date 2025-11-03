import React, { useState, useEffect } from "react";
import { createProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { getOccasions } from "../../../api/occasion";
import { useNavigate } from "react-router-dom";

export default function AdminCreateProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    short_description: "",
    full_description: "",
    category_id: "",
    occasion_id: "",
    price: "",
    stock_quantity: 0,
    is_active: true,
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [cats, occs] = await Promise.all([getCategories(), getOccasions()]);
      setCategories(cats.data);
      setOccasions(occs.data);
    } catch (err) {
      console.error("❌ Lỗi tải categories/occasions:", err);
    }
  };

  // ✅ Xử lý chọn ảnh và hiển thị preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    // ✅ Đảm bảo kiểu boolean đúng (Laravel nhận được true/false)
    data.set("is_active", form.is_active ? 1 : 0);

    // ✅ Đính kèm nhiều ảnh
    images.forEach((file) => data.append("images[]", file));

    try {
      await createProduct(data);
      alert("✅ Tạo sản phẩm thành công!");
      setForm({
        name: "",
        short_description: "",
        full_description: "",
        category_id: "",
        occasion_id: "",
        price: "",
        stock_quantity: 0,
        is_active: true,
      });
      setImages([]);
      setPreviewUrls([]);
      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Lỗi khi tạo sản phẩm:", err.response?.data || err.message);
      alert("❌ Không thể tạo sản phẩm. Kiểm tra console để xem chi tiết.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">➕ Thêm sản phẩm</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Tên:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>Mô tả ngắn:</label>
          <input
            type="text"
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>Mô tả chi tiết:</label>
          <textarea
            value={form.full_description}
            onChange={(e) => setForm({ ...form, full_description: e.target.value })}
            rows="3"
            className="w-full border p-2 rounded"
          ></textarea>
        </div>

        <div>
          <label>Danh mục:</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">--Chọn--</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Dịp:</label>
          <select
            value={form.occasion_id}
            onChange={(e) => setForm({ ...form, occasion_id: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option value="">--Chọn--</option>
            {occasions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Giá:</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>Tồn kho:</label>
          <input
            type="number"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          <label>Kích hoạt</label>
        </div>

        <div>
          <label>Ảnh sản phẩm (nhiều ảnh):</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {previewUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`preview-${index}`}
                  className="w-full h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Lưu sản phẩm
        </button>
      </form>
    </div>
  );
}
