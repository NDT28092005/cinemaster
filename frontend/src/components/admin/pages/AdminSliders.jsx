import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from '../../../layouts/AdminLayout';
import { Image, Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

const AdminSliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    image: null,
    order: 0,
    is_active: true,
    link: ''
  });
  const [previewImage, setPreviewImage] = useState(null);

  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/admin/sliders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSliders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setSliders([]);
      if (err.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (slider = null) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData({
        image: null,
        order: slider.order || 0,
        is_active: slider.is_active !== undefined ? slider.is_active : true,
        link: slider.link || ''
      });
      setPreviewImage(slider.image_url);
    } else {
      setEditingSlider(null);
      setFormData({
        image: null,
        order: sliders.length,
        is_active: true,
        link: ''
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlider(null);
    setFormData({
      image: null,
      order: 0,
      is_active: true,
      link: ''
    });
    setPreviewImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingSlider && !formData.image) {
      alert("Vui lòng chọn ảnh");
      return;
    }

    try {
      const submitData = new FormData();
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      submitData.append('order', formData.order);
      submitData.append('is_active', formData.is_active ? 1 : 0);
      if (formData.link) {
        submitData.append('link', formData.link);
      }

      if (editingSlider) {
        await axios.put(
          `http://localhost:8000/api/admin/sliders/${editingSlider.id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert("Cập nhật slider thành công!");
      } else {
        await axios.post(
          "http://localhost:8000/api/admin/sliders",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        alert("Tạo slider thành công!");
      }

      handleCloseModal();
      fetchSliders();
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa slider này?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/admin/sliders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("Xóa slider thành công!");
      fetchSliders();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa slider: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleActive = async (slider) => {
    try {
      await axios.put(
        `http://localhost:8000/api/admin/sliders/${slider.id}`,
        {
          is_active: !slider.is_active,
          order: slider.order,
          link: slider.link
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchSliders();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleOrderChange = async (slider, direction) => {
    const currentIndex = sliders.findIndex(s => s.id === slider.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sliders.length) return;

    const tempSliders = [...sliders];
    const [moved] = tempSliders.splice(currentIndex, 1);
    tempSliders.splice(newIndex, 0, moved);

    // Update orders
    try {
      for (let i = 0; i < tempSliders.length; i++) {
        await axios.put(
          `http://localhost:8000/api/admin/sliders/${tempSliders[i].id}`,
          {
            order: i,
            is_active: tempSliders[i].is_active,
            link: tempSliders[i].link
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      fetchSliders();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật thứ tự");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="loading-spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(251, 99, 118, 0.2)', 
            borderTopColor: '#FB6376', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#5D2A42', 
            fontSize: '2rem', 
            fontWeight: '700',
            margin: 0
          }}>
            Quản lý Slider
          </h1>
          <button
            onClick={() => handleOpenModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(251, 99, 118, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 99, 118, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.3)';
            }}
          >
            <Plus size={20} />
            Thêm Slider
          </button>
        </div>

        {sliders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'rgba(251, 99, 118, 0.05)',
            borderRadius: '12px',
            color: '#666'
          }}>
            <Image size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Chưa có slider nào. Hãy thêm slider đầu tiên!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {sliders.map((slider) => (
              <div
                key={slider.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  border: slider.is_active ? '2px solid #FB6376' : '2px solid #ddd'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={slider.image_url}
                    alt={`Slider ${slider.id}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: slider.is_active ? '#4CAF50' : '#999',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {slider.is_active ? 'Hiển thị' : 'Ẩn'}
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#5D2A42' }}>Thứ tự: </strong>
                    <span>{slider.order}</span>
                  </div>
                  {slider.link && (
                    <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                      <strong>Link: </strong>
                      <a href={slider.link} target="_blank" rel="noopener noreferrer" style={{ color: '#FB6376' }}>
                        {slider.link.length > 30 ? slider.link.substring(0, 30) + '...' : slider.link}
                      </a>
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap',
                    marginTop: '1rem'
                  }}>
                    <button
                      onClick={() => handleOrderChange(slider, 'up')}
                      style={{
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Di chuyển lên"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleOrderChange(slider, 'down')}
                      style={{
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Di chuyển xuống"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(slider)}
                      style={{
                        padding: '0.5rem',
                        background: slider.is_active ? '#f0f0f0' : '#4CAF50',
                        color: slider.is_active ? '#333' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={slider.is_active ? 'Ẩn slider' : 'Hiển thị slider'}
                    >
                      {slider.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleOpenModal(slider)}
                      style={{
                        padding: '0.5rem',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      style={{
                        padding: '0.5rem',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ 
                marginTop: 0, 
                marginBottom: '1.5rem',
                color: '#5D2A42',
                fontSize: '1.5rem'
              }}>
                {editingSlider ? 'Chỉnh sửa Slider' : 'Thêm Slider Mới'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: '#5D2A42'
                  }}>
                    Ảnh {!editingSlider && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        marginTop: '1rem',
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                      }}
                    />
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: '#5D2A42'
                  }}>
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: '#5D2A42'
                  }}>
                    Link (tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600, color: '#5D2A42' }}>Hiển thị slider</span>
                  </label>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'flex-end',
                  marginTop: '2rem'
                }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#f0f0f0',
                      color: '#333',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(251, 99, 118, 0.3)'
                    }}
                  >
                    {editingSlider ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSliders;

