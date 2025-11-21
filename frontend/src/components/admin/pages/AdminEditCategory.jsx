import React, { useState, useEffect } from "react";
import { getCategory, updateCategory } from "../../../api/category";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { FolderTree, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function AdminEditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", image_url: "" });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadCategory();
  }, []);

  const loadCategory = async () => {
    try {
      setLoadingData(true);
      const res = await getCategory(id);
      setForm(res.data);
      if (res.data.image_url) {
        setPreviewUrl(res.data.image_url);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      alert('Lỗi khi tải thông tin danh mục');
    } finally {
      setLoadingData(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description || '');
      if (image) {
        formData.append('image', image);
      }
      await updateCategory(id, formData);
      navigate("/admin/categories");
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Lỗi khi cập nhật danh mục');
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
            to="/admin/categories" 
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
            Chỉnh sửa danh mục
          </h1>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">
            <FolderTree size={20} />
            Thông tin danh mục
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#5D2A42'
              }}>
                Tên danh mục <span style={{ color: '#dc3545' }}>*</span>
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
                placeholder="Nhập tên danh mục..."
              />
            </div>
            <div className="mb-4">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#5D2A42'
              }}>
                Mô tả
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="4"
                className="form-control"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Nhập mô tả danh mục..."
              ></textarea>
            </div>
            <div className="mb-4">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#5D2A42'
              }}>
                Ảnh danh mục
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
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
                  <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                    Chấp nhận: JPG, PNG, WEBP (tối đa 4MB). Để trống nếu không muốn thay đổi ảnh.
                  </small>
                </div>
                {previewUrl && (
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    flexShrink: 0
                  }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
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
                to="/admin/categories" 
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
