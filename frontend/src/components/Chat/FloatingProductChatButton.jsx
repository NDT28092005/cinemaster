import React, { useState } from "react";
import ProductChatBot from "./ProductChatBot";
import "./FloatingProductChatButton.css";

export default function FloatingProductChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="product-chatbot-overlay" onClick={() => setIsOpen(false)}>
          <div className="product-chatbot-wrapper" onClick={(e) => e.stopPropagation()}>
            <ProductChatBot onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      <div
        className="floating-product-chatbot-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Chatbot Tư vấn Sản phẩm"
      >
        {isOpen ? "✕" : "💬"}
      </div>
    </>
  );
}

