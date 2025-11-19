import React, { useState, useEffect } from "react";
import { createProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { getOccasions } from "../../../api/occasion";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { ShoppingBag, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [cats, occs] = await Promise.all([getCategories(), getOccasions()]);
      setCategories(cats.data || []);
      setOccasions(occs.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải categories/occasions:", err);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    data.set("is_active", form.is_active ? 1 : 0);
    images.forEach((file) => data.append("images[]", file));

    try {
      setLoading(true);
      await createProduct(data);
      alert("✅ Tạo sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err) {
      console.error("❌ Lỗi khi tạo sản phẩm:", err.response?.data || err.message);
      alert("❌ Không thể tạo sản phẩm. Kiểm tra console để xem chi tiết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="d-flex align-items-center mb-4">
          <Link 
            to="/admin/products" 
            className="admin-btn admin-btn-secondary me-3"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 style={{ 
            color: '#5D2A42', 
            fontSize: '2rem', 
            fontWeight: '600',
            margin: 0
          }}>
            Thêm sản phẩm mới
          </h1>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">
            <ShoppingBag size={20} />
            Thông tin sản phẩm
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-4">
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#5D2A42'
                }}>
                  Tên sản phẩm <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="form-control"
                  style={{
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '15px',
                    padding: '0.85rem 1.25rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>

              <div className="col-md-6 mb-4">
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#5D2A42'
                }}>
                  Giá <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="form-control"
                  style={{
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '15px',
                    padding: '0.85rem 1.25rem',
                    fontSize: '1rem'
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mb-4">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#5D2A42'
              }}>
                Mô tả ngắn
              </label>
              <input
                type="text"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                className="form-control"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem',
                  fontSize: '1rem'
                }}
                placeholder="Nhập mô tả ngắn..."
              />
            </div>

            <div className="mb-4">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#5D2A42'
              }}>
                Mô tả chi tiết
              </label>
              <textarea
                value={form.full_description}
                onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                rows="4"
                className="form-control"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Nhập mô tả chi tiết..."
              ></textarea>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#5D2A42'
                }}>
                  Danh mục
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="form-select"
                  style={{
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '15px',
                    padding: '0.85rem 1.25rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">--Chọn danh mục--</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-4">
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#5D2A42'
                }}>
                  Dịp lễ
                </label>
                <select
                  value={form.occasion_id}
                  onChange={(e) => setForm({ ...form, occasion_id: e.target.value })}
                  className="form-select"
                  style={{
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '15px',
                    padding: '0.85rem 1.25rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">--Chọn dịp lễ--</option>
                  {occasions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#5D2A42'
                }}>
                  Tồn kho
                </label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="form-control"
                  style={{
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '15px',
                    padding: '0.85rem 1.25rem',
                    fontSize: '1rem'
                  }}
                  placeholder="0"
                />
              </div>

              <div className="col-md-6 mb-4 d-flex align-items-end">
                <div className="d-flex align-items-center" style={{ 
                  padding: '0.85rem 1.25rem',
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  width: '100%'
                }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    style={{ marginRight: '0.5rem', width: '20px', height: '20px' }}
                  />
                  <label style={{ margin: 0, fontWeight: '500', color: '#5D2A42' }}>
                    Kích hoạt sản phẩm
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#5D2A42'
              }}>
                <ImageIcon size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                Ảnh sản phẩm (có thể chọn nhiều ảnh)
              </label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange}
                className="form-control"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem',
                  fontSize: '1rem'
                }}
              />
              {previewUrls.length > 0 && (
                <div className="row g-2 mt-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="col-md-3">
                      <img
                        src={url}
                        alt={`preview-${index}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '2px solid rgba(251, 99, 118, 0.2)'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={loading}
              >
                <Save size={20} style={{ marginRight: '0.5rem' }} />
                {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
              </button>
              <Link 
                to="/admin/products" 
                className="admin-btn admin-btn-secondary"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
