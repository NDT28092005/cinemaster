import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, Gift } from "lucide-react";
import axios from "axios";

export default function LoginAdmin() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/api/admin/login", {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.data) {
        setUser({ ...response.data.admin, isAdmin: true });
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('token', response.data.token); // Lưu vào token chung
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError("Sai email hoặc mật khẩu!");
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền truy cập admin!");
      } else {
        setError("Lỗi kết nối máy chủ! Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <Gift size={48} />
              <h1>GiftShop</h1>
              <p>Admin Panel</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            {error && (
              <div className="admin-alert-error">
                {error}
              </div>
            )}

            <div className="admin-form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="admin-form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="admin-btn admin-btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? (
                <span>Đang đăng nhập...</span>
              ) : (
                <>
                  <LogIn size={20} style={{ marginRight: '0.5rem' }} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
