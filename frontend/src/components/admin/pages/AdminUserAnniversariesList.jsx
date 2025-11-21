import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { Calendar, Plus, Edit, Trash2, ArrowLeft, Gift } from 'lucide-react';

const AdminUserAnniversariesList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anniversaries, setAnniversaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    const fetchAnniversaries = async () => {
        setLoading(true);
        try {
            const [anniversariesRes, userRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/users/${id}/anniversaries`),
                axios.get(`http://localhost:8000/api/users/${id}`)
            ]);
            setAnniversaries(anniversariesRes.data || []);
            setUserInfo(userRes.data);
        } catch (err) {
            console.error(err);
            alert('Lỗi khi tải danh sách kỷ niệm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnniversaries();
    }, [id]);

    const handleDelete = async (anniversaryId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sự kiện kỷ niệm này?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/users/${id}/anniversaries/${anniversaryId}`);
            fetchAnniversaries();
        } catch (err) {
            console.error(err);
            alert('Lỗi khi xóa sự kiện kỷ niệm');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                                Sự kiện kỷ niệm
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
                        onClick={() => navigate(`/admin/users/${id}/anniversaries/add`)}
                    >
                        <Plus size={20} style={{ marginRight: '0.5rem' }} />
                        Thêm sự kiện
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
                        {anniversaries.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>Chưa có sự kiện kỷ niệm nào</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tên sự kiện</th>
                                            <th>Ngày kỷ niệm</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {anniversaries.map((event) => (
                                            <tr key={event.anniversary_id}>
                                                <td>#{event.anniversary_id}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Gift size={18} color="#FB6376" />
                                                        <span style={{ fontWeight: '500', color: '#5D2A42' }}>
                                                            {event.event_name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={18} color="#FCB1A6" />
                                                        <span style={{ color: '#666' }}>
                                                            {formatDate(event.event_date)}
                                                        </span>
                                                    </div>
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
                                                            onClick={() => navigate(`/admin/users/${id}/anniversaries/${event.anniversary_id}/edit`)}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="admin-btn admin-btn-danger"
                                                            style={{ padding: '0.5rem 0.75rem' }}
                                                            onClick={() => handleDelete(event.anniversary_id)}
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

export default AdminUserAnniversariesList;
