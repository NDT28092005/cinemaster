import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { FaMapMarkerAlt, FaHome, FaSave, FaArrowLeft } from 'react-icons/fa';

export default function AddAddress() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Việt Nam',
    is_default: false
  });
  const [message, setMessage] = useState('');

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Thêm địa chỉ giao hàng - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Thêm địa chỉ giao hàng mới để nhận quà tặng tại nhà.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Thêm địa chỉ giao hàng mới để nhận quà tặng tại nhà.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Chỉ redirect về login khi đã load xong và không có user
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const currentToken = token || localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!currentToken || !userId) {
        navigate('/login');
        return;
      }

      await axios.post(
        `http://localhost:8000/api/users/${userId}/addresses`,
        form,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      
      setMessage('✅ Thêm địa chỉ thành công!');
      setTimeout(() => {
        const returnTo = location.state?.returnTo || '/profile';
        if (returnTo === '/checkout') {
          navigate(returnTo, { state: { fromAddAddress: true } });
        } else {
          navigate(returnTo);
        }
      }, 1500);
    } catch (err) {
      console.error('Add address error:', err);
      setMessage('❌ Lỗi khi thêm địa chỉ: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị loading khi đang kiểm tra authentication
  if (authLoading) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5" style={{ minHeight: '70vh', paddingBottom: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: '#5D2A42' }}>Đang tải...</p>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  // Nếu không có user sau khi load xong, sẽ redirect về login (đã xử lý trong useEffect)
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
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/profile')}
            style={{
              marginBottom: '1.5rem',
              borderRadius: '15px',
              padding: '0.5rem 1rem',
              borderColor: '#5D2A42',
              color: '#5D2A42',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaArrowLeft />
            Quay lại
          </Button>
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
            <FaMapMarkerAlt style={{ color: '#FB6376' }} />
            Thêm địa chỉ giao hàng
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1rem',
            margin: 0
          }}>
            Thêm địa chỉ mới để nhận quà tặng tại nhà
          </p>
        </div>

        <Card style={{
          border: 'none',
          borderRadius: '20px',
          padding: '2.5rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
          boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
          animation: 'fadeInUp 0.6s ease-out 0.2s both'
        }}>
          {message && (
            <div style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: '12px',
              background: message.includes('✅') 
                ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05))'
                : 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05))',
              border: `2px solid ${message.includes('✅') ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)'}`,
              color: message.includes('✅') ? '#28a745' : '#dc3545',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {message}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{
                    color: '#5D2A42',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Địa chỉ chi tiết <span style={{ color: '#FB6376' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address_line1"
                    placeholder="Ví dụ: Số 123, Đường ABC"
                    value={form.address_line1}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '15px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      fontSize: '0.95rem',
                      padding: '0.85rem 1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FB6376';
                      e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{
                    color: '#5D2A42',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Phường/Xã <span style={{ color: '#FB6376' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address_line2"
                    placeholder="Ví dụ: Phường 1, Phường Hải Châu"
                    value={form.address_line2}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '15px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      fontSize: '0.95rem',
                      padding: '0.85rem 1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FB6376';
                      e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{
                    color: '#5D2A42',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Tỉnh <span style={{ color: '#FB6376' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    placeholder="Ví dụ: Đà Nẵng"
                    value={form.state}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '15px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      fontSize: '0.95rem',
                      padding: '0.85rem 1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FB6376';
                      e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{
                    color: '#5D2A42',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Thành phố <span style={{ color: '#FB6376' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Ví dụ: Quận Hải Châu"
                    value={form.city}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '15px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      fontSize: '0.95rem',
                      padding: '0.85rem 1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FB6376';
                      e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{
                    color: '#5D2A42',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Mã bưu điện
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="postal_code"
                    placeholder="Ví dụ: 550000"
                    value={form.postal_code}
                    onChange={handleChange}
                    style={{
                      borderRadius: '15px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      fontSize: '0.95rem',
                      padding: '0.85rem 1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FB6376';
                      e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{
                    color: '#5D2A42',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Quốc gia <span style={{ color: '#FB6376' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '15px',
                      border: '2px solid rgba(251, 99, 118, 0.2)',
                      fontSize: '0.95rem',
                      padding: '0.85rem 1.2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FB6376';
                      e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="is_default"
                    label="Đặt làm địa chỉ mặc định"
                    checked={form.is_default}
                    onChange={handleChange}
                    style={{
                      color: '#5D2A42',
                      fontWeight: 500
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Button
                type="submit"
                className="btn-book"
                disabled={loading}
                style={{
                  padding: '0.85rem 2.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FaSave />
                {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => navigate('/profile')}
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
      </Container>
      <Footer />
    </div>
  );
}

