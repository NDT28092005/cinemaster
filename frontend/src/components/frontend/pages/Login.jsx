import { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const { setUser,setToken  } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Nơi sẽ quay lại sau khi đăng nhập
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Starting login with:', formData);
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', res.status, res.statusText);
      console.log('Response headers:', res.headers);
      
      const data = await res.json();
      console.log('Login response data:', data);
      console.log('Has user?', !!data.user);
      console.log('Has token?', !!data.token);
      console.log('Token value:', data.token);

      if (!res.ok) {
        console.error('Login failed with status:', res.status);
        alert(data.message || 'Đăng nhập thất bại');
        return;
      }

      if (data.user && data.token) {
        // Validate token trước khi lưu
        const tokenValue = data.token;
        if (!tokenValue || typeof tokenValue !== 'string' || tokenValue === 'undefined' || tokenValue === 'null' || tokenValue.trim().length === 0) {
          console.error('Invalid token value:', tokenValue);
          alert('Token không hợp lệ. Vui lòng thử lại.');
          return;
        }
        
        console.log('Setting token:', tokenValue);
        console.log('Token type:', typeof tokenValue);
        console.log('Token length:', tokenValue.length);
        
        // Lưu vào localStorage trước
        try {
          localStorage.setItem('token', tokenValue);
          const savedToken = localStorage.getItem('token');
          console.log('Token saved to localStorage:', savedToken);
          console.log('Token saved successfully?', savedToken === tokenValue);
          
          if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
            console.error('Failed to save token to localStorage!');
            alert('Lỗi khi lưu token. Vui lòng thử lại.');
            return;
          }
        } catch (storageError) {
          console.error('localStorage error:', storageError);
          alert('Lỗi khi lưu token vào localStorage');
          return;
        }
        
        // Sau đó mới update state (chỉ update nếu token hợp lệ)
        setUser(data.user);
        setToken(tokenValue);
        
        console.log('State updated, navigating...');
        
        // Đợi một chút để đảm bảo state được update
        setTimeout(() => {
          const verifyToken = localStorage.getItem('token');
          console.log('After setToken - localStorage token:', verifyToken);
          console.log('After setToken - token still there?', !!verifyToken);
          alert('Đăng nhập thành công!');
          navigate(from, { replace: true }); // 🔹 Quay lại trang trước
        }, 100);
      } else {
        console.error('Login failed - missing user or token:', {
          hasUser: !!data.user,
          hasToken: !!data.token,
          data: data
        });
        alert('Sai thông tin đăng nhập hoặc thiếu token');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Đã xảy ra lỗi khi đăng nhập: ' + err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google login started');
      const res = await axios.post('http://localhost:8000/api/auth/google/callback', {
        token: credentialResponse.credential,
      });
      
      console.log('Google login response:', res.data);
      
      // API trả về access_token, không phải token
      const tokenValue = res.data.access_token || res.data.token;
      const userData = res.data.user;
      
      if (!tokenValue || !userData) {
        console.error('Google login failed - missing token or user:', res.data);
        alert('Đăng nhập Google thất bại - thiếu token hoặc user');
        return;
      }
      
      // Validate token trước khi lưu
      if (typeof tokenValue !== 'string' || tokenValue === 'undefined' || tokenValue === 'null' || tokenValue.trim().length === 0) {
        console.error('Invalid token value from Google login:', tokenValue);
        alert('Token không hợp lệ từ Google login');
        return;
      }
      
      console.log('Setting Google token:', tokenValue);
      console.log('Setting Google user:', userData);
      
      // Lưu vào localStorage trước
      try {
        localStorage.setItem('token', tokenValue);
        const savedToken = localStorage.getItem('token');
        console.log('Google token saved to localStorage:', savedToken);
        console.log('Google token saved successfully?', savedToken === tokenValue);
        
        if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
          console.error('Failed to save Google token to localStorage!');
          alert('Lỗi khi lưu token. Vui lòng thử lại.');
          return;
        }
      } catch (storageError) {
        console.error('localStorage error:', storageError);
        alert('Lỗi khi lưu token vào localStorage');
        return;
      }
      
      // Sau đó mới update state
      setUser(userData);
      setToken(tokenValue);
      
      console.log('Google login state updated, navigating...');
      
      setTimeout(() => {
        const verifyToken = localStorage.getItem('token');
        console.log('After Google login - localStorage token:', verifyToken);
        alert(`Đăng nhập Google thành công! Xin chào ${userData.name}`);
        const from = location.state?.from || '/';
        navigate(from, { replace: true }); 
      }, 100);
    } catch (err) {
      console.error('Google login error:', err);
      console.error('Error response:', err.response?.data);
      alert('Đăng nhập Google thất bại: ' + (err.response?.data?.error || err.message));
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

      <p style={{ marginTop: '10px' }}>
        Bạn chưa có tài khoản?{' '}
        <a href="/register">
          Đăng ký ngay
        </a>
      </p>

      <div className="divider">Hoặc</div>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert('Đăng nhập Google thất bại')}
      />
    </div>
  );
}
