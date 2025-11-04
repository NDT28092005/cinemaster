import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminReview() {
  const [reviews, setReviews] = useState([]); // ✅ luôn là mảng

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/reviews");
        // Kiểm tra nếu API trả về {data: [...]}
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setReviews(data);
      } catch (error) {
        console.error("Lỗi khi tải review:", error);
      }
    };
    fetchReviews();
  }, []);

  const handleBlock = async (id, blocked) => {
    const endpoint = blocked ? `http://localhost:8000/api/reviews/${id}/unblock` : `http://localhost:8000/api/reviews/${id}/block`;
    await axios.patch(endpoint);
    setReviews((prev) =>
      prev.map((r) =>
        r.review_id === id ? { ...r, is_blocked: !blocked } : r
      )
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa review này không?")) {
      await axios.delete(`http://localhost:8000/api/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.review_id !== id));
    }
  };

  if (!Array.isArray(reviews)) {
    return <p className="text-red-500">Dữ liệu review không hợp lệ!</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Quản lý Review</h2>
      <table className="w-full border">
        <thead>
          <tr>
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
              <td colSpan="6" className="text-center py-3">
                Không có review nào.
              </td>
            </tr>
          ) : (
            reviews.map((r) => (
              <tr key={r.review_id} className="border-t">
                <td>{r.user?.name || "Ẩn danh"}</td>
                <td>{r.product?.name || "Không rõ"}</td>
                <td>{r.rating}⭐</td>
                <td>{r.comment}</td>
                <td>{r.is_blocked ? "⛔ Bị chặn" : "✅ Hiển thị"}</td>
                <td>
                  <button
                    onClick={() => handleBlock(r.review_id, r.is_blocked)}
                    className={`px-2 py-1 rounded ${
                      r.is_blocked ? "bg-green-500" : "bg-red-500"
                    } text-white mr-2`}
                  >
                    {r.is_blocked ? "Mở chặn" : "Chặn"}
                  </button>
                  <button
                    onClick={() => handleDelete(r.review_id)}
                    className="px-2 py-1 rounded bg-gray-500 text-white"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
