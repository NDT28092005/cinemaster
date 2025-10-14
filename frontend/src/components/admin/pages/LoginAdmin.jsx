import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate(); // <-- hook navigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        // Lưu user vào context
        setUser({ ...data.admin, isAdmin: true });
        // Lưu token nếu cần
        localStorage.setItem('adminToken', data.token);
        // lưu thông tin admin
        localStorage.setItem('adminUser', JSON.stringify(data.admin));

        // Redirect sang dashboard
        navigate("/admin/dashboard");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Admin Login</h2>
      <input
        type="text"
        placeholder="Tên đăng nhập"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit">Đăng nhập</button>
    </form>
  );
}