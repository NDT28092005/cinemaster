import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { Heart, Save, ArrowLeft } from 'lucide-react';

const AdminEditPreference = () => {
    const { id, prefId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        preferred_occasion: '',
        favorite_category: '',
        budget_range_min: '',
        budget_range_max: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPref = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/users/${id}/preferences/${prefId}`);
                setForm({
                    preferred_occasion: res.data.preferred_occasion || '',
                    favorite_category: res.data.favorite_category || '',
                    budget_range_min: res.data.budget_range_min || '',
                    budget_range_max: res.data.budget_range_max || ''
                });
            } catch (err) {
                console.error(err);
                alert('Lỗi khi tải sở thích');
            } finally {
                setLoading(false);
            }
        };
        fetchPref();
    }, [id, prefId]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`http://localhost:8000/api/users/${id}/preferences/${prefId}`, form);
            alert('Cập nhật sở thích thành công!');
            navigate(`/admin/users/${id}/preferences`);
        } catch (err) {
            console.error(err);
            alert('Lỗi khi cập nhật sở thích');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
                        to={`/admin/users/${id}/preferences`} 
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
                        Chỉnh sửa sở thích
                    </h1>
                </div>

                <div className="admin-card">
                    <div className="admin-card-title">
                        <Heart size={20} />
                        Thông tin sở thích
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
                                    Dịp ưa thích
                                </label>
                                <input
                                    name="preferred_occasion"
                                    value={form.preferred_occasion}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập dịp ưa thích..."
                                />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Danh mục yêu thích
                                </label>
                                <input
                                    name="favorite_category"
                                    value={form.favorite_category}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập danh mục yêu thích..."
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
                                    Ngân sách tối thiểu (VNĐ)
                                </label>
                                <input
                                    name="budget_range_min"
                                    type="number"
                                    value={form.budget_range_min}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập ngân sách tối thiểu..."
                                    min="0"
                                />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Ngân sách tối đa (VNĐ)
                                </label>
                                <input
                                    name="budget_range_max"
                                    type="number"
                                    value={form.budget_range_max}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập ngân sách tối đa..."
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="admin-btn admin-btn-primary"
                            >
                                <Save size={20} style={{ marginRight: '0.5rem' }} />
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <Link 
                                to={`/admin/users/${id}/preferences`} 
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
};

export default AdminEditPreference;
