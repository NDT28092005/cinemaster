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

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [oldImageUrl, setOldImageUrl] = useState("");
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
      setOldImageUrl(product.image_url || "");
      setCategories(catsRes.data || []);
      setOccasions(occRes.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi load dữ liệu sản phẩm:", err.response?.data || err.message);
      alert("Lỗi khi tải thông tin sản phẩm");
    } finally {
      setLoadingData(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
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

    if (images.length > 0) {
      images.forEach((file) => data.append("images[]", file));
    } else {
      data.append("keep_old_image", 1);
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

  if (loadingData) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="loading-spinner" style={{ 
            width: '60px', 
            height: '60px', 
            border: '5px solid rgba(251, 99, 118, 0.2)', 
            borderTopColor: '#FB6376', 
            borderRightColor: '#FCB1A6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </AdminLayout>
    );
  }

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
            Chỉnh sửa sản phẩm
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
              {previewUrls.length > 0 ? (
                <div className="row g-2 mb-3">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="col-md-3">
                      <img 
                        src={url} 
                        alt="preview" 
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
              ) : oldImageUrl && (
                <div className="mb-3">
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>Ảnh hiện tại:</p>
                  <img 
                    src={oldImageUrl} 
                    alt="ảnh cũ" 
                    style={{
                      maxWidth: '200px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '2px solid rgba(251, 99, 118, 0.2)'
                    }}
                  />
                </div>
              )}
              <input 
                type="file" 
                multiple 
                onChange={handleImageChange}
                className="form-control"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="admin-btn admin-btn-primary"
                disabled={loading}
              >
                <Save size={20} style={{ marginRight: '0.5rem' }} />
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
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
