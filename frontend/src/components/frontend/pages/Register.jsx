import { useState, useContext } from "react";
import { register } from "../../../api/auth";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";

function Register() {
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await register(form);
      setMessage(res.data.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi máy chủ, vui lòng thử lại.";
      setMessage("⚠️ " + msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Đăng ký / đăng nhập bằng Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8000/api/auth/google/callback", {
        token: credentialResponse.credential,
      });

      if (res.data.status) {
        setUser(res.data.user);
        localStorage.setItem("token", res.data.token);
        alert("🎉 Đăng ký / đăng nhập Google thành công!");
        window.location.href = "/"; // chuyển về trang chủ
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng nhập bằng Google!");
    }
  };

  const handleGoogleError = () => {
    alert("Không thể kết nối Google, vui lòng thử lại!");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Đăng ký tài khoản</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Tên hiển thị"
          value={form.name}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>

      {message && <p style={{ color: message.startsWith("⚠️") ? "red" : "green", marginTop: "10px" }}>{message}</p>}

      <div style={{ margin: "20px 0" }}>
        <p>Hoặc đăng ký nhanh bằng</p>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
      </div>
    </div>
  );
}

export default Register;