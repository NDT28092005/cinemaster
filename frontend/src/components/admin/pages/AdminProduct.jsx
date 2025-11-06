import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { getOccasions } from "../../../api/occasion";
import { Link } from "react-router-dom";
import AdminLayout from '../../../layouts/AdminLayout';
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [filter, setFilter] = useState({ category_id: "", occasion_id: "", search: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilters();
    loadProducts();
  }, []);

  const loadFilters = async () => {
    try {
      const [cats, occs] = await Promise.all([getCategories(), getOccasions()]);
      setCategories(cats.data || []);
      setOccasions(occs.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts(filter);
      setProducts(res.data.data || res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá sản phẩm này không?")) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error(error);
        alert('Lỗi khi xóa sản phẩm');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
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
            Quản lý sản phẩm
          </h1>
          <Link to="/admin/products/create" className="admin-btn admin-btn-primary">
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            Thêm sản phẩm
          </Link>
        </div>

        {/* Filter + Search */}
        <div className="admin-card mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                placeholder="🔍 Tìm theo tên sản phẩm..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="form-control"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem'
                }}
              />
            </div>
            <div className="col-md-3">
              <select
                onChange={(e) => setFilter({ ...filter, category_id: e.target.value })}
                value={filter.category_id}
                className="form-select"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem'
                }}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                onChange={(e) => setFilter({ ...filter, occasion_id: e.target.value })}
                value={filter.occasion_id}
                className="form-select"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem'
                }}
              >
                <option value="">Tất cả dịp</option>
                {occasions.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button 
                onClick={loadProducts} 
                className="admin-btn admin-btn-secondary w-100"
              >
                <Search size={20} style={{ marginRight: '0.5rem' }} />
                Tìm
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
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
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Danh mục</th>
                    <th>Dịp</th>
                    <th>Giá</th>
                    <th>Kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Chưa có sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.images?.[0]?.image_url || p.image_url ? (
                            <img 
                              src={p.images?.[0]?.image_url || p.image_url} 
                              alt={p.name} 
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover',
                                borderRadius: '10px'
                              }} 
                            />
                          ) : (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.1))',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#999'
                            }}>
                              No img
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: '500' }}>{p.name}</td>
                        <td>{p.category?.name || "-"}</td>
                        <td>{p.occasion?.name || "-"}</td>
                        <td style={{ 
                          background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: '700'
                        }}>
                          {formatPrice(p.price || 0)}
                        </td>
                        <td>{p.stock_quantity || 0}</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            background: p.is_active 
                              ? 'rgba(40, 167, 69, 0.1)' 
                              : 'rgba(220, 53, 69, 0.1)',
                            color: p.is_active ? '#28a745' : '#dc3545',
                            fontWeight: '500'
                          }}>
                            {p.is_active ? "Hoạt động" : "Tạm khóa"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link 
                              to={`/admin/products/edit/${p.id}`} 
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
                              onClick={() => handleDelete(p.id)} 
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
