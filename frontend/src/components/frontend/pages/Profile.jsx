import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaLock,
  FaHome,
  FaHeart,
  FaCalendarAlt,
  FaStar
} from 'react-icons/fa';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Hồ sơ của tôi - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Quản lý thông tin cá nhân, cập nhật hồ sơ và đổi mật khẩu của bạn.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Quản lý thông tin cá nhân, cập nhật hồ sơ và đổi mật khẩu của bạn.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });

    setAvatarPreview(user.avatar ? `http://localhost:8000/storage/${user.avatar}` : '');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:8000/api/users/${user.id}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setAvatarPreview(`http://localhost:8000/storage/${res.data.avatar}`);
      setUser({ ...user, avatar: res.data.avatar });
      setMessage('✅ Ảnh đại diện đã được cập nhật!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Lỗi khi tải ảnh: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:8000/api/users/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setUser(res.data);
      setMessage('✅ Cập nhật thông tin thành công!');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Lỗi khi cập nhật thông tin: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/users/${user.id}/password`,
        passwordForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('✅ Đổi mật khẩu thành công!');
      setShowPasswordModal(false);
      setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Lỗi khi đổi mật khẩu: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (!user) return null;

  return (
    <div>
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar" style={{ position: 'relative' }}>
              <img
                src={avatarPreview || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&background=FB6376&color=fff&size=128'}
                alt={user.name || 'Avatar'}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid rgba(251, 99, 118, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.5)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
              <label
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  padding: '0.5rem',
                  borderRadius: '50%',
                  cursor: editing ? 'pointer' : 'not-allowed',
                  background: editing 
                    ? 'linear-gradient(135deg, #FB6376, #FCB1A6)' 
                    : 'rgba(108, 117, 125, 0.5)',
                  color: '#fff',
                  border: '2px solid #fff',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px'
                }}
                title={editing ? 'Chọn ảnh mới' : 'Nhấn "Chỉnh sửa" để thay đổi ảnh'}
                onMouseEnter={(e) => {
                  if (editing) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <FaCamera style={{ fontSize: '0.9rem' }} />
                {editing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                )}
              </label>
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #5D2A42, #FB6376, #FCB1A6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              Hồ sơ của tôi
            </h1>
          </div>

          {message && (
            <div className={`profile-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="profile-content">
            <div className="profile-field">
              <label>
                <FaUser className="field-icon" />
                Tên hiển thị
              </label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên của bạn"
                />
              ) : (
                <div className="field-value">{formData.name || 'Chưa cập nhật'}</div>
              )}
            </div>

            <div className="profile-field">
              <label>
                <FaEnvelope className="field-icon" />
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email của bạn"
                />
              ) : (
                <div className="field-value">{formData.email || 'Chưa cập nhật'}</div>
              )}
            </div>

            <div className="profile-field">
              <label>
                <FaPhone className="field-icon" />
                Số điện thoại
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại của bạn"
                />
              ) : (
                <div className="field-value">{formData.phone || 'Chưa cập nhật'}</div>
              )}
            </div>

            {/* Điểm thưởng */}
            <div className="profile-field">
              <label>
                <FaStar className="field-icon" style={{ color: '#FFD700' }} />
                Điểm thưởng
              </label>
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.1))',
                borderRadius: '12px',
                border: '2px solid rgba(251, 99, 118, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {user.loyalty_points || 0}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#5D2A42' }}>Điểm hiện có</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>
                    1 điểm = 100đ giảm giá • Tích điểm: 10,000đ = 1 điểm
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              {editing ? (
                <>
                  <button
                    className="profile-button save"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <FaSave />
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    className="profile-button cancel"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                      });
                    }}
                  >
                    <FaTimes />
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="profile-button edit"
                    onClick={() => setEditing(true)}
                  >
                    <FaEdit />
                    Chỉnh sửa
                  </button>
                  <button
                    className="profile-button"
                    onClick={() => setShowPasswordModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #FFC107, #FF9800)',
                      color: '#fff'
                    }}
                  >
                    <FaLock />
                    Đổi mật khẩu
                  </button>
                  <button
                    className="profile-button cancel"
                    onClick={() => navigate('/')}
                  >
                    <FaHome />
                    Về trang chủ
                  </button>
                </>
              )}
            </div>

            {/* Quick Navigation Section */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '2px solid rgba(251, 99, 118, 0.1)'
            }}>
              <h3 style={{
                color: '#5D2A42',
                fontSize: '1.3rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Quản lý sở thích
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <button
                  className="profile-button"
                  onClick={() => navigate('/preferences')}
                  style={{
                    background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(251, 99, 118, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 99, 118, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.3)';
                  }}
                >
                  <FaHeart />
                  Sở thích của tôi
                </button>
                <button
                  className="profile-button"
                  onClick={() => navigate('/anniversaries')}
                  style={{
                    background: 'linear-gradient(135deg, #5D2A42, #8B4A6B)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(93, 42, 66, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(93, 42, 66, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(93, 42, 66, 0.3)';
                  }}
                >
                  <FaCalendarAlt />
                  Dịp lễ đặc biệt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="profile-card"
            style={{
              maxWidth: '450px',
              margin: '1rem',
              animation: 'fadeInUp 0.4s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              color: '#5D2A42',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Đổi mật khẩu
            </h3>
            <div className="profile-content">
              <div className="profile-field">
                <label>Mật khẩu cũ</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                />
              </div>
              <div className="profile-field">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                />
              </div>
              <div className="profile-field">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                />
              </div>
            </div>
            <div className="profile-actions" style={{ marginTop: '1.5rem' }}>
              <button
                className="profile-button save"
                onClick={handlePasswordChange}
              >
                <FaSave />
                Lưu
              </button>
              <button
                className="profile-button cancel"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
                }}
              >
                <FaTimes />
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
