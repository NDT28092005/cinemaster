import React, { useState, useEffect } from "react";
import { getOccasion, updateOccasion } from "../../../api/occasion";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { Gift, Save, ArrowLeft } from "lucide-react";

export default function AdminEditOccasion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const res = await getOccasion(id);
      setForm(res.data);
    } catch (error) {
      console.error('Error loading occasion:', error);
      alert('Lỗi khi tải thông tin dịp lễ');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateOccasion(id, form);
      navigate("/admin/occasions");
    } catch (error) {
      console.error('Error updating occasion:', error);
      alert('Lỗi khi cập nhật dịp lễ');
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
            to="/admin/occasions" 
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
            Chỉnh sửa dịp lễ
          </h1>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">
            <Gift size={20} />
            Thông tin dịp lễ
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#5D2A42'
              }}>
                Tên dịp lễ <span style={{ color: '#dc3545' }}>*</span>
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
                placeholder="Nhập tên dịp lễ..."
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
                placeholder="Nhập mô tả dịp lễ..."
              ></textarea>
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
                to="/admin/occasions" 
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
