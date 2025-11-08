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

export default function Cart() {
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
  const [timeLeft, setTimeLeft] = useState(0); // countdown
  const pollRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const userId = user?.id || localStorage.getItem("userId");

  // Lấy giỏ hàng
  useEffect(() => {
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
      })
      .catch((err) => {
        console.error("Fetch cart error:", err);
        setError(err.response?.data?.message || "Lỗi khi tải giỏ hàng");
        setLoading(false);
      });
  }, [token, authLoading, navigate, location]);

  // Thanh toán
  const checkout = () => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      alert("Vui lòng đăng nhập để thanh toán");
      navigate("/login");
      return;
    }
    if (!deliveryAddress.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .post(
        "http://localhost:8000/api/cart/checkout",
        {
          delivery_address: deliveryAddress,
          payment_method: paymentMethod,

          customer_name: customerName,
          customer_phone: customerPhone,
          customer_province: customerProvince,
          customer_district: customerDistrict,
          customer_ward: customerWard,
        },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      )
      .then((res) => {
        setQrCode(res.data.qr_code);
        setAmount(Number(res.data.amount) || 0);
        setTransferContent(res.data.addInfo);
        setOrderId(res.data.order_id);
        setPaymentStatus("pending");
        setTimeLeft(1 * 60); // 5 phút countdown
        setLoading(false);
      })
      .catch((err) => {
        console.error("Checkout error:", err);
        setError(err.response?.data?.message || "Lỗi khi thanh toán");
        setLoading(false);
      });
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
        alert("🎉 Thanh toán thành công!");
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
      }).then(() => setPaymentStatus("cancelled"));
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

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
            <p style={{ color: '#5D2A42', fontSize: '1rem', fontWeight: '500', margin: 0 }}>Đang tải giỏ hàng...</p>
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
          <Card style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '0' }}>
            <Card.Body>
              <h2 style={{ color: '#2c2c2c', fontWeight: '500' }}>Giỏ hàng</h2>
              <p style={{ color: "red" }}>{error}</p>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Container className="mt-5 pt-5" style={{ minHeight: '70vh', paddingBottom: '40px' }}>
        <h2 className="mb-4" style={{ color: '#5D2A42', fontSize: '2rem', fontWeight: '600', letterSpacing: '-0.5px' }}>Giỏ hàng của bạn</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <Row>
          <Col md={8}>
            <Card style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(251, 99, 118, 0.15)',
              marginBottom: '20px',
              borderRadius: '20px',
              boxShadow: '0 8px 25px rgba(93, 42, 66, 0.1)'
            }}>
              <Card.Body>
                {cart?.items?.length > 0 ? (
                  <div>
                    {cart.items.map((item) => (
                      <div key={item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        gap: '20px'
                      }}>
                        <img
                          src={item.product?.images?.[0]?.image_url || 'https://via.placeholder.com/100'}
                          alt={item.product?.name}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ color: '#5D2A42', marginBottom: '8px', fontWeight: '500', fontSize: '1.05rem' }}>
                            {item.product?.name || "Unknown Product"}
                          </h5>
                          <p style={{
                            background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            margin: 0,
                            fontSize: '1.2rem',
                            fontWeight: 700
                          }}>
                            {formatPrice(item.product?.price || 0)} x {item.quantity} = {formatPrice((item.product?.price || 0) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center" style={{ padding: '40px', color: '#666' }}>
                    <p>Giỏ hàng trống</p>
                    <Button className="btn-book" onClick={() => navigate('/products')}>
                      Mua sắm ngay
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(251, 99, 118, 0.15)',
              position: 'sticky',
              top: '100px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(93, 42, 66, 0.15)'
            }}>
              <Card.Body>
                <h4 style={{
                  color: '#5D2A42',
                  marginBottom: '20px',
                  fontWeight: '600',
                  fontSize: '1.3rem',
                  position: 'relative',
                  display: 'inline-block'
                }}>
                  Tổng đơn hàng
                </h4>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666', fontSize: '0.95rem' }}>
                    <span>Tạm tính:</span>
                    <span>{formatPrice(cart?.total_amount || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666', fontSize: '0.95rem' }}>
                    <span>Phí vận chuyển:</span>
                    <span style={{ color: '#FB6376', fontWeight: '600' }}>Miễn phí</span>
                  </div>
                  <hr style={{ borderColor: 'rgba(251, 99, 118, 0.2)', margin: '1rem 0', borderWidth: '1px' }} />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.1))',
                    padding: '1rem',
                    borderRadius: '15px',
                    marginTop: '1rem'
                  }}>
                    <span style={{ color: '#5D2A42', fontSize: '1.1rem', fontWeight: '600' }}>Tổng cộng:</span>
                    <span style={{
                      background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: '1.4rem',
                      fontWeight: 700
                    }}>
                      {formatPrice(cart?.total_amount || 0)}
                    </span>
                  </div>
                </div>

                {cart?.items?.length > 0 && (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#5D2A42', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>Địa chỉ giao hàng</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập địa chỉ giao hàng"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(251, 99, 118, 0.2)',
                          color: '#5D2A42',
                          borderRadius: '15px',
                          fontSize: '0.9rem',
                          padding: '0.85rem',
                          transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#FB6376';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Họ tên người nhận</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên người nhận"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập số điện thoại"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Tỉnh / Thành phố</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: Đà Nẵng"
                        value={customerProvince}
                        onChange={(e) => setCustomerProvince(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Quận / Huyện</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: Hải Châu"
                        value={customerDistrict}
                        onChange={(e) => setCustomerDistrict(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phường / Xã</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: Hòa Thuận Tây"
                        value={customerWard}
                        onChange={(e) => setCustomerWard(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#5D2A42', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>Phương thức thanh toán</Form.Label>
                      <Form.Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid rgba(251, 99, 118, 0.2)',
                          color: '#5D2A42',
                          borderRadius: '15px',
                          fontSize: '0.9rem',
                          padding: '0.85rem',
                          transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#FB6376';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(251, 99, 118, 0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                        <option value="momo">MoMo</option>
                        <option value="cod">COD</option>
                      </Form.Select>
                    </Form.Group>
                    <Button
                      className="btn-book w-100"
                      onClick={checkout}
                      disabled={loading || !deliveryAddress.trim()}
                      style={{ marginTop: '10px' }}
                    >
                      {loading ? "Đang xử lý..." : "Thanh toán ngay"}
                    </Button>
                  </div>
                )}

                {timeLeft > 0 && paymentStatus === "pending" && (
                  <div className="mt-3" style={{ color: '#666', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p>⏳ Thời gian thanh toán còn lại: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</p>
                  </div>
                )}
                {paymentStatus === "cancelled" && (
                  <div className="mt-3" style={{ color: 'red', textAlign: 'center' }}>
                    ❌ Đơn hàng đã hủy do hết thời gian thanh toán
                  </div>
                )}
              </Card.Body>
            </Card>

            {qrCode && (
              <Card style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(251, 99, 118, 0.15)',
                marginTop: '20px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(93, 42, 66, 0.15)'
              }}>
                <Card.Body>
                  <h4 style={{
                    color: '#5D2A42',
                    marginBottom: '20px',
                    fontWeight: '600',
                    fontSize: '1.3rem'
                  }}>
                    Quét mã VietQR để thanh toán
                  </h4>
                  <div className="text-center">
                    <img
                      src={qrCode}
                      alt="VietQR"
                      style={{
                        width: '250px',
                        height: '250px',
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        padding: "8px",
                        background: '#fff'
                      }}
                    />
                  </div>
                  <div style={{
                    marginTop: '20px',
                    color: '#5D2A42',
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.05), rgba(252, 177, 166, 0.05))',
                    padding: '1.5rem',
                    borderRadius: '15px'
                  }}>
                    <p style={{ marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#5D2A42' }}>Nội dung chuyển khoản:</strong>
                      <span style={{ color: '#FB6376', fontWeight: '600', marginLeft: '0.5rem' }}>{transferContent}</span>
                    </p>
                    <p style={{ marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#5D2A42' }}>Số tiền:</strong>
                      <span style={{
                        background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        marginLeft: '0.5rem'
                      }}>
                        {formatPrice(amount)}
                      </span>
                    </p>
                    <p><strong>Trạng thái đơn hàng:</strong>{" "}
                      <Badge bg={paymentStatus === "paid" ? "success" : paymentStatus === "pending" ? "warning" : "danger"}>
                        {paymentStatus === "paid" ? "Đã thanh toán" : paymentStatus === "pending" ? "Đang chờ thanh toán" : "Đơn hàng hủy"}
                      </Badge>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}
