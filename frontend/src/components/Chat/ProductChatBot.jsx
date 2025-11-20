import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { getCategories } from "../../api/category";
import { getProducts } from "../../api/product";
import { detectCategory, createBotResponse } from "../../services/productChatbotService";
import { AuthContext } from "../../context/AuthContext";
import { startProductChat, saveProductChatMessage } from "../../api/productChatbot";
import "./ProductChatBot.css";

export default function ProductChatBot({ onClose }) {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Lưu tin nhắn vào backend
  const saveMessageToBackend = useCallback(async (messageData) => {
    if (!token || !user || !conversationId) {
      return null; // Không lưu nếu chưa đăng nhập
    }

    try {
      const response = await saveProductChatMessage({
        conversation_id: conversationId,
        content: messageData.content,
        type: messageData.type,
        products: messageData.products || null,
        showCategories: messageData.showCategories || false,
      });
      return response.data;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  }, [token, user, conversationId]);

  // Load lịch sử conversation
  const loadConversationHistory = useCallback(async () => {
    try {
      const response = await startProductChat();
      const { conversation_id, messages: historyMessages } = response.data;
      
      setConversationId(conversation_id);
      localStorage.setItem("product_chatbot_conversation_id", conversation_id);
      
      // Nếu có lịch sử, load lại
      if (historyMessages && historyMessages.length > 0) {
        const formattedMessages = historyMessages.map((msg) => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          products: msg.products || null,
          showCategories: msg.showCategories || msg.showOccasions || false, // Hỗ trợ cả cũ và mới
        }));
        setMessages(formattedMessages);
      } else {
        // Nếu chưa có lịch sử, hiển thị tin nhắn chào hỏi và lưu vào backend
        const welcomeMessage = {
          id: "welcome-1",
          type: "bot",
          content: "Xin chào! 👋 Tôi là chatbot tư vấn sản phẩm. Bạn đang muốn tìm sản phẩm trong danh mục nào?",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        // Lưu welcome message vào backend
        await saveMessageToBackend(welcomeMessage);
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
      // Nếu lỗi, vẫn hiển thị tin nhắn chào hỏi
      const welcomeMessage = {
        id: "welcome-1",
        type: "bot",
        content: "Xin chào! 👋 Tôi là chatbot tư vấn sản phẩm. Bạn đang muốn tìm sản phẩm trong danh mục nào?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [saveMessageToBackend]);

  // Khởi tạo conversation và load lịch sử
  useEffect(() => {
    loadCategories();
    
    // Nếu user đã đăng nhập, load lịch sử
    if (token && user) {
      loadConversationHistory();
    } else {
      // Nếu chưa đăng nhập, chỉ hiển thị tin nhắn chào hỏi
      const welcomeMessage = {
        id: "welcome-1",
        type: "bot",
        content: "Xin chào! 👋 Tôi là chatbot tư vấn sản phẩm. Bạn đang muốn tìm sản phẩm trong danh mục nào?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [token, user, loadConversationHistory]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load danh sách categories
  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Sử dụng service để nhận diện category
  const handleDetectCategory = (text) => {
    return detectCategory(text, categories);
  };

  // Load sản phẩm theo category
  const loadProductsByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await getProducts({ category_id: categoryId });
      return response.data || [];
    } catch (error) {
      console.error("Error loading products:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setShowQuickReplies(false);

    // Lưu tin nhắn user vào backend
    await saveMessageToBackend(userMessage);

    // Nhận diện category
    const detectedCategory = handleDetectCategory(inputText.trim());

    if (detectedCategory && detectedCategory.id) {
      const botConfirmMessage = {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: `Tuyệt vời! Tôi đã hiểu bạn đang tìm sản phẩm trong danh mục "${detectedCategory.name}". Để tôi tìm các sản phẩm phù hợp cho bạn...`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botConfirmMessage]);
      
      // Lưu tin nhắn bot confirm vào backend
      await saveMessageToBackend(botConfirmMessage);

      // Load sản phẩm
      const productsData = await loadProductsByCategory(detectedCategory.id);

      // Sử dụng service để tạo response
      const botResponse = createBotResponse(detectedCategory, productsData);

      const botProductsMessage = {
        id: `bot-products-${Date.now()}`,
        type: "bot",
        content: botResponse.content,
        timestamp: new Date(),
        products: botResponse.products || [],
        showCategories: botResponse.showCategories || false,
      };

      setMessages((prev) => [...prev, botProductsMessage]);
      
      // Lưu tin nhắn bot products vào backend
      await saveMessageToBackend(botProductsMessage);

      if (botResponse.showCategories) {
        setShowQuickReplies(true);
      }
    } else {
      // Không nhận diện được category
      const botNotFoundMessage = {
        id: `bot-notfound-${Date.now()}`,
        type: "bot",
        content:
          "Xin lỗi, tôi chưa hiểu rõ danh mục bạn muốn tìm. Bạn có thể chọn một trong các danh mục sau hoặc nhập lại:",
        timestamp: new Date(),
        showCategories: true,
      };
      setMessages((prev) => [...prev, botNotFoundMessage]);
      
      // Lưu tin nhắn bot not found vào backend
      await saveMessageToBackend(botNotFoundMessage);
      
      setShowQuickReplies(true);
    }
  };

  // Xử lý chọn category từ quick reply
  const handleQuickReplyClick = (category) => {
    setInputText(category.name);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  // Format thời gian
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="product-chatbot-container">
      <div className="product-chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar">🤖</div>
          <div>
            <h3>Chatbot Tư vấn Sản phẩm</h3>
            <p className="chatbot-status">Đang online</p>
          </div>
        </div>
        {onClose && (
          <button className="chatbot-close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="product-chatbot-messages" ref={messagesEndRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chatbot-message ${message.type === "user" ? "user" : "bot"}`}
          >
            <div className="message-content">
              {message.content}
              
              {/* Hiển thị sản phẩm nếu có */}
              {message.products && message.products.length > 0 && (
                <div className="products-list">
                  {message.products.slice(0, 5).map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} />
                        ) : (
                          <div className="product-placeholder">📦</div>
                        )}
                      </div>
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        {product.short_description && (
                          <p className="product-short-description">
                            {product.short_description}
                          </p>
                        )}
                        {product.full_description && (
                          <p className="product-full-description">
                            {product.full_description}
                          </p>
                        )}
                        <p className="product-price">
                          {formatPrice(product.price)}
                        </p>
                        {product.stock_quantity > 0 ? (
                          <span className="product-stock in-stock">
                            Còn hàng
                          </span>
                        ) : (
                          <span className="product-stock out-of-stock">
                            Hết hàng
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {message.products.length > 5 && (
                    <p className="more-products-text">
                      ... và {message.products.length - 5} sản phẩm khác
                    </p>
                  )}
                </div>
              )}

              {/* Hiển thị danh sách categories nếu không nhận diện được */}
              {message.showCategories && categories.length > 0 && (
                <div className="occasions-list">
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category.id}
                      className="occasion-chip"
                      onClick={() => handleQuickReplyClick(category)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}

              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chatbot-message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && categories.length > 0 && (
        <div className="quick-replies">
          <p className="quick-replies-label">Chọn danh mục:</p>
          <div className="quick-replies-list">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                className="quick-reply-btn"
                onClick={() => handleQuickReplyClick(category)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="product-chatbot-input">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          placeholder="Nhập danh mục bạn muốn tìm sản phẩm..."
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || loading}
          className="send-btn"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

