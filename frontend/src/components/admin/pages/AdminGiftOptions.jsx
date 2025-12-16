import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from '../../../layouts/AdminLayout';
import { Gift, Plus, Edit, Trash2, Package } from "lucide-react";

export default function AdminGiftOptions() {
  const [activeTab, setActiveTab] = useState('wrapping-papers');
  const [wrappingPapers, setWrappingPapers] = useState([]);
  const [decorativeAccessories, setDecorativeAccessories] = useState([]);
  const [cardTypes, setCardTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    quantity: 0,
    price: 0,
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  useEffect(() => {
    loadData();
    // Reset form và ảnh khi chuyển tab
    setFormData({
      name: '',
      description: '',
      image_url: '',
      quantity: 0,
      price: 0,
      is_active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setEditing(null);
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        window.location.href = '/admin/login';
        return;
      }
      
      const endpoint = `http://localhost:8000/api/admin/gift-options/${activeTab}`;
      const res = await axios.get(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Load data response:', res.data);
      
      const data = res.data || [];
      console.log('First item image_url:', data[0]?.image_url);
      
      if (activeTab === 'wrapping-papers') {
        setWrappingPapers(data);
      } else if (activeTab === 'decorative-accessories') {
        setDecorativeAccessories(data);
      } else {
        setCardTypes(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Lỗi khi tải dữ liệu';
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      image_url: item.image_url || '',
      quantity: item.quantity || 0,
      price: item.price || 0,
      is_active: item.is_active !== undefined ? item.is_active : true
    });
    // Reset ảnh trước
    setImageFile(null);
    // Hiển thị ảnh từ database nếu có
    if (item.image_url && item.image_url.trim()) {
      setImagePreview(item.image_url);
      console.log('Setting image preview from edit:', item.image_url);
    } else {
      setImagePreview(null);
    }
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      quantity: 0,
      price: 0,
      is_active: true
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Tạo preview từ file local
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      console.log('File selected:', file.name, file.size, file.type);
    } else {
      // Nếu không chọn file, giữ nguyên preview hiện tại (nếu đang edit)
      if (!editing) {
        setImageFile(null);
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra các trường bắt buộc trước khi submit
    if (!formData.name || !formData.name.trim()) {
      alert('Vui lòng nhập tên');
      return;
    }
    
    try {
      const token = getToken();
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        window.location.href = '/admin/login';
        return;
      }
      
      setUploading(true);
      
      const endpoint = editing
        ? `http://localhost:8000/api/admin/gift-options/${activeTab}/${editing}`
        : `http://localhost:8000/api/admin/gift-options/${activeTab}`;
      
      // Dùng POST thay vì PUT để tránh lỗi với FormData
      const method = 'post';
      
      // Tạo FormData để upload file
      const formDataToSend = new FormData();
      
      // Đảm bảo tất cả các trường được gửi đúng cách
      const nameValue = (formData.name || '').trim();
      if (!nameValue) {
        alert('Vui lòng nhập tên');
        setUploading(false);
        return;
      }
      
      formDataToSend.append('name', nameValue);
      formDataToSend.append('description', (formData.description || '').trim());
      formDataToSend.append('quantity', String(parseInt(formData.quantity) || 0));
      formDataToSend.append('price', String(parseFloat(formData.price) || 0));
      
      // Gửi is_active dưới dạng "1" hoặc "0" string để backend xử lý
      const isActiveValue = formData.is_active === true || formData.is_active === 'true' || formData.is_active === 1 || formData.is_active === '1';
      formDataToSend.append('is_active', isActiveValue ? '1' : '0');
      
      // Nếu có file ảnh, thêm vào FormData
      if (imageFile) {
        formDataToSend.append('image', imageFile);
        console.log('Uploading image file:', imageFile.name, imageFile.size);
      }
      
      console.log('Sending data:', {
        name: nameValue,
        quantity: formData.quantity,
        price: formData.price,
        is_active: isActiveValue,
        hasImageFile: !!imageFile
      });
      console.log('Endpoint:', endpoint);
      console.log('Method:', method);
      
      const response = await axios[method](endpoint, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response:', response.data);
      
      alert(editing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      handleCancel();
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Lỗi không xác định';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Lỗi: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    
    try {
      const token = getToken();
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        window.location.href = '/admin/login';
        return;
      }
      
      await axios.delete(
        `http://localhost:8000/api/admin/gift-options/${activeTab}/${id}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          } 
        }
      );
      alert('Xóa thành công!');
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      console.error('Error response:', error.response?.data);
      alert('Lỗi khi xóa: ' + (error.response?.data?.message || error.message));
    }
  };

  const getCurrentData = () => {
    if (activeTab === 'wrapping-papers') return wrappingPapers;
    if (activeTab === 'decorative-accessories') return decorativeAccessories;
    return cardTypes;
  };

  const getTabLabel = () => {
    if (activeTab === 'wrapping-papers') return 'Giấy gói';
    if (activeTab === 'decorative-accessories') return 'Phụ kiện trang trí';
    return 'Loại thiệp';
  };

  return (
    <AdminLayout>
      <div className="admin-gift-options">
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#5D2A42', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift /> Quản lý quà tặng
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '2px solid #e0e0e0'
        }}>
          {['wrapping-papers', 'decorative-accessories', 'card-types'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setEditing(null);
                // Reset form và ảnh khi chuyển tab
                setFormData({
                  name: '',
                  description: '',
                  image_url: '',
                  quantity: 0,
                  price: 0,
                  is_active: true
                });
                setImageFile(null);
                setImagePreview(null);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeTab === tab ? '#5D2A42' : 'transparent',
                color: activeTab === tab ? 'white' : '#5D2A42',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #FB6376' : '3px solid transparent',
                fontWeight: activeTab === tab ? 600 : 400,
                transition: 'all 0.3s'
              }}
            >
              {tab === 'wrapping-papers' ? 'Giấy gói' : 
               tab === 'decorative-accessories' ? 'Phụ kiện trang trí' : 
               'Loại thiệp'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 236, 0.9))',
          padding: '2rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(93, 42, 66, 0.1)',
          border: '2px solid rgba(251, 99, 118, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(251, 99, 118, 0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Gift size={20} />
            </div>
            <h3 style={{ 
              margin: 0, 
              color: '#5D2A42',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              {editing ? '✏️ Chỉnh sửa' : '➕ Thêm mới'} {getTabLabel()}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: 600,
                  color: '#5D2A42'
                }}>
                  Tên <span style={{ color: '#FB6376' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FB6376';
                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: 600,
                  color: '#5D2A42'
                }}>
                  Số lượng <span style={{ color: '#FB6376' }}>*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FB6376';
                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: 600,
                  color: '#5D2A42'
                }}>
                  Giá (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FB6376';
                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: 600,
                  color: '#5D2A42'
                }}>
                  Trạng thái
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: 'white',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FB6376';
                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value={true}>✅ Hoạt động</option>
                  <option value={false}>⏸️ Tạm ngưng</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: 600,
                color: '#5D2A42'
              }}>
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                placeholder="Nhập mô tả chi tiết..."
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '10px',
                  resize: 'vertical',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FB6376';
                  e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: 600,
                color: '#5D2A42',
                fontSize: '1rem'
              }}>
                Hình ảnh
              </label>
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                alignItems: 'flex-start',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{
                    padding: '1rem',
                    border: '2px dashed rgba(251, 99, 118, 0.3)',
                    borderRadius: '10px',
                    background: 'rgba(251, 99, 118, 0.05)',
                    marginBottom: '1rem'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid rgba(251, 99, 118, 0.2)',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    />
                  <small style={{ 
                    color: '#666', 
                    fontSize: '0.85rem', 
                    display: 'block', 
                    marginTop: '0.5rem' 
                  }}>
                    Chấp nhận: JPG, PNG, WEBP (tối đa 5MB). File sẽ được upload lên server tự động.
                  </small>
                  </div>
                </div>
                {imagePreview && (
                  <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '3px solid rgba(251, 99, 118, 0.3)',
                    flexShrink: 0,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '2px solid rgba(251, 99, 118, 0.1)'
            }}>
              <button
                type="submit"
                disabled={uploading}
                style={{
                  padding: '0.85rem 2rem',
                  background: uploading 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #5D2A42, #FB6376)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: uploading ? 'none' : '0 4px 15px rgba(93, 42, 66, 0.3)',
                  transition: 'all 0.3s',
                  opacity: uploading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(93, 42, 66, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(93, 42, 66, 0.3)';
                  }
                }}
              >
                {uploading ? '⏳ Đang xử lý...' : (editing ? '💾 Cập nhật' : '➕ Thêm mới')}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '0.85rem 2rem',
                    background: 'white',
                    color: '#666',
                    border: '2px solid #ddd',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#FB6376';
                    e.target.style.color = '#FB6376';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#ddd';
                    e.target.style.color = '#666';
                  }}
                >
                  ❌ Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem',
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(93, 42, 66, 0.1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '5px solid rgba(251, 99, 118, 0.2)',
              borderTopColor: '#FB6376',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#666', fontSize: '1rem' }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 236, 0.9))',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(93, 42, 66, 0.1)',
            border: '2px solid rgba(251, 99, 118, 0.15)'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #5D2A42, #FB6376)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Package size={24} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
                Danh sách {getTabLabel()} ({getCurrentData().length})
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(251, 99, 118, 0.1)' }}>
                    <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: '#5D2A42' }}>Hình ảnh</th>
                    <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: '#5D2A42' }}>Tên</th>
                    <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, color: '#5D2A42' }}>Mô tả</th>
                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: '#5D2A42' }}>Số lượng</th>
                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: '#5D2A42' }}>Giá</th>
                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: '#5D2A42' }}>Trạng thái</th>
                    <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 600, color: '#5D2A42' }}>Thao tác</th>
                  </tr>
                </thead>
              <tbody>
                {getCurrentData().map((item, index) => (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(251, 99, 118, 0.1)',
                      background: index % 2 === 0 ? 'white' : 'rgba(251, 99, 118, 0.02)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 99, 118, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'rgba(251, 99, 118, 0.02)';
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      {item.image_url && item.image_url.trim() ? (
                        <div style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '2px solid rgba(251, 99, 118, 0.2)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(item.image_url, '_blank')}
                        title="Click để xem ảnh lớn"
                        >
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(251, 99, 118, 0.05)); color: #999; font-size: 0.7rem; text-align: center; padding: 0.25rem;">No img</div>';
                              }
                            }}
                            onLoad={() => console.log('Image loaded:', item.image_url)}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: '70px',
                          height: '70px',
                          background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(251, 99, 118, 0.05))',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#999',
                          fontSize: '0.75rem',
                          border: '2px dashed rgba(251, 99, 118, 0.3)'
                        }}>
                          No img
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#5D2A42' }}>{item.name}</td>
                    <td style={{ padding: '1rem', color: '#666', maxWidth: '300px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.description || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: item.quantity > 0 
                          ? 'linear-gradient(135deg, #d4edda, #c3e6cb)' 
                          : 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                        color: item.quantity > 0 ? '#155724' : '#721c24',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        {item.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#FB6376' }}>
                      {new Intl.NumberFormat('vi-VN').format(item.price || 0)} đ
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: item.is_active 
                          ? 'linear-gradient(135deg, #d4edda, #c3e6cb)' 
                          : 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
                        color: item.is_active ? '#155724' : '#721c24',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        {item.is_active ? '✅ Hoạt động' : '⏸️ Tạm ngưng'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            padding: '0.6rem',
                            background: 'linear-gradient(135deg, #17a2b8, #138496)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(23, 162, 184, 0.3)',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(23, 162, 184, 0.3)';
                          }}
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            padding: '0.6rem',
                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                          }}
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {getCurrentData().length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        color: '#999'
                      }}>
                        <Gift size={48} style={{ opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
                          Chưa có dữ liệu {getTabLabel()}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                          Hãy thêm mới bằng form phía trên
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

