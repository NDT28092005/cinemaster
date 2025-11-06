import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api/admin";

export default function AdminPromotionUsage() {
    const [usages, setUsages] = useState([]);
    const [dashboard, setDashboard] = useState({});
    const [filters, setFilters] = useState({ search: '' });
    const [form, setForm] = useState({ promotion_id: '', user_id: '', order_id: '' });
    const [editing, setEditing] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/promotion-usage`, { params: filters });
            setUsages(res.data.data || []);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            setUsages([]);
        }
    }, [filters]);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/promotion-usage/dashboard`);
            setDashboard(res.data);
        } catch (error) {
            console.error('Lỗi khi tải dashboard:', error);
            setDashboard({});
        }
    }, []);

    const handleExport = async () => {
        try {
            const res = await axios.get(`${API_BASE}/promotion-usage/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'promotion_usage.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Lỗi khi export:', error);
            alert('Không thể export file!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert to integers and handle empty strings
            const submitData = {
                promotion_id: parseInt(form.promotion_id),
                user_id: form.user_id && form.user_id !== '' ? parseInt(form.user_id) : null,
                order_id: form.order_id && form.order_id !== '' ? parseInt(form.order_id) : null,
            };

            if (editing) {
                await axios.put(`${API_BASE}/promotion-usage/${editing}`, submitData);
            } else {
                await axios.post(`${API_BASE}/promotion-usage`, submitData);
            }
            setForm({ promotion_id: '', user_id: '', order_id: '' });
            setEditing(null);
            fetchData();
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
            const errorMessage = error.response?.data?.message || 
                               (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : error.message);
            alert('Có lỗi xảy ra: ' + errorMessage);
        }
    };

    const handleEdit = (item) => {
        setForm({
            promotion_id: item.promotion_id || '',
            user_id: item.user_id || '',
            order_id: item.order_id || ''
        });
        setEditing(item.usage_id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xóa mục này?')) {
            try {
                await axios.delete(`${API_BASE}/promotion-usage/${id}`);
                fetchData();
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                alert('Không thể xóa mục này!');
            }
        }
    };

    useEffect(() => {
        fetchData();
        fetchDashboard();
    }, [fetchData, fetchDashboard]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Quản lý Promotion Usage</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card title="Tổng lượt dùng" value={dashboard.total} />
                <Card title="Số mã khuyến mãi duy nhất" value={dashboard.uniquePromotions} />
                <Card title="Số người dùng duy nhất" value={dashboard.uniqueUsers} />
            </div>

            <div className="flex gap-2 mb-4">
                <input
                    placeholder="🔍 Tìm mã khuyến mãi..."
                    className="border p-2 rounded w-64"
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleExport}>📦 Export Excel</button>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{editing ? "✏️ Sửa" : "➕ Thêm"} Promotion Usage</h3>
                <div className="flex gap-2 mb-2">
                    <input
                        type="number"
                        placeholder="Promotion ID"
                        className="border p-2 rounded w-1/3"
                        value={form.promotion_id}
                        onChange={(e) => setForm({ ...form, promotion_id: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="User ID"
                        className="border p-2 rounded w-1/3"
                        value={form.user_id}
                        onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Order ID"
                        className="border p-2 rounded w-1/3"
                        value={form.order_id}
                        onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                    />
                </div>
                <button type="submit">{editing ? "Lưu thay đổi" : "Tạo mới"}</button>
            </form>

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th>ID</th><th>Promotion ID</th><th>User ID</th><th>Order ID</th><th>Ngày tạo</th><th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {usages.length > 0 ? (
                        usages.map(u => (
                            <tr key={u.usage_id} className="border-b text-center">
                                <td>{u.usage_id}</td>
                                <td>{u.promotion_id}</td>
                                <td>{u.user_id ?? '-'}</td>
                                <td>{u.order_id ?? '-'}</td>
                                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                                <td>
                                    <button onClick={() => handleEdit(u)} className="mr-2">✏️</button>
                                    <button onClick={() => handleDelete(u.usage_id)}>🗑</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-4 text-gray-500">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

const Card = ({ title, value }) => (
    <div className="bg-white shadow p-4 rounded-lg">
        <h3 className="text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value ?? 0}</p>
    </div>
);
