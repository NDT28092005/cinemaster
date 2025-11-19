import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { Heart, Save, ArrowLeft } from 'lucide-react';

const AdminAddPreference = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        preferred_occasion: '',
        favorite_category: '',
        budget_range_min: '',
        budget_range_max: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(`http://localhost:8000/api/users/${id}/preferences`, form);
            navigate(`/admin/users/${id}/preferences`);
        } catch (error) {
            console.error('Error adding preference:', error);
            alert('Lỗi khi thêm sở thích');
        } finally {
            setLoading(false);
        }
    };

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
                        Thêm sở thích người dùng
                    </h1>
                </div>

                <div className="admin-card">
                    <div className="admin-card-title">
                        <Heart size={20} />
                        Thông tin sở thích
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
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
                                placeholder="Nhập dịp ưa thích..." 
                                value={form.preferred_occasion} 
                                onChange={handleChange} 
                                className="form-control"
                                style={{
                                    border: '2px solid rgba(251, 99, 118, 0.2)',
                                    borderRadius: '15px',
                                    padding: '0.85rem 1.25rem',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div className="mb-4">
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
                                placeholder="Nhập danh mục yêu thích..." 
                                value={form.favorite_category} 
                                onChange={handleChange} 
                                className="form-control"
                                style={{
                                    border: '2px solid rgba(251, 99, 118, 0.2)',
                                    borderRadius: '15px',
                                    padding: '0.85rem 1.25rem',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Ngân sách tối thiểu
                                </label>
                                <input 
                                    name="budget_range_min" 
                                    placeholder="0" 
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
                                />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Ngân sách tối đa
                                </label>
                                <input 
                                    name="budget_range_max" 
                                    placeholder="0" 
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
                                />
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                type="submit" 
                                className="admin-btn admin-btn-primary"
                                disabled={loading}
                            >
                                <Save size={20} style={{ marginRight: '0.5rem' }} />
                                {loading ? 'Đang lưu...' : 'Lưu sở thích'}
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

export default AdminAddPreference;
