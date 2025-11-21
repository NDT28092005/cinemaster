import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Home } from 'lucide-react';

const AdminUserAddresses = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const [addressesRes, userRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/users/${id}/addresses`),
                axios.get(`http://localhost:8000/api/users/${id}`)
            ]);
            setAddresses(addressesRes.data || []);
            setUserInfo(userRes.data);
        } catch (error) {
            console.error(error);
            alert('Lỗi khi tải địa chỉ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [id]);

    const handleDelete = async (addressId) => {
        if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/users/${id}/addresses/${addressId}`);
            fetchAddresses();
        } catch (error) {
            console.error(error);
            alert('Lỗi khi xóa địa chỉ');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    return (
        <AdminLayout>
            <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <Link 
                            to="/admin/users" 
                            className="admin-btn admin-btn-secondary me-3"
                            style={{ padding: '0.5rem 0.75rem' }}
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 style={{ 
                                color: '#5D2A42', 
                                fontSize: '2rem', 
                                fontWeight: '600',
                                margin: 0
                            }}>
                                Địa chỉ người dùng
                            </h1>
                            {userInfo && (
                                <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                                    {userInfo.name} ({userInfo.email})
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => navigate(`/admin/users/${id}/addresses/add`)}
                    >
                        <Plus size={20} style={{ marginRight: '0.5rem' }} />
                        Thêm địa chỉ
                    </button>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
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
                ) : (
                    <div className="admin-card">
                        {addresses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>Chưa có địa chỉ nào</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Địa chỉ</th>
                                            <th>Thành phố</th>
                                            <th>Tỉnh/Thành</th>
                                            <th>Mã bưu điện</th>
                                            <th>Quốc gia</th>
                                            <th>Mặc định</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {addresses.map(addr => (
                                            <tr key={addr.address_id}>
                                                <td>#{addr.address_id}</td>
                                                <td>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{addr.address_line1 || 'N/A'}</div>
                                                        {addr.address_line2 && (
                                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                                {addr.address_line2}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{addr.city || 'N/A'}</td>
                                                <td>{addr.state || 'N/A'}</td>
                                                <td>{addr.postal_code || 'N/A'}</td>
                                                <td>{addr.country || 'N/A'}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '15px',
                                                        fontSize: '0.85rem',
                                                        background: addr.is_default 
                                                            ? 'rgba(40, 167, 69, 0.1)' 
                                                            : 'rgba(93, 42, 66, 0.1)',
                                                        color: addr.is_default ? '#28a745' : '#5D2A42',
                                                        fontWeight: '500'
                                                    }}>
                                                        {addr.is_default ? 'Có' : 'Không'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="admin-btn"
                                                            style={{ 
                                                                padding: '0.5rem 0.75rem',
                                                                background: 'rgba(255, 193, 7, 0.1)',
                                                                color: '#ffc107',
                                                                border: '1px solid rgba(255, 193, 7, 0.3)'
                                                            }}
                                                            onClick={() => navigate(`/admin/users/${id}/addresses/${addr.address_id}/edit`)}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="admin-btn admin-btn-danger"
                                                            style={{ padding: '0.5rem 0.75rem' }}
                                                            onClick={() => handleDelete(addr.address_id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUserAddresses;
