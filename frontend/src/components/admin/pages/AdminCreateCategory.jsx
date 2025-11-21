import React, { useState } from "react";
import { createCategory } from "../../../api/category";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { FolderTree, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function AdminCreateCategory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

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
      await createCategory(formData);
      navigate("/admin/categories");
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Lỗi khi tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

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
            Thêm danh mục mới
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
                    Chấp nhận: JPG, PNG, WEBP (tối đa 4MB)
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
                {loading ? 'Đang lưu...' : 'Lưu danh mục'}
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
