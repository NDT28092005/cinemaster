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
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
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

const GHTK_STATUS_INFO = {
  created: { label: 'Đã tạo đơn', icon: FaBox, color: '#17a2b8' },
  picking: { label: 'Đang lấy hàng', icon: FaTruck, color: '#007bff' },
  delivering: { label: 'Đang giao hàng', icon: FaTruck, color: '#007bff' },
  delivered: { label: 'Đã giao hàng', icon: FaCheckCircle, color: '#28a745' },
  returned: { label: 'Đã hoàn trả', icon: FaTimesCircle, color: '#dc3545' },
  cancelled: { label: 'Đã hủy', icon: FaTimesCircle, color: '#dc3545' },
  lost: { label: 'Thất lạc', icon: FaTimesCircle, color: '#dc3545' },
  unknown: { label: 'Không xác định', icon: FaBox, color: '#666' },
  no_label: { label: 'Chưa có mã vận đơn', icon: FaClock, color: '#FFA500' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [returnRequest, setReturnRequest] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState('refund');
  const [returnReason, setReturnReason] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

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
        
        // Debug: Kiểm tra dữ liệu ảnh sản phẩm
        if (orderData.items) {
          console.log('Order items with images:', orderData.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product?.name,
            has_images: !!item.product?.images?.length,
            image_url: item.product?.image_url,
            first_image_url: item.product?.images?.[0]?.image_url
          })));
        }

        // Fetch return request nếu có
        try {
          const returnRes = await axios.get('http://localhost:8000/api/returns', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const returnForOrder = returnRes.data.find(r => r.order_id === parseInt(id));
          if (returnForOrder) {
            setReturnRequest(returnForOrder);
          }
        } catch (err) {
          console.error('Error fetching return request:', err);
        }
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

  const getGHTKStatusInfo = (status) => {
    return GHTK_STATUS_INFO[status] || GHTK_STATUS_INFO.unknown;
  };

  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/100x100?text=No+Image';
    
    // Ưu tiên: images relationship (nếu có)
    if (product.images && product.images.length > 0 && product.images[0]?.image_url) {
      return product.images[0].image_url;
    }
    
    // Fallback: image_url trực tiếp từ product
    if (product.image_url) {
      return product.image_url;
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
  
  // Kiểm tra GHTK status để quyết định có thể return không
  const ghtkOrder = order.ghtk_order || order.ghtkOrder;
  const ghtkStatus = ghtkOrder?.status;
  const ghtkStatusInfo = ghtkStatus ? getGHTKStatusInfo(ghtkStatus) : null;
  const GHTKStatusIcon = ghtkStatusInfo?.icon || FaBox;
  
  // Chỉ cho phép return khi order completed VÀ GHTK status là delivered hoặc returned
  const canReturn = order.status === 'completed' && 
    (!ghtkStatus || ['delivered', 'returned'].includes(ghtkStatus));

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

      // Hiển thị message từ backend (đã xử lý logic hoàn tiền)
      alert(response.data?.message || 'Đơn hàng đã được hủy.');
    } catch (err) {
      console.error('Cancel order error:', err);
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReturnRequest = async () => {
    if (!returnReason.trim()) {
      alert('Vui lòng nhập lý do đổi/trả hàng');
      return;
    }

    if (!token || !order) return;

    // Kiểm tra GHTK status trước khi submit
    if (ghtkStatus && !['delivered', 'returned'].includes(ghtkStatus)) {
      alert(`Không thể yêu cầu đổi/trả hàng. Trạng thái vận chuyển hiện tại: ${ghtkStatusInfo?.label || ghtkStatus}. Chỉ có thể yêu cầu khi đơn hàng đã được giao hoặc đã hoàn trả.`);
      return;
    }

    setSubmittingReturn(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/returns',
        {
          order_id: order.id,
          type: returnType,
          reason: returnReason,
          note: returnNote,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        setReturnRequest(response.data.data);
        setShowReturnModal(false);
        setReturnReason('');
        setReturnNote('');
        alert('Đã gửi yêu cầu đổi/trả hàng thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.');
      }
    } catch (err) {
      console.error('Error submitting return request:', err);
      alert(err.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getReturnStatusLabel = (status) => {
    const labels = {
      requested: 'Chờ duyệt',
      approved: 'Đã duyệt',
      shipping_back: 'Đang gửi hàng hoàn',
      received: 'Đã nhận hàng hoàn',
      completed: 'Hoàn thành',
      rejected: 'Từ chối',
    };
    return labels[status] || status;
  };

  const getReturnStatusColor = (status) => {
    const colors = {
      requested: 'warning',
      approved: 'info',
      shipping_back: 'primary',
      received: 'success',
      completed: 'success',
      rejected: 'danger',
    };
    return colors[status] || 'secondary';
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
            {canReturn && !returnRequest && (
              <Button
                variant="outline-warning"
                onClick={() => {
                  if (ghtkStatus && !['delivered', 'returned'].includes(ghtkStatus)) {
                    alert(`Không thể yêu cầu đổi/trả hàng. Trạng thái vận chuyển hiện tại: ${ghtkStatusInfo?.label || ghtkStatus}. Chỉ có thể yêu cầu khi đơn hàng đã được giao hoặc đã hoàn trả.`);
                    return;
                  }
                  setShowReturnModal(true);
                }}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1.25rem',
                  fontWeight: 600
                }}
              >
                Yêu cầu đổi/trả hàng
              </Button>
            )}
            {returnRequest && (
              <Badge bg={getReturnStatusColor(returnRequest.status)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Yêu cầu {returnRequest.type === 'refund' ? 'hoàn tiền' : 'đổi hàng'}: {getReturnStatusLabel(returnRequest.status)}
              </Badge>
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

                {/* Tùy chọn quà tặng */}
                {(order.wrapping_paper || order.decorative_accessories || order.card_type || order.card_note) && (
                  <>
                    <hr />
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'rgba(251, 99, 118, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(251, 99, 118, 0.2)'
                    }}>
                      <strong style={{ color: '#5D2A42', fontSize: '1rem', marginBottom: '0.75rem', display: 'block' }}>
                        Tùy chọn quà tặng
                      </strong>
                      {order.wrapping_paper && (
                        <div className="info-item" style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>Giấy gói:</strong>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>{order.wrapping_paper}</div>
                        </div>
                      )}
                      {order.decorative_accessories && (
                        <div className="info-item" style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>Phụ kiện trang trí:</strong>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>{order.decorative_accessories}</div>
                        </div>
                      )}
                      {order.card_type && (
                        <div className="info-item" style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>Loại thiệp:</strong>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>{order.card_type}</div>
                        </div>
                      )}
                      {order.card_note && (
                        <div className="info-item" style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>Ghi chú cho thiệp:</strong>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            color: '#666', 
                            marginTop: '0.25rem',
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '5px',
                            fontStyle: 'italic'
                          }}>
                            {order.card_note}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* GHTK Tracking Info */}
                {ghtkOrder && (
                  <>
                    <hr />
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'rgba(0, 123, 255, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 123, 255, 0.2)'
                    }}>
                      <strong style={{ color: '#5D2A42', fontSize: '1rem', marginBottom: '0.75rem', display: 'block' }}>
                        Thông tin vận chuyển GHTK
                      </strong>
                      {ghtkStatus && (
                        <div className="info-item" style={{ marginBottom: '0.75rem' }}>
                          <strong style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <GHTKStatusIcon style={{ color: ghtkStatusInfo?.color }} />
                            Trạng thái:
                          </strong>
                          <Badge 
                            bg="info" 
                            style={{ 
                              backgroundColor: ghtkStatusInfo?.color,
                              padding: '0.25rem 0.75rem',
                              fontSize: '0.85rem',
                              marginLeft: '0.5rem'
                            }}
                          >
                            {ghtkStatusInfo?.label || ghtkStatus}
                          </Badge>
                        </div>
                      )}
                      {order.tracking_code && (
                        <div className="info-item" style={{ marginBottom: '0.75rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>Mã vận đơn:</strong>
                          <div style={{ fontSize: '0.9rem', color: '#666', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                            {order.tracking_code}
                          </div>
                        </div>
                      )}
                      {ghtkOrder.tracking_url && (
                        <div className="info-item" style={{ marginBottom: '0.75rem' }}>
                          <a 
                            href={ghtkOrder.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.9rem',
                              color: '#007bff',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <FaTruck /> Theo dõi đơn hàng
                          </a>
                        </div>
                      )}
                      {ghtkOrder.order_code && (
                        <div className="info-item" style={{ marginBottom: '0.75rem' }}>
                          <strong style={{ fontSize: '0.9rem' }}>Mã đơn GHTK:</strong>
                          <div style={{ fontSize: '0.9rem', color: '#666', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                            {ghtkOrder.order_code}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
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
                    {(() => {
                      // COD: Không hiển thị thông báo hoàn tiền (vì chưa thanh toán)
                      // Bank transfer/Momo: Hiển thị thông báo hoàn tiền (vì đã thanh toán)
                      const shouldShowRefund = order.payment_method && 
                                               order.payment_method !== 'cod';
                      
                      if (shouldShowRefund) {
                        return 'Đơn hàng đã được hủy. Chúng tôi sẽ hoàn tiền lại trong vòng 24 giờ.';
                      }
                      return 'Đơn hàng đã được hủy.';
                    })()}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Return Request Modal */}
        <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Yêu cầu đổi/trả hàng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Loại yêu cầu <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Select value={returnType} onChange={(e) => setReturnType(e.target.value)}>
                  <option value="refund">Hoàn tiền</option>
                  <option value="exchange">Đổi hàng</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Lý do <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Vui lòng mô tả lý do bạn muốn đổi/trả hàng..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú thêm (tùy chọn)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Thêm thông tin chi tiết nếu cần..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReturnModal(false)}>
              Hủy
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmitReturnRequest}
              disabled={submittingReturn || !returnReason.trim()}
            >
              {submittingReturn ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <Footer />
    </div>
  );
}

