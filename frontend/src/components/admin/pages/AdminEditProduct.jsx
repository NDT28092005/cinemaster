import React, { useEffect, useState } from "react";
import { getProduct, updateProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { getOccasions } from "../../../api/occasion";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { ShoppingBag, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

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

  const [mainImage, setMainImage] = useState(null);        // ảnh chính mới upload
  const [oldMainImage, setOldMainImage] = useState("");    // ảnh chính cũ

  const [oldImages, setOldImages] = useState([]);          // danh sách ảnh phụ cũ
  const [previewImages, setPreviewImages] = useState([]);  // preview ảnh phụ mới

  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
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

      setOldMainImage(product.image_url || ""); // ảnh chính
      setOldImages(product.images || []);       // ảnh phụ (từ bảng product_images)

      setCategories(catsRes.data);
      setOccasions(occRes.data);
    } catch (err) {
      console.error("❌ Lỗi khi load dữ liệu sản phẩm:", err.response?.data || err.message);
      alert("Lỗi khi tải thông tin sản phẩm");
    } finally {
      setLoadingData(false);
    }
  };

  const handleMainImageChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleOtherImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    setOldImages([]); // clear ảnh cũ để preview ảnh mới
    setForm((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "is_active") {
        data.append(key, value ? 1 : 0);
      } else {
        data.append(key, value);
      }
    });

    // ✅ Gửi ảnh chính
    if (mainImage) data.append("main_image", mainImage);

    // ✅ Gửi ảnh phụ
    if (form.images?.length > 0) {
      form.images.forEach((file) => data.append("images[]", file));
    }

    try {
      setLoading(true);
      await updateProduct(id, data);
      alert("✅ Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err.response?.data || err.message);
      alert("❌ Không thể cập nhật sản phẩm. Kiểm tra console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2>✏️ Chỉnh sửa sản phẩm</h2>
      <form onSubmit={handleSubmit}>
        {/* Tên */}
        <div>
          <label>Tên:</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
      </AdminLayout>
    );
  }

        {/* Giá */}
        <div>
          <label>Giá:</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        {/* Tồn kho */}
        <div>
          <label>Tồn kho:</label>
          <input
            type="number"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
          />
        </div>

        {/* Danh mục */}
        <div>
          <label>Danh mục:</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">--Chọn--</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Dịp */}
        <div>
          <label>Dịp:</label>
          <select
            value={form.occasion_id}
            onChange={(e) => setForm({ ...form, occasion_id: e.target.value })}
          >
            <option value="">--Chọn--</option>
            {occasions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        {/* Trạng thái */}
        <div>
          <label>Trạng thái:</label>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />{" "}
          Kích hoạt
        </div>

        {/* Ảnh chính */}
        <div style={{ marginTop: 20 }}>
          <label>Ảnh chính:</label>
          <br />
          {oldMainImage && (
            <img src={oldMainImage} width={150} alt="Ảnh chính" />
          )}
          <input type="file" onChange={handleMainImageChange} />
        </div>

        {/* Ảnh phụ */}
        <div style={{ marginTop: 20 }}>
          <label>Ảnh phụ:</label>

          {/* Hiển thị ảnh phụ cũ */}
          {oldImages.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {oldImages.map((img) => (
                <img key={img.id} src={img.image_url} width={120} alt="Ảnh phụ cũ" />
              ))}
            </div>
          )}

          {/* Preview ảnh phụ mới */}
          {previewImages.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {previewImages.map((url, idx) => (
                <img key={idx} src={url} width={120} alt="Preview ảnh phụ mới" />
              ))}
            </div>
          )}

          <input type="file" multiple onChange={handleOtherImagesChange} />
        </div>

        <button type="submit" style={{ marginTop: 20 }}>
          ✅ Cập nhật
        </button>
      </form>
    </div>
  );
}
