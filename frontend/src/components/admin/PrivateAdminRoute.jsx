import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PrivateAdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // nếu đang load dữ liệu user, hiển thị loading
  if (loading) return <div>Đang kiểm tra quyền truy cập...</div>;

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}