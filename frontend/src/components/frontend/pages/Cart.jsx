import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaShoppingCart, FaTrash, FaArrowRight } from "react-icons/fa";

export default function Cart() {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Giỏ hàng của bạn - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Xem và quản lý giỏ hàng của bạn. Thanh toán nhanh chóng và an toàn với nhiều phương thức thanh toán.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Xem và quản lý giỏ hàng của bạn. Thanh toán nhanh chóng và an toàn với nhiều phương thức thanh toán.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Lấy giỏ hàng
  const fetchCart = () => {
    if (authLoading) return;
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    axios
      .get("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${currentToken}` },
      })
      .then((res) => {
        setCart(res.data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Fetch cart error:", err);
        setError(err.response?.data?.message || "Lỗi khi tải giỏ hàng");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, [token, authLoading, navigate, location]);

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (itemId, productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId, productId);
      return;
    }

    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      alert("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }

    try {
      const currentItem = cart.items.find(item => item.id === itemId);
      const currentQuantity = currentItem?.quantity || 0;
      const quantityDiff = newQuantity - currentQuantity;

      if (quantityDiff === 0) return;

      await axios.post(
        "http://localhost:8000/api/cart/add",
        { product_id: productId, quantity: quantityDiff },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      
      fetchCart();
    } catch (err) {
      console.error("Update quantity error:", err);
      alert("❌ Lỗi khi cập nhật số lượng: " + (err.response?.data?.message || err.message));
    }
  };
  const updateQuantity = (cartId, newQty) => {
    const currentToken = token || localStorage.getItem("token");

    axios.put("http://localhost:8000/api/cart/update", {
      cart_id: cartId,
      quantity: newQty
    }, {
      headers: { Authorization: `Bearer ${currentToken}` }
    })
      .then(res => {
        setCart(res.data);
      })
      .catch(err => console.error(err));
  };

  const removeFromCart = (cartId) => {
    const currentToken = token || localStorage.getItem("token");

    axios.delete("http://localhost:8000/api/cart/remove", {
      headers: { Authorization: `Bearer ${currentToken}` },
      data: { cart_id: cartId }
    })
      .then(res => {
        setCart(res.data);
      })
      .catch(err => console.error(err));
  };
  // Poll Google Sheet
  const checkPaymentFromGoogleAPI = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyjHTm8gtq_qPG_GUEV970kCuAFuhGd3dlEqqPjK-zsvUssBzdeOuc0si8BjVx31nj9/exec"
      );
      const data = await response.json();
      if (!data?.data?.length) return;

    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      alert("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }

    try {
      const currentItem = cart.items.find(item => item.id === itemId);
      const currentQuantity = currentItem?.quantity || 1;

      await axios.post(
        "http://localhost:8000/api/cart/add",
        { product_id: productId, quantity: -currentQuantity },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      
      fetchCart();
    } catch (err) {
      console.error("Remove item error:", err);
      try {
        const otherItems = cart.items.filter(item => item.id !== itemId);
        await axios.delete("http://localhost:8000/api/cart/clear-cart", {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        
        for (const item of otherItems) {
          await axios.post(
            "http://localhost:8000/api/cart/add",
            { product_id: item.product_id || item.product?.id, quantity: item.quantity },
            { headers: { Authorization: `Bearer ${currentToken}` } }
          );
        }
        
        fetchCart();
      } catch (fallbackErr) {
        console.error("Fallback remove error:", fallbackErr);
        alert("❌ Lỗi khi xóa sản phẩm: " + (fallbackErr.response?.data?.message || fallbackErr.message));
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert("Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.");
      return;
    }
    navigate("/checkout");
  };

  if (authLoading || loading) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5">
          <div className="cart-loading-container">
            <div className="cart-loading-spinner"></div>
            <p className="cart-loading-text">Đang tải giỏ hàng...</p>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5">
          <Card className="cart-error-card">
            <Card.Body>
              <h2 className="cart-error-title">Giỏ hàng</h2>
              <p className="cart-error-text">{error}</p>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <Header />
      <Container className="mt-5 pt-5 cart-container">
        <div className="cart-header-section">
          <h1 className="cart-title">
            <FaShoppingCart /> Giỏ hàng của bạn
          </h1>
          <p className="cart-subtitle">
            Quản lý sản phẩm trong giỏ hàng và tiến hành thanh toán
          </p>
        </div>

        {error && (
          <div className="alert alert-danger cart-alert">
            {error}
          </div>
        )}

        <Row>
          <Col md={8}>
            <Card className="cart-items-card">
              <Card.Body>
                {cart?.items?.length > 0 ? (
                  <div className="cart-items-list">
                    {cart.items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="cart-item"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${0.1 * index}s both`
                        }}
                      >
                        <div className="cart-item-content">
                          <div 
                            className="cart-item-image"
                            onClick={() => navigate(`/products/${item.product_id || item.product?.id}`)}
                          >
                            <img
                              src={item.product?.images?.[0]?.image_url || item.product?.image_url || 'https://via.placeholder.com/100'}
                              alt={item.product?.name || 'Sản phẩm'}
                            />
                          </div>
                          
                          <div className="cart-item-info">
                            <h5 
                              className="cart-item-name"
                              onClick={() => navigate(`/products/${item.product_id || item.product?.id}`)}
                            >
                              {item.product?.name || "Unknown Product"}
                            </h5>
                            
                            <div className="cart-item-controls">
                              <div className="quantity-controls">
                                <span className="quantity-label">Số lượng:</span>
                                <div className="quantity-buttons">
                                  <button
                                    className="quantity-btn"
                                    onClick={() => updateQuantity(item.id, item.product_id || item.product?.id, Math.max(1, item.quantity - 1))}
                                  >
                                    -
                                  </button>
                                  <span className="quantity-value">{item.quantity}</span>
                                  <button
                                    className="quantity-btn"
                                    onClick={() => {
                                      const maxStock = item.product?.stock_quantity || 999;
                                      updateQuantity(item.id, item.product_id || item.product?.id, Math.min(maxStock, item.quantity + 1));
                                    }}
                                    disabled={item.quantity >= (item.product?.stock_quantity || 999)}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="cart-item-price">
                                <span className="price-label">Giá:</span>
                                <span className="price-value">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                                <span className="price-unit">({formatPrice(item.product?.price || 0)} x {item.quantity})</span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="cart-item-remove"
                            onClick={() => removeItem(item.id, item.product_id || item.product?.id)}
                            title="Xóa sản phẩm"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cart-empty">
                    <FaShoppingCart className="cart-empty-icon" />
                    <h3>Giỏ hàng trống</h3>
                    <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                    <Button 
                      className="btn-book" 
                      onClick={() => navigate('/products')}
                    >
                      Mua sắm ngay
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="cart-summary-card">
              <Card.Body>
                <h2 className="cart-summary-title">Tổng đơn hàng</h2>
                
                <div className="cart-summary-details">
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(cart?.total_amount || 0)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span className="shipping-free">Miễn phí</span>
                  </div>
                  <hr className="summary-divider" />
                  <div className="summary-total">
                    <span>Tổng cộng:</span>
                    <span className="total-amount">
                      {formatPrice(cart?.total_amount || 0)}
                    </span>
                  </div>
                </div>

                {cart?.items?.length > 0 && (
                  <Button
                    className="btn-book w-100 checkout-button"
                    onClick={handleCheckout}
                    disabled={!cart?.items?.length}
                  >
                    Thanh toán <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}
