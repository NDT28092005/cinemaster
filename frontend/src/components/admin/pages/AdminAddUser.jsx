import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';

const AdminAddUser = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
        is_active: true,
    });

    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('http://localhost:8000/api/users', user);
            alert('Tạo người dùng thành công!');
            navigate('/admin/users');
        } catch (error) {
            console.error(error);
            alert('Không thể tạo người dùng. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                <div className="d-flex align-items-center mb-4">
                    <Link 
                        to="/admin/users" 
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
                        Thêm người dùng mới
                    </h1>
                </div>

                <div className="admin-card">
                    <div className="admin-card-title">
                        <UserPlus size={20} />
                        Thông tin người dùng
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
                                    Họ và tên <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={user.full_name}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập họ và tên..."
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Email <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập email..."
                                    required
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
                                    Mật khẩu <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={user.password}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập mật khẩu..."
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Xác nhận mật khẩu <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={user.password_confirmation}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập lại mật khẩu..."
                                    required
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
                                    Vai trò
                                </label>
                                <select
                                    name="role"
                                    value={user.role}
                                    onChange={handleChange}
                                    className="form-select"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
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
                                        name="is_active"
                                        checked={user.is_active}
                                        onChange={handleChange}
                                        style={{ 
                                            marginRight: '0.5rem', 
                                            width: '20px', 
                                            height: '20px',
                                            accentColor: '#FB6376'
                                        }}
                                    />
                                    <label style={{ margin: 0, fontWeight: '500', color: '#5D2A42' }}>
                                        Kích hoạt tài khoản
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="admin-btn admin-btn-primary"
                            >
                                <Save size={20} style={{ marginRight: '0.5rem' }} />
                                {saving ? 'Đang lưu...' : 'Thêm người dùng'}
                            </button>
                            <Link 
                                to="/admin/users" 
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

export default AdminAddUser;
