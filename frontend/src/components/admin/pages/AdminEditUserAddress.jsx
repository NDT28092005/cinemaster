import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { MapPin, Save, ArrowLeft } from 'lucide-react';

const AdminEditAddress = () => {
    const { id, addrId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/users/${id}/addresses/${addrId}`);
                setForm(res.data);
            } catch (error) {
                console.error(error);
                alert('Lỗi khi tải địa chỉ');
            } finally {
                setLoading(false);
            }
        };
        fetchAddress();
    }, [id, addrId]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`http://localhost:8000/api/users/${id}/addresses/${addrId}`, form);
            alert('Cập nhật địa chỉ thành công!');
            navigate(`/admin/users/${id}/addresses`);
        } catch (error) {
            console.error(error);
            alert('Lỗi khi cập nhật địa chỉ');
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
                        to={`/admin/users/${id}/addresses`} 
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
                        Chỉnh sửa địa chỉ
                    </h1>
                </div>

                <div className="admin-card">
                    <div className="admin-card-title">
                        <MapPin size={20} />
                        Thông tin địa chỉ
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-12 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Địa chỉ dòng 1 <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    name="address_line1"
                                    value={form.address_line1}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập địa chỉ dòng 1..."
                                    required
                                />
                            </div>
                            <div className="col-md-12 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Địa chỉ dòng 2
                                </label>
                                <input
                                    name="address_line2"
                                    value={form.address_line2}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập địa chỉ dòng 2..."
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
                                    Thành phố <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập thành phố..."
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
                                    Tỉnh/Thành
                                </label>
                                <input
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập tỉnh/thành..."
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
                                    Mã bưu điện
                                </label>
                                <input
                                    name="postal_code"
                                    value={form.postal_code}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập mã bưu điện..."
                                />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#5D2A42'
                                }}>
                                    Quốc gia <span style={{ color: '#dc3545' }}>*</span>
                                </label>
                                <input
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{
                                        border: '2px solid rgba(251, 99, 118, 0.2)',
                                        borderRadius: '15px',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Nhập quốc gia..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="d-flex align-items-center" style={{ 
                                padding: '0.85rem 1.25rem',
                                border: '2px solid rgba(251, 99, 118, 0.2)',
                                borderRadius: '15px'
                            }}>
                                <input
                                    type="checkbox"
                                    name="is_default"
                                    checked={form.is_default}
                                    onChange={handleChange}
                                    style={{ 
                                        marginRight: '0.5rem', 
                                        width: '20px', 
                                        height: '20px',
                                        accentColor: '#FB6376'
                                    }}
                                />
                                <label style={{ margin: 0, fontWeight: '500', color: '#5D2A42' }}>
                                    Đặt làm địa chỉ mặc định
                                </label>
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
                                to={`/admin/users/${id}/addresses`} 
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

export default AdminEditAddress;
