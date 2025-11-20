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
import { FaCalendarAlt, FaGift, FaTrash, FaPlus, FaHeart } from 'react-icons/fa';

export default function Anniversaries() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ event_name: '', event_date: '' });
  const [showForm, setShowForm] = useState(false);

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Dịp lễ đặc biệt - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Quản lý các dịp lễ đặc biệt của bạn. Nhắc nhở và gợi ý quà tặng cho những ngày quan trọng.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Quản lý các dịp lễ đặc biệt của bạn. Nhắc nhở và gợi ý quà tặng cho những ngày quan trọng.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user && !authLoading) {
      fetchAnniversaries();
    }
  }, [user, authLoading, navigate]);

  const fetchAnniversaries = async () => {
    try {
      setLoading(true);
      const currentToken = token || localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!currentToken || !userId) {
        navigate('/login');
        return;
      }

      const res = await axios.get(`http://localhost:8000/api/users/${userId}/anniversaries`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setAnniversaries(res.data || []);
    } catch (err) {
      console.error('Fetch anniversaries error:', err);
      setAnniversaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentToken = token || localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      await axios.post(
        `http://localhost:8000/api/users/${userId}/anniversaries`,
        form,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      setForm({ event_name: '', event_date: '' });
      setShowForm(false);
      fetchAnniversaries();
    } catch (err) {
      console.error('Add anniversary error:', err);
      alert('Lỗi khi thêm dịp lễ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịp lễ này?')) return;
    
    try {
      const currentToken = token || localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      await axios.delete(
        `http://localhost:8000/api/users/${userId}/anniversaries/${id}`,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      fetchAnniversaries();
    } catch (err) {
      console.error('Delete anniversary error:', err);
      alert('Lỗi khi xóa dịp lễ: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    eventDate.setFullYear(today.getFullYear());
    
    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
            <FaCalendarAlt style={{ color: '#FB6376' }} />
            Danh sách dịp lễ đặc biệt
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1rem',
            margin: 0
          }}>
            Quản lý các dịp lễ quan trọng và nhận gợi ý quà tặng phù hợp
          </p>
        </div>

        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          <Button
            className="btn-book"
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 2rem'
            }}
          >
            <FaPlus />
            {showForm ? 'Ẩn form' : 'Thêm dịp lễ mới'}
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
              Thêm dịp lễ mới
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
                      Tên dịp lễ
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Sinh nhật, Kỷ niệm ngày cưới..."
                      value={form.event_name}
                      onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                      required
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
                      Ngày
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={form.event_date}
                      onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                      required
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
                  Thêm
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setForm({ event_name: '', event_date: '' });
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

        {anniversaries.length === 0 ? (
          <Card style={{
            border: 'none',
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
            boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
            animation: 'fadeInUp 0.6s ease-out'
          }}>
            <FaCalendarAlt style={{
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
              Chưa có dịp lễ nào
            </h3>
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              fontSize: '1rem'
            }}>
              Hãy thêm các dịp lễ đặc biệt để nhận gợi ý quà tặng phù hợp
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
              Thêm dịp lễ đầu tiên
            </Button>
          </Card>
        ) : (
          <Row className="g-4">
            {anniversaries.map((anniversary, index) => {
              const daysUntil = getDaysUntil(anniversary.event_date);
              return (
                <Col key={anniversary.anniversary_id} xs={12} md={6} lg={4}>
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
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 15px rgba(251, 99, 118, 0.3)'
                    }}>
                      {daysUntil === 0 ? 'Hôm nay' : daysUntil === 1 ? 'Ngày mai' : `Còn ${daysUntil} ngày`}
                    </div>
                    <div style={{
                      fontSize: '3rem',
                      color: '#FB6376',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <FaHeart />
                    </div>
                    <h3 style={{
                      color: '#5D2A42',
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      {anniversary.event_name}
                    </h3>
                    <div style={{
                      color: '#666',
                      fontSize: '1rem',
                      textAlign: 'center',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaCalendarAlt style={{ color: '#FB6376' }} />
                      {formatDate(anniversary.event_date)}
                    </div>
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
                        variant="outline-danger"
                        onClick={() => handleDelete(anniversary.anniversary_id)}
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
              );
            })}
          </Row>
        )}
      </Container>
      <Footer />
    </div>
  );
}
