import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { Search, Plus, Edit, Trash2, MapPin, Heart, Calendar } from 'lucide-react';

const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const navigate = useNavigate();
    
    const fetchUsers = async (page = 1, searchTerm = '') => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/users`, {
                params: { page, search: searchTerm },
            });
            setUsers(response.data.data || []);
            setPage(response.data.current_page || 1);
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1, search);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/users/${userId}`);
            fetchUsers(page, search);
        } catch (error) {
            console.error(error);
            alert('Lỗi khi xóa người dùng');
        }
    };

    return (
        <AdminLayout>
            <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 style={{ 
                        color: '#5D2A42', 
                        fontSize: '2rem', 
                        fontWeight: '600',
                        margin: 0
                    }}>
                        Quản lý người dùng
                    </h1>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => navigate('/admin/users/create')}
                    >
                        <Plus size={20} style={{ marginRight: '0.5rem' }} />
                        Thêm người dùng
                    </button>
                </div>

                {/* Search Form */}
                <div className="admin-card mb-4">
                    <form onSubmit={handleSearch} className="d-flex gap-2">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-control"
                            style={{
                                flex: 1,
                                border: '2px solid rgba(251, 99, 118, 0.2)',
                                borderRadius: '15px',
                                padding: '0.85rem 1.25rem'
                            }}
                        />
                        <button
                            type="submit"
                            className="admin-btn admin-btn-secondary"
                        >
                            <Search size={20} style={{ marginRight: '0.5rem' }} />
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                {/* Users Table */}
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
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Họ tên</th>
                                        <th>Email</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!users || users.length === 0) ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                                Không tìm thấy người dùng nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td>#{user.id}</td>
                                                <td>{user.name || 'N/A'}</td>
                                                <td>{user.email || 'N/A'}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '15px',
                                                        fontSize: '0.85rem',
                                                        background: user.role === 'admin' 
                                                            ? 'rgba(251, 99, 118, 0.1)' 
                                                            : 'rgba(93, 42, 66, 0.1)',
                                                        color: user.role === 'admin' ? '#FB6376' : '#5D2A42',
                                                        fontWeight: '500'
                                                    }}>
                                                        {user.role || 'user'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '15px',
                                                        fontSize: '0.85rem',
                                                        background: user.is_active 
                                                            ? 'rgba(40, 167, 69, 0.1)' 
                                                            : 'rgba(220, 53, 69, 0.1)',
                                                        color: user.is_active ? '#28a745' : '#dc3545',
                                                        fontWeight: '500'
                                                    }}>
                                                        {user.is_active ? 'Hoạt động' : 'Khóa'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2" style={{ flexWrap: 'wrap' }}>
                                                        <button
                                                            className="admin-btn"
                                                            style={{ 
                                                                padding: '0.5rem 0.75rem',
                                                                background: 'rgba(255, 193, 7, 0.1)',
                                                                color: '#ffc107',
                                                                border: '1px solid rgba(255, 193, 7, 0.3)'
                                                            }}
                                                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            className="admin-btn"
                                                            style={{ 
                                                                padding: '0.5rem 0.75rem',
                                                                background: 'rgba(0, 123, 255, 0.1)',
                                                                color: '#007bff',
                                                                border: '1px solid rgba(0, 123, 255, 0.3)'
                                                            }}
                                                            onClick={() => navigate(`/admin/users/${user.id}/addresses`)}
                                                        >
                                                            <MapPin size={16} />
                                                        </button>
                                                        <button
                                                            className="admin-btn"
                                                            style={{ 
                                                                padding: '0.5rem 0.75rem',
                                                                background: 'rgba(251, 99, 118, 0.1)',
                                                                color: '#FB6376',
                                                                border: '1px solid rgba(251, 99, 118, 0.3)'
                                                            }}
                                                            onClick={() => navigate(`/admin/users/${user.id}/preferences`)}
                                                        >
                                                            <Heart size={16} />
                                                        </button>
                                                        <button
                                                            className="admin-btn"
                                                            style={{ 
                                                                padding: '0.5rem 0.75rem',
                                                                background: 'rgba(252, 177, 166, 0.1)',
                                                                color: '#FCB1A6',
                                                                border: '1px solid rgba(252, 177, 166, 0.3)'
                                                            }}
                                                            onClick={() => navigate(`/admin/users/${user.id}/anniversaries`)}
                                                        >
                                                            <Calendar size={16} />
                                                        </button>
                                                        <button
                                                            className="admin-btn admin-btn-danger"
                                                            style={{ padding: '0.5rem 0.75rem' }}
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <span style={{ color: '#666' }}>
                                Trang {page} / {lastPage}
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    disabled={page <= 1}
                                    onClick={() => fetchUsers(page - 1, search)}
                                >
                                    Trước
                                </button>
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    disabled={page >= lastPage}
                                    onClick={() => fetchUsers(page + 1, search)}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUser;
