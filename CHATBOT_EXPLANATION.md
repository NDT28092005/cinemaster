# 📚 Giải thích Toàn Bộ Hệ Thống Chatbot Lưu Lịch Sử

## ⚠️ Tại sao truy cập `/api/chat/product-chatbot/history` không hiển thị gì?

### Vấn đề:
- Route này **YÊU CẦU** có `{id}` trong URL: `/api/chat/product-chatbot/history/{id}`
- **KHÔNG THỂ** truy cập trực tiếp `/history` (thiếu conversation_id)
- **YÊU CẦU authentication** (phải có token trong header)

### Route đúng:
```
GET /api/chat/product-chatbot/history/1
```
(Trong đó `1` là `conversation_id` - ID của conversation trong database)

---

## 📋 TOÀN BỘ NHỮNG GÌ ĐÃ LÀM

### 1️⃣ **BACKEND - Database & Models**

#### a) Bảng `conversations`:
- Lưu thông tin cuộc trò chuyện
- Có các trường:
  - `id`: ID conversation
  - `user_id`: ID người dùng
  - `title`: Loại chat (`'product_chatbot'` cho chatbot tư vấn)
  - `created_at`, `updated_at`: Thời gian

#### b) Bảng `messages`:
- Lưu từng tin nhắn
- Có các trường:
  - `id`: ID tin nhắn
  - `conversation_id`: ID conversation chứa tin nhắn này
  - `user_id`: ID người gửi (null nếu là bot)
  - `sender_type`: Loại người gửi (`'user'`, `'bot'`, `'seller'`)
  - `content`: Nội dung tin nhắn
  - `meta`: JSON chứa thêm thông tin (products, showOccasions)
  - `created_at`, `updated_at`: Thời gian

#### c) Quan hệ:
```
Conversation (1) ──── (nhiều) Messages
    │
    └─── Mỗi conversation có nhiều messages
```

---

### 2️⃣ **BACKEND - API Endpoints**

#### ✅ **POST `/api/chat/product-chatbot/start`**
**Khi nào sử dụng:**
- Khi user mở chatbot lần đầu
- Khi user đã đăng nhập và mở chatbot

**Chức năng:**
1. Kiểm tra user đã đăng nhập chưa (cần token)
2. Tìm conversation của user với `title = 'product_chatbot'`
3. Nếu chưa có → Tạo mới
4. Nếu đã có → Lấy conversation hiện có
5. Load tất cả messages trong conversation đó
6. Trả về `conversation_id` và danh sách `messages`

**Code trong Controller:**
```php
public function startProductChat(Request $request)
{
    $user = $request->user(); // Lấy user từ token
    
    // Tìm hoặc tạo conversation
    $conv = Conversation::firstOrCreate(
        [
            'user_id' => $user->id,
            'title' => 'product_chatbot'
        ]
    );
    
    // Load messages
    $messages = Message::where('conversation_id', $conv->id)
        ->orderBy('created_at', 'asc')
        ->get();
    
    return response()->json([
        'conversation_id' => $conv->id,
        'messages' => $messages
    ]);
}
```

---

#### ✅ **POST `/api/chat/product-chatbot/save`**
**Khi nào sử dụng:**
- Sau MỖI tin nhắn được gửi (user hoặc bot)
- Tự động được gọi từ frontend

**Chức năng:**
1. Kiểm tra user đã đăng nhập chưa
2. Kiểm tra `conversation_id` có thuộc về user không (bảo mật)
3. Lưu tin nhắn vào bảng `messages`
4. Lưu kèm metadata (products, showOccasions) vào field `meta`
5. Trả về tin nhắn đã lưu

**Request Body:**
```json
{
  "conversation_id": 1,
  "content": "Tôi muốn tìm quà sinh nhật",
  "type": "user",  // hoặc "bot"
  "products": null,  // hoặc [array sản phẩm]
  "showOccasions": false
}
```

**Code trong Controller:**
```php
public function saveProductChatMessage(Request $request)
{
    $user = $request->user();
    
    // Kiểm tra conversation thuộc về user
    $conversation = Conversation::where('id', $request->conversation_id)
        ->where('user_id', $user->id)
        ->first();
    
    // Lưu message
    $message = Message::create([
        'conversation_id' => $request->conversation_id,
        'user_id' => $request->type === 'user' ? $user->id : null,
        'sender_type' => $request->type === 'user' ? 'user' : 'bot',
        'content' => $request->content,
        'meta' => [
            'products' => $request->products ?? null,
            'showOccasions' => $request->showOccasions ?? false,
        ]
    ]);
    
    return response()->json($message);
}
```

---

#### ⚠️ **GET `/api/chat/product-chatbot/history/{id}`**
**Khi nào sử dụng:**
- Hiện tại **CHƯA được sử dụng** trong code
- Có thể dùng để reload lịch sử mà không tạo conversation mới

**Lưu ý:**
- Cần phải có `{id}` trong URL (conversation_id)
- **KHÔNG THỂ** truy cập `/history` (thiếu id)
- Yêu cầu authentication

**Cách sử dụng đúng:**
```
GET /api/chat/product-chatbot/history/1
Header: Authorization: Bearer {token}
```
(Trong đó `1` là conversation_id)

**Code trong Controller:**
```php
public function getProductChatHistory(Request $request, $conversationId)
{
    $user = $request->user();
    
    // Kiểm tra conversation thuộc về user
    $conversation = Conversation::where('id', $conversationId)
        ->where('user_id', $user->id)
        ->where('title', 'product_chatbot')
        ->first();
    
    // Load messages
    $messages = Message::where('conversation_id', $conversationId)
        ->orderBy('created_at', 'asc')
        ->get();
    
    return response()->json($messages);
}
```

---

### 3️⃣ **FRONTEND - API Service**

**File:** `frontend/src/api/productChatbot.js`

#### a) `startProductChat()`
```javascript
export const startProductChat = () => {
  return axios.post(`${API_URL}/start`, {}, getAuthHeaders());
};
```
- Gọi endpoint `/start`
- Tự động gửi token từ localStorage
- Trả về `conversation_id` và `messages`

#### b) `saveProductChatMessage(data)`
```javascript
export const saveProductChatMessage = (data) => {
  return axios.post(`${API_URL}/save`, data, getAuthHeaders());
};
```
- Gọi endpoint `/save`
- Gửi kèm dữ liệu tin nhắn
- Tự động gửi token từ localStorage

#### c) `getProductChatHistory(conversationId)`
```javascript
export const getProductChatHistory = (conversationId) => {
  return axios.get(`${API_URL}/history/${conversationId}`, getAuthHeaders());
};
```
- Gọi endpoint `/history/{id}`
- Cần truyền `conversationId` vào URL
- Tự động gửi token từ localStorage

---

### 4️⃣ **FRONTEND - Component ProductChatBot**

**File:** `frontend/src/components/Chat/ProductChatBot.jsx`

#### a) Khi component mount:
```javascript
useEffect(() => {
  if (token && user) {
    // User đã đăng nhập → Load lịch sử
    loadConversationHistory();
  } else {
    // Chưa đăng nhập → Chỉ hiển thị tin nhắn chào hỏi (không lưu)
    const welcomeMessage = {
      id: "welcome-1",
      type: "bot",
      content: "Xin chào! 👋...",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }
}, [token, user]);
```

#### b) Load lịch sử:
```javascript
const loadConversationHistory = async () => {
  const response = await startProductChat();
  const { conversation_id, messages: historyMessages } = response.data;
  
  setConversationId(conversation_id); // Lưu ID để dùng sau
  localStorage.setItem("product_chatbot_conversation_id", conversation_id);
  
  if (historyMessages && historyMessages.length > 0) {
    // Có lịch sử → Hiển thị lại
    setMessages(historyMessages);
  } else {
    // Chưa có lịch sử → Hiển thị tin nhắn chào hỏi và lưu
    const welcomeMessage = { ... };
    setMessages([welcomeMessage]);
    await saveMessageToBackend(welcomeMessage); // Lưu vào DB
  }
};
```

#### c) Lưu tin nhắn:
```javascript
const saveMessageToBackend = async (messageData) => {
  if (!token || !user || !conversationId) {
    return null; // Không lưu nếu chưa đăng nhập
  }
  
  const response = await saveProductChatMessage({
    conversation_id: conversationId,
    content: messageData.content,
    type: messageData.type,
    products: messageData.products || null,
    showOccasions: messageData.showOccasions || false,
  });
  
  return response.data;
};
```

#### d) Khi user gửi tin nhắn:
```javascript
const handleSendMessage = async () => {
  // 1. Hiển thị tin nhắn user ngay lập tức
  const userMessage = {
    id: `user-${Date.now()}`,
    type: "user",
    content: inputText.trim(),
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, userMessage]);
  
  // 2. Lưu tin nhắn user vào backend
  await saveMessageToBackend(userMessage);
  
  // 3. Bot phản hồi
  // ... bot logic ...
  
  // 4. Lưu tin nhắn bot vào backend
  await saveMessageToBackend(botMessage);
};
```

---

## 🔄 LUỒNG HOẠT ĐỘNG CHI TIẾT

### **Scenario 1: User lần đầu mở chatbot (đã đăng nhập)**

```
1. User click floating button → ProductChatBot mount
   ↓
2. Component kiểm tra: token && user ? → YES
   ↓
3. Gọi loadConversationHistory()
   ↓
4. POST /api/chat/product-chatbot/start
   ↓
5. Backend:
   - Tìm conversation với user_id và title='product_chatbot'
   - Không tìm thấy → Tạo mới
   - Load messages: rỗng []
   ↓
6. Frontend nhận:
   {
     conversation_id: 1,
     messages: []
   }
   ↓
7. Không có lịch sử → Hiển thị welcome message
   ↓
8. Lưu welcome message vào backend:
   POST /api/chat/product-chatbot/save
   {
     conversation_id: 1,
     content: "Xin chào! 👋...",
     type: "bot"
   }
   ↓
9. Backend lưu vào DB:
   - Bảng messages có 1 record mới
```

