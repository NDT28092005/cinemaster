import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Badge from 'react-bootstrap/Badge';
import { FaSearch, FaShoppingCart, FaFilter, FaSort, FaTimes } from 'react-icons/fa';
import { getCategories } from '../../../api/category';
import { getOccasions } from '../../../api/occasion';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const { token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Danh sách sản phẩm - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Khám phá bộ sưu tập quà tặng đa dạng của chúng tôi. Từ quà tặng sinh nhật đến quà kỷ niệm, tìm món quà hoàn hảo cho người thân yêu.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Khám phá bộ sưu tập quà tặng đa dạng của chúng tôi. Từ quà tặng sinh nhật đến quà kỷ niệm, tìm món quà hoàn hảo cho người thân yêu.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Get filter from URL
  useEffect(() => {
    const categoryId = searchParams.get('category_id');
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [searchParams]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.short_description && p.short_description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
    }

    // Filter by occasion
    if (selectedOccasion) {
      filtered = filtered.filter(p => p.occasion_id === parseInt(selectedOccasion));
    }

    // Filter active products only
    filtered = filtered.filter(p => p.is_active !== false);

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedOccasion, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsRes = await axios.get('http://localhost:8000/api/products');
      setProducts(productsRes.data || []);
      
      // Fetch categories
      const categoriesRes = await getCategories();
      setCategories(categoriesRes.data || []);
      
      // Fetch occasions
      const occasionsRes = await getOccasions();
      setOccasions(occasionsRes.data || []);
      
    } catch (err) {
      console.error('Fetch data error:', err);
      setProducts([]);
      setCategories([]);
      setOccasions([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (authLoading) {
      return;
    }

    if (addingProductId === productId) {
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
      setAddingProductId(productId);
      await axios.post(
        "http://localhost:8000/api/cart/add",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      alert("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("❌ Lỗi khi thêm vào giỏ hàng: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingProductId((current) => (current === productId ? null : current));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedOccasion('');
    setSortBy('newest');
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
      <Container className="mt-5 pt-5" style={{ minHeight: '70vh', paddingBottom: '4rem' }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '2.5rem',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <h1 style={{ 
            color: '#5D2A42', 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            letterSpacing: '-0.5px', 
            marginBottom: '1rem'
          }}>
            Danh sách quà tặng
          </h1>
          <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
            Tìm món quà hoàn hảo cho mọi dịp đặc biệt
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card style={{
          marginBottom: '2rem',
          border: 'none',
          borderRadius: '20px',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
          boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
          animation: 'fadeInUp 0.6s ease-out 0.2s both'
        }}>
          <Row className="g-3 align-items-end">
            <Col xs={12} md={6}>
              <Form.Label style={{ color: '#5D2A42', fontWeight: 500, marginBottom: '0.5rem' }}>
                Tìm kiếm sản phẩm
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{
                  background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                  border: 'none',
                  borderRadius: '15px 0 0 15px',
                  color: '#fff'
                }}>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    borderRadius: '0 15px 15px 0',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    padding: '0.85rem',
                    fontSize: '0.95rem'
                  }}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={3}>
              <Form.Label style={{ color: '#5D2A42', fontWeight: 500, marginBottom: '0.5rem' }}>
                Sắp xếp
              </Form.Label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  borderRadius: '15px',
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  padding: '0.85rem',
                  fontSize: '0.95rem'
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá: Thấp → Cao</option>
                <option value="price-high">Giá: Cao → Thấp</option>
                <option value="name">Tên: A → Z</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Button
                className="btn-book w-100"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem'
                }}
              >
                <FaFilter />
                {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
              </Button>
            </Col>
          </Row>

          {/* Advanced Filters */}
          {showFilters && (
            <Row className="g-3 mt-3" style={{
              paddingTop: '1.5rem',
              borderTop: '2px solid rgba(251, 99, 118, 0.1)',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <Col xs={12} md={6}>
                <Form.Label style={{ color: '#5D2A42', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Danh mục
                </Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    borderRadius: '15px',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    padding: '0.85rem',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={6}>
                <Form.Label style={{ color: '#5D2A42', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Dịp lễ
                </Form.Label>
                <Form.Select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  style={{
                    borderRadius: '15px',
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    padding: '0.85rem',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Tất cả dịp lễ</option>
                  {occasions.map(occ => (
                    <option key={occ.id} value={occ.id}>{occ.name}</option>
                  ))}
                </Form.Select>
              </Col>
              {(selectedCategory || selectedOccasion || searchTerm) && (
                <Col xs={12}>
                  <Button
                    variant="outline-secondary"
                    onClick={clearFilters}
                    style={{
                      borderRadius: '15px',
                      padding: '0.5rem 1.5rem',
                      borderColor: '#5D2A42',
                      color: '#5D2A42',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaTimes />
                    Xóa bộ lọc
                  </Button>
                </Col>
              )}
            </Row>
          )}
        </Card>

        {/* Results Count */}
        <div style={{
          marginBottom: '1.5rem',
          color: '#666',
          fontSize: '0.95rem',
          animation: 'fadeInUp 0.6s ease-out 0.4s both'
        }}>
          Tìm thấy <strong style={{ color: '#5D2A42' }}>{filteredProducts.length}</strong> sản phẩm
        </div>

        {/* Products Grid */}
        <Row className="g-4">
          {filteredProducts.length === 0 ? (
            <Col xs={12}>
              <Card style={{
                border: 'none',
                borderRadius: '20px',
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                <FaSearch style={{
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
                  Không tìm thấy sản phẩm
                </h3>
                <p style={{
                  color: '#666',
                  marginBottom: '2rem',
                  fontSize: '1rem'
                }}>
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <Button
                  className="btn-book"
                  onClick={clearFilters}
                  style={{
                    padding: '1rem 2.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </Card>
            </Col>
          ) : (
            filteredProducts.map((p, index) => (
              <Col key={p.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 movie-card" style={{ 
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                border: '2px solid rgba(251, 99, 118, 0.1)',
                borderRadius: '20px',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(93, 42, 66, 0.08)',
                animation: `fadeInUp 0.6s ease-out ${0.5 + index * 0.05}s both`
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
                  background: 'linear-gradient(135deg, rgba(255, 249, 236, 0.5), rgba(255, 220, 204, 0.3))',
                  position: 'relative'
                }}>
                  {p.category && (
                    <Badge style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      zIndex: 2
                    }}>
                      {p.category.name}
                    </Badge>
                  )}
                  <img
                    src={p.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={p.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
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
                    {p.short_description && (
                      <p style={{
                        color: '#666',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {p.short_description}
                      </p>
                    )}
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
                    {p.stock_quantity !== undefined && (
                      <div style={{
                        color: p.stock_quantity > 0 ? '#28a745' : '#dc3545',
                        fontSize: '0.85rem',
                        marginTop: '0.25rem'
                      }}>
                        {p.stock_quantity > 0 ? `Còn ${p.stock_quantity} sản phẩm` : 'Hết hàng'}
                      </div>
                    )}
                  </div>
                  <Button
                    className="btn-book"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p.id);
                    }}
                    disabled={p.stock_quantity === 0 || addingProductId === p.id}
                    style={{
                      width: '100%',
                      borderRadius: '30px',
                      fontWeight: '500',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FaShoppingCart />
                    {p.stock_quantity === 0
                      ? 'Hết hàng'
                      : addingProductId === p.id
                        ? 'Đang thêm...'
                        : 'Thêm vào giỏ'}
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
