import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import { FaShoppingCart, FaStar, FaArrowLeft, FaUser, FaFacebook, FaFacebookMessenger } from 'react-icons/fa';
import Dropdown from 'react-bootstrap/Dropdown';

// Component hiển thị sao đánh giá
const StarRating = ({ rating, onRatingChange, readonly = false, size = '1.2rem' }) => {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          style={{
            color: star <= rating ? '#FFD700' : '#ddd',
            cursor: readonly ? 'default' : 'pointer',
            fontSize: size,
            transition: 'all 0.2s ease',
            filter: star <= rating ? 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!readonly) {
              e.currentTarget.style.transform = 'scale(1.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!readonly) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        />
      ))}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews'); // 'details', 'reviews', 'faqs'
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [reviewSort, setReviewSort] = useState('latest');
  const [addingToCart, setAddingToCart] = useState(false);

  // SEO Meta Tags
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - Cửa hàng quà tặng`;
      const metaDescription = document.querySelector('meta[name="description"]');
      const description = product.short_description || product.full_description || `Khám phá ${product.name} - món quà tặng ý nghĩa và chất lượng cao.`;
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/products/${id}`);
        if (response && response.data) {
          setProduct(response.data);
          // Fetch related products after product is loaded
          fetchRelatedProducts(response.data);
        } else {
          setProduct(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Fetch product error:', error);
        setProduct(null);
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchRelatedProducts = async (currentProduct) => {
    try {
      // Fetch products from same category or occasion
      const params = {};
      if (currentProduct.category_id) {
        params.category_id = currentProduct.category_id;
      }
      if (currentProduct.occasion_id) {
        params.occasion_id = currentProduct.occasion_id;
      }

      const response = await axios.get('http://localhost:8000/api/products', { params });
      const allProducts = response.data || [];
      
      // Filter out current product and inactive products, then take 4 products
      const related = allProducts
        .filter(p => p.id !== currentProduct.id && p.is_active !== false)
        .slice(0, 4);
      
      setRelatedProducts(related);
    } catch (error) {
      console.error('Fetch related products error:', error);
      setRelatedProducts([]);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await axios.get('http://localhost:8000/api/reviews/');
        // Filter reviews theo product_id và chỉ lấy reviews không bị block
        const allReviews = Array.isArray(response && response.data) ? response.data : [];
        const productReviews = allReviews.filter(
          review => review && review.product_id === parseInt(id) && !review.is_blocked
        );
        setReviews(productReviews);
        setReviewsLoading(false);
      } catch (error) {
        console.error('Fetch reviews error:', error);
        setReviews([]);
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  const addToCart = async () => {
    if (authLoading || addingToCart) {
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
      setAddingToCart(true);
      await axios.post(
        "http://localhost:8000/api/cart/add",
        { product_id: id, quantity: quantity },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      alert("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Add to cart error:", err);
      const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || "Lỗi khi thêm vào giỏ hàng";
      alert("❌ " + errorMsg);
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Facebook Share Functions
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent(`${product.name} - ${product.short_description || ''}`);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnMessenger = () => {
    const url = encodeURIComponent(window.location.href);
    // Use Facebook Send Dialog for sharing via Messenger
    const shareUrl = `https://www.facebook.com/dialog/send?link=${url}&redirect_uri=${encodeURIComponent(window.location.href)}`;
    // For mobile devices, try to use messenger app
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Try to open in Messenger app first, fallback to web
      const messengerUrl = `fb-messenger://share?link=${url}`;
      window.location.href = messengerUrl;
      // Fallback after a short delay if app doesn't open
      setTimeout(() => {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }, 500);
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
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

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const submitReview = async () => {
    if (!user || !user.id) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert('Vui lòng chọn số sao đánh giá!');
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
      setSubmittingReview(true);
      await axios.post(
        'http://localhost:8000/api/reviews/',
        {
          product_id: parseInt(id),
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment || null
        },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      
      // Refresh reviews
      const response = await axios.get('http://localhost:8000/api/reviews/');
      const allReviews = Array.isArray(response && response.data) ? response.data : [];
      const productReviews = allReviews.filter(
        review => review && review.product_id === parseInt(id) && !review.is_blocked
      );
      setReviews(productReviews);
      
      // Reset form
      setReviewRating(5);
      setReviewComment('');
      setShowReviewForm(false);
      alert('✅ Đánh giá của bạn đã được gửi thành công!');
    } catch (err) {
      console.error('Submit review error:', err);
      const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại!";
      alert('❌ ' + errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <Container style={{ paddingTop: '180px', paddingBottom: '80px', minHeight: '70vh' }}>
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

  if (!product) {
    return (
      <div>
        <Header />
        <Container style={{ paddingTop: '180px', paddingBottom: '80px', minHeight: '70vh' }}>
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ color: '#5D2A42' }}>Không tìm thấy sản phẩm</h2>
            <Button onClick={() => navigate('/products')} style={{ marginTop: '1rem' }}>
              <FaArrowLeft style={{ marginRight: '0.5rem' }} />
              Quay lại danh sách
            </Button>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_url) 
    : ['https://via.placeholder.com/600x600?text=No+Image'];

  return (
    <div>
      <Header />
      <Container style={{ paddingTop: '180px', paddingBottom: '80px' }}>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          style={{ 
            marginBottom: '2rem',
            borderRadius: '25px',
            padding: '0.5rem 1.5rem',
            borderColor: '#5D2A42',
            color: '#5D2A42'
          }}
        >
          <FaArrowLeft style={{ marginRight: '0.5rem' }} />
          Quay lại
        </Button>

        <Row>
          {/* Product Images - Layout mới với thumbnails bên trái */}
          <Col md={6}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Thumbnail Images - Bên trái */}
              {images.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.75rem',
                  width: '80px',
                  flexShrink: 0
                }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImageIndex === idx ? '3px solid #FB6376' : '2px solid rgba(93, 42, 66, 0.2)',
                        transition: 'all 0.3s ease',
                        opacity: selectedImageIndex === idx ? 1 : 0.7,
                        background: '#f8f8f8'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedImageIndex !== idx) {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedImageIndex !== idx) {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = 'rgba(93, 42, 66, 0.2)';
                        }
                      }}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Main Image - Ở giữa */}
              <div style={{ flex: 1 }}>
                <Card style={{ 
                  border: 'none', 
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(93, 42, 66, 0.1)',
                  marginBottom: 0
                }}>
                  <div style={{
                    width: '100%',
                    paddingTop: '100%',
                    position: 'relative',
                    background: '#f8f8f8',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={images[selectedImageIndex] || images[0]}
                      alt={product.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </Card>
              </div>
            </div>
          </Col>

          {/* Product Info */}
          <Col md={6}>
            <Card style={{ 
              border: 'none', 
              borderRadius: '20px',
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
              boxShadow: '0 10px 40px rgba(93, 42, 66, 0.1)'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                {product.category && (
                  <Badge style={{
                    background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    border: 'none'
                  }}>
                    {product.category.name}
                  </Badge>
                )}
                <h1 style={{
                  color: '#5D2A42',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  lineHeight: '1.3'
                }}>
                  {product.name}
                </h1>
                {/* Rating Display */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  {!reviewsLoading && reviews.length > 0 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <StarRating rating={Math.round(calculateAverageRating())} readonly={true} size="1.2rem" />
                        <span style={{ 
                          color: '#5D2A42', 
                          fontWeight: 600, 
                          fontSize: '1rem' 
                        }}>
                          {calculateAverageRating()}
                        </span>
                      </div>
                      <span style={{ 
                        color: '#5D2A42', 
                        opacity: 0.7, 
                        fontSize: '0.95rem' 
                      }}>
                        {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                      </span>
                    </>
                  )}
                  {!reviewsLoading && reviews.length === 0 && (
                    <span style={{ 
                      color: '#5D2A42', 
                      opacity: 0.7, 
                      fontSize: '0.95rem' 
                    }}>
                      Chưa có đánh giá
                    </span>
                  )}
                </div>
                {product.short_description && (
                  <p style={{
                    color: '#5D2A42',
                    fontSize: '1.1rem',
                    opacity: 0.8,
                    marginBottom: '1.5rem',
                    lineHeight: '1.6'
                  }}>
                    {product.short_description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#5D2A42'
                  }}>
                    {formatPrice(Number(product.price))}
                  </div>
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <>
                      <span style={{
                        fontSize: '1.2rem',
                        color: '#5D2A42',
                        opacity: 0.5,
                        textDecoration: 'line-through'
                      }}>
                        {formatPrice(Number(product.original_price))}
                      </span>
                      <Badge style={{
                        background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.85rem',
                        border: 'none'
                      }}>
                        -{Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.short_description && (
                <p style={{
                  color: '#5D2A42',
                  fontSize: '1rem',
                  opacity: 0.8,
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  {product.short_description}
                </p>
              )}

              {/* Color Options */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ 
                  color: '#5D2A42', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  display: 'block',
                  marginBottom: '0.75rem'
                }}>
                  Màu sắc:
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {['#556B2F', '#1E3A8A', '#000000'].map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: selectedColor === color ? '3px solid #FB6376' : '2px solid rgba(93, 42, 66, 0.2)',
                        background: color,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedColor === color ? '0 4px 12px rgba(251, 99, 118, 0.4)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedColor !== color) {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedColor !== color) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = 'rgba(93, 42, 66, 0.2)';
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Options */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ 
                  color: '#5D2A42', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  display: 'block',
                  marginBottom: '0.75rem'
                }}>
                  Kích thước:
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {['Small', 'Medium', 'Large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '0.5rem 1.5rem',
                        borderRadius: '8px',
                        border: selectedSize === size 
                          ? '2px solid #FB6376' 
                          : '2px solid rgba(93, 42, 66, 0.2)',
                        background: selectedSize === size 
                          ? 'rgba(251, 99, 118, 0.1)' 
                          : 'transparent',
                        color: '#5D2A42',
                        fontWeight: selectedSize === size ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '0.95rem'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSize !== size) {
                          e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.5)';
                          e.currentTarget.style.background = 'rgba(251, 99, 118, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSize !== size) {
                          e.currentTarget.style.borderColor = 'rgba(93, 42, 66, 0.2)';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '1.5rem'
              }}>
                <span style={{ color: '#5D2A42', fontWeight: 600, fontSize: '0.95rem' }}>Số lượng:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '2px solid rgba(93, 42, 66, 0.2)', borderRadius: '8px', padding: '0.25rem' }}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      color: '#5D2A42',
                      fontSize: '1.2rem',
                      fontWeight: 600
                    }}
                  >
                    -
                  </Button>
                  <span style={{
                    minWidth: '40px',
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#5D2A42'
                  }}>
                    {quantity}
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      borderRadius: '6px',
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      color: '#5D2A42',
                      fontSize: '1.2rem',
                      fontWeight: 600
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={addToCart}
                disabled={addingToCart}
                style={{
                  background: '#5D2A42',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  marginBottom: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FB6376';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 99, 118, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#5D2A42';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <FaShoppingCart style={{ marginRight: '0.5rem' }} />
                {addingToCart ? 'Đang thêm...' : 'Add to Cart'}
              </Button>

              {/* Facebook Share Button */}
              <Dropdown style={{ width: '100%' }}>
                <Dropdown.Toggle
                  style={{
                    background: 'linear-gradient(135deg, #1877F2, #42A5F5)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'white',
                    width: '100%',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1565C0, #1976D2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 119, 242, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1877F2, #42A5F5)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaFacebook style={{ fontSize: '1.2rem' }} />
                  Chia sẻ Facebook
                </Dropdown.Toggle>
                <Dropdown.Menu style={{
                  borderRadius: '8px',
                  border: '2px solid rgba(93, 42, 66, 0.1)',
                  boxShadow: '0 4px 15px rgba(93, 42, 66, 0.15)',
                  padding: '0.5rem',
                  minWidth: '200px'
                }}>
                  <Dropdown.Item
                    onClick={shareOnFacebook}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      color: '#5D2A42',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(24, 119, 242, 0.1)';
                      e.currentTarget.style.color = '#1877F2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#5D2A42';
                    }}
                  >
                    <FaFacebook style={{ fontSize: '1.1rem', color: '#1877F2' }} />
                    <span style={{ fontWeight: 500 }}>Chia sẻ lên News Feed</span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={shareOnMessenger}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      color: '#5D2A42',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 132, 255, 0.1)';
                      e.currentTarget.style.color = '#0084FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#5D2A42';
                    }}
                  >
                    <FaFacebookMessenger style={{ fontSize: '1.1rem', color: '#0084FF' }} />
                    <span style={{ fontWeight: 500 }}>Chia sẻ qua Messenger</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card>
          </Col>
        </Row>

        {/* Product Information Tabs */}
        <Row style={{ marginTop: '3rem' }}>
          <Col xs={12}>
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              padding: '0',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
              boxShadow: '0 10px 40px rgba(93, 42, 66, 0.1)',
              overflow: 'hidden'
            }}>
              {/* Tabs Navigation */}
              <div style={{
                display: 'flex',
                borderBottom: '2px solid rgba(93, 42, 66, 0.1)',
                background: '#fff'
              }}>
                {[
                  { id: 'details', label: 'Product Details' },
                  { id: 'reviews', label: 'Ratings & Reviews' },
                  { id: 'faqs', label: 'FAQs' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '1.5rem 2rem',
                      border: 'none',
                      background: 'transparent',
                      color: activeTab === tab.id ? '#5D2A42' : 'rgba(93, 42, 66, 0.6)',
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      borderBottom: activeTab === tab.id ? '3px solid #FB6376' : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.color = '#5D2A42';
                        e.currentTarget.style.background = 'rgba(251, 99, 118, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.color = 'rgba(93, 42, 66, 0.6)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: '2.5rem' }}>
                {activeTab === 'details' && (
                  <div>
                    <h3 style={{
                      color: '#5D2A42',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      marginBottom: '1.5rem'
                    }}>
                      Product Details
                    </h3>
                    {product.full_description ? (
                      <div style={{
                        color: '#5D2A42',
                        fontSize: '1rem',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-line',
                        opacity: 0.8
                      }}>
                        {product.full_description}
                      </div>
                    ) : (
                      <p style={{ color: '#5D2A42', opacity: 0.7 }}>
                        Không có thông tin chi tiết về sản phẩm này.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    {/* Reviews Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '2rem',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <h3 style={{
                        color: '#5D2A42',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        margin: 0
                      }}>
                        All Reviews ({reviews.length})
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Form.Select
                          value={reviewSort}
                          onChange={(e) => setReviewSort(e.target.value)}
                          style={{
                            borderRadius: '8px',
                            border: '2px solid rgba(93, 42, 66, 0.2)',
                            padding: '0.5rem 1rem',
                            color: '#5D2A42',
                            fontSize: '0.95rem',
                            background: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="latest">Latest</option>
                          <option value="oldest">Oldest</option>
                          <option value="highest">Highest Rating</option>
                          <option value="lowest">Lowest Rating</option>
                        </Form.Select>
                        {user && (
                          <Button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            style={{
                              background: showReviewForm 
                                ? '#5D2A42' 
                                : 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem 1.5rem',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              color: 'white',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {showReviewForm ? 'Cancel' : 'Write a Review'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && user && (
                <Card style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  background: '#fff'
                }}>
                  <h4 style={{
                    color: '#5D2A42',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}>
                    Đánh giá của bạn
                  </h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      color: '#5D2A42',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      display: 'block'
                    }}>
                      Số sao đánh giá *
                    </label>
                    <StarRating 
                      rating={reviewRating} 
                      onRatingChange={setReviewRating}
                      readonly={false}
                      size="1.5rem"
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Form.Label style={{
                      color: '#5D2A42',
                      fontWeight: 500,
                      marginBottom: '0.5rem'
                    }}>
                      Nhận xét của bạn
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      style={{
                        borderRadius: '10px',
                        border: '2px solid rgba(251, 99, 118, 0.2)',
                        padding: '0.75rem',
                        fontSize: '1rem',
                        color: '#5D2A42',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      style={{
                        borderRadius: '25px',
                        padding: '0.5rem 1.5rem',
                        borderColor: '#5D2A42',
                        color: '#5D2A42'
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={submitReview}
                      disabled={submittingReview}
                      style={{
                        background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '0.5rem 1.5rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(251, 99, 118, 0.3)'
                      }}
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                  </div>
                </Card>
              )}

                    {!user && !showReviewForm && (
                      <div style={{
                        padding: '1.5rem',
                        background: 'rgba(251, 99, 118, 0.1)',
                        borderRadius: '15px',
                        marginBottom: '2rem',
                        textAlign: 'center'
                      }}>
                        <p style={{ color: '#5D2A42', margin: 0, marginBottom: '1rem' }}>
                          Đăng nhập để viết đánh giá về sản phẩm này
                        </p>
                        <Button
                          onClick={() => navigate('/login', { state: { from: location.pathname } })}
                          style={{
                            background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1.5rem',
                            fontWeight: 600,
                            color: 'white'
                          }}
                        >
                          Đăng nhập
                        </Button>
                      </div>
                    )}

                    {/* Reviews List - 2 columns layout */}
                    {reviewsLoading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '3rem'
                      }}>
                        <div className="loading-spinner" style={{ 
                          width: '40px', 
                          height: '40px', 
                          border: '4px solid rgba(251, 99, 118, 0.2)', 
                          borderTopColor: '#FB6376', 
                          borderRadius: '50%', 
                          animation: 'spin 1s linear infinite'
                        }}></div>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#5D2A42',
                        opacity: 0.7
                      }}>
                        <FaStar style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '1.1rem', margin: 0 }}>
                          Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                        </p>
                      </div>
                    ) : (
                      <Row className="g-3">
                        {reviews.map((review) => (
                          <Col key={review.review_id} xs={12} md={6}>
                            <Card
                              style={{
                                border: '1px solid rgba(251, 99, 118, 0.15)',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                background: '#fff',
                                height: '100%',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.15)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.75rem',
                                gap: '0.75rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                  }}>
                                    <FaUser />
                                  </div>
                                  <div>
                                    <div style={{
                                      color: '#5D2A42',
                                      fontWeight: 600,
                                      fontSize: '0.95rem',
                                      marginBottom: '0.25rem'
                                    }}>
                                      {(review.user && review.user.name) || 'Người dùng'}
                                    </div>
                                    <div style={{
                                      color: '#5D2A42',
                                      opacity: 0.6,
                                      fontSize: '0.8rem'
                                    }}>
                                      {formatDate(review.created_at)}
                                    </div>
                                  </div>
                                </div>
                                <StarRating rating={review.rating} readonly={true} size="1rem" />
                              </div>
                              {review.comment && (
                                <div style={{
                                  color: '#5D2A42',
                                  fontSize: '0.9rem',
                                  lineHeight: '1.6',
                                  padding: '0.75rem',
                                  background: 'rgba(251, 99, 118, 0.05)',
                                  borderRadius: '8px',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {review.comment}
                                </div>
                              )}
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
                )}

                {activeTab === 'faqs' && (
                  <div>
                    <h3 style={{
                      color: '#5D2A42',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      marginBottom: '1.5rem'
                    }}>
                      Frequently Asked Questions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        {
                          question: 'Làm thế nào để đặt hàng?',
                          answer: 'Bạn có thể thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau.'
                        },
                        {
                          question: 'Thời gian giao hàng là bao lâu?',
                          answer: 'Thời gian giao hàng thường từ 3-7 ngày làm việc tùy thuộc vào địa chỉ giao hàng của bạn.'
                        },
                        {
                          question: 'Có thể đổi trả sản phẩm không?',
                          answer: 'Có, chúng tôi hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn và chưa sử dụng.'
                        }
                      ].map((faq, index) => (
                        <Card
                          key={index}
                          style={{
                            border: '1px solid rgba(251, 99, 118, 0.15)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            background: '#fff',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{
                            color: '#5D2A42',
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginBottom: '0.75rem'
                          }}>
                            {faq.question}
                          </div>
                          <div style={{
                            color: '#5D2A42',
                            fontSize: '0.95rem',
                            opacity: 0.8,
                            lineHeight: '1.6'
                          }}>
                            {faq.answer}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Related Products - "You Might Also Like" */}
        {relatedProducts.length > 0 && (
          <Row style={{ marginTop: '4rem' }}>
            <Col xs={12}>
              <h3 style={{
                color: '#5D2A42',
                fontSize: '1.8rem',
                fontWeight: 700,
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                YOU MIGHT ALSO LIKE
              </h3>
              <Row className="g-4">
                {relatedProducts.map((relatedProduct) => (
                  <Col key={relatedProduct.id} xs={12} sm={6} md={3}>
                    <Card
                      style={{
                        background: '#fff',
                        border: '1px solid rgba(93, 42, 66, 0.1)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(93, 42, 66, 0.08)',
                        height: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(251, 99, 118, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(93, 42, 66, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(93, 42, 66, 0.1)';
                      }}
                      onClick={() => navigate(`/products/${relatedProduct.id}`)}
                    >
                      <div style={{
                        width: '100%',
                        height: '280px',
                        overflow: 'hidden',
                        background: '#f8f8f8'
                      }}>
                        <img
                          src={relatedProduct.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                          alt={relatedProduct.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'all 0.3s ease'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                      </div>
                      <Card.Body style={{
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <Card.Title style={{
                          color: '#5D2A42',
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          marginBottom: '0.5rem',
                          lineHeight: '1.4',
                          minHeight: '2.8rem'
                        }}>
                          {relatedProduct.name}
                        </Card.Title>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <StarRating rating={5} readonly={true} size="0.9rem" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{
                            color: '#5D2A42',
                            fontSize: '1.1rem',
                            fontWeight: 700
                          }}>
                            {formatPrice(Number(relatedProduct.price))}
                          </span>
                          {relatedProduct.original_price && Number(relatedProduct.original_price) > Number(relatedProduct.price) && (
                            <span style={{
                              color: '#5D2A42',
                              fontSize: '0.9rem',
                              opacity: 0.5,
                              textDecoration: 'line-through'
                            }}>
                              {formatPrice(Number(relatedProduct.original_price))}
                            </span>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}
      </Container>
      <Footer />
    </div>
  );
}

