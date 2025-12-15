import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { 
  FaShoppingBag, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaBox
} from 'react-icons/fa';
import '../../../assets/css/Orders.scss';

const ORDER_STAGES = [
  { key: 'all', label: 'Tất cả', icon: FaShoppingBag, color: '#5D2A42' },
  { key: 'pending', label: 'Chờ thanh toán', icon: FaClock, color: '#FFA500' },
  { key: 'paid', label: 'Đã thanh toán', icon: FaCheckCircle, color: '#28a745' },
  { key: 'processing', label: 'Đang xử lý', icon: FaBox, color: '#17a2b8' },
  { key: 'shipping', label: 'Đang giao hàng', icon: FaTruck, color: '#007bff' },
  { key: 'completed', label: 'Đã giao hàng', icon: FaCheckCircle, color: '#28a745' },
  { key: 'cancelled', label: 'Đã hủy', icon: FaTimesCircle, color: '#dc3545' },
];

export default function Orders() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Lưu tất cả đơn hàng để đếm số lượng
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState('all');
  const [error, setError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Thẻ Meta SEO
  useEffect(() => {
    document.title = "Đơn hàng của tôi - Cửa hàng quà tặng";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Theo dõi đơn hàng của bạn tại cửa hàng quà tặng.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Theo dõi đơn hàng của bạn tại cửa hàng quà tặng.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);

  // Lấy tất cả đơn hàng để đếm số lượng và lọc
  const fetchOrders = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:8000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 100 }
      });

      let ordersData = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }

      const userOrders = ordersData.filter(order => {
        const orderUserId = order.user_id || order.user?.id;
        return orderUserId === user.id;
      });
      
      setAllOrders(userOrders);

      const filtered = activeStage === 'all' 
        ? userOrders 
        : userOrders.filter(o => o.status === activeStage);
      
      setOrders(filtered);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      setOrders([]);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, token, activeStage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = (orderId) => {
    if (!token || !user) return;
    setOrderToCancel(orderId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || !token || !user) return;

    // Kiểm tra: lý do hủy đơn là bắt buộc
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng.');
      return;
    }

    try {
      setCancellingOrderId(orderToCancel);
      setShowCancelModal(false);
      
      await axios.post(
        `http://localhost:8000/api/orders/${orderToCancel}/cancel`,
        { reason: cancelReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Đơn hàng đã được hủy. Chúng tôi sẽ hoàn tiền lại trong vòng 24 giờ.');
      await fetchOrders();
      setCancelReason('');
      setOrderToCancel(null);
    } catch (err) {
      console.error('Cancel order error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.';
      alert(errorMessage);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
    setOrderToCancel(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const stage = ORDER_STAGES.find(s => s.key === status);
    if (!stage) {
      return <Badge bg="secondary">{status}</Badge>;
    }
    return (
      <Badge 
        style={{ 
          backgroundColor: stage.color,
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}
      >
        {stage.label}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    const stage = ORDER_STAGES.find(s => s.key === status);
    return stage ? <stage.icon style={{ color: stage.color, marginRight: '0.5rem' }} /> : null;
  };

  if (authLoading) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
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
    <div className="orders-page">
      <Header />
      <Container className="mt-5 pt-5" style={{ minHeight: '70vh', paddingBottom: '4rem' }}>
        <div className="orders-header">
          <h1 style={{ 
            color: '#5D2A42', 
            fontWeight: 700, 
            marginBottom: '2rem',
            fontSize: '2rem'
          }}>
            Đơn hàng của tôi
          </h1>
        </div>

        {/* Tab trạng thái */}
        <div className="orders-stages">
          {ORDER_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.key;
            {/* Đếm từ allOrders để có số lượng chính xác */}
            const count = stage.key === 'all' 
              ? allOrders.length 
              : allOrders.filter(o => o.status === stage.key).length;

            return (
              <button
                key={stage.key}
                className={`stage-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStage(stage.key)}
                style={{
                  backgroundColor: isActive ? stage.color : '#f8f9fa',
                  color: isActive ? '#fff' : '#5D2A42',
                  border: `2px solid ${isActive ? stage.color : '#e0e0e0'}`,
                }}
              >
                <Icon style={{ marginRight: '0.5rem' }} />
                {stage.label}
                {count > 0 && (
                  <Badge 
                    bg={isActive ? 'light' : 'secondary'} 
                    text={isActive ? 'dark' : 'white'}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Danh sách đơn hàng */}
        <div className="orders-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3" style={{ color: '#666' }}>Đang tải đơn hàng...</p>
            </div>
          ) : error ? (
            <Card className="error-card">
              <Card.Body style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: '#dc3545', fontSize: '1.1rem' }}>{error}</p>
                <Button 
                  variant="primary" 
                  onClick={() => window.location.reload()}
                  style={{ marginTop: '1rem' }}
                >
                  Thử lại
                </Button>
              </Card.Body>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="empty-card">
              <Card.Body style={{ textAlign: 'center', padding: '4rem' }}>
                <FaShoppingBag style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }} />
                <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Chưa có đơn hàng nào</h3>
                <p style={{ color: '#999' }}>Bạn chưa có đơn hàng nào trong danh mục này.</p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/products')}
                  style={{ marginTop: '1.5rem' }}
                >
                  Mua sắm ngay
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <Card key={order.id} className="order-card">
                  <Card.Body>
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-id">
                          <strong>Đơn hàng #{order.id}</strong>
                        </div>
                        <div className="order-date">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="order-status">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items && order.items.length > 0 ? (
                        order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="order-item">
                            <div className="item-image">
                              {item.product?.images?.[0]?.image_url ? (
                                <img 
                                  src={item.product.images[0].image_url} 
                                  alt={item.product.name}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80x80?text=Không+có+hình+ảnh';
                                  }}
                                />
                              ) : (
                                <div className="placeholder-image">
                                  <FaBox />
                                </div>
                              )}
                            </div>
                            <div className="item-details">
                              <div className="item-name">{item.product?.name || 'Sản phẩm đã xóa'}</div>
                              <div className="item-quantity">x{item.quantity}</div>
                            </div>
                            <div className="item-price">
                              {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-items">Không có sản phẩm</div>
                      )}
                      {order.items && order.items.length > 3 && (
                        <div className="more-items">
                          +{order.items.length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        <span className="total-label">Tổng tiền:</span>
                        <span className="total-amount">
                          {formatPrice((Number(order.total_amount) || 0) + (Number(order.shipping_fee) || 0))}
                        </span>
                      </div>
                      <div className="order-actions" style={{ gap: '0.5rem', display: 'flex', flexWrap: 'wrap' }}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          style={{
                            borderRadius: '8px',
                            padding: '0.5rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <FaEye /> Xem chi tiết
                        </Button>
                        {['pending', 'paid', 'processing'].includes(order.status) && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            style={{
                              borderRadius: '8px',
                              padding: '0.5rem 1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {cancellingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {order.delivery_address && (
                      <div className="order-address">
                        <strong>Địa chỉ giao hàng:</strong> {order.delivery_address}
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="order-cancel-note">
                        Đơn hàng đã được hủy.
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
      <Footer />

      {/* Modal hủy đơn hàng */}
      <Modal show={showCancelModal} onHide={handleCloseCancelModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#5D2A42', fontWeight: 600 }}>
            Hủy đơn hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng nhập lý do hủy đơn hàng.
          </p>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 600, color: '#5D2A42' }}>
              Lý do hủy đơn hàng <span style={{ color: '#dc3545' }}>*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Ví dụ: Thay đổi ý định, Đặt nhầm sản phẩm, Không còn nhu cầu..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{
                borderRadius: '8px',
                border: '1px solid #ddd',
                resize: 'vertical'
              }}
              maxLength={500}
            />
            <Form.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
              {cancelReason.length}/500 ký tự
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCloseCancelModal}
            style={{ borderRadius: '8px' }}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmCancel}
            disabled={!cancelReason.trim() || cancellingOrderId === orderToCancel}
            style={{ borderRadius: '8px' }}
          >
            {cancellingOrderId === orderToCancel ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

