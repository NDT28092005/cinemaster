import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [importFile, setImportFile] = useState(null);

  // Fetch orders với filter & search
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/orders", {
        params: { status: statusFilter, search },
      });
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  // Mở Dialog chi tiết
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedOrder(null);
  };

  // Cập nhật trạng thái đơn hàng
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8000/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      fetchOrders();
      alert("Order status updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // Export Excel trực tiếp
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
      link.setAttribute(
        "download",
        `orders_${timestamp}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export failed! " + (err.response?.data?.message || err.message || "Check server route."));
    }
  };

  // Import Excel file
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
        // Reset file input
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) fileInput.value = '';
        // Refresh orders list
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

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        event.target.value = '';
        return;
      }
      setImportFile(file);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Quản lý đơn hàng
      </Typography>

      <Box mb={2} display="flex" gap={2}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="processing">Processing</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>

        <TextField
          placeholder="Search email / order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          id="import-file-input"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="import-file-input">
          <Button
            variant="outlined"
            color="secondary"
            component="span"
            style={{ marginRight: '8px' }}
          >
            {importFile ? `Đã chọn: ${importFile.name}` : 'Chọn file Excel'}
          </Button>
        </label>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleImport}
          disabled={!importFile}
          style={{ marginRight: '8px' }}
        >
          Import Excel
        </Button>

        <Button variant="contained" color="primary" onClick={handleExport}>
          Export Excel
        </Button>
      </Box>

      <Box>
        <table width="100%" border="1" style={{ borderCollapse: "collapse" }}>
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
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user?.email || "Guest"}</td>
                  <td>{order.total_amount}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : ""}
                  </td>
                  <td>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDetail(order)}
                      style={{ marginRight: "8px" }}
                    >
                      Chi tiết
                    </Button>

                    <Select
                      value={order.status}
                      onChange={(e) =>
                        handleChangeStatus(order.id, e.target.value)
                      }
                      size="small"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Không có đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      {/* Dialog chi tiết order */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>
          {selectedOrder ? (
            <>
              <Typography>
                <strong>User:</strong> {selectedOrder.user?.email || "Guest"}
              </Typography>
              <Typography>
                <strong>Total:</strong> {selectedOrder.total_amount}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedOrder.delivery_address}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selectedOrder.status}
              </Typography>

              <Box mt={2}>
                <Typography variant="h6">Sản phẩm:</Typography>
                <table
                  width="100%"
                  border="1"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.product?.name || "Unknown"}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrder;
