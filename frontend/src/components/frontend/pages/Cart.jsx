import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  memo,
} from "react";
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

/* =======================
   CartItem (MEMO)
======================= */
const CartItem = memo(function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  formatPrice,
  navigate,
}) {
  const maxStock = item.product?.stock_quantity || 999;

  return (
    <div className="cart-item">
      <div
        className="cart-item-image"
        onClick={() => navigate(`/products/${item.product_id}`)}
      >
        <img
          src={
            item.product?.images?.[0]?.image_url ||
            item.product?.image_url ||
            "https://via.placeholder.com/100"
          }
          alt={item.product?.name}
        />
      </div>

      <div className="cart-item-info">
        <h5 onClick={() => navigate(`/products/${item.product_id}`)}>
          {item.product?.name}
        </h5>

        <div className="quantity-controls">
          <button onClick={() => onDecrease(item.id)}>-</button>
          <span>{item.quantity}</span>
          <button
            onClick={() => onIncrease(item.id)}
            disabled={item.quantity >= maxStock}
          >
            +
          </button>
        </div>

        <div className="cart-item-price">
          {formatPrice(item.product?.price * item.quantity)}
        </div>
      </div>

      <button
        className="cart-item-remove"
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
      >
        <FaTrash />
      </button>
    </div>
  );
});

/* =======================
   MAIN CART
======================= */
export default function Cart() {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const debounceTimers = useRef({});

  /* =======================
     Helpers
  ======================= */
  const getCurrentToken = useCallback(
    () => token || localStorage.getItem("token"),
    [token]
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + " đ";

  /* =======================
     Fetch cart
  ======================= */
  const fetchCart = useCallback(async () => {
    if (authLoading) return;

    const currentToken = getCurrentToken();
    if (!currentToken) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setCart(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [authLoading, getCurrentToken, navigate, location.pathname]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* =======================
     OPTIMISTIC UPDATE
  ======================= */
  const updateQuantityOptimistic = (cartId, delta) => {
    setCart((prev) => {
      const items = prev.items.map((item) =>
        item.id === cartId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );

      const total = items.reduce(
        (sum, i) => sum + i.quantity * (i.product?.price || 0),
        0
      );

      return { ...prev, items, total_amount: total };
    });

    // debounce API
    if (debounceTimers.current[cartId]) {
      clearTimeout(debounceTimers.current[cartId]);
    }

    debounceTimers.current[cartId] = setTimeout(() => {
      syncQuantityWithServer(cartId);
    }, 400);
  };

  /* =======================
     Sync server
  ======================= */
  const syncQuantityWithServer = async (cartId) => {
    const currentToken = getCurrentToken();
    const item = cart.items.find((i) => i.id === cartId);
    if (!item) return;

    try {
      await axios.put(
        "http://localhost:8000/api/cart/update",
        {
          cart_id: cartId,
          quantity: item.quantity,
        },
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
    } catch (err) {
      console.error("Sync quantity failed", err);
      // Optionally, revert the optimistic update here
      // fetchCart(); 
    }
  };

  /* =======================
     Remove item
  ======================= */
  const removeItem = async (cartId) => {
    const currentToken = getCurrentToken();
    try {
      const res = await axios.delete(
        "http://localhost:8000/api/cart/remove",
        {
          headers: { Authorization: `Bearer ${currentToken}` },
          data: { cart_id: cartId },
        }
      );
      setCart(res.data);
    } catch (error) {
      setError("Không thể xóa sản phẩm");
    }
  };

  /* =======================
     Checkout
  ======================= */
  const handleCheckout = () => {
    if (!cart.items.length) {
      alert("Giỏ hàng trống");
      return;
    }
    navigate("/checkout");
  };

  /* =======================
     Render
  ======================= */
  if (loading || authLoading) {
    return (
      <>
        <Header />
        <Container className="mt-5 pt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {/* ĐÃ THÊM: class="cart-page" */}
      <Container className="cart-page mt-5 pt-5">
        <Row>
          <Col md={8}>
            {/* ĐÃ THAY ĐỔI: Thêm class="cart-items-container" */}
            <Card className="cart-items-container">
              <Card.Header as="h3">Giỏ hàng của bạn</Card.Header>
              <Card.Body>
                {cart.items.length ? (
                  cart.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      navigate={navigate}
                      formatPrice={formatPrice}
                      onIncrease={(id) => updateQuantityOptimistic(id, +1)}
                      onDecrease={(id) => updateQuantityOptimistic(id, -1)}
                      onRemove={removeItem}
                    />
                  ))
                ) : (
                  // ĐÃ THAY ĐỔI: Thêm class="empty-cart"
                  <div className="empty-cart text-center">
                    <FaShoppingCart size={48} />
                    <p>Giỏ hàng của bạn hiện đang trống.</p>
                    <Button variant="primary" onClick={() => navigate("/products")}>
                      Mua sắm ngay
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            {/* ĐÃ THAY ĐỔI: Thêm class="order-summary" */}
            <Card className="order-summary">
              <Card.Header as="h4">Tổng đơn hàng</Card.Header>
              <Card.Body>
                <div className="summary-details">
                  <div className="d-flex justify-content-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(cart.total_amount)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between total">
                    <h5>Tổng cộng:</h5>
                    <h5>{formatPrice(cart.total_amount)}</h5>
                  </div>
                </div>
                <Button
                  className="w-100 mt-3"
                  onClick={handleCheckout}
                  disabled={!cart.items.length}
                >
                  Thanh toán <FaArrowRight />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}