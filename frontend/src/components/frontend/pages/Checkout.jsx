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
import { FaCheckCircle, FaClock, FaTimesCircle, FaArrowLeft, FaCreditCard, FaMapMarkerAlt, FaPlus, FaStar, FaEdit, FaTrash } from "react-icons/fa";
import '../../../assets/css/_checkout.scss';

export default function Checkout() {
  const { token, user, loading: authLoading, refreshUser } = useContext(AuthContext);
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [editForm, setEditForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Việt Nam',
    is_default: false
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [wrappingPaperId, setWrappingPaperId] = useState("");
  const [wrappingPaper, setWrappingPaper] = useState("");
  const [wrappingPaperImage, setWrappingPaperImage] = useState("");
  const [decorativeAccessoryId, setDecorativeAccessoryId] = useState("");
  const [decorativeAccessories, setDecorativeAccessories] = useState("");
  const [decorativeAccessoryImage, setDecorativeAccessoryImage] = useState("");
  const [cardTypeId, setCardTypeId] = useState("");
  const [cardType, setCardType] = useState("");
  const [cardTypeImage, setCardTypeImage] = useState("");
  const [cardNote, setCardNote] = useState("");
  const [wrappingPapers, setWrappingPapers] = useState([]);
  const [decorativeAccessoriesList, setDecorativeAccessoriesList] = useState([]);
  const [cardTypes, setCardTypes] = useState([]);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [availableLoyaltyPoints, setAvailableLoyaltyPoints] = useState(0);
  const [printLabel, setPrintLabel] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [giftPreview, setGiftPreview] = useState(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
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
    fetchGiftOptions();
    fetchUserLoyaltyPoints();
  }, [token, authLoading, navigate, location, user]);

  // Tự động tính phí ship khi địa chỉ thay đổi (nếu đã có đủ thông tin)
  useEffect(() => {
    if (customerProvince && customerDistrict && deliveryAddress && cart?.items?.length > 0) {
      // Debounce để tránh gọi API quá nhiều
      const timer = setTimeout(() => {
        calculateShippingFee(customerProvince, customerDistrict, customerWard, deliveryAddress);
      }, 500);

      return () => clearTimeout(timer);
    } else if (!customerProvince || !customerDistrict || !deliveryAddress) {
      setShippingFee(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerProvince, customerDistrict, customerWard, deliveryAddress, cart?.items?.length]);

  // Cập nhật điểm từ user object khi user thay đổi
  useEffect(() => {
    if (user && user.loyalty_points !== undefined) {
      console.log("Updating loyalty points from user object:", user.loyalty_points);
      setAvailableLoyaltyPoints(user.loyalty_points || 0);
    }
  }, [user]);

  // Lấy số điểm thưởng hiện có của user
  const fetchUserLoyaltyPoints = async () => {
    if (!user || !token) {
      console.log("Cannot fetch loyalty points: no user or token");
      return;
    }
    try {
      const currentToken = token || localStorage.getItem("token");
      console.log("Fetching loyalty points for user:", user.id);
      const res = await axios.get("http://localhost:8000/api/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const newPoints = res.data.loyalty_points || 0;
      console.log("Fetched loyalty points:", newPoints, "from user data:", res.data);
      setAvailableLoyaltyPoints(newPoints);
    } catch (err) {
      console.error("Error fetching loyalty points:", err);
      setAvailableLoyaltyPoints(0);
    }
  };

  // Lấy danh sách quà tặng
  const fetchGiftOptions = async () => {
    try {
      const [papersRes, accessoriesRes, cardsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/gift-options/wrapping-papers'),
        axios.get('http://localhost:8000/api/gift-options/decorative-accessories'),
        axios.get('http://localhost:8000/api/gift-options/card-types')
      ]);

      console.log('Wrapping papers:', papersRes.data);
      console.log('Accessories:', accessoriesRes.data);
      console.log('Card types:', cardsRes.data);

      setWrappingPapers(papersRes.data || []);
      setDecorativeAccessoriesList(accessoriesRes.data || []);
      setCardTypes(cardsRes.data || []);
    } catch (error) {
      console.error('Error fetching gift options:', error);
      console.error('Error response:', error.response?.data);
    }
  };
  useEffect(() => {
    // Chỉ gọi khi chọn đủ 3
    if (!wrappingPaperId || !decorativeAccessoryId || !cardTypeId) {
      setGiftPreview(null);
      setPreviewError(null);
      setGeneratingPreview(false);
      return;
    }

    const generatePreview = async () => {
      setGeneratingPreview(true);
      setPreviewError(null);
      setGiftPreview(null);

      try {
        const res = await axios.post(
          "http://localhost:8000/api/gift/preview",
          {
            wrapping_paper_id: parseInt(wrappingPaperId),
            decorative_accessory_id: parseInt(decorativeAccessoryId),
            card_type_id: parseInt(cardTypeId),
          },
          {
            timeout: 30000, // 30 seconds timeout
          }
        );

        if (res.data.success && res.data.image_url) {
          setGiftPreview(res.data.image_url);
          setPreviewError(null);
        } else {
          throw new Error(res.data.message || 'Không thể tạo preview');
        }
      } catch (err) {
        console.error("❌ Lỗi tạo preview quà:", err);
        const errorMessage = err.response?.data?.message 
          || err.message 
          || 'Không thể tạo preview quà tặng. Vui lòng thử lại sau.';
        setPreviewError(errorMessage);
        setGiftPreview(null);
      } finally {
        setGeneratingPreview(false);
      }
    };

    // debounce nhẹ để tránh gọi API quá nhiều
    const timer = setTimeout(generatePreview, 800);
    return () => clearTimeout(timer);

  }, [wrappingPaperId, decorativeAccessoryId, cardTypeId]);
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

  // Tính phí ship dựa trên địa chỉ
  const calculateShippingFee = async (province, district, ward, address) => {
    if (!province || !district || !address) {
      setShippingFee(0);
      return;
    }

    setCalculatingShipping(true);
    try {
      // Tính trọng lượng từ giỏ hàng
      const totalWeight = cart?.items?.reduce((sum, item) => {
        const itemWeight = item.product?.weight_in_gram || 200;
        return sum + (itemWeight * item.quantity);
      }, 0) || 500;

      // Tính giá trị đơn hàng
      const orderValue = cart?.total_amount || 0;

      const res = await axios.post(
        "http://localhost:8000/api/shipping/calc",
        {
          address: address,
          province: province,
          district: district,
          ward: ward || "",
          weight: totalWeight,
          value: orderValue,
        }
      );

      if (res.data?.shipping_fee) {
        setShippingFee(res.data.shipping_fee);
      } else {
        setShippingFee(0);
      }
    } catch (error) {
      console.error("Error calculating shipping fee:", error);
      // Nếu lỗi, set về 0 (miễn phí)
      setShippingFee(0);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Chọn địa chỉ và điền vào form
  const selectAddress = (address) => {
    setSelectedAddress(address);
    // Map địa chỉ từ UserAddress sang form checkout
    const fullAddress = [address.address_line1, address.address_line2]
      .filter(Boolean)
      .join(", ");
    setDeliveryAddress(fullAddress);
    const province = address.state || address.city || "";
    const district = address.city || "";
    const ward = "";
    setCustomerProvince(province);
    setCustomerDistrict(district);
    setCustomerWard(ward);
    setShowAddressModal(false);

    // Tính phí ship khi chọn địa chỉ
    calculateShippingFee(province, district, ward, fullAddress);
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

  // Mở modal sửa địa chỉ
  const handleEditAddress = (address, e) => {
    e.stopPropagation(); // Ngăn chặn select address khi click vào nút sửa
    setEditingAddress(address);
    setEditForm({
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || 'Việt Nam',
      is_default: address.is_default || false
    });
    setShowEditModal(true);
  };

  // Xử lý sửa địa chỉ
  const handleSaveEditAddress = async () => {
    if (!editingAddress) return;

    setSavingAddress(true);
    try {
      const currentToken = token || localStorage.getItem("token");
      const userId = user?.id || localStorage.getItem("userId");

      if (!currentToken || !userId) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const addressId = editingAddress.address_id || editingAddress.id;
      await axios.put(
        `http://localhost:8000/api/users/${userId}/addresses/${addressId}`,
        editForm,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      // Refresh danh sách địa chỉ
      await fetchAddresses();
      setShowEditModal(false);
      setEditingAddress(null);
    } catch (err) {
      console.error("Edit address error:", err);
      alert("Lỗi khi sửa địa chỉ: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingAddress(false);
    }
  };

  // Mở dialog xác nhận xóa
  const handleDeleteAddress = (address, e) => {
    e.stopPropagation(); // Ngăn chặn select address khi click vào nút xóa
    const addressId = address.address_id || address.id;
    setDeletingAddressId(addressId);
    setShowDeleteConfirm(true);
  };

  // Xác nhận xóa địa chỉ
  const confirmDeleteAddress = async () => {
    if (!deletingAddressId) return;

    try {
      const currentToken = token || localStorage.getItem("token");
      const userId = user?.id || localStorage.getItem("userId");

      if (!currentToken || !userId) {
        alert("Vui lòng đăng nhập");
        return;
      }

      await axios.delete(
        `http://localhost:8000/api/users/${userId}/addresses/${deletingAddressId}`,
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      // Refresh danh sách địa chỉ
      await fetchAddresses();
      
      // Nếu địa chỉ đang chọn bị xóa, bỏ chọn
      if (selectedAddress && (selectedAddress.address_id === deletingAddressId || selectedAddress.id === deletingAddressId)) {
        setSelectedAddress(null);
        setDeliveryAddress("");
      }

      setShowDeleteConfirm(false);
      setDeletingAddressId(null);
    } catch (err) {
      console.error("Delete address error:", err);
      alert("Lỗi khi xóa địa chỉ: " + (err.response?.data?.message || err.message));
    }
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
      // Đảm bảo shipping fee đã được tính từ GHTK
      if (customerProvince && customerDistrict && deliveryAddress && cart?.items?.length > 0) {
        // Nếu đang tính hoặc chưa có shipping fee, tính lại
        if (calculatingShipping || !shippingFee || shippingFee === 0) {
          console.log('Tính lại shipping fee trước khi checkout...');
          await calculateShippingFee(customerProvince, customerDistrict, customerWard, deliveryAddress);
          // Đợi một chút để state cập nhật
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

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
      if (wrappingPaperId) {
        checkoutData.wrapping_paper_id = wrappingPaperId;
        checkoutData.wrapping_paper = wrappingPaper;
      }
      if (decorativeAccessoryId) {
        checkoutData.decorative_accessory_id = decorativeAccessoryId;
        checkoutData.decorative_accessories = decorativeAccessories;
      }
      if (cardTypeId) {
        checkoutData.card_type_id = cardTypeId;
        checkoutData.card_type = cardType;
      }
      if (cardNote && cardNote.trim()) {
        checkoutData.card_note = cardNote.trim();
      }
      // Đảm bảo print_label luôn là boolean
      checkoutData.print_label = Boolean(printLabel);
      // Thêm phí vận chuyển - Đảm bảo có giá trị từ GHTK
      const finalShippingFee = Number(shippingFee) || 0;
      checkoutData.shipping_fee = finalShippingFee;
      
      console.log('Checkout data - Shipping fee:', finalShippingFee, 'from state:', shippingFee);
      // Thêm điểm thưởng sử dụng
      if (loyaltyPointsUsed > 0) {
        checkoutData.loyalty_points_used = loyaltyPointsUsed;
      }
      if (giftPreview) {
        checkoutData.gift_preview_image = giftPreview;
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

      const isCOD = paymentMethod === 'cod';
      const responseAmount = res.data.total_with_shipping || res.data.amount || 0;
      const finalAmount = Number(responseAmount);
      
      console.log("Checkout response processing:", {
        payment_method: paymentMethod,
        isCOD: isCOD,
        has_qr_code: !!res.data.qr_code,
        total_with_shipping: res.data.total_with_shipping,
        amount: res.data.amount,
        shipping_fee: res.data.shipping_fee,
        total_amount: res.data.total_amount,
        finalAmount: finalAmount
      });

      setOrderId(res.data.order_id || null);
      setSubmitting(false);

      // Cập nhật shipping fee từ response nếu có
      if (res.data.shipping_fee !== undefined) {
        const responseShippingFee = Number(res.data.shipping_fee) || 0;
        setShippingFee(responseShippingFee);
        console.log("Updated shipping fee from response:", responseShippingFee);
      }

      // Xử lý theo payment method
      if (isCOD) {
        // COD: Không hiển thị QR, chỉ thông báo thành công
        setQrCode(""); // Không có QR code
        setAmount(finalAmount);
        setTransferContent("");
        setPaymentStatus("pending");
        setTimeLeft(0); // Không có countdown cho COD
        
        // Xóa giỏ hàng sau khi COD thành công
        try {
          await fetch("http://localhost:8000/api/cart/clear-cart", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
          });
          console.log("Cart cleared after COD order");
        } catch (err) {
          console.error("Error clearing cart:", err);
        }
        
        // Thông báo thành công
        alert(`✅ Đơn hàng #${res.data.order_id} đã được tạo thành công!\n\nTổng tiền: ${formatPrice(finalAmount)}\nBạn sẽ thanh toán khi nhận hàng.\n\nĐơn hàng đang ở trạng thái: Chờ thanh toán`);
        
        // Chuyển đến trang đơn hàng sau 2 giây
        setTimeout(() => {
          navigate(`/orders/${res.data.order_id}`);
        }, 2000);
      } else {
        // Bank transfer hoặc Momo: Hiển thị QR code
        if (!res.data.qr_code) {
          console.warn("QR code không có trong response:", res.data);
        }

        setQrCode(res.data.qr_code || "");
        setAmount(finalAmount);
        setTransferContent(res.data.addInfo || "");
        setPaymentStatus("pending");
        setTimeLeft(5 * 60); // 5 phút countdown
      }

      // Cập nhật lại số điểm sau khi sử dụng
      if (loyaltyPointsUsed > 0) {
        // Cập nhật từ response nếu có
        if (res.data.remaining_loyalty_points !== undefined) {
          console.log("Updated loyalty points from response:", res.data.remaining_loyalty_points);
          setAvailableLoyaltyPoints(res.data.remaining_loyalty_points);
        } else {
          // Nếu không có trong response, fetch lại
          await fetchUserLoyaltyPoints();
        }
        // Refresh user trong AuthContext để cập nhật điểm ở header và profile
        if (refreshUser) {
          await refreshUser();
        }
        // Reset điểm đã sử dụng
        setLoyaltyPointsUsed(0);
      }
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
        const currentToken = token || localStorage.getItem("token");

        // ✅ Gọi API markPaid để cập nhật trạng thái đơn hàng và giảm tồn kho
        if (orderId) {
          try {
            await axios.post(
              "http://localhost:8000/api/orders/mark-paid",
              { order_id: orderId },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${currentToken}`,
                },
              }
            );
            console.log("✅ Đã cập nhật trạng thái đơn hàng thành paid và giảm tồn kho");
          } catch (markPaidError) {
            console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng:", markPaidError);
            // Vẫn hiển thị thông báo thành công cho người dùng
            // Admin có thể cập nhật thủ công sau
          }
        }

        setPaymentStatus("paid");
        setPaymentMessage({ type: "success", text: "🎉 Thanh toán thành công!" });
        setCart({ items: [], total_amount: 0 });

        // Cập nhật lại số điểm sau khi thanh toán (điểm mới được tích)
        await fetchUserLoyaltyPoints();
        // Refresh user trong AuthContext để cập nhật điểm ở header và profile
        if (refreshUser) {
          await refreshUser();
        }

        // Xóa giỏ hàng
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
          <div className="checkout-loading-container">
            <div className="checkout-spinner"></div>
            <p className="checkout-loading-text">
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
          <Card className="checkout-error-card">
            <Card.Body>
              <h2 className="checkout-error-title">Lỗi</h2>
              <p className="checkout-error-text">{error}</p>
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
        <div className="checkout-header-section">
          <Button
            variant="link"
            onClick={() => navigate('/cart')}
            className="checkout-back-button"
          >
            <FaArrowLeft /> Quay lại giỏ hàng
          </Button>
          <h1 className="checkout-title">
            <FaCreditCard />
            Thanh toán
          </h1>
          <p className="checkout-subtitle">
            Điền thông tin giao hàng và chọn phương thức thanh toán
          </p>
        </div>

        {error && (
          <div className="alert alert-danger checkout-error-alert">
            {error}
          </div>
        )}

        <Row>
          <Col lg={8}>
            <Card className="checkout-main-card">
              <Card.Body className="checkout-card-body">
                <h2 className="checkout-section-title">
                  Thông tin giao hàng
                </h2>

                {/* Địa chỉ nhận hàng - Shopee style */}
                <div className="delivery-address-section">
                  <div className="address-header-row">
                    <FaMapMarkerAlt className="address-header-icon" />
                    <h3 className="address-header-title">
                      Địa Chỉ Nhận Hàng
                    </h3>
                  </div>

                  {selectedAddress ? (
                    <div className="address-content-wrapper">
                      <div className="address-details-wrapper">
                        <div className="recipient-name-display">
                          {user?.name || customerName || "Người nhận"}
                          {customerPhone && ` (+84) ${customerPhone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3')}`}
                        </div>
                        <div className="address-text-display">
                          {formatAddress(selectedAddress)}
                        </div>
                      </div>
                      <div className="address-actions-wrapper">
                        {selectedAddress.is_default && (
                          <span className="default-badge">
                            Mặc Định
                          </span>
                        )}
                        <Button
                          variant="link"
                          onClick={() => setShowAddressModal(true)}
                          className="change-address-button"
                        >
                          Thay Đổi
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-address-container">
                      <p className="empty-address-text">Chưa có địa chỉ giao hàng</p>
                      <Button
                        variant="outline-primary"
                        onClick={() => navigate('/add-address', { state: { returnTo: '/checkout' } })}
                        className="add-address-button"
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
                        <Form.Label className="checkout-form-label">
                          Họ tên người nhận <span className="required-asterisk">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên người nhận"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="checkout-form-control"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="checkout-form-label">
                          Số điện thoại <span className="required-asterisk">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập số điện thoại"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="checkout-form-control"
                        />
                      </Form.Group>
                    </Col>

                    {/* Tùy chọn quà tặng */}
                    <Col xs={12}>
                      <div className="gift-options-container">
                        <h3 className="gift-options-title">
                          Tùy chọn quà tặng
                        </h3>

                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="checkout-form-label">
                                Giấy gói
                              </Form.Label>
                              <Form.Select
                                value={wrappingPaperId}
                                onChange={(e) => {
                                  const selected = wrappingPapers.find(p => p.id === parseInt(e.target.value));
                                  setWrappingPaperId(e.target.value);
                                  setWrappingPaper(selected ? selected.name : '');
                                  setWrappingPaperImage(selected ? selected.image_url : '');
                                }}
                                className="checkout-form-select"
                              >
                                <option value="">Chọn giấy gói</option>
                                {wrappingPapers.map(paper => (
                                  <option key={paper.id} value={paper.id}>
                                    {paper.name} {paper.quantity > 0 ? `(Còn ${paper.quantity})` : '(Hết hàng)'}
                                  </option>
                                ))}
                              </Form.Select>
                              {wrappingPaperImage && wrappingPaperImage.trim() && (
                                <div className="preview-image-container">
                                  <div className="preview-label">Xem trước:</div>
                                  <div className="preview-image-wrapper">
                                    <img
                                      src={wrappingPaperImage}
                                      alt={wrappingPaper}
                                      className="preview-image"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        const parent = e.target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<div style="padding: 2rem; color: #999; font-size: 0.9rem;">Không thể tải hình ảnh</div>';
                                        }
                                      }}
                                      onLoad={() => console.log('Wrapping paper image loaded:', wrappingPaperImage)}
                                    />
                                  </div>
                                </div>
                              )}
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="checkout-form-label">
                                Phụ kiện trang trí
                              </Form.Label>
                              <Form.Select
                                value={decorativeAccessoryId}
                                onChange={(e) => {
                                  const selected = decorativeAccessoriesList.find(a => a.id === parseInt(e.target.value));
                                  setDecorativeAccessoryId(e.target.value);
                                  setDecorativeAccessories(selected ? selected.name : '');
                                  setDecorativeAccessoryImage(selected ? selected.image_url : '');
                                }}
                                className="checkout-form-select"
                              >
                                <option value="">Chọn phụ kiện</option>
                                {decorativeAccessoriesList.map(accessory => (
                                  <option key={accessory.id} value={accessory.id}>
                                    {accessory.name} {accessory.quantity > 0 ? `(Còn ${accessory.quantity})` : '(Hết hàng)'}
                                  </option>
                                ))}
                              </Form.Select>
                              {decorativeAccessoryImage && decorativeAccessoryImage.trim() && (
                                <div className="preview-image-container">
                                  <div className="preview-label">Xem trước:</div>
                                  <div className="preview-image-wrapper">
                                    <img
                                      src={decorativeAccessoryImage}
                                      alt={decorativeAccessories}
                                      className="preview-image"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        const parent = e.target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<div style="padding: 2rem; color: #999; font-size: 0.9rem;">Không thể tải hình ảnh</div>';
                                        }
                                      }}
                                      onLoad={() => console.log('Accessory image loaded:', decorativeAccessoryImage)}
                                    />
                                  </div>
                                </div>
                              )}
                            </Form.Group>
                          </Col>

                          <Col xs={12}>
                            <Form.Group className="mb-3">
                              <Form.Label className="checkout-form-label">
                                Loại thiệp
                              </Form.Label>
                              <Form.Select
                                value={cardTypeId}
                                onChange={(e) => {
                                  const selected = cardTypes.find(c => c.id === parseInt(e.target.value));
                                  setCardTypeId(e.target.value);
                                  setCardType(selected ? selected.name : '');
                                  setCardTypeImage(selected ? selected.image_url : '');
                                }}
                                className="checkout-form-select"
                              >
                                <option value="">Chọn loại thiệp</option>
                                {cardTypes.map(card => (
                                  <option key={card.id} value={card.id}>
                                    {card.name} {card.quantity > 0 ? `(Còn ${card.quantity})` : '(Hết hàng)'}
                                  </option>
                                ))}
                              </Form.Select>
                              {cardTypeImage && cardTypeImage.trim() && (
                                <div className="preview-image-container">
                                  <div className="preview-label">Xem trước:</div>
                                  <div className="preview-image-wrapper">
                                    <img
                                      src={cardTypeImage}
                                      alt={cardType}
                                      className="preview-image"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        const parent = e.target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<div style="padding: 2rem; color: #999; font-size: 0.9rem;">Không thể tải hình ảnh</div>';
                                        }
                                      }}
                                      onLoad={() => console.log('Card type image loaded:', cardTypeImage)}
                                    />
                                  </div>
                                </div>
                              )}
                            </Form.Group>
                          </Col>

                          <Col xs={12}>
                            <Form.Group className="mb-3">
                              <Form.Label className="checkout-form-label">
                                Ghi chú cho thiệp
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Nhập lời chúc hoặc ghi chú bạn muốn ghi trên thiệp..."
                                value={cardNote}
                                onChange={(e) => setCardNote(e.target.value)}
                                className="checkout-form-control"
                                maxLength={500}
                              />
                              <Form.Text className="text-muted character-count">
                                {cardNote.length}/500 ký tự
                              </Form.Text>
                              
                              {/* AI Gift Preview Section */}
                              {(wrappingPaperId && decorativeAccessoryId && cardTypeId) && (
                                <div className="ai-gift-preview-section">
                                  {generatingPreview && (
                                    <div className="ai-gift-preview-loading">
                                      <div className="preview-spinner"></div>
                                      <p>Đang tạo preview quà tặng...</p>
                                    </div>
                                  )}
                                  
                                  {previewError && !generatingPreview && (
                                    <div className="ai-gift-preview-error">
                                      <p>⚠️ {previewError}</p>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => {
                                          // Trigger regeneration by resetting and setting again
                                          const wp = wrappingPaperId;
                                          const da = decorativeAccessoryId;
                                          const ct = cardTypeId;
                                          setWrappingPaperId('');
                                          setDecorativeAccessoryId('');
                                          setCardTypeId('');
                                          setTimeout(() => {
                                            setWrappingPaperId(wp);
                                            setDecorativeAccessoryId(da);
                                            setCardTypeId(ct);
                                          }, 100);
                                        }}
                                      >
                                        Thử lại
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {giftPreview && !generatingPreview && (
                                    <div className="ai-gift-preview-container">
                                      <h4 className="ai-gift-preview-title">
                                        🎁 Xem trước gói quà (AI)
                                      </h4>

                                      <div className="ai-gift-preview-image-wrapper">
                                        <img
                                          src={giftPreview}
                                          alt="AI Gift Preview"
                                          className="ai-gift-preview-image"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            setPreviewError('Không thể tải hình ảnh preview');
                                            setGiftPreview(null);
                                          }}
                                        />
                                      </div>

                                      <div className="ai-gift-preview-note">
                                        * Hình ảnh được AI tạo dựa trên lựa chọn của bạn (giấy gói, phụ kiện, thiệp).
                                        Sản phẩm thực tế có thể chênh lệch nhỏ.
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    </Col>

                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="checkout-form-label">
                          Phương thức thanh toán <span className="required-asterisk">*</span>
                        </Form.Label>
                        <Form.Select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="checkout-form-select"
                        >
                          <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                          <option value="momo">MoMo</option>
                          <option value="cod">COD (Thanh toán khi nhận hàng)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <div className="gift-options-container">
                        <h3 className="gift-options-title">
                          Tùy chọn giao hàng
                        </h3>

                        <Form.Check
                          type="switch"
                          id="print-label-switch"
                          label="In nhãn đơn hàng (có thể hiển thị giá)"
                          checked={printLabel}
                          onChange={(e) => setPrintLabel(e.target.checked)}
                          className="mb-2"
                        />

                        {!printLabel && (
                          <div className="text-muted small">
                            🎁 Phù hợp khi tặng quà — đơn hàng sẽ <strong>không dán nhãn có giá</strong>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="order-summary-card">
              <Card.Body>
                <h2>Tổng đơn hàng</h2>

                {/* Đổi điểm thưởng - Đặt ở trên cùng */}
                {user && (
                  <div className="loyalty-points-section">
                    <div className="loyalty-header">
                      <FaStar className="star-icon" />
                      <div className="loyalty-info">
                        <div className="loyalty-title">Đổi điểm thưởng</div>
                        <div className="loyalty-subtitle">
                          {availableLoyaltyPoints > 0 ? (
                            <>Bạn có <strong>{availableLoyaltyPoints}</strong> điểm • 1 điểm = 100đ</>
                          ) : (
                            <>Bạn chưa có điểm thưởng • Tích điểm: 10,000đ = 1 điểm</>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="loyalty-input-group">
                      <Form.Control
                        type="number"
                        min="0"
                        max={availableLoyaltyPoints}
                        value={loyaltyPointsUsed}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(availableLoyaltyPoints, parseInt(e.target.value) || 0));
                          setLoyaltyPointsUsed(value);
                        }}
                        placeholder="Nhập số điểm"
                        disabled={availableLoyaltyPoints === 0}
                        className="loyalty-input"
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          const maxUsable = Math.min(availableLoyaltyPoints, Math.floor((cart?.total_amount || 0) / 100));
                          setLoyaltyPointsUsed(maxUsable);
                        }}
                        disabled={availableLoyaltyPoints === 0}
                        className="max-button"
                      >
                        Dùng tối đa
                      </Button>
                    </div>
                    {loyaltyPointsUsed > 0 && (
                      <div className="discount-display">
                        ✓ Giảm: {formatPrice(loyaltyPointsUsed * 100)}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items Summary */}
                {cart?.items && cart.items.length > 0 && (
                  <div className="order-items-container">
                    <h3 className="order-items-title">
                      Sản phẩm ({cart.items.length})
                    </h3>
                    {cart.items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <div className="order-item-info">
                          <div className="order-item-name">
                            {item.product?.name || "Unknown Product"}
                          </div>
                          <div className="order-item-details">
                            {formatPrice(item.product?.price || 0)} x {item.quantity}
                          </div>
                        </div>
                        <div className="order-item-price">
                          {formatPrice((item.product?.price || 0) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}


                <div className="price-summary-container">
                  <div className="price-row">
                    <span className="price-label">Tạm tính:</span>
                    <span className="price-value">
                      {formatPrice(cart?.total_amount || 0)}
                    </span>
                  </div>
                  {loyaltyPointsUsed > 0 && (
                    <div className="price-row price-row-discount">
                      <span className="price-label">Giảm giá (điểm thưởng):</span>
                      <span className="price-value">
                        -{formatPrice(loyaltyPointsUsed * 100)}
                      </span>
                    </div>
                  )}
                  <div className="price-row price-row-shipping">
                    <span className="price-label">Phí vận chuyển:</span>
                    <span className="price-value">
                      {calculatingShipping ? (
                        <span className="text-muted">Đang tính...</span>
                      ) : shippingFee > 0 ? (
                        formatPrice(shippingFee)
                      ) : (
                        "Miễn phí"
                      )}
                    </span>
                  </div>
                  <hr className="price-divider" />
                  <div className="price-total-row">
                    <span className="price-total-label">
                      Tổng cộng:
                    </span>
                    <span className="price-total-value">
                      {formatPrice(Math.max(0, (cart?.total_amount || 0) - (loyaltyPointsUsed * 100) + shippingFee))}
                    </span>
                  </div>
                </div>

                <Button
                  className="btn-book w-100 checkout-submit-button"
                  onClick={handleCheckout}
                  disabled={submitting || !deliveryAddress.trim() || !cart?.items?.length}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>

                {timeLeft > 0 && paymentStatus === "pending" && (
                  <div className="payment-timer">
                    <FaClock className="me-2" />
                    <strong>Thời gian thanh toán còn lại: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</strong>
                  </div>
                )}

                {paymentStatus === "cancelled" && (
                  <div className="payment-status-cancelled">
                    <FaTimesCircle className="me-2" />
                    Đơn hàng đã hủy do hết thời gian thanh toán
                  </div>
                )}

                {paymentStatus === "paid" && (
                  <div className="payment-status-paid">
                    <FaCheckCircle className="me-2" />
                    <strong>Thanh toán thành công!</strong>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* QR Code Modal Overlay - Chỉ hiển thị khi không phải COD */}
            {qrCode && paymentMethod !== 'cod' && (
              <div
                className="qr-modal-overlay"
                onClick={(e) => {
                  // Đóng modal khi click vào backdrop
                  if (e.target === e.currentTarget) {
                    // Không đóng, chỉ để người dùng thấy rõ QR
                  }
                }}
              >
                {/* Backdrop với blur */}
                <div className="qr-modal-backdrop" />

                {/* QR Code Modal */}
                <Card
                  className="qr-modal-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setQrCode('')}
                    className="qr-modal-close-button"
                  >
                    ×
                  </button>

                  <Card.Body className="qr-modal-body">
                    {/* Payment Message */}
                    {paymentMessage && (
                      <div className={`payment-message-container ${paymentMessage.type === 'success' ? 'success' : 'error'}`}>
                        <div className="payment-message-icon">
                          {paymentMessage.type === 'success' ? '✅' : '❌'}
                        </div>
                        <h4 className={`payment-message-text ${paymentMessage.type === 'success' ? 'success' : 'error'}`}>
                          {paymentMessage.text}
                        </h4>
                      </div>
                    )}

                    {!paymentMessage && (
                      <>
                        <h3 className="qr-modal-title">
                          Quét mã VietQR để thanh toán
                        </h3>

                        {/* QR Code - To và rõ ràng, căn giữa hoàn hảo */}
                        <div className="qr-code-container">
                          <div className="qr-code-wrapper">
                            <img
                              src={qrCode}
                              alt="VietQR"
                              className="qr-code-image"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Payment Info - Chỉ hiển thị khi chưa có thông báo */}
                    {!paymentMessage && (
                      <div className="payment-info-container">
                        <div className="payment-info-section">
                          <div className="payment-info-label">
                            <strong>Nội dung chuyển khoản:</strong>
                          </div>
                          <div className="payment-info-value">
                            {transferContent}
                          </div>
                        </div>
                        <div className="payment-info-section">
                          <div className="payment-info-label">
                            <strong>Số tiền cần thanh toán:</strong>
                          </div>
                          <div className="payment-info-amount">
                            {formatPrice(amount)}
                          </div>
                        </div>
                        <div className="text-center">
                          <Badge bg={paymentStatus === "paid" ? "success" : paymentStatus === "pending" ? "warning" : "danger"} className="payment-status-badge">
                            {paymentStatus === "paid" ? "✓ Đã thanh toán" : paymentStatus === "pending" ? "⏳ Đang chờ thanh toán" : "✗ Đơn hàng hủy"}
                          </Badge>
                        </div>

                        {/* Countdown timer */}
                        {timeLeft > 0 && (
                          <div className="countdown-timer">
                            Thời gian còn lại: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>
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
          className="address-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddressModal(false);
            }
          }}
        >
          <Card
            className="address-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <Card.Header className="address-modal-header">
              <h3 className="address-modal-title">
                Địa Chỉ Của Tôi
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="address-modal-close"
              >
                ×
              </button>
            </Card.Header>

            <Card.Body className="address-modal-body">
              {loadingAddresses ? (
                <div className="address-loading-text">
                  Đang tải địa chỉ...
                </div>
              ) : addresses.length === 0 ? (
                <div className="address-empty-container">
                  <p className="mb-3">Chưa có địa chỉ nào</p>
                  <Button
                    className="btn-book"
                    onClick={() => {
                      setShowAddressModal(false);
                      navigate('/add-address', { state: { returnTo: '/checkout' } });
                    }}
                  >
                    <FaPlus className="me-2" />
                    Thêm Địa Chỉ Mới
                  </Button>
                </div>
              ) : (
                <div className="address-list-container">
                  {addresses.map((address) => (
                    <div
                      key={address.address_id || address.id}
                      className={`address-item ${selectedAddress?.address_id === address.address_id || selectedAddress?.id === address.id ? 'selected' : ''}`}
                    >
                      <div className="address-item-content" onClick={() => selectAddress(address)}>
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddress?.address_id === address.address_id || selectedAddress?.id === address.id}
                          onChange={() => selectAddress(address)}
                          className="address-item-radio"
                        />
                        <div className="address-item-details">
                          <div className="address-item-header">
                            <div className="address-item-name">
                              {user?.name || customerName || "Người nhận"}
                            </div>
                            {address.is_default && (
                              <span className="default-badge">
                                Mặc Định
                              </span>
                            )}
                          </div>
                          <div className="address-item-text">
                            {formatAddress(address)}
                          </div>
                        </div>
                      </div>
                      <div className="address-item-actions" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => handleEditAddress(address, e)}
                          className="address-edit-button"
                          title="Sửa địa chỉ"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={(e) => handleDeleteAddress(address, e)}
                          className="address-delete-button"
                          title="Xóa địa chỉ"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>

            <Card.Footer className="address-modal-footer">
              <Button
                variant="outline-secondary"
                onClick={() => setShowAddressModal(false)}
                className="address-modal-cancel-button"
              >
                Hủy
              </Button>
              <Button
                className="btn-book address-modal-add-button"
                onClick={() => {
                  setShowAddressModal(false);
                  navigate('/add-address', { state: { returnTo: '/checkout' } });
                }}
              >
                <FaPlus className="me-2" />
                Thêm Địa Chỉ Mới
              </Button>
            </Card.Footer>
          </Card>
        </div>
      )}

      {/* Modal sửa địa chỉ */}
      {showEditModal && (
        <div
          className="address-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingAddress(null);
            }
          }}
        >
          <Card
            className="address-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px' }}
          >
            <Card.Header className="address-modal-header">
              <h3 className="address-modal-title">
                Sửa Địa Chỉ
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAddress(null);
                }}
                className="address-modal-close"
              >
                ×
              </button>
            </Card.Header>

            <Card.Body className="address-modal-body">
              <Form>
                <Row>
                  <Col xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Địa chỉ chi tiết <span style={{ color: '#FB6376' }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: Số 123, Đường ABC"
                        value={editForm.address_line1}
                        onChange={(e) => setEditForm({ ...editForm, address_line1: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Phường/Xã <span style={{ color: '#FB6376' }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: Phường 1, Phường Hải Châu"
                        value={editForm.address_line2}
                        onChange={(e) => setEditForm({ ...editForm, address_line2: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Tỉnh <span style={{ color: '#FB6376' }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: Đà Nẵng"
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Thành phố <span style={{ color: '#FB6376' }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: Quận Hải Châu"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mã bưu điện</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ví dụ: 550000"
                        value={editForm.postal_code}
                        onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Quốc gia <span style={{ color: '#FB6376' }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Đặt làm địa chỉ mặc định"
                        checked={editForm.is_default}
                        onChange={(e) => setEditForm({ ...editForm, is_default: e.target.checked })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>

            <Card.Footer className="address-modal-footer">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAddress(null);
                }}
                className="address-modal-cancel-button"
              >
                Hủy
              </Button>
              <Button
                className="btn-book"
                onClick={handleSaveEditAddress}
                disabled={savingAddress}
              >
                {savingAddress ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Card.Footer>
          </Card>
        </div>
      )}

      {/* Dialog xác nhận xóa */}
      {showDeleteConfirm && (
        <div
          className="address-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
              setDeletingAddressId(null);
            }
          }}
        >
          <Card
            className="address-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '400px' }}
          >
            <Card.Header className="address-modal-header">
              <h3 className="address-modal-title">
                Xác nhận xóa
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingAddressId(null);
                }}
                className="address-modal-close"
              >
                ×
              </button>
            </Card.Header>

            <Card.Body className="address-modal-body">
              <p>Bạn có chắc chắn muốn xóa địa chỉ này không?</p>
            </Card.Body>

            <Card.Footer className="address-modal-footer">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingAddressId(null);
                }}
                className="address-modal-cancel-button"
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteAddress}
              >
                Xóa
              </Button>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
}

