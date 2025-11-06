import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');

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
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      setMessage('Cập nhật thông tin thành công!');
      setEditing(false);
    } catch (err) {
      setMessage('Lỗi khi cập nhật thông tin: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setEditing(false);
    setMessage('');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <h2>Hồ sơ của tôi</h2>
        </div>

        {message && (
          <div className={`profile-message ${message.includes('thành công') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-field">
            <label>
              <FaUser className="field-icon" /> Tên hiển thị
            </label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            ) : (
              <div className="field-value">{formData.name || 'Chưa cập nhật'}</div>
            )}
          </div>

          <div className="profile-field">
            <label>
              <FaEnvelope className="field-icon" /> Email
            </label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            ) : (
              <div className="field-value">{formData.email}</div>
            )}
          </div>

          <div className="profile-field">
            <label>
              <FaPhone className="field-icon" /> Số điện thoại
            </label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                placeholder="Chưa cập nhật"
              />
            ) : (
              <div className="field-value">{formData.phone || 'Chưa cập nhật'}</div>
            )}
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="profile-button save"
                  disabled={loading}
                >
                  <FaSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  onClick={handleCancel}
                  className="profile-button cancel"
                  disabled={loading}
                >
                  <FaTimes /> Hủy
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="profile-button edit"
              >
                <FaEdit /> Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

