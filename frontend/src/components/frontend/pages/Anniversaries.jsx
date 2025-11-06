import React, { useEffect, useState } from 'react';
import api from '../api';

const userId = 2;

export default function Anniversaries() {
  const [anniversaries, setAnniversaries] = useState([]);
  const [form, setForm] = useState({ event_name: '', event_date: '' });

  useEffect(() => {
    fetchAnniversaries();
  }, []);

  const fetchAnniversaries = async () => {
    const res = await api.get(`/users/${userId}/anniversaries`);
    setAnniversaries(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/users/${userId}/anniversaries`, form);
    setForm({ event_name: '', event_date: '' });
    fetchAnniversaries();
  };

  const handleDelete = async (id) => {
    await api.delete(`/users/${userId}/anniversaries/${id}`);
    fetchAnniversaries();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🎉 Danh sách dịp lễ</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-x-2">
        <input
          type="text"
          placeholder="Tên dịp lễ"
          value={form.event_name}
          onChange={(e) => setForm({ ...form, event_name: e.target.value })}
          className="border p-2"
          required
        />
        <input
          type="date"
          value={form.event_date}
          onChange={(e) => setForm({ ...form, event_date: e.target.value })}
          className="border p-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          ➕ Thêm
        </button>
      </form>

      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="border p-2">Tên dịp lễ</th>
            <th className="border p-2">Ngày</th>
            <th className="border p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {anniversaries.map((a) => (
            <tr key={a.anniversary_id}>
              <td className="border p-2">{a.event_name}</td>
              <td className="border p-2">
                {new Date(a.event_date).toLocaleDateString('vi-VN')}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(a.anniversary_id)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  🗑️ Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
