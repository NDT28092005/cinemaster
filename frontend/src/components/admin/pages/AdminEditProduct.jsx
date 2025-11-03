import React, { useEffect, useState } from "react";
import { getProduct, updateProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { getOccasions } from "../../../api/occasion";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: 0,
    stock_quantity: 0,
    category_id: "",
    occasion_id: "",
    is_active: true,
  });

  const [images, setImages] = useState([]); // Ảnh mới upload
  const [previewUrls, setPreviewUrls] = useState([]); // Preview ảnh mới
  const [oldImageUrl, setOldImageUrl] = useState(""); // Ảnh cũ hiển thị
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catsRes, occRes] = await Promise.all([
        getProduct(id),
        getCategories(),
        getOccasions(),
      ]);
      const product = prodRes.data;
      setForm({
        name: product.name,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id || "",
        occasion_id: product.occasion_id || "",
        is_active: product.is_active,
      });
      setOldImageUrl(product.image_url || "");
      setCategories(catsRes.data);
      setOccasions(occRes.data);
    } catch (err) {
      console.error("❌ Lỗi khi load dữ liệu sản phẩm:", err.response?.data || err.message);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file))); // Tạo preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "is_active") {
        data.append(key, value ? 1 : 0); // gửi boolean đúng cho Laravel
      } else {
        data.append(key, value);
      }
    });

    // Nếu có ảnh mới, append vào formData
    if (images.length > 0) {
      images.forEach((file) => data.append("images[]", file));
    } else {
      // Nếu không có ảnh mới, gửi một cờ giữ nguyên ảnh cũ
      data.append("keep_old_image", 1);
    }

    try {
      await updateProduct(id, data);
      alert("✅ Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err.response?.data || err.message);
      alert("❌ Không thể cập nhật sản phẩm. Kiểm tra console.");
    }
  };

  return (
    <div className="p-6">
      <h2>✏️ Chỉnh sửa sản phẩm</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên:</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Giá:</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <div>
          <label>Tồn kho:</label>
          <input
            type="number"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
          />
        </div>

        <div>
          <label>Danh mục:</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
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
          <label>Trạng thái:</label>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />{" "}
          Kích hoạt
        </div>

        <div>
          <label>Ảnh sản phẩm:</label>
          {/* Nếu có preview ảnh mới, hiển thị preview */}
          {previewUrls.length > 0
            ? previewUrls.map((url, idx) => (
                <img key={idx} src={url} alt="preview" width={120} style={{ marginRight: 10 }} />
              ))
            : oldImageUrl && <img src={oldImageUrl} alt="ảnh cũ" width={120} />}
          <input type="file" multiple onChange={handleImageChange} />
        </div>

        <button type="submit">Cập nhật</button>
      </form>
    </div>
  );
}
