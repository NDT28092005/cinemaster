import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api/admin";

export default function AdminReferral() {
  const [referrals, setReferrals] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [form, setForm] = useState({ referrer_id: '', referral_code: '', status: 'pending' });
  const [editing, setEditing] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/referrals`, { params: filters });
      setReferrals(res.data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setReferrals([]);
    }
  }, [filters]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/referrals/dashboard`);
      setDashboard(res.data);
    } catch (error) {
      console.error('Lỗi khi tải dashboard:', error);
      setDashboard({});
    }
  }, []);

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/referrals/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'referrals.xlsx');
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
      if (editing) {
        await axios.put(`${API_BASE}/referrals/${editing}`, form);
      } else {
        await axios.post(`${API_BASE}/referrals`, form);
      }
      setForm({ referrer_id: '', referral_code: '', status: 'pending' });
      setEditing(null);
      fetchData();
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (item) => {
    setForm({
      referrer_id: item.referrer_id || '',
      referral_code: item.referral_code || '',
      status: item.status || 'pending'
    });
    setEditing(item.referral_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      try {
        await axios.delete(`${API_BASE}/referrals/${id}`);
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
      <h2 className="text-2xl font-bold mb-4">👥 Quản lý Referrals</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card title="Tổng lượt giới thiệu" value={dashboard.total} />
        <Card title="Hoàn thành" value={dashboard.completed} />
        <Card title="Đang chờ" value={dashboard.pending} />
      </div>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="🔍 Tìm theo tên..."
          className="border p-2 rounded w-64"
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
        </select>
        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleExport}>📦 Export Excel</button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">{editing ? "✏️ Sửa" : "➕ Thêm"} Referral</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Referrer ID"
            className="border p-2 rounded w-1/3"
            value={form.referrer_id}
            onChange={(e) => setForm({ ...form, referrer_id: e.target.value })}
            required
          />
          <input
            placeholder="Referral Code"
            className="border p-2 rounded w-1/3"
            value={form.referral_code}
            onChange={(e) => setForm({ ...form, referral_code: e.target.value })}
            required
          />
          <select
            className="border p-2 rounded w-1/3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button type="submit">{editing ? "Lưu thay đổi" : "Tạo mới"}</button>
      </form>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>ID</th><th>Người giới thiệu</th><th>Code</th><th>Trạng thái</th><th>Ngày</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {referrals.length > 0 ? (
            referrals.map(r => (
              <tr key={r.referral_id} className="border-b text-center">
                <td>{r.referral_id}</td>
                <td>{r.referrer?.name ?? r.referrer_id}</td>
                <td>{r.referral_code}</td>
                <td>{r.status}</td>
                <td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                <td>
                  <button onClick={() => handleEdit(r)} className="mr-2">✏️</button>
                  <button onClick={() => handleDelete(r.referral_id)}>🗑</button>
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
