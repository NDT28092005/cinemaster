import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch products error:', err);
        setLoading(false);
      });
  }, []);

  const addToCart = async (productId) => {
    if (authLoading) {
      return;
    }
    
    const tokenFromContext = token;
    let tokenFromStorage = localStorage.getItem('token');
    
    if (tokenFromStorage === 'undefined' || tokenFromStorage === 'null') {
      localStorage.removeItem('token');
      tokenFromStorage = null;
    }
    
    const currentToken = tokenFromContext || tokenFromStorage;
    
    if (!currentToken || currentToken === 'undefined' || currentToken === 'null') {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/cart/add",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      alert("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("❌ Lỗi khi thêm vào giỏ hàng");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (loading) {
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
              animation: 'spin 1s linear infinite',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                inset: '-5px',
                border: '5px solid transparent',
                borderTopColor: 'rgba(251, 99, 118, 0.1)',
                borderRadius: '50%',
                animation: 'spin 1.5s linear infinite reverse'
              }}></div>
            </div>
            <p style={{ color: '#5D2A42', fontSize: '1rem', fontWeight: '500', margin: 0 }}>Đang tải sản phẩm...</p>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Container className="mt-5 pt-5" style={{ minHeight: '70vh' }}>
        <h2 className="mb-4" style={{ color: '#5D2A42', fontSize: '2rem', fontWeight: '600', letterSpacing: '-0.5px', position: 'relative', display: 'inline-block' }}>
          Danh sách quà tặng
        </h2>
        <Row className="g-4">
          {products.length === 0 ? (
            <Col xs={12}>
              <div className="text-center" style={{ color: '#5D2A42', padding: '40px' }}>
                <p>Chưa có sản phẩm nào</p>
              </div>
            </Col>
          ) : (
            products.map(p => (
              <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 movie-card" style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                  border: '2px solid rgba(251, 99, 118, 0.1)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(93, 42, 66, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(251, 99, 118, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(93, 42, 66, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.1)';
                }}
                onClick={() => navigate(`/products/${p.id}`)}
                >
                  <div style={{ 
                    width: '100%', 
                    height: '320px', 
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(255, 249, 236, 0.5), rgba(255, 220, 204, 0.3))'
                  }}>
                    <img
                      src={p.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={p.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(1deg)';
                        e.currentTarget.style.filter = 'brightness(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    />
                  </div>
                  <Card.Body style={{ 
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    background: 'linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.95))'
                  }}>
                    <div>
                      <Card.Title style={{ 
                        color: '#5D2A42', 
                        fontSize: '1.05rem', 
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        lineHeight: '1.5',
                        transition: 'color 0.3s'
                      }}>
                        {p.name}
                      </Card.Title>
                      <div style={{ 
                        background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '1.3rem', 
                        fontWeight: 700,
                        letterSpacing: '-0.3px'
                      }}>
                        {formatPrice(Number(p.price))}
                      </div>
                    </div>
                    <Button
                      className="btn-book"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p.id);
                      }}
                      style={{
                        width: '100%',
                        borderRadius: '30px',
                        fontWeight: '500',
                        padding: '0.85rem',
                        fontSize: '0.95rem'
                      }}
                    >
                      Thêm vào giỏ
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
      <Footer />
    </div>
  );
}
