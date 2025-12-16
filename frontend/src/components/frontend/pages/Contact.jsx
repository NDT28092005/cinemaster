import React, { useEffect, useState } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Liên hệ - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Liên hệ với chúng tôi tại Phường Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh. Chúng tôi luôn sẵn sàng hỗ trợ bạn.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Liên hệ với chúng tôi tại Phường Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh. Chúng tôi luôn sẵn sàng hỗ trợ bạn.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        'http://localhost:8000/api/contact',
        formData,
        { headers }
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Maps Embed - Không cần API key
  const address = "Phường Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh";
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: 'Địa chỉ',
      content: 'Phường Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh',
      link: 'https://maps.google.com/?q=Phường+Linh+Trung,+Thủ+Đức,+Hồ+Chí+Minh'
    },
    {
      icon: <FaPhone />,
      title: 'Điện thoại',
      content: '0123 456 789',
      link: 'tel:0123456789'
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      content: 'contact@quatang.com',
      link: 'mailto:contact@quatang.com'
    },
    {
      icon: <FaClock />,
      title: 'Giờ làm việc',
      content: 'Thứ 2 - Chủ nhật: 8:00 - 22:00',
      link: null
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, name: 'Facebook', url: 'https://facebook.com' },
    { icon: <FaInstagram />, name: 'Instagram', url: 'https://instagram.com' },
    { icon: <FaYoutube />, name: 'YouTube', url: 'https://youtube.com' }
  ];

  return (
    <div>
      <Header />
      <div style={{ paddingTop: '120px', minHeight: '100vh', position: 'relative' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(255, 249, 236, 0.8), rgba(255, 220, 204, 0.6))',
          padding: '4rem 0',
          marginBottom: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 30% 50%, rgba(251, 99, 118, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}></div>
          <Container style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', animation: 'fadeInUp 0.8s ease-out' }}>
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #5D2A42, #FB6376, #FCB1A6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1.5rem',
                letterSpacing: '-1px'
              }}>
                Liên hệ với chúng tôi
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#666',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.8'
              }}>
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh sau.
              </p>
            </div>
          </Container>
        </section>

        {/* Contact Info Section */}
        <Container style={{ marginBottom: '4rem' }}>
          <Row className="g-4">
            {contactInfo.map((info, index) => (
              <Col key={index} xs={12} sm={6} md={3}>
                <Card style={{
                  border: 'none',
                  borderRadius: '20px',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                  boxShadow: '0 8px 25px rgba(93, 42, 66, 0.08)',
                  height: '100%',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both`,
                  cursor: info.link ? 'pointer' : 'default',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (info.link) {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(251, 99, 118, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (info.link) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(93, 42, 66, 0.08)';
                  }
                }}
                onClick={() => {
                  if (info.link) {
                    window.open(info.link, '_blank');
                  }
                }}
                >
                  <div style={{
                    fontSize: '3rem',
                    color: '#FB6376',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    {info.icon}
                  </div>
                  <h3 style={{
                    color: '#5D2A42',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}>
                    {info.title}
                  </h3>
                  <p style={{
                    color: '#666',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {info.content}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        {/* Map and Contact Form Section */}
        <Container style={{ marginBottom: '4rem' }}>
          <Row className="g-4">
            {/* Google Map */}
            <Col md={6}>
              <Card style={{
                border: 'none',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(93, 42, 66, 0.1)',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                <div style={{
                  height: '500px',
                  width: '100%',
                  position: 'relative',
                  background: '#f5f5f5',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}>
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      borderRadius: '20px'
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Địa chỉ cửa hàng - Phường Linh Trung, Thủ Đức, Hồ Chí Minh"
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }}>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#FB6376',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FaMapMarkerAlt /> Mở trong Google Maps
                    </a>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Contact Form */}
            <Col md={6}>
              <Card style={{
                border: 'none',
                borderRadius: '20px',
                padding: '2.5rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                boxShadow: '0 10px 40px rgba(93, 42, 66, 0.1)',
                height: '100%',
                animation: 'fadeInUp 0.6s ease-out 0.2s both'
              }}>
                <h2 style={{
                  color: '#5D2A42',
                  fontSize: '2rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  position: 'relative',
                  paddingBottom: '1rem'
                }}>
                  Gửi tin nhắn cho chúng tôi
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #FB6376, #FCB1A6)',
                    borderRadius: '2px'
                  }}></span>
                </h2>
                {success && (
                  <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))',
                    border: '2px solid #4CAF50',
                    borderRadius: '10px',
                    color: '#2E7D32',
                    textAlign: 'center',
                    fontWeight: 600
                  }}>
                    ✓ Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
                  </div>
                )}
                {error && (
                  <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(239, 154, 154, 0.1))',
                    border: '2px solid #F44336',
                    borderRadius: '10px',
                    color: '#C62828',
                    textAlign: 'center',
                    fontWeight: 600
                  }}>
                    ✗ {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#5D2A42',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}>
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '2px solid rgba(251, 99, 118, 0.15)',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FB6376';
                        e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(251, 99, 118, 0.15)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#5D2A42',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '2px solid rgba(251, 99, 118, 0.15)',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FB6376';
                        e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(251, 99, 118, 0.15)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#5D2A42',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '2px solid rgba(251, 99, 118, 0.15)',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FB6376';
                        e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(251, 99, 118, 0.15)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#5D2A42',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}>
                      Tin nhắn *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '2px solid rgba(251, 99, 118, 0.15)',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: 'white',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FB6376';
                        e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(251, 99, 118, 0.15)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '1rem 2rem',
                      background: loading 
                        ? 'linear-gradient(135deg, #ccc, #999)' 
                        : 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: loading 
                        ? 'none' 
                        : '0 4px 15px rgba(251, 99, 118, 0.3)',
                      opacity: loading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 99, 118, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.3)';
                      }
                    }}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                  </button>
                </form>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Social Media Section */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(255, 249, 236, 0.5), rgba(255, 220, 204, 0.3))',
          padding: '4rem 0',
          marginBottom: '4rem'
        }}>
          <Container>
            <h2 style={{
              textAlign: 'center',
              color: '#5D2A42',
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '3rem',
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              Theo dõi chúng tôi
            </h2>
            <Row className="g-4 justify-content-center">
              {socialLinks.map((social, index) => (
                <Col key={index} xs={6} sm={4} md={3}>
                  <Card
                    style={{
                      border: 'none',
                      borderRadius: '20px',
                      padding: '2rem',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                      boxShadow: '0 8px 25px rgba(93, 42, 66, 0.08)',
                      textAlign: 'center',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `fadeInUp 0.6s ease-out ${0.3 + index * 0.1}s both`,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(251, 99, 118, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(93, 42, 66, 0.08)';
                    }}
                    onClick={() => window.open(social.url, '_blank')}
                  >
                    <div style={{
                      fontSize: '3rem',
                      color: '#FB6376',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      {social.icon}
                    </div>
                    <h3 style={{
                      color: '#5D2A42',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      margin: 0
                    }}>
                      {social.name}
                    </h3>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;

