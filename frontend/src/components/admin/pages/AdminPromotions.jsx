import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    title: "",
    code: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/promotions");
      setPromotions(res.data.data || res.data || []);
    } catch (error) {
      console.error("Lỗi khi fetch promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    try {
      await axios.post("http://localhost:8000/api/promotions", newPromo);
      alert("✅ Tạo khuyến mãi thành công!");
      setShowModal(false);
      setNewPromo({
        title: "",
        code: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
      fetchPromotions();
    } catch (error) {
      if (error.response && error.response.data.errors) {
        alert("❌ " + JSON.stringify(error.response.data.errors, null, 2));
      } else {
        alert("Không thể tạo khuyến mãi. Kiểm tra lại dữ liệu!");
      }
    }
  };

  const handleDeletePromotion = async (id) => {
    const confirmDelete = window.confirm("⚠️ Bạn có chắc muốn xóa khuyến mãi này?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/promotions/${id}`);
      alert("🗑️ Đã xóa thành công!");
      fetchPromotions();
    } catch (error) {
      console.error("❌ Lỗi khi xóa:", error);
      alert("Không thể xóa khuyến mãi này!");
    }
  };

  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">🎟️ Quản lý khuyến mãi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Tạo khuyến mãi mới
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">⏳ Đang tải dữ liệu...</div>
      ) : (
        <table className="border w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Tiêu đề</th>
              <th className="border px-3 py-2">Mã</th>
              <th className="border px-3 py-2">Ngày bắt đầu</th>
              <th className="border px-3 py-2">Ngày kết thúc</th>
              <th className="border px-3 py-2">Trạng thái</th>
              <th className="border px-3 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length > 0 ? (
              promotions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{p.id}</td>
                  <td className="border px-3 py-2">{p.title}</td>
                  <td className="border px-3 py-2 font-mono">{p.code}</td>
                  <td className="border px-3 py-2">{new Date(p.start_date).toLocaleDateString()}</td>
                  <td className="border px-3 py-2">{new Date(p.end_date).toLocaleDateString()}</td>
                  <td className="border px-3 py-2">{p.is_active ? "🟢 Hoạt động" : "🔴 Ngưng"}</td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() => navigate(`/admin/promotions/edit/${p.id}`)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="border px-3 py-4 text-center text-gray-500">
                  ⚠️ Chưa có khuyến mãi nào — hãy tạo mới ngay!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal thêm mới */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-96 relative animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">➕ Tạo khuyến mãi mới</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tiêu đề"
                value={newPromo.title}
                onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Mã khuyến mãi"
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                className="w-full border px-3 py-2 rounded font-mono"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newPromo.start_date}
                  onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })}
                  className="border px-3 py-2 rounded w-1/2"
                />
                <input
                  type="date"
                  value={newPromo.end_date}
                  onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })}
                  className="border px-3 py-2 rounded w-1/2"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPromo.is_active}
                  onChange={(e) => setNewPromo({ ...newPromo, is_active: e.target.checked })}
                />
                <span>Hoạt động</span>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                ❌ Hủy
              </button>
              <button
                onClick={handleCreatePromotion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                💾 Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
