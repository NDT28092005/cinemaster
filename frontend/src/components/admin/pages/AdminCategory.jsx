import React, { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "../../../api/category";
import { Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá danh mục này?")) {
      try {
        await deleteCategory(id);
        loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Lỗi khi xóa danh mục');
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
            Quản lý danh mục
          </h1>
          <Link to="/admin/categories/create" className="admin-btn admin-btn-primary">
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            Thêm danh mục
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
              <FolderTree size={20} />
              Danh sách danh mục
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Chưa có danh mục nào
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>#{cat.id}</td>
                        <td style={{ fontWeight: '500' }}>{cat.name}</td>
                        <td>{cat.description || '-'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link 
                              to={`/admin/categories/edit/${cat.id}`} 
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
                              onClick={() => handleDelete(cat.id)} 
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