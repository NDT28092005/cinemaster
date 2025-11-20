import React, { useState, useEffect, useContext, useRef } from "react";
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
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import { FaCheckCircle, FaClock, FaTimesCircle, FaArrowLeft, FaCreditCard, FaMapMarkerAlt, FaPlus } from "react-icons/fa";

export default function Checkout() {
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerProvince, setCustomerProvince] = useState("");
  const [customerDistrict, setCustomerDistrict] = useState("");
  const [customerWard, setCustomerWard] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [qrCode, setQrCode] = useState("");
  const [transferContent, setTransferContent] = useState("");
  const [amount, setAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const pollRef = useRef(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // SEO Meta Tags
  useEffect(() => {
    document.title = "Thanh toán - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Thanh toán đơn hàng của bạn. Điền thông tin giao hàng và chọn phương thức thanh toán phù hợp.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Thanh toán đơn hàng của bạn. Điền thông tin giao hàng và chọn phương thức thanh toán phù hợp.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Lấy giỏ hàng
  const fetchCart = async () => {
    if (authLoading) return;
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setCart(res.data);
      setLoading(false);
      setError(null);
      
      // Nếu giỏ hàng trống, chuyển về trang cart
      if (!res.data?.items || res.data.items.length === 0) {
        navigate("/cart");
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError(err.response?.data?.message || "Lỗi khi tải giỏ hàng");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [token, authLoading, navigate, location]);

  // Refresh addresses khi quay lại từ AddAddress
  useEffect(() => {
    if (location.state?.fromAddAddress) {
      fetchAddresses();
      // Clear state để tránh refresh lại
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    if (authLoading || !user) return;
    const currentToken = token || localStorage.getItem("token");
    const userId = user?.id || localStorage.getItem("userId");
    
    if (!currentToken || !userId) return;

    setLoadingAddresses(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/users/${userId}/addresses`,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      setAddresses(res.data || []);
      
      // Tự động chọn địa chỉ mặc định
      const defaultAddress = res.data?.find(addr => addr.is_default) || res.data?.[0];
      if (defaultAddress) {
        selectAddress(defaultAddress);
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Chọn địa chỉ và điền vào form
  const selectAddress = (address) => {
    setSelectedAddress(address);
    // Map địa chỉ từ UserAddress sang form checkout
    setDeliveryAddress(
      [address.address_line1, address.address_line2]
        .filter(Boolean)
        .join(", ")
    );
    setCustomerProvince(address.state || address.city || "");
    setCustomerDistrict(address.city || "");
    setCustomerWard("");
    setShowAddressModal(false);
  };

  // Format địa chỉ để hiển thị
  const formatAddress = (address) => {
    if (!address) return "";
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.country
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Thanh toán
  const handleCheckout = async () => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      alert("Vui lòng đăng nhập để thanh toán");
      navigate("/login");
      return;
    }
    
    // Validation
    if (!deliveryAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng");
      return;
    }
    
    if (!paymentMethod) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }
    
    if (!cart || !cart.items || cart.items.length === 0) {
      setError("Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.");
      navigate("/cart");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Chuẩn bị dữ liệu gửi đi
      const checkoutData = {
        delivery_address: deliveryAddress.trim(),
        payment_method: paymentMethod,
      };
      
      // Chỉ thêm các trường có giá trị
      if (customerName && customerName.trim()) {
        checkoutData.customer_name = customerName.trim();
      }
      if (customerPhone && customerPhone.trim()) {
        checkoutData.customer_phone = customerPhone.trim();
      }
      if (customerProvince && customerProvince.trim()) {
        checkoutData.customer_province = customerProvince.trim();
      }
      if (customerDistrict && customerDistrict.trim()) {
        checkoutData.customer_district = customerDistrict.trim();
      }
      if (customerWard && customerWard.trim()) {
        checkoutData.customer_ward = customerWard.trim();
      }
      
      console.log("Sending checkout data:", checkoutData);
      
      const res = await axios.post(
        "http://localhost:8000/api/cart/checkout",
        checkoutData,
        { 
          headers: { 
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("Checkout response:", res.data);
      
      // Kiểm tra response có đầy đủ dữ liệu không
      if (!res.data) {
        throw new Error("Không nhận được dữ liệu từ server");
      }
      
      if (!res.data.qr_code) {
        console.warn("QR code không có trong response:", res.data);
      }
      
      setQrCode(res.data.qr_code || "");
      setAmount(Number(res.data.amount) || 0);
      setTransferContent(res.data.addInfo || "");
      setOrderId(res.data.order_id || null);
      setPaymentStatus("pending");
      setTimeLeft(5 * 60); // 5 phút countdown
      setSubmitting(false);
    } catch (err) {
      console.error("Checkout error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      let errorMessage = "Lỗi khi thanh toán";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (err.response?.status === 500) {
        const backendError = err.response?.data?.error || err.response?.data?.message;
        if (backendError) {
          errorMessage = `Lỗi server: ${backendError}`;
        } else {
          errorMessage = "Lỗi server (500). Có thể do:\n- Database connection issue\n- Missing columns in orders table\n- Server error\n\nVui lòng thử lại sau hoặc liên hệ hỗ trợ.";
        }
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      } else if (err.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (!err.response) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }
      
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  // Poll Google Sheet
  const checkPaymentFromGoogleAPI = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyjHTm8gtq_qPG_GUEV970kCuAFuhGd3dlEqqPjK-zsvUssBzdeOuc0si8BjVx31nj9/exec"
      );
      const data = await response.json();
      if (!data?.data?.length) return;

      const latestTx = data.data[data.data.length - 1];
      const description = latestTx["Mô tả"] || "";
      const amountFromAPI = Number(latestTx["Giá trị"]) || 0;

      if (description.includes(transferContent) && amountFromAPI >= amount) {
        setPaymentStatus("paid");
        setPaymentMessage({ type: "success", text: "🎉 Thanh toán thành công!" });
        setCart({ items: [], total_amount: 0 });

        const currentToken = token || localStorage.getItem("token");
        await fetch("http://localhost:8000/api/cart/clear-cart", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        });

        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        // Tự động đóng modal sau 3 giây
        setTimeout(() => {
          setQrCode("");
          setPaymentMessage(null);
          navigate("/products");
        }, 3000);
      }
    } catch (error) {
      console.error("❌ Lỗi khi kiểm tra thanh toán:", error);
    }
  };

  useEffect(() => {
    if (!transferContent) return;
    if (pollRef.current) return;
    checkPaymentFromGoogleAPI();
    pollRef.current = setInterval(checkPaymentFromGoogleAPI, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [transferContent]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    if (timeLeft === 1) {
      const currentToken = token || localStorage.getItem("token");
      fetch("http://localhost:8000/api/cart/cancel-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId }),
      }).then(() => {
        setPaymentStatus("cancelled");
        setPaymentMessage({ type: "error", text: "⏰ Hết thời gian thanh toán. Đơn hàng đã bị hủy." });
        
        // Tự động đóng modal sau 3 giây
        setTimeout(() => {
          setQrCode("");
          setPaymentMessage(null);
        }, 3000);
      });
    }

    return () => clearInterval(timer);
  }, [timeLeft, orderId, token]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (authLoading || loading) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5">
          <div style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            padding: '4rem 0'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '5px solid rgba(251, 99, 118, 0.2)', 
              borderTopColor: '#FB6376', 
              borderRightColor: '#FCB1A6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#5D2A42', fontSize: '1rem', fontWeight: '500', margin: 0 }}>
              Đang tải thông tin...
            </p>
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
          <Card style={{
            borderRadius: '20px',
            border: '2px solid rgba(220, 53, 69, 0.2)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
            padding: '2rem'
          }}>
            <Card.Body>
              <h2 style={{ color: '#5D2A42', marginBottom: '1rem' }}>Lỗi</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>{error}</p>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <Header />
      <Container className="mt-5 pt-5 checkout-container">
        <div style={{
          marginBottom: '2.5rem',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <Button
            variant="link"
            onClick={() => navigate('/cart')}
            style={{
              color: '#5D2A42',
              textDecoration: 'none',
              padding: 0,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaArrowLeft /> Quay lại giỏ hàng
          </Button>
          <h1 style={{
            color: '#5D2A42',
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FaCreditCard />
            Thanh toán
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1rem',
            margin: 0
          }}>
            Điền thông tin giao hàng và chọn phương thức thanh toán
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{
            borderRadius: '15px',
            border: '2px solid rgba(220, 53, 69, 0.2)',
            background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05))',
            animation: 'slideDown 0.3s ease-out',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        <Row>
          <Col lg={8}>
            <Card style={{
              borderRadius: '20px',
              border: '2px solid rgba(251, 99, 118, 0.15)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
              boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
              animation: 'fadeInUp 0.6s ease-out 0.2s both'
            }}>
              <Card.Body style={{ padding: '2.5rem' }}>
                <h2 style={{
                  color: '#5D2A42',
                  marginBottom: '2rem',
                  fontWeight: 700,
                  fontSize: '1.8rem',
                  position: 'relative',
                  paddingBottom: '1rem'
                }}>
                  Thông tin giao hàng
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

                {/* Địa chỉ nhận hàng - Shopee style */}
                <div className="delivery-address-section" style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '15px',
                  border: '2px solid rgba(251, 99, 118, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <FaMapMarkerAlt style={{ color: '#FB6376', fontSize: '1.2rem' }} />
                    <h3 style={{
                      color: '#FB6376',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      margin: 0
                    }}>
                      Địa Chỉ Nhận Hàng
                    </h3>
                  </div>

                  {selectedAddress ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{
                          fontWeight: 600,
                          color: '#5D2A42',
                          marginBottom: '0.5rem',
                          fontSize: '1rem'
                        }}>
                          {user?.name || customerName || "Người nhận"}
                          {customerPhone && ` (+84) ${customerPhone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3')}`}
                        </div>
                        <div style={{
                          color: '#666',
                          fontSize: '0.95rem',
                          lineHeight: '1.6'
                        }}>
                          {formatAddress(selectedAddress)}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                      }}>
                        {selectedAddress.is_default && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid #FF9800',
                            color: '#FF9800',
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            Mặc Định
                          </span>
                        )}
                        <Button
                          variant="link"
                          onClick={() => setShowAddressModal(true)}
                          style={{
                            padding: 0,
                            color: '#1890ff',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 500
                          }}
                        >
                          Thay Đổi
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#666'
                    }}>
                      <p style={{ marginBottom: '1rem' }}>Chưa có địa chỉ giao hàng</p>
                      <Button
                        variant="outline-primary"
                        onClick={() => navigate('/add-address', { state: { returnTo: '/checkout' } })}
                        style={{
                          borderRadius: '8px',
                          padding: '0.5rem 1.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FaPlus /> Thêm địa chỉ mới
                      </Button>
                    </div>
                  )}
                </div>

                <Form>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{
                          color: '#5D2A42',
                          fontWeight: 600,
                          marginBottom: '0.5rem'
                        }}>
                          Họ tên người nhận <span style={{ color: '#FB6376' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên người nhận"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
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
                          Số điện thoại <span style={{ color: '#FB6376' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập số điện thoại"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
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
                          Phương thức thanh toán <span style={{ color: '#FB6376' }}>*</span>
                        </Form.Label>
                        <Form.Select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{
                            borderRadius: '15px',
                            border: '2px solid rgba(251, 99, 118, 0.2)',
                            fontSize: '0.95rem',
                            padding: '0.85rem 1.2rem',
                            transition: 'all 0.3s ease',
                            background: 'white'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#FB6376';
                            e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                          <option value="momo">MoMo</option>
                          <option value="cod">COD (Thanh toán khi nhận hàng)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card style={{
              borderRadius: '20px',
              border: '2px solid rgba(251, 99, 118, 0.15)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
              boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)',
              animation: 'fadeInUp 0.6s ease-out 0.4s both',
              position: 'sticky',
              top: '100px'
            }}>
              <Card.Body style={{ padding: '2rem' }}>
                <h2 style={{
                  color: '#5D2A42',
                  marginBottom: '1.5rem',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  position: 'relative',
                  paddingBottom: '1rem'
                }}>
                  Tổng đơn hàng
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

                {/* Order Items Summary */}
                {cart?.items && cart.items.length > 0 && (
                  <div style={{
                    marginBottom: '1.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '2px solid rgba(251, 99, 118, 0.1)'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      marginBottom: '1rem'
                    }}>
                      Sản phẩm ({cart.items.length})
                    </h3>
                    {cart.items.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '10px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#5D2A42',
                            fontWeight: 500,
                            marginBottom: '0.25rem'
                          }}>
                            {item.product?.name || "Unknown Product"}
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#666'
                          }}>
                            {formatPrice(item.product?.price || 0)} x {item.quantity}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#FB6376'
                        }}>
                          {formatPrice((item.product?.price || 0) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    color: '#666'
                  }}>
                    <span>Tạm tính:</span>
                    <span style={{ fontWeight: 600, color: '#5D2A42' }}>
                      {formatPrice(cart?.total_amount || 0)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                    color: '#666'
                  }}>
                    <span>Phí vận chuyển:</span>
                    <span style={{
                      fontWeight: 600,
                      color: '#28a745'
                    }}>
                      Miễn phí
                    </span>
                  </div>
                  <hr style={{
                    borderColor: 'rgba(251, 99, 118, 0.2)',
                    margin: '1rem 0'
                  }} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 700
                  }}>
                    <span style={{
                      color: '#5D2A42'
                    }}>
                      Tổng cộng:
                    </span>
                    <span style={{
                      background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {formatPrice(cart?.total_amount || 0)}
                    </span>
                  </div>
                </div>

                <Button
                  className="btn-book w-100"
                  onClick={handleCheckout}
                  disabled={submitting || !deliveryAddress.trim() || !cart?.items?.length}
                  style={{
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '30px',
                    marginBottom: '1rem'
                  }}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>

                {timeLeft > 0 && paymentStatus === "pending" && (
                  <div style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 193, 7, 0.2)',
                    textAlign: 'center',
                    animation: 'pulse 2s infinite',
                    marginBottom: '1rem'
                  }}>
                    <FaClock style={{ marginRight: '0.5rem', color: '#FFC107' }} />
                    <strong style={{ color: '#5D2A42' }}>
                      Thời gian thanh toán còn lại: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </strong>
                  </div>
                )}

                {paymentStatus === "cancelled" && (
                  <div style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05))',
                    borderRadius: '12px',
                    border: '2px solid rgba(220, 53, 69, 0.2)',
                    textAlign: 'center',
                    color: '#dc3545',
                    marginBottom: '1rem'
                  }}>
                    <FaTimesCircle style={{ marginRight: '0.5rem' }} />
                    Đơn hàng đã hủy do hết thời gian thanh toán
                  </div>
                )}

                {paymentStatus === "paid" && (
                  <div style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05))',
                    borderRadius: '12px',
                    border: '2px solid rgba(40, 167, 69, 0.2)',
                    textAlign: 'center',
                    color: '#28a745',
                    marginBottom: '1rem'
                  }}>
                    <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                    <strong>Thanh toán thành công!</strong>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* QR Code Modal Overlay */}
            {qrCode && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem',
                  animation: 'fadeIn 0.3s ease-out',
                  overflow: 'auto'
                }}
                onClick={(e) => {
                  // Đóng modal khi click vào backdrop
                  if (e.target === e.currentTarget) {
                    // Không đóng, chỉ để người dùng thấy rõ QR
                  }
                }}
              >
                {/* Backdrop với blur */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                />
                
                {/* QR Code Modal */}
                <Card
                  style={{
                    position: 'relative',
                    zIndex: 10000,
                    borderRadius: '25px',
                    border: 'none',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 236, 0.95))',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    maxWidth: '550px',
                    width: '100%',
                    margin: 'auto',
                    animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setQrCode('')}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(251, 99, 118, 0.1)',
                      color: '#FB6376',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10001,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 99, 118, 0.2)';
                      e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 99, 118, 0.1)';
                      e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                  >
                    ×
                  </button>

                  <Card.Body style={{ padding: '3rem 2rem' }}>
                    {/* Payment Message */}
                    {paymentMessage && (
                      <div style={{
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        borderRadius: '20px',
                        background: paymentMessage.type === 'success' 
                          ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.15), rgba(40, 167, 69, 0.1))'
                          : 'linear-gradient(135deg, rgba(220, 53, 69, 0.15), rgba(220, 53, 69, 0.1))',
                        border: `3px solid ${paymentMessage.type === 'success' ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`,
                        textAlign: 'center',
                        animation: 'fadeInUp 0.5s ease-out'
                      }}>
                        <div style={{
                          fontSize: '3rem',
                          marginBottom: '1rem'
                        }}>
                          {paymentMessage.type === 'success' ? '✅' : '❌'}
                        </div>
                        <h4 style={{
                          color: paymentMessage.type === 'success' ? '#28a745' : '#dc3545',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          margin: 0
                        }}>
                          {paymentMessage.text}
                        </h4>
                      </div>
                    )}

                    {!paymentMessage && (
                      <>
                        <h3 style={{
                          color: '#5D2A42',
                          marginBottom: '2rem',
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          textAlign: 'center'
                        }}>
                          Quét mã VietQR để thanh toán
                        </h3>
                        
                        {/* QR Code - To và rõ ràng, căn giữa hoàn hảo */}
                        <div style={{ 
                          textAlign: 'center', 
                          marginBottom: '2rem',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%'
                        }}>
                          <div style={{
                            padding: '1.5rem',
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '0 auto'
                          }}>
                            <img
                              src={qrCode}
                              alt="VietQR"
                              style={{
                                width: '400px',
                                height: '400px',
                                maxWidth: 'calc(100vw - 4rem)',
                                maxHeight: 'calc(70vh - 200px)',
                                objectFit: 'contain',
                                borderRadius: '15px',
                                border: '3px solid rgba(251, 99, 118, 0.2)',
                                background: 'white',
                                display: 'block',
                                margin: '0 auto'
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Payment Info - Chỉ hiển thị khi chưa có thông báo */}
                    {!paymentMessage && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '2px solid rgba(251, 99, 118, 0.1)'
                      }}>
                      <div style={{
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '2px solid rgba(251, 99, 118, 0.1)'
                      }}>
                        <div style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          marginBottom: '0.75rem',
                          fontWeight: 500
                        }}>
                          <strong style={{ color: '#5D2A42' }}>Nội dung chuyển khoản:</strong>
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: '#FB6376',
                          wordBreak: 'break-word',
                          padding: '0.75rem',
                          background: 'rgba(251, 99, 118, 0.05)',
                          borderRadius: '10px'
                        }}>
                          {transferContent}
                        </div>
                      </div>
                      <div style={{
                        marginBottom: '1.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '2px solid rgba(251, 99, 118, 0.1)'
                      }}>
                        <div style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          marginBottom: '0.75rem',
                          fontWeight: 500
                        }}>
                          <strong style={{ color: '#5D2A42' }}>Số tiền cần thanh toán:</strong>
                        </div>
                        <div style={{
                          fontSize: '1.8rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          textAlign: 'center'
                        }}>
                          {formatPrice(amount)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Badge bg={paymentStatus === "paid" ? "success" : paymentStatus === "pending" ? "warning" : "danger"} style={{
                          fontSize: '1rem',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '25px',
                          fontWeight: 600
                        }}>
                          {paymentStatus === "paid" ? "✓ Đã thanh toán" : paymentStatus === "pending" ? "⏳ Đang chờ thanh toán" : "✗ Đơn hàng hủy"}
                        </Badge>
                      </div>
                      
                      {/* Countdown timer */}
                      {timeLeft > 0 && (
                        <div style={{
                          marginTop: '1.5rem',
                          textAlign: 'center',
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>
                          Thời gian còn lại: <strong style={{ color: '#FB6376' }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>
                        </div>
                      )}
                    </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <Footer />

      {/* Modal chọn địa chỉ */}
      {showAddressModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.3s ease-out',
            overflow: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddressModal(false);
            }
          }}
        >
          <Card
            style={{
              position: 'relative',
              zIndex: 10000,
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 236, 0.95))',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card.Header style={{
              background: 'transparent',
              borderBottom: '2px solid rgba(251, 99, 118, 0.1)',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                color: '#5D2A42',
                margin: 0,
                fontWeight: 700,
                fontSize: '1.5rem'
              }}>
                Địa Chỉ Của Tôi
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 99, 118, 0.1)';
                  e.currentTarget.style.color = '#FB6376';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }}
              >
                ×
              </button>
            </Card.Header>

            <Card.Body style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {loadingAddresses ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#666'
                }}>
                  Đang tải địa chỉ...
                </div>
              ) : addresses.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#666'
                }}>
                  <p style={{ marginBottom: '1.5rem' }}>Chưa có địa chỉ nào</p>
                  <Button
                    className="btn-book"
                    onClick={() => {
                      setShowAddressModal(false);
                      navigate('/add-address', { state: { returnTo: '/checkout' } });
                    }}
                  >
                    <FaPlus style={{ marginRight: '0.5rem' }} />
                    Thêm Địa Chỉ Mới
                  </Button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {addresses.map((address) => (
                    <div
                      key={address.address_id || address.id}
                      onClick={() => selectAddress(address)}
                      style={{
                        padding: '1.25rem',
                        border: selectedAddress?.address_id === address.address_id || selectedAddress?.id === address.id
                          ? '2px solid #FB6376'
                          : '2px solid rgba(251, 99, 118, 0.2)',
                        borderRadius: '12px',
                        background: selectedAddress?.address_id === address.address_id || selectedAddress?.id === address.id
                          ? 'rgba(251, 99, 118, 0.05)'
                          : 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedAddress?.address_id !== address.address_id && selectedAddress?.id !== address.id) {
                          e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.4)';
                          e.currentTarget.style.background = 'rgba(251, 99, 118, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedAddress?.address_id !== address.address_id && selectedAddress?.id !== address.id) {
                          e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}>
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddress?.address_id === address.address_id || selectedAddress?.id === address.id}
                          onChange={() => selectAddress(address)}
                          style={{
                            marginTop: '0.25rem',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            <div style={{
                              fontWeight: 600,
                              color: '#5D2A42',
                              fontSize: '1rem'
                            }}>
                              {user?.name || customerName || "Người nhận"}
                            </div>
                            {address.is_default && (
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                border: '1px solid #FF9800',
                                color: '#FF9800',
                                fontSize: '0.85rem',
                                fontWeight: 500
                              }}>
                                Mặc Định
                              </span>
                            )}
                          </div>
                          <div style={{
                            color: '#666',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            marginBottom: '0.5rem'
                          }}>
                            {formatAddress(address)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>

            <Card.Footer style={{
              background: 'transparent',
              borderTop: '2px solid rgba(251, 99, 118, 0.1)',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <Button
                variant="outline-secondary"
                onClick={() => setShowAddressModal(false)}
                style={{
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  borderColor: '#5D2A42',
                  color: '#5D2A42'
                }}
              >
                Hủy
              </Button>
              <Button
                className="btn-book"
                onClick={() => {
                  setShowAddressModal(false);
                  navigate('/add-address', { state: { returnTo: '/checkout' } });
                }}
                style={{
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FaPlus />
                Thêm Địa Chỉ Mới
              </Button>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
}

