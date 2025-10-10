import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // 🧩 Login truyền thống
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        alert('Đăng nhập thành công!');
        window.location.href = '/';
      } else {
        alert('Sai thông tin đăng nhập');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi đăng nhập');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:8000/api/auth/google/callback', {
        token: credentialResponse.credential,
      });
      const { user, token } = res.data;
      setUser(user);
      localStorage.setItem('token', token);
      alert(`Đăng nhập Google thành công! Xin chào ${user.name}`);
      window.location.href = '/'; // 🔹 Quay về trang Home
    } catch (err) {
      console.error('Google login error:', err);
      alert('Đăng nhập Google thất bại');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Đăng nhập</h2>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit">Đăng nhập</button>
      </form>

      {/* Link tới trang đăng ký */}
      <p style={{ marginTop: '10px' }}>
        Bạn chưa có tài khoản?{' '}
        <a href="/register">
          Đăng ký ngay
        </a>
      </p>

      {/* OR separator */}
      <div className="divider">Hoặc</div>

      {/* Google login button */}
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert('Đăng nhập Google thất bại')}
      />
    </div>
  );
}