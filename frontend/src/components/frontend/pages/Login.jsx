import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    // Giả lập API login
    const res = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      alert('Đăng nhập thành công!');
    } else {
      alert('Sai thông tin đăng nhập');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Đăng nhập</h2>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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