import axios from "axios";

const API_URL = "http://localhost:8000/api/chat/product-chatbot";
const TOKEN_KEY = "token";

// Helper để lấy token
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

/**
 * Tạo hoặc lấy conversation cho product chatbot
 * Trả về conversation_id và danh sách messages
 */
export const startProductChat = () => {
  return axios.post(`${API_URL}/start`, {}, getAuthHeaders());
};

/**
 * Lưu tin nhắn vào lịch sử
 */
export const saveProductChatMessage = (data) => {
  return axios.post(`${API_URL}/save`, data, getAuthHeaders());
};

/**
 * Load lịch sử chat
 */
export const getProductChatHistory = (conversationId) => {
  return axios.get(`${API_URL}/history/${conversationId}`, getAuthHeaders());
};

