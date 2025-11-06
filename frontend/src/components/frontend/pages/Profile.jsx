import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaLock,
  FaHome
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

  // Xử lý input text
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý upload avatar
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
      setMessage('Ảnh đại diện đã được cập nhật!');
    } catch (err) {
      setMessage('Lỗi khi tải ảnh: ' + (err.response?.data?.message || err.message));
    }
  };

  // Lưu hồ sơ
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

  // Đổi mật khẩu
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
      setMessage('Đổi mật khẩu thành công!');
      setShowPasswordModal(false);
      setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      setMessage('Lỗi khi đổi mật khẩu: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container p-6 max-w-xl mx-auto">
      <div className="profile-card shadow-md rounded-xl p-6 bg-white">
        <div className="profile-header text-center">
          <div className="relative inline-block mb-3">
            <img
              src={avatarPreview || '/default-avatar.png'}
              alt="Avatar"
              className="w-24 h-24 rounded-full border object-cover"
            />
            <label
              className={`absolute bottom-0 right-0 p-2 rounded-full ${editing ? 'bg-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
                }`}
              title={editing ? 'Chọn ảnh mới' : 'Nhấn "Chỉnh sửa" để thay đổi ảnh'}
            >
              <FaCamera className={`${editing ? 'text-white' : 'text-gray-500'}`} />
              {editing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              )}
            </label>
          </div>
          <h2 className="text-2xl font-semibold">Hồ sơ của tôi</h2>
        </div>

        {message && (
          <div className={`p-2 text-center mt-3 rounded ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="profile-content mt-4">
          <div className="mb-3">
            <label className="block mb-1 font-medium"><FaUser className="inline mr-1" /> Tên hiển thị</label>
            {editing ? (
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="border p-2 w-full rounded" />
            ) : (
              <div>{formData.name}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium"><FaEnvelope className="inline mr-1" /> Email</label>
            {editing ? (
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="border p-2 w-full rounded" />
            ) : (
              <div>{formData.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium"><FaPhone className="inline mr-1" /> Số điện thoại</label>
            {editing ? (
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="border p-2 w-full rounded" />
            ) : (
              <div>{formData.phone || 'Chưa cập nhật'}</div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            {editing ? (
              <>
                <button onClick={handleSave} className="bg-green-500 text-white px-3 py-2 rounded flex items-center">
                  <FaSave className="mr-2" /> {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button onClick={() => setEditing(false)} className="bg-gray-400 text-white px-3 py-2 rounded flex items-center">
                  <FaTimes className="mr-2" /> Hủy
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="bg-blue-500 text-white px-3 py-2 rounded flex items-center">
                  <FaEdit className="mr-2" /> Chỉnh sửa
                </button>
                <button onClick={() => setShowPasswordModal(true)} className="bg-yellow-500 text-white px-3 py-2 rounded flex items-center">
                  <FaLock className="mr-2" /> Đổi mật khẩu
                </button>
                <button onClick={() => navigate('/')} className="bg-gray-700 text-white px-3 py-2 rounded flex items-center">
                  <FaHome className="mr-2" /> Về trang chủ
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl mb-3 font-semibold">Đổi mật khẩu</h3>
            <input
              type="password"
              placeholder="Mật khẩu cũ"
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={passwordForm.new_password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
              className="border p-2 w-full mb-4 rounded"
            />
            <div className="flex justify-between">
              <button onClick={handlePasswordChange} className="bg-green-600 text-white px-3 py-2 rounded">
                <FaSave className="inline mr-1" /> Lưu
              </button>
              <button onClick={() => setShowPasswordModal(false)} className="bg-gray-400 text-white px-3 py-2 rounded">
                <FaTimes className="inline mr-1" /> Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
