import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminEditPromotion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/promotions/${id}`)
      .then((res) => setPromotion(res.data))
      .catch((err) => console.error("Lỗi khi tải khuyến mãi:", err));
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/api/promotions/${id}`, promotion);
      alert("✅ Cập nhật thành công!");
      navigate("/admin/promotions");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Không thể cập nhật khuyến mãi!");
    }
  };

  if (!promotion) return <div className="p-4">⏳ Đang tải khuyến mãi...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h1 className="text-lg font-semibold mb-4">✏️ Chỉnh sửa khuyến mãi #{id}</h1>

      <div className="space-y-3">
        <input
          type="text"
          value={promotion.title}
          onChange={(e) => setPromotion({ ...promotion, title: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          value={promotion.code}
          onChange={(e) => setPromotion({ ...promotion, code: e.target.value })}
          className="w-full border px-3 py-2 rounded font-mono"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={promotion.start_date?.slice(0, 10)}
            onChange={(e) => setPromotion({ ...promotion, start_date: e.target.value })}
            className="border px-3 py-2 rounded w-1/2"
          />
          <input
            type="date"
            value={promotion.end_date?.slice(0, 10)}
            onChange={(e) => setPromotion({ ...promotion, end_date: e.target.value })}
            className="border px-3 py-2 rounded w-1/2"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={promotion.is_active}
            onChange={(e) => setPromotion({ ...promotion, is_active: e.target.checked })}
          />
          <span>Hoạt động</span>
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={() => navigate("http://localhost:5173/admin/promotions")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          🔙 Quay lại
        </button>
        <button
          onClick={handleUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          💾 Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
