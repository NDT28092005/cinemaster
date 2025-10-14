import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // thêm trạng thái loading

  useEffect(() => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    fetch("http://localhost:8000/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.admin) setUser({ ...data.admin, isAdmin: true });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);
  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken,loading}}>
      {children}
    </AuthContext.Provider>
  );
};
