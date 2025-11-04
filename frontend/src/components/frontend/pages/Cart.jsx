import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Cart() {
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
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
      fetch("http://localhost:8000/api/cart/clear-cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }).then(() => setPaymentStatus("cancel"));
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (authLoading || loading) return <div>Loading...</div>;
  if (error && !cart)
    return (
      <div>
        <h2>Giỏ hàng</h2>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Giỏ hàng của bạn</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {cart?.items?.length > 0
          ? cart.items.map((item) => (
              <li key={item.id}>
                {item.product?.name || "Unknown Product"} x {item.quantity} ={" "}
                {(item.product?.price * item.quantity).toLocaleString()} VND
              </li>
            ))
          : <p>Giỏ hàng trống</p>}
      </ul>
      <p><strong>Tổng cộng:</strong> {cart?.total_amount?.toLocaleString("vi-VN")} VND</p>

      <h3>Thanh toán</h3>
      <input
        type="text"
        placeholder="Địa chỉ giao hàng"
        value={deliveryAddress}
        onChange={(e) => setDeliveryAddress(e.target.value)}
        style={{ marginRight: "10px", padding: "5px", width: "250px" }}
      />
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      >
        <option value="bank_transfer">Chuyển khoản ngân hàng</option>
        <option value="momo">MoMo</option>
        <option value="cod">COD</option>
      </select>
      <button onClick={checkout} disabled={loading}>
        {loading ? "Đang xử lý..." : "Thanh toán ngay"}
      </button>

      {timeLeft > 0 && paymentStatus === "pending" && (
        <p>⏳ Thời gian thanh toán còn lại: {Math.floor(timeLeft/60)}:{('0'+(timeLeft%60)).slice(-2)}</p>
      )}
      {paymentStatus === "cancel" && <p style={{ color: 'red' }}>❌ Đơn hàng đã hủy do hết thời gian thanh toán</p>}

      {qrCode && (
        <div style={{ marginTop: "30px" }}>
          <h4>Quét mã VietQR để thanh toán</h4>
          <img
            src={qrCode}
            alt="VietQR"
            width="250"
            height="250"
            style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}
          />
          <p><strong>Nội dung chuyển khoản:</strong> {transferContent}</p>
          <p><strong>Số tiền:</strong> {amount?.toLocaleString("vi-VN")} VND</p>
          <p><strong>Trạng thái đơn hàng:</strong>{" "}
            <span style={{ color: paymentStatus === "paid" ? "green" : paymentStatus === "pending" ? "orange" : "red" }}>
              {paymentStatus === "paid" ? "Đã thanh toán" : paymentStatus === "pending" ? "Đang chờ thanh toán" : "Đơn hàng hủy"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
