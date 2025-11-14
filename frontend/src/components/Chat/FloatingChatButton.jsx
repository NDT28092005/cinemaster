import React from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingChatButton() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/chat")}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "#FB6376",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: "28px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        cursor: "pointer",
        zIndex: 9999
      }}
    >
      💬
    </div>
  );
}
