import React, { useEffect, useState } from "react";
import { getOccasions, deleteOccasion } from "../../../api/occasion";
import { Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { Gift, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminOccasion() {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getOccasions();
      setOccasions(res.data || []);
    } catch (error) {
      console.error('Error loading occasions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá dịp này không?")) {
      try {
        await deleteOccasion(id);
        loadData();
      } catch (error) {
        console.error('Error deleting occasion:', error);
        alert('Lỗi khi xóa dịp');
      }
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
            Quản lý dịp lễ
          </h1>
          <Link to="/admin/occasions/create" className="admin-btn admin-btn-primary">
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            Thêm dịp mới
          </Link>
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
            <div className="admin-card-title">
              <Gift size={20} />
              Danh sách dịp lễ
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên dịp</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {occasions.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Chưa có dịp lễ nào
                      </td>
                    </tr>
                  ) : (
                    occasions.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                        <td>{item.description || '-'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link 
                              to={`/admin/occasions/edit/${item.id}`} 
                              className="admin-btn"
                              style={{ 
                                padding: '0.5rem 0.75rem',
                                background: 'rgba(255, 193, 7, 0.1)',
                                color: '#ffc107',
                                border: '1px solid rgba(255, 193, 7, 0.3)',
                                textDecoration: 'none'
                              }}
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '0.5rem 0.75rem' }}
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}