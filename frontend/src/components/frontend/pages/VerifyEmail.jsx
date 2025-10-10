import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const userId = query.get("user");
    const token = query.get("token");

    if (!userId || !token) {
      alert("Link xác nhận không hợp lệ");
      return;
    }

    axios.post("http://localhost:8000/api/email/verify", { id: userId, token })
      .then(res => {
        if (res.data.status) {
          alert(res.data.message);
          // ❌ Không dùng navigate, redirect trực tiếp
          window.location.href = "http://localhost:5173/";
        }
      })
      .catch(err => {
        console.error(err);
        alert("Xác nhận thất bại");
      });
  }, [location]);

  return (
    <div style={{textAlign:"center", marginTop:"50px"}}>
      <h2>Đang xác nhận email...</h2>
    </div>
  );
}