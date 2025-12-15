import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../../layouts/AdminLayout';
import { RefreshCw, CheckCircle, XCircle, Package, DollarSign, Eye } from 'lucide-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';

const STATUS_COLORS = {
  requested: 'warning',
  approved: 'info',
  shipping_back: 'primary',
  received: 'success',
  completed: 'success',
  rejected: 'danger',
};

const STATUS_LABELS = {
  requested: 'Chờ duyệt',
  approved: 'Đã duyệt',
  shipping_back: 'Đang gửi hàng hoàn',
  received: 'Đã nhận hàng hoàn',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
};

export default function AdminReturnRequests() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundMethod, setRefundMethod] = useState('bank');
  const [refundNote, setRefundNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReturns();
  }, [statusFilter, typeFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await axios.get('http://localhost:8000/api/admin/returns', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setReturns(res.data || []);
    } catch (err) {
      console.error('Error fetching returns:', err);
      alert('Không thể tải danh sách yêu cầu đổi/trả hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) return;

    try {
      await axios.post(
        `http://localhost:8000/api/admin/returns/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Đã duyệt yêu cầu thành công');
      fetchReturns();
    } catch (err) {
      console.error('Error approving return:', err);
      alert(err.response?.data?.message || 'Không thể duyệt yêu cầu');
    }
  };

  const handleReject = async (id) => {
    const note = window.prompt('Nhập lý do từ chối:');
    if (!note) return;

    try {
      await axios.post(
        `http://localhost:8000/api/admin/returns/${id}/reject`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Đã từ chối yêu cầu');
      fetchReturns();
    } catch (err) {
      console.error('Error rejecting return:', err);
      alert(err.response?.data?.message || 'Không thể từ chối yêu cầu');
    }
  };

  const handleReceived = async (id) => {
    if (!window.confirm('Xác nhận đã nhận hàng hoàn?')) return;

    try {
      await axios.post(
        `http://localhost:8000/api/admin/returns/${id}/received`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Đã xác nhận nhận hàng hoàn');
      fetchReturns();
    } catch (err) {
      console.error('Error confirming received:', err);
      alert(err.response?.data?.message || 'Không thể xác nhận');
    }
  };

  const handleRefund = async () => {
    if (!selectedReturn) return;

    setProcessing(true);
    try {
      const res = await axios.post(
        `http://localhost:8000/api/admin/returns/${selectedReturn.id}/refund`,
        {
          method: refundMethod,
          note: refundNote,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert('Hoàn tiền thành công!');
        setShowRefundModal(false);
        setSelectedReturn(null);
        fetchReturns();
      }
    } catch (err) {
      console.error('Error processing refund:', err);
      alert(err.response?.data?.message || 'Không thể hoàn tiền');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <AdminLayout>
      <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#5D2A42', fontWeight: 700 }}>Quản lý đổi/trả hàng</h1>
          <Button variant="outline-primary" onClick={fetchReturns} disabled={loading}>
            <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
            Làm mới
          </Button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Form.Select>

          <Form.Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Tất cả loại</option>
            <option value="refund">Hoàn tiền</option>
            <option value="exchange">Đổi hàng</option>
          </Form.Select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</div>
        ) : returns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            Không có yêu cầu nào
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#5D2A42', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Đơn hàng</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Loại</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Lý do</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Trạng thái</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Ngày tạo</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnReq) => (
                  <tr key={returnReq.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>#{returnReq.id}</td>
                    <td style={{ padding: '1rem' }}>
                      Đơn #{returnReq.order_id}
                      {returnReq.order && (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {formatPrice(returnReq.order.total_amount || 0)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge bg={returnReq.type === 'refund' ? 'danger' : 'info'}>
                        {returnReq.type === 'refund' ? 'Hoàn tiền' : 'Đổi hàng'}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {returnReq.reason}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge bg={STATUS_COLORS[returnReq.status] || 'secondary'}>
                        {STATUS_LABELS[returnReq.status] || returnReq.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      {formatDate(returnReq.created_at)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => {
                            setSelectedReturn(returnReq);
                            setShowDetail(true);
                          }}
                        >
                          <Eye size={14} />
                        </Button>

                        {returnReq.status === 'requested' && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleApprove(returnReq.id)}
                            >
                              <CheckCircle size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleReject(returnReq.id)}
                            >
                              <XCircle size={14} />
                            </Button>
                          </>
                        )}

                        {returnReq.status === 'approved' && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleReceived(returnReq.id)}
                          >
                            <Package size={14} />
                          </Button>
                        )}

                        {returnReq.status === 'received' && returnReq.type === 'refund' && !returnReq.refund && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => {
                              setSelectedReturn(returnReq);
                              setShowRefundModal(true);
                            }}
                          >
                            <DollarSign size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết yêu cầu #{selectedReturn?.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedReturn && (
              <div>
                <p><strong>Đơn hàng:</strong> #{selectedReturn.order_id}</p>
                <p><strong>Loại:</strong> {selectedReturn.type === 'refund' ? 'Hoàn tiền' : 'Đổi hàng'}</p>
                <p><strong>Lý do:</strong> {selectedReturn.reason}</p>
                {selectedReturn.note && <p><strong>Ghi chú:</strong> {selectedReturn.note}</p>}
                <p><strong>Trạng thái:</strong> {STATUS_LABELS[selectedReturn.status]}</p>
                {selectedReturn.refund && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h6>Thông tin hoàn tiền:</h6>
                    <p><strong>Số tiền:</strong> {formatPrice(selectedReturn.refund.amount)}</p>
                    <p><strong>Phương thức:</strong> {selectedReturn.refund.method}</p>
                    <p><strong>Trạng thái:</strong> {selectedReturn.refund.status === 'completed' ? 'Đã hoàn' : 'Chờ xử lý'}</p>
                    {selectedReturn.refund.note && <p><strong>Ghi chú:</strong> {selectedReturn.refund.note}</p>}
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetail(false)}>Đóng</Button>
          </Modal.Footer>
        </Modal>

        {/* Refund Modal */}
        <Modal show={showRefundModal} onHide={() => setShowRefundModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Hoàn tiền</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedReturn && (
              <div>
                <p><strong>Đơn hàng:</strong> #{selectedReturn.order_id}</p>
                <p><strong>Số tiền hoàn:</strong> {formatPrice(selectedReturn.order?.total_amount || 0)}</p>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phương thức hoàn tiền</Form.Label>
                  <Form.Select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}>
                    <option value="bank">Chuyển khoản ngân hàng</option>
                    <option value="wallet">Ví điện tử</option>
                    <option value="original">Hoàn về phương thức thanh toán gốc</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="Nhập ghi chú về việc hoàn tiền..."
                  />
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRefundModal(false)}>Hủy</Button>
            <Button variant="success" onClick={handleRefund} disabled={processing}>
              {processing ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
}

