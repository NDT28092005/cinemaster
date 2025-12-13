import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from '../../../layouts/AdminLayout';
import { ShoppingCart, Search, FileSpreadsheet, Download, Upload, Eye } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/orders", {
        params: { status: statusFilter, search },
      });
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedOrder(null);
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      fetchOrders();
      alert("Cập nhật trạng thái đơn hàng thành công!");
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái");
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/orders/export",
        { 
          responseType: "blob",
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `orders_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Xuất file thất bại! " + (err.response?.data?.message || err.message || "Kiểm tra server route."));
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert("Vui lòng chọn file Excel để import");
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/orders/import",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert("Import thành công! " + response.data.message);
        setImportFile(null);
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) fileInput.value = '';
        fetchOrders();
      } else {
        alert("Import thất bại: " + response.data.message);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Import failed! Check server route.";
      alert("Import thất bại: " + errorMessage);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        event.target.value = '';
        return;
      }
      setImportFile(file);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    return parseFloat(price).toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' },
      paid: { bg: 'rgba(0, 128, 0, 0.1)', color: '#008000' },
      processing: { bg: 'rgba(0, 123, 255, 0.1)', color: '#007bff' },
      completed: { bg: 'rgba(40, 167, 69, 0.1)', color: '#28a745' },
      cancelled: { bg: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }
    };
    return colors[status] || colors.pending;
  };

  return (
    <AdminLayout>
      <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <h1 style={{ 
          color: '#5D2A42', 
          fontSize: '2rem', 
          fontWeight: '600',
          marginBottom: '2rem'
        }}>
          Quản lý đơn hàng
        </h1>

        {/* Filter và Search */}
        <div className="admin-card mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{
                  border: '2px solid rgba(251, 99, 118, 0.2)',
                  borderRadius: '15px',
                  padding: '0.85rem 1.25rem',
                  fontSize: '1rem'
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-md-4">
              <div style={{ position: 'relative' }}>
                <Search 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search email / order ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{
                    border: '2px solid rgba(251, 99, 118, 0.2)',
                    borderRadius: '15px',
                    padding: '0.85rem 1.25rem 0.85rem 3rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex gap-2 flex-wrap justify-content-end">
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="import-file-input"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="import-file-input" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className="admin-btn"
                    style={{ 
                      padding: '0.75rem 1.25rem',
                      background: 'white',
                      color: '#FB6376',
                      border: '2px solid rgba(251, 99, 118, 0.3)',
                      fontWeight: '500'
                    }}
                  >
                    <FileSpreadsheet size={18} style={{ marginRight: '0.5rem' }} />
                    CHỌN FILE EXCEL
                  </button>
                </label>

                <button
                  type="button"
                  className="admin-btn"
                  onClick={handleImport}
                  disabled={!importFile}
                  style={{ 
                    padding: '0.75rem 1.25rem',
                    background: !importFile ? '#e9ecef' : '#6c757d',
                    color: !importFile ? '#6c757d' : 'white',
                    border: 'none',
                    fontWeight: '500',
                    opacity: !importFile ? 0.6 : 1,
                    cursor: !importFile ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Upload size={18} style={{ marginRight: '0.5rem' }} />
                  IMPORT EXCEL
                </button>

                <button
                  type="button"
                  className="admin-btn"
                  onClick={handleExport}
                  style={{ 
                    padding: '0.75rem 1.25rem',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    fontWeight: '500'
                  }}
                >
                  <Download size={18} style={{ marginRight: '0.5rem' }} />
                  EXPORT EXCEL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="loading-spinner" style={{ 
              width: '60px', 
              height: '60px', 
              border: '5px solid rgba(251, 99, 118, 0.2)', 
              borderTopColor: '#FB6376', 
              borderRightColor: '#FCB1A6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="table-responsive">
              <table className="admin-table" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User Email</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => {
                      const statusStyle = getStatusColor(order.status);
                      return (
                        <tr key={order.id}>
                          <td style={{ fontWeight: '600' }}>{order.id}</td>
                          <td>{order.user?.email || "Guest"}</td>
                          <td style={{ fontWeight: '500' }}>
                            {formatPrice(order.total_amount || 0)}
                          </td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '15px',
                              fontSize: '0.85rem',
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: '500'
                            }}>
                              {order.status || 'pending'}
                            </span>
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <div className="d-flex gap-2 align-items-center">
                              <button
                                onClick={() => handleOpenDetail(order)}
                                className="admin-btn"
                                style={{ 
                                  padding: '0.5rem 1rem',
                                  background: 'transparent',
                                  color: '#007bff',
                                  border: '1px solid #007bff',
                                  borderRadius: '8px',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                              >
                                CHI TIẾT
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                                className="form-select"
                                style={{
                                  border: '1px solid rgba(0, 0, 0, 0.2)',
                                  borderRadius: '8px',
                                  padding: '0.5rem 0.75rem',
                                  fontSize: '0.9rem',
                                  minWidth: '120px',
                                  background: 'white'
                                }}
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {openDetail && selectedOrder && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem'
            }}
            onClick={handleCloseDetail}
          >
            <div 
              className="admin-card"
              style={{ 
                maxWidth: '800px', 
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ 
                  color: '#5D2A42', 
                  fontSize: '1.5rem', 
                  fontWeight: '600',
                  margin: 0
                }}>
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <button
                  onClick={handleCloseDetail}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: '0.5rem 0.75rem' }}
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  <strong style={{ color: '#5D2A42' }}>User:</strong> {selectedOrder.user?.email || "Guest"}
                </p>
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  <strong style={{ color: '#5D2A42' }}>Tổng tiền:</strong> {formatPrice(selectedOrder.total_amount || 0)}
                </p>
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  <strong style={{ color: '#5D2A42' }}>Địa chỉ giao hàng:</strong> {selectedOrder.delivery_address || 'N/A'}
                </p>
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  <strong style={{ color: '#5D2A42' }}>Trạng thái:</strong>{' '}
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    ...getStatusColor(selectedOrder.status),
                    fontWeight: '500'
                  }}>
                    {selectedOrder.status}
                  </span>
                </p>
              </div>

              {/* Tùy chọn quà tặng */}
              {(selectedOrder.wrapping_paper || selectedOrder.decorative_accessories || selectedOrder.card_type || selectedOrder.card_note) && (
                <div className="mb-4" style={{
                  padding: '1rem',
                  background: 'rgba(251, 99, 118, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(251, 99, 118, 0.2)'
                }}>
                  <h3 style={{ 
                    color: '#5D2A42', 
                    fontSize: '1.2rem', 
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}>
                    Tùy chọn quà tặng:
                  </h3>
                  {selectedOrder.wrapping_paper && (
                    <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                      <strong style={{ color: '#5D2A42' }}>Giấy gói:</strong> {selectedOrder.wrapping_paper}
                    </p>
                  )}
                  {selectedOrder.decorative_accessories && (
                    <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                      <strong style={{ color: '#5D2A42' }}>Phụ kiện trang trí:</strong> {selectedOrder.decorative_accessories}
                    </p>
                  )}
                  {selectedOrder.card_type && (
                    <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                      <strong style={{ color: '#5D2A42' }}>Loại thiệp:</strong> {selectedOrder.card_type}
                    </p>
                  )}
                  {selectedOrder.card_note && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong style={{ color: '#5D2A42' }}>Ghi chú cho thiệp:</strong>
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background: 'white',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        fontStyle: 'italic',
                        color: '#666'
                      }}>
                        {selectedOrder.card_note}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 style={{ 
                  color: '#5D2A42', 
                  fontSize: '1.2rem', 
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  Sản phẩm:
                </h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).length > 0 ? (
                        selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.product?.name || "Unknown"}</td>
                            <td>{item.quantity}</td>
                            <td>{formatPrice(item.price || 0)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                            Không có sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