### **Scenario 2: User gửi tin nhắn**

```
1. User nhập: "sinh nhật"
   ↓
2. Click gửi → handleSendMessage()
   ↓
3. Hiển thị tin nhắn user ngay (UI update)
   ↓
4. POST /api/chat/product-chatbot/save
   {
     conversation_id: 1,
     content: "sinh nhật",
     type: "user"
   }
   ↓
5. Backend lưu vào DB
   ↓
6. Bot nhận diện dịp lễ → "Sinh nhật"
   ↓
7. Bot reply: "Tuyệt vời! Để tôi tìm..."
   ↓
8. POST /api/chat/product-chatbot/save (bot confirm)
   ↓
9. Bot load sản phẩm
   ↓
10. Bot reply: "Tôi đã tìm thấy 5 sản phẩm..."
    ↓
11. POST /api/chat/product-chatbot/save (bot + products)
    {
      conversation_id: 1,
      content: "Tôi đã tìm thấy...",
      type: "bot",
      products: [{...}, {...}],
      showOccasions: false
    }
    ↓
12. Backend lưu vào DB (field meta chứa products)
```

### **Scenario 3: User đóng và mở lại chatbot**

```
1. User đóng chatbot (đã có conversation_id = 1)
   ↓
2. User mở lại chatbot
   ↓
3. Component mount → loadConversationHistory()
   ↓
4. POST /api/chat/product-chatbot/start
   ↓
5. Backend:
   - Tìm conversation với user_id và title='product_chatbot'
   - Tìm thấy conversation_id = 1
   - Load tất cả messages của conversation này
   ↓
6. Frontend nhận:
   {
     conversation_id: 1,
     messages: [
       {id: 1, type: "bot", content: "Xin chào! 👋..."},
       {id: 2, type: "user", content: "sinh nhật"},
       {id: 3, type: "bot", content: "Tuyệt vời!..."},
       {id: 4, type: "bot", content: "Tôi đã tìm thấy...", products: [...]}
     ]
   }
   ↓
7. Hiển thị lại toàn bộ lịch sử trên UI
```

---

## 🧪 CÁCH TEST ĐÚNG

### **Test Route `/start`:**
```bash
# 1. Login để lấy token
POST http://localhost:8000/api/login
Body: {
  "email": "user@example.com",
  "password": "password"
}
Response: { "token": "abc123..." }

# 2. Gọi /start với token
POST http://localhost:8000/api/chat/product-chatbot/start
Headers: {
  "Authorization": "Bearer abc123...",
  "Content-Type": "application/json"
}
Response: {
  "conversation_id": 1,
  "messages": [...]
}
```

### **Test Route `/save`:**
```bash
POST http://localhost:8000/api/chat/product-chatbot/save
Headers: {
  "Authorization": "Bearer abc123...",
  "Content-Type": "application/json"
}
Body: {
  "conversation_id": 1,
  "content": "Tôi muốn tìm quà sinh nhật",
  "type": "user"
}
Response: {
  "id": 5,
  "type": "user",
  "content": "Tôi muốn tìm quà sinh nhật",
  "timestamp": "2024-01-01T10:00:00"
}
```

### **Test Route `/history/{id}`:**
```bash
# Lưu ý: Phải có {id} trong URL!
GET http://localhost:8000/api/chat/product-chatbot/history/1
Headers: {
  "Authorization": "Bearer abc123..."
}
Response: [
  {
    "id": 1,
    "type": "bot",
    "content": "Xin chào! 👋...",
    "timestamp": "2024-01-01T10:00:00",
    "products": null,
    "showOccasions": false
  },
  // ... các tin nhắn khác
]
```

---

## ❌ LỖI THƯỜNG GẶP

### 1. Truy cập `/history` thiếu `{id}`
```
❌ GET /api/chat/product-chatbot/history
✅ GET /api/chat/product-chatbot/history/1
```

### 2. Không có token
```
❌ GET /api/chat/product-chatbot/history/1
→ Error 401: Unauthorized

✅ GET /api/chat/product-chatbot/history/1
   Header: Authorization: Bearer {token}
```

### 3. Conversation không thuộc về user
```
❌ User A cố truy cập conversation của User B
→ Error 404: Conversation not found
```

---

## 📊 TÓM TẮT

| Route | Method | Khi nào dùng | Cần gì | Trả về gì |
|-------|--------|--------------|--------|-----------|
| `/start` | POST | Mở chatbot | Token | conversation_id + messages |
| `/save` | POST | Sau mỗi tin nhắn | Token + conversation_id + message data | Message đã lưu |
| `/history/{id}` | GET | Load lại lịch sử | Token + conversation_id trong URL | Danh sách messages |

---

## 🎯 KẾT LUẬN

1. **Route `/history/{id}` cần có `{id}` trong URL** - đây là `conversation_id`
2. **Tất cả routes đều yêu cầu authentication** - phải có token
3. **Route `/history/{id}` hiện chưa được sử dụng** - thay vào đó, `/start` đã trả về cả lịch sử
4. **Hệ thống tự động lưu và load lịch sử** khi user mở chatbot

