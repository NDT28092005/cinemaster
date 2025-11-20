import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { FaHeart, FaTrash, FaPlus, FaEdit, FaTag, FaDollarSign, FaGift } from 'react-icons/fa';

export default function Preferences() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    preferred_occasion: '', 
    favorite_category: '', 
    budget_range_min: '', 
    budget_range_max: '' 
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Sở thích của tôi - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Quản lý sở thích và sở thích quà tặng của bạn. Nhận gợi ý sản phẩm phù hợp với sở thích của bạn.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Quản lý sở thích và sở thích quà tặng của bạn. Nhận gợi ý sản phẩm phù hợp với sở thích của bạn.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user && !authLoading) {
      fetchPreferences();
    }
  }, [user, authLoading, navigate]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const currentToken = token || localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!currentToken || !userId) {
        navigate('/login');
        return;
      }

      const res = await axios.get(`http://localhost:8000/api/users/${userId}/preferences`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setPreferences(res.data || []);
    } catch (err) {
      console.error('Fetch preferences error:', err);
      setPreferences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const minBudget = parseFloat(form.budget_range_min) || 0;
    const maxBudget = parseFloat(form.budget_range_max) || 0;
    
    if (form.budget_range_min && form.budget_range_max && minBudget > maxBudget) {
      alert('Ngân sách tối thiểu không thể lớn hơn ngân sách tối đa!');
      return;
    }
    
    if (form.budget_range_min && minBudget > 999999999999999) {
      alert('Ngân sách tối thiểu không được vượt quá 999,999,999,999,999 VNĐ!');
      return;
    }
    
    if (form.budget_range_max && maxBudget > 999999999999999) {
      alert('Ngân sách tối đa không được vượt quá 999,999,999,999,999 VNĐ!');
      return;
    }
    
    try {
      const currentToken = token || localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      if (editingId) {
        await axios.put(
          `http://localhost:8000/api/users/${userId}/preferences/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );
      } else {
        await axios.post(
          `http://localhost:8000/api/users/${userId}/preferences`,
          form,
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );
      }
      setForm({ preferred_occasion: '', favorite_category: '', budget_range_min: '', budget_range_max: '' });
      setShowForm(false);
      setEditingId(null);
      fetchPreferences();
    } catch (err) {
      console.error('Save preference error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.budget_range_max?.[0] || err.message;
      alert('Lỗi khi lưu sở thích: ' + errorMessage);
    }
  };

  const handleEdit = (pref) => {
    setForm({
      preferred_occasion: pref.preferred_occasion || '',
      favorite_category: pref.favorite_category || '',
      budget_range_min: pref.budget_range_min || '',
      budget_range_max: pref.budget_range_max || ''
    });
    setEditingId(pref.preference_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sở thích này?')) return;
    
    try {
      const currentToken = token || localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      await axios.delete(
        `http://localhost:8000/api/users/${userId}/preferences/${id}`,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      fetchPreferences();
    } catch (err) {
      console.error('Delete preference error:', err);
      alert('Lỗi khi xóa sở thích: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (authLoading || loading) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5">
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh', gap: '20px' }}>
            <div className="loading-spinner" style={{ 
              width: '60px', 
              height: '60px', 
              border: '5px solid rgba(251, 99, 118, 0.2)', 
              borderTopColor: '#FB6376', 
              borderRightColor: '#FCB1A6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#5D2A42', fontSize: '1rem', fontWeight: '500', margin: 0 }}>Đang tải...</p>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <Header />
      <Container className="mt-5 pt-5" style={{ minHeight: '70vh', paddingBottom: '4rem' }}>
        <div style={{
          marginBottom: '2.5rem',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <h1 style={{
            color: '#5D2A42',
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <FaHeart style={{ color: '#FB6376' }} />
            Sở thích của tôi
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1rem',
            margin: 0
          }}>
            Quản lý sở thích quà tặng và nhận gợi ý sản phẩm phù hợp
          </p>
        </div>

        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          <Button
            className="btn-book"
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setForm({ preferred_occasion: '', favorite_category: '', budget_range_min: '', budget_range_max: '' });
                setEditingId(null);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 2rem'
            }}
          >
            <FaPlus />
            {showForm ? 'Ẩn form' : 'Thêm sở thích mới'}
          </Button>
        </div>

        {showForm && (
          <Card style={{
            marginBottom: '2rem',
            border: 'none',
            borderRadius: '20px',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
            boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
            animation: 'fadeInUp 0.4s ease-out'
          }}>
            <h3 style={{
              color: '#5D2A42',
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}>
              {editingId ? 'Chỉnh sửa sở thích' : 'Thêm sở thích mới'}
            </h3>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{
                      color: '#5D2A42',
                      fontWeight: 500,
                      marginBottom: '0.5rem'
                    }}>
                      Dịp ưa thích
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Sinh nhật, Kỷ niệm..."
                      name="preferred_occasion"
                      value={form.preferred_occasion}
                      onChange={(e) => setForm({ ...form, preferred_occasion: e.target.value })}
                      style={{
                        borderRadius: '15px',
                        border: '2px solid rgba(251, 99, 118, 0.2)',
                        padding: '0.85rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{
                      color: '#5D2A42',
                      fontWeight: 500,
                      marginBottom: '0.5rem'
                    }}>
                      Danh mục yêu thích
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Quà tặng nam, Quà tặng nữ..."
                      name="favorite_category"
                      value={form.favorite_category}
                      onChange={(e) => setForm({ ...form, favorite_category: e.target.value })}
                      style={{
                        borderRadius: '15px',
                        border: '2px solid rgba(251, 99, 118, 0.2)',
                        padding: '0.85rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{
                      color: '#5D2A42',
                      fontWeight: 500,
                      marginBottom: '0.5rem'
                    }}>
                      Ngân sách tối thiểu (VNĐ)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      name="budget_range_min"
                      value={form.budget_range_min}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 999999999999999)) {
                          setForm({ ...form, budget_range_min: value });
                        }
                      }}
                      min="0"
                      max="999999999999999"
                      style={{
                        borderRadius: '15px',
                        border: '2px solid rgba(251, 99, 118, 0.2)',
                        padding: '0.85rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{
                      color: '#5D2A42',
                      fontWeight: 500,
                      marginBottom: '0.5rem'
                    }}>
                      Ngân sách tối đa (VNĐ)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="1000000"
                      name="budget_range_max"
                      value={form.budget_range_max}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 999999999999999)) {
                          setForm({ ...form, budget_range_max: value });
                        }
                      }}
                      min="0"
                      max="999999999999999"
                      style={{
                        borderRadius: '15px',
                        border: '2px solid rgba(251, 99, 118, 0.2)',
                        padding: '0.85rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                  type="submit"
                  className="btn-book"
                  style={{
                    padding: '0.85rem 2rem'
                  }}
                >
                  <FaPlus style={{ marginRight: '0.5rem' }} />
                  {editingId ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setForm({ preferred_occasion: '', favorite_category: '', budget_range_min: '', budget_range_max: '' });
                    setEditingId(null);
                  }}
                  style={{
                    borderRadius: '15px',
                    padding: '0.85rem 2rem',
                    borderColor: '#5D2A42',
                    color: '#5D2A42'
                  }}
                >
                  Hủy
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {preferences.length === 0 ? (
          <Card style={{
            border: 'none',
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
            boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <FaHeart style={{
              fontSize: '4rem',
              color: '#FB6376',
              opacity: 0.3,
              marginBottom: '1.5rem'
            }} />
            <h3 style={{
              color: '#5D2A42',
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              Chưa có sở thích nào
            </h3>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              fontSize: '1rem'
            }}>
              Hãy thêm sở thích để nhận gợi ý quà tặng phù hợp
            </p>
            <Button
              className="btn-book"
              onClick={() => setShowForm(true)}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              <FaPlus style={{ marginRight: '0.5rem' }} />
              Thêm sở thích đầu tiên
            </Button>
          </Card>
        ) : (
          <Row className="g-4">
            {preferences.map((pref, index) => (
              <Col key={pref.preference_id} xs={12} md={6} lg={4}>
                <Card style={{
                  border: 'none',
                  borderRadius: '20px',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                  boxShadow: '0 8px 25px rgba(93, 42, 66, 0.08)',
                  height: '100%',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(251, 99, 118, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(93, 42, 66, 0.08)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                >
                  <div style={{
                    fontSize: '3rem',
                    color: '#FB6376',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <FaHeart />
                  </div>
                  {pref.preferred_occasion && (
                    <div style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'center'
                    }}>
                      <FaTag style={{ color: '#FB6376' }} />
                      <span style={{ color: '#5D2A42', fontWeight: 500 }}>{pref.preferred_occasion}</span>
                    </div>
                  )}
                  {pref.favorite_category && (
                    <div style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'center'
                    }}>
                      <FaGift style={{ color: '#FB6376' }} />
                      <span style={{ color: '#666' }}>{pref.favorite_category}</span>
                    </div>
                  )}
                  {(pref.budget_range_min || pref.budget_range_max) && (
                    <div style={{
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <FaDollarSign style={{ color: '#FB6376' }} />
                      <span style={{ color: '#5D2A42', fontWeight: 600 }}>
                        {pref.budget_range_min ? formatPrice(pref.budget_range_min) : '0 đ'} - {pref.budget_range_max ? formatPrice(pref.budget_range_max) : 'Không giới hạn'}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      className="btn-book"
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        fontSize: '0.9rem'
                      }}
                      onClick={() => navigate('/products')}
                    >
                      <FaGift style={{ marginRight: '0.5rem' }} />
                      Xem quà tặng
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() => handleEdit(pref)}
                      style={{
                        borderRadius: '15px',
                        padding: '0.75rem 1rem',
                        borderColor: '#FB6376',
                        color: '#FB6376'
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDelete(pref.preference_id)}
                      style={{
                        borderRadius: '15px',
                        padding: '0.75rem 1rem',
                        borderColor: '#dc3545',
                        color: '#dc3545'
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      <Footer />
    </div>
  );
}

