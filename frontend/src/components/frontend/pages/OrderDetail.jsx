import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { 
  FaArrowLeft, 
  FaShoppingBag, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle,
  FaBox,
  FaMapMarkerAlt,
  FaPhone,
  FaUser
} from 'react-icons/fa';
import '../../../assets/css/OrderDetail.scss';

const STATUS_INFO = {
  pending: { label: 'Chờ thanh toán', icon: FaClock, color: '#FFA500' },
  paid: { label: 'Đã thanh toán', icon: FaCheckCircle, color: '#28a745' },
  processing: { label: 'Đang xử lý', icon: FaBox, color: '#17a2b8' },
  shipping: { label: 'Đang giao hàng', icon: FaTruck, color: '#007bff' },
  completed: { label: 'Đã giao hàng', icon: FaCheckCircle, color: '#28a745' },
  cancelled: { label: 'Đã hủy', icon: FaTimesCircle, color: '#dc3545' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // SEO Meta Tags
  useEffect(() => {
    document.title = `Chi tiết đơn hàng #${id} - Cửa hàng quà tặng`;
  }, [id]);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);

  // Fetch order details
  useEffect(() => {
    if (!user || !token || !id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(`http://localhost:8000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const orderData = response.data;
        
        // Kiểm tra xem order có thuộc về user hiện tại không
        if (orderData.user_id !== user.id && orderData.user?.id !== user.id) {
          setError('Bạn không có quyền xem đơn hàng này.');
          setOrder(null);
          return;
        }

        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        if (err.response?.status === 404) {
          setError('Không tìm thấy đơn hàng.');
        } else {
          setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại.');
        }
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, token, id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusInfo = (status) => {
    return STATUS_INFO[status] || { label: status, icon: FaBox, color: '#666' };
  };

  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/100x100?text=No+Image';
    if (product.images && product.images.length > 0 && product.images[0]?.image_url) {
      return product.images[0].image_url;
    }
    return 'https://via.placeholder.com/100x100?text=No+Image';
  };

  if (authLoading) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Header />
        <Container className="mt-5 pt-5" style={{ minHeight: '70vh', paddingBottom: '4rem' }}>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/orders')}
            style={{ marginBottom: '2rem' }}
          >
            <FaArrowLeft style={{ marginRight: '0.5rem' }} />
            Quay lại
          </Button>
          <Card>
            <Card.Body style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#dc3545', fontSize: '1.1rem' }}>{error || 'Không tìm thấy đơn hàng'}</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/orders')}
                style={{ marginTop: '1rem' }}
              >
                Quay về danh sách đơn hàng
              </Button>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const canCancel = ['pending', 'paid', 'processing'].includes(order.status);

  const handleCancelOrder = async () => {
    if (!token || !order) return;

    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
    if (!confirmCancel) {
      return;
    }

    try {
      setCancelling(true);
      const response = await axios.post(
        `http://localhost:8000/api/orders/${order.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.order) {
        setOrder(response.data.order);
      }

      alert(response.data?.message || 'Đơn hàng đã được hủy. Chúng tôi sẽ hoàn tiền lại trong vòng 24 giờ.');
    } catch (err) {
      console.error('Cancel order error:', err);
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="order-detail-page">
      <Header />
      <Container className="mt-5 pt-5" style={{ minHeight: '70vh', paddingBottom: '4rem' }}>
        <Button
          variant="outline-secondary"
          onClick={() => navigate('/orders')}
          style={{ 
            marginBottom: '2rem',
            borderRadius: '8px',
            padding: '0.5rem 1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaArrowLeft /> Quay lại
        </Button>

        <div className="order-detail-header">
          <h1 style={{ 
            color: '#5D2A42', 
            fontWeight: 700, 
            marginBottom: '1rem',
            fontSize: '2rem'
          }}>
            Đơn hàng #{order.id}
          </h1>
          <div className="order-status-actions">
            <div className="order-status-badge">
              <StatusIcon style={{ color: statusInfo.color, marginRight: '0.5rem' }} />
              <Badge 
                style={{ 
                  backgroundColor: statusInfo.color,
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                {statusInfo.label}
              </Badge>
            </div>
            {canCancel && (
              <Button
                variant="outline-danger"
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1.25rem',
                  fontWeight: 600
                }}
              >
                {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </Button>
            )}
          </div>
        </div>

        <Row className="mt-4">
          {/* Order Items */}
          <Col md={8}>
            <Card className="order-items-card">
              <Card.Header style={{ 
                backgroundColor: '#5D2A42', 
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                Sản phẩm
              </Card.Header>
              <Card.Body>
                {order.items && order.items.length > 0 ? (
                  <div className="order-items-list">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-detail">
                        <div className="item-image">
                          <img 
                            src={getProductImage(item.product)} 
                            alt={item.product?.name || 'Sản phẩm'}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="item-info">
                          <div className="item-name">{item.product?.name || 'Sản phẩm đã xóa'}</div>
                          <div className="item-quantity">Số lượng: {item.quantity}</div>
                          <div className="item-price">
                            {formatPrice(Number(item.price) || 0)} x {item.quantity || 0} = {formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    Không có sản phẩm
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Info */}
          <Col md={4}>
            <Card className="order-info-card">
              <Card.Header style={{ 
                backgroundColor: '#5D2A42', 
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                Thông tin đơn hàng
              </Card.Header>
              <Card.Body>
                <div className="info-item">
                  <strong>Ngày đặt:</strong>
                  <div>{formatDate(order.created_at)}</div>
                </div>

                {order.customer_name && (
                  <div className="info-item">
                    <strong><FaUser style={{ marginRight: '0.5rem' }} />Khách hàng:</strong>
                    <div>{order.customer_name}</div>
                  </div>
                )}

                {order.customer_phone && (
                  <div className="info-item">
                    <strong><FaPhone style={{ marginRight: '0.5rem' }} />Số điện thoại:</strong>
                    <div>{order.customer_phone}</div>
                  </div>
                )}

                {order.delivery_address && (
                  <div className="info-item">
                    <strong><FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />Địa chỉ giao hàng:</strong>
                    <div>{order.delivery_address}</div>
                    {order.customer_province && (
                      <div style={{ marginTop: '0.25rem', color: '#666', fontSize: '0.9rem' }}>
                        {[order.customer_ward, order.customer_district, order.customer_province]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <hr />

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(Number(order.total_amount) || 0)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(Number(order.shipping_fee) || 0)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Tổng tiền:</span>
                    <span>{formatPrice((Number(order.total_amount) || 0) + (Number(order.shipping_fee) || 0))}</span>
                  </div>
                </div>

                {order.status === 'cancelled' && (
                  <div className="order-cancel-note">
                    Đơn hàng đã được hủy. Chúng tôi sẽ hoàn tiền lại trong vòng 24 giờ.
                  </div>
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

