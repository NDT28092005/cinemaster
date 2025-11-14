import React, { useState, useEffect, useContext } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function Chat() {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    if (!token) return;

    axios
      .post(
        "http://localhost:8000/api/chat/start",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setConversationId(res.data.id);

        return axios.get(
          `http://localhost:8000/api/chat/messages/${res.data.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((res) => {
        setMessages(res.data);
      });
  }, [token]);

  // WebSocket connect và Polling fallback
  useEffect(() => {
    if (!conversationId || !token) return;

    let pollingInterval = null;

    // Setup WebSocket
    try {
      window.Pusher = Pusher;

      // Disconnect Echo cũ nếu có
      if (window.Echo) {
        window.Echo.disconnect();
      }

      window.Echo = new Echo({
        broadcaster: "pusher",
        key: "local",
        cluster: "mt1",
        wsHost: "127.0.0.1",
        wsPort: 6001,
        forceTLS: false,
        disableStats: true,
        encrypted: false,
        enabledTransports: ["ws", "wss"],

        authorizer: (channel) => ({
          authorize: (socketId, callback) => {
            axios
              .post(
                "http://localhost:8000/broadcasting/auth",
                {
                  socket_id: socketId,
                  channel_name: channel.name,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => callback(false, res.data))
              .catch((err) => {
                console.warn("WebSocket auth failed:", err);
                callback(true, err);
              });
          },
        }),
      });

      // Listen cho tin nhắn mới
      const channel = window.Echo.private(`conversation.${conversationId}`);
      
      channel
        .listen("MessageSent", (e) => {
          console.log("Received message via WebSocket:", e);
          setMessages((prev) => {
            // Kiểm tra duplicate
            if (prev.some((msg) => msg.id === e.id)) {
              return prev;
            }
            return [...prev, {
              id: e.id,
              conversation_id: e.conversation_id,
              sender_type: e.sender_type,
              content: e.content,
              created_at: e.created_at,
            }];
          });
        })
        .error((error) => {
          console.warn("WebSocket subscription error:", error);
        });

      // Kiểm tra kết nối WebSocket
      if (window.Echo.connector?.pusher?.connection) {
        window.Echo.connector.pusher.connection.bind("connected", () => {
          console.log("WebSocket connected");
        });

        window.Echo.connector.pusher.connection.bind("error", (err) => {
          console.warn("WebSocket connection error:", err);
        });
      }
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }

    // Polling fallback - poll mỗi 2 giây để đảm bảo nhận được tin nhắn
    const pollMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/chat/messages/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.length > 0) {
          setMessages((prev) => {
            const newMessages = response.data;
            // Chỉ update nếu có tin nhắn mới (so sánh số lượng hoặc ID cuối cùng)
            if (prev.length === 0) {
              return newMessages;
            }
            const lastNewId = newMessages[newMessages.length - 1]?.id;
            const lastPrevId = prev[prev.length - 1]?.id;
            if (lastNewId && lastNewId !== lastPrevId) {
              return newMessages;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    // Poll ngay lập tức và sau đó mỗi 2 giây
    pollMessages();
    pollingInterval = setInterval(pollMessages, 2000);

    return () => {
      if (window.Echo) {
        window.Echo.disconnect();
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [conversationId, token]);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;

    const newMsg = {
      id: "temp-" + Date.now(),
      conversation_id: conversationId,
      sender_type: "user",
      content: text,
      created_at: new Date().toISOString()
    };

    // Hiện ngay lập tức cho UI nhanh
    setMessages(prev => [...prev, newMsg]);

    axios
      .post(
        "http://localhost:8000/api/chat/send",
        {
          conversation_id: conversationId,
          content: text,
          sender_type: "user",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        // Cập nhật tin nhắn tạm bằng tin nhắn thật từ server
        setMessages((prev) => {
          const filtered = prev.filter((msg) => !msg.id.toString().startsWith("temp-"));
          return [...filtered, response.data];
        });
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        // Xóa tin nhắn tạm nếu gửi lỗi
        setMessages((prev) => prev.filter((msg) => !msg.id.toString().startsWith("temp-")));
      });

    setText("");
  };


  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chat hỗ trợ</h2>

      <div
        id="chat-messages"
        style={{
          height: 400,
          border: "1px solid #ccc",
          padding: 10,
          overflowY: "scroll",
          background: "#f9f9f9",
          marginBottom: 10,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#999", fontStyle: "italic" }}>Chưa có tin nhắn nào...</p>
        )}
        {messages.map((msg, i) => (
          <p key={msg.id || i}>
            <strong>
              {msg.sender_type === "user"
                ? user?.name || "Bạn"
                : msg.sender_type === "bot"
                  ? "Bot"
                  : msg.sender_type === "seller"
                    ? "Người bán"
                    : "Hệ thống"}
              :
            </strong>{" "}
            {msg.content}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          style={{ flex: 1, padding: 10 }}
        />

        <button
          onClick={send}
          style={{ padding: "10px 20px", background: "#FB6376", color: "#fff" }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
