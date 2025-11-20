import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import { FaLock, FaEnvelope, FaSignInAlt } from 'react-icons/fa';

export default function Login() {
  const { setUser, setToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Đăng nhập - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Đăng nhập vào tài khoản của bạn để mua sắm quà tặng và quản lý đơn hàng. Đăng nhập nhanh với Google.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Đăng nhập vào tài khoản của bạn để mua sắm quà tặng và quản lý đơn hàng. Đăng nhập nhanh với Google.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Nơi sẽ quay lại sau khi đăng nhập
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đăng nhập thất bại');
        setLoading(false);
        return;
      }

      if (data.user && data.token) {
        const tokenValue = data.token;
        
        // Validate token
        if (!tokenValue || typeof tokenValue !== 'string' || tokenValue === 'undefined' || tokenValue === 'null' || tokenValue.trim().length === 0) {
          setError('Token không hợp lệ. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
        
        try {
          localStorage.setItem('token', tokenValue);
          const savedToken = localStorage.getItem('token');
          
          if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
            setError('Lỗi khi lưu token. Vui lòng thử lại.');
            setLoading(false);
            return;
          }
        } catch (storageError) {
          setError('Lỗi khi lưu token vào localStorage');
          setLoading(false);
          return;
        }
        
        setUser(data.user);
        setToken(tokenValue);
        navigate(from, { replace: true });
      } else {
        setError('Sai thông tin đăng nhập hoặc thiếu token');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng nhập: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.post('http://localhost:8000/api/auth/google/callback', {
        token: credentialResponse.credential,
      });
      
      const tokenValue = res.data.access_token || res.data.token;
      const userData = res.data.user;
      
      if (!tokenValue || !userData) {
        setError('Đăng nhập Google thất bại - thiếu token hoặc user');
        setLoading(false);
        return;
      }
      
      // Validate token
      if (typeof tokenValue !== 'string' || tokenValue === 'undefined' || tokenValue === 'null' || tokenValue.trim().length === 0) {
        setError('Token không hợp lệ từ Google login');
        setLoading(false);
        return;
      }
      
      try {
        localStorage.setItem('token', tokenValue);
        const savedToken = localStorage.getItem('token');
        
        if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
          setError('Lỗi khi lưu token. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      } catch (storageError) {
        setError('Lỗi khi lưu token vào localStorage');
        setLoading(false);
        return;
      }
      
      setUser(userData);
      setToken(tokenValue);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Đăng nhập Google thất bại: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div style={{
              fontSize: '3rem',
              color: '#FB6376',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <FaSignInAlt />
            </div>
            <h1>Đăng nhập</h1>
            <p>Chào mừng bạn trở lại!</p>
          </div>

          {error && (
            <div className="login-error error">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#FB6376',
                  fontSize: '1rem'
                }} />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>
            <div className="form-group">
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#FB6376',
                  fontSize: '1rem'
                }} />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Đang xử lý...' : (
                <>
                  <FaSignInAlt style={{ marginRight: '0.5rem' }} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>Hoặc</span>
          </div>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Đăng nhập Google thất bại')}
              disabled={loading}
            />
          </div>

          <p className="login-footer">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="login-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
