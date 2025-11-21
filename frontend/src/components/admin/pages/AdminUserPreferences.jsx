import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { Heart, Plus, Edit, Trash2, ArrowLeft, Gift } from 'lucide-react';

const AdminUserPreferences = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    const fetchPreferences = async () => {
        setLoading(true);
        try {
            const [preferencesRes, userRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/users/${id}/preferences`),
                axios.get(`http://localhost:8000/api/users/${id}`)
            ]);
            setPreferences(preferencesRes.data || []);
            setUserInfo(userRes.data);
        } catch (error) {
            console.error(error);
            alert('Lỗi khi tải sở thích');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreferences();
    }, [id]);

    const handleDelete = async (prefId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sở thích này?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/users/${id}/preferences/${prefId}`);
            fetchPreferences();
        } catch (error) {
            console.error(error);
            alert('Lỗi khi xóa sở thích');
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'N/A';
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
                                Sở thích người dùng
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
                        onClick={() => navigate(`/admin/users/${id}/preferences/add`)}
                    >
                        <Plus size={20} style={{ marginRight: '0.5rem' }} />
                        Thêm sở thích
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
                        {preferences.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>Chưa có sở thích nào</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Dịp ưa thích</th>
                                            <th>Danh mục yêu thích</th>
                                            <th>Ngân sách tối thiểu</th>
                                            <th>Ngân sách tối đa</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preferences.map(pref => (
                                            <tr key={pref.preference_id}>
                                                <td>#{pref.preference_id}</td>
                                                <td>
                                                    {pref.preferred_occasion ? (
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '15px',
                                                            fontSize: '0.85rem',
                                                            background: 'rgba(251, 99, 118, 0.1)',
                                                            color: '#FB6376',
                                                            fontWeight: '500'
                                                        }}>
                                                            {pref.preferred_occasion}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>N/A</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {pref.favorite_category ? (
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '15px',
                                                            fontSize: '0.85rem',
                                                            background: 'rgba(252, 177, 166, 0.1)',
                                                            color: '#FCB1A6',
                                                            fontWeight: '500'
                                                        }}>
                                                            {pref.favorite_category}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>N/A</span>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: '600', color: '#5D2A42' }}>
                                                    {formatPrice(pref.budget_range_min)}
                                                </td>
                                                <td style={{ fontWeight: '600', color: '#FB6376' }}>
                                                    {formatPrice(pref.budget_range_max)}
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
                                                            onClick={() => navigate(`/admin/users/${id}/preferences/${pref.preference_id}/edit`)}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="admin-btn admin-btn-danger"
                                                            style={{ padding: '0.5rem 0.75rem' }}
                                                            onClick={() => handleDelete(pref.preference_id)}
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

export default AdminUserPreferences;
