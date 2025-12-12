import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from '../../../layouts/AdminLayout';
import { Star, Shield, ShieldOff, Trash2, Plus, X } from "lucide-react";

export default function AdminReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    user_id: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/products");
      setProducts(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/users");
      const usersData = res.data.data || res.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Lỗi khi tải người dùng:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/reviews");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setReviews(data);
    } catch (error) {
      console.error("Lỗi khi tải review:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id, blocked) => {
    try {
      const endpoint = blocked 
        ? `http://localhost:8000/api/reviews/${id}/unblock` 
        : `http://localhost:8000/api/reviews/${id}/block`;
      await axios.patch(endpoint);
      setReviews((prev) =>
        prev.map((r) =>
          r.review_id === id ? { ...r, is_blocked: !blocked } : r
        )
      );
    } catch (error) {
      console.error('Error blocking/unblocking review:', error);
      alert('Lỗi khi thay đổi trạng thái review');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa review này không?")) {
      try {
        await axios.delete(`http://localhost:8000/api/reviews/${id}`);
        setReviews((prev) => prev.filter((r) => r.review_id !== id));
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Lỗi khi xóa review');
      }
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    
    if (!formData.product_id) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      alert("Vui lòng chọn đánh giá từ 1-5 sao");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const reviewData = {
        product_id: formData.product_id,
        rating: formData.rating,
        comment: formData.comment || null,
      };

      // Chỉ thêm user_id nếu được chọn
      if (formData.user_id) {
        reviewData.user_id = formData.user_id;
      }

      await axios.post(
        "http://localhost:8000/api/reviews",
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert("Thêm đánh giá thành công!");
      setShowAddModal(false);
      setFormData({
        product_id: '',
        user_id: '',
        rating: 5,
        comment: ''
      });
      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
      const errorMessage = error.response?.data?.message || error.message || "Lỗi khi thêm đánh giá";
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!Array.isArray(reviews)) {
    return (
      <AdminLayout>
        <p style={{ color: '#dc3545' }}>Dữ liệu review không hợp lệ!</p>
      </AdminLayout>
    );
  }

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
            Quản lý đánh giá
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn admin-btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.75rem 1.5rem'
            }}
          >
            <Plus size={20} />
            Thêm đánh giá
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
            <div className="admin-card-title">
              <Star size={20} />
              Danh sách đánh giá
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Sản phẩm</th>
                    <th>Đánh giá</th>
                    <th>Bình luận</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Chưa có đánh giá nào
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r) => (
                      <tr key={r.review_id}>
                        <td>#{r.review_id}</td>
                        <td style={{ fontWeight: '500' }}>{r.user?.name || "Ẩn danh"}</td>
                        <td>{r.product?.name || "Không rõ"}</td>
                        <td>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            color: '#ffc107'
                          }}>
                            {r.rating}
                            <Star size={16} fill="#ffc107" />
                          </div>
                        </td>
                        <td style={{ maxWidth: '300px' }}>{r.comment || '-'}</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            background: r.is_blocked 
                              ? 'rgba(220, 53, 69, 0.1)' 
                              : 'rgba(40, 167, 69, 0.1)',
                            color: r.is_blocked ? '#dc3545' : '#28a745',
                            fontWeight: '500'
                          }}>
                            {r.is_blocked ? "Bị chặn" : "Hiển thị"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleBlock(r.review_id, r.is_blocked)}
                              className="admin-btn"
                              style={{ 
                                padding: '0.5rem 0.75rem',
                                background: r.is_blocked 
                                  ? 'rgba(40, 167, 69, 0.1)' 
                                  : 'rgba(220, 53, 69, 0.1)',
                                color: r.is_blocked ? '#28a745' : '#dc3545',
                                border: r.is_blocked 
                                  ? '1px solid rgba(40, 167, 69, 0.3)' 
                                  : '1px solid rgba(220, 53, 69, 0.3)'
                              }}
                            >
                              {r.is_blocked ? <ShieldOff size={16} /> : <Shield size={16} />}
                            </button>
                            <button
                              onClick={() => handleDelete(r.review_id)}
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

        {/* Modal thêm đánh giá */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="admin-card"
              style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{
                  color: '#5D2A42',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: 0
                }}>
                  Thêm đánh giá mới
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddReview}>
                <div className="mb-3">
                  <label style={{
                    color: '#5D2A42',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Sản phẩm <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="form-select"
                    required
                    style={{
                      borderRadius: '8px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      padding: '0.75rem',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label style={{
                    color: '#5D2A42',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Người dùng (tùy chọn)
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="form-select"
                    style={{
                      borderRadius: '8px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      padding: '0.75rem',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">-- Không chọn (Admin review) --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label style={{
                    color: '#5D2A42',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Đánh giá (sao) <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <Star
                          size={32}
                          fill={star <= formData.rating ? '#ffc107' : 'transparent'}
                          color="#ffc107"
                          style={{ transition: 'all 0.2s' }}
                        />
                      </button>
                    ))}
                    <span style={{ marginLeft: '1rem', color: '#666', fontWeight: '500' }}>
                      {formData.rating} / 5 sao
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{
                    color: '#5D2A42',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Bình luận
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="form-control"
                    rows="4"
                    placeholder="Nhập bình luận đánh giá..."
                    style={{
                      borderRadius: '8px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="admin-btn"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="admin-btn admin-btn-primary"
                    style={{
                      padding: '0.75rem 1.5rem',
                      opacity: submitting ? 0.6 : 1,
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submitting ? 'Đang thêm...' : 'Thêm đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
