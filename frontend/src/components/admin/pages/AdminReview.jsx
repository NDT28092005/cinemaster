import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from '../../../layouts/AdminLayout';
import { Star, Shield, ShieldOff, Trash2 } from "lucide-react";

export default function AdminReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

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
        <h1 style={{ 
          color: '#5D2A42', 
          fontSize: '2rem', 
          fontWeight: '600',
          marginBottom: '2rem'
        }}>
          Quản lý đánh giá
        </h1>

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
      </div>
    </AdminLayout>
  );
}
