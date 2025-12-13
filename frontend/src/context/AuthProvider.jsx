import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Normalize initial token from localStorage
  const getInitialToken = () => {
    try {
      const t = localStorage.getItem("token");
      return t || null;
    } catch {
      return null;
    }
  };
  const [token, setToken] = useState(getInitialToken());
  const [loading, setLoading] = useState(true);

  // Hàm refresh user data
  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) return;
    
    try {
      const res = await axios.get("http://localhost:8000/api/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const userData = res.data.user || res.data;
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Error refreshing user:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    }
  };

  useEffect(() => {
    let storedToken;
    try {
      storedToken = localStorage.getItem("token");
      storedToken = storedToken || null; // Normalize undefined/null
    } catch (e) {
      console.error('Error accessing localStorage on init:', e);
      storedToken = null;
    }
    
    console.log('AuthProvider init - storedToken:', storedToken, 'type:', typeof storedToken);
    
    if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        console.log('Fetching user with token:', storedToken);
        const res = await axios.get("http://localhost:8000/api/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        // API trả về user trực tiếp, không wrap trong object
        const userData = res.data.user || res.data;
        console.log('User fetched successfully:', userData);
        setUser(userData);
        setToken(storedToken);
      } catch (err) {
        console.log("Token invalid or expired", err);
        // Chỉ xóa token nếu lỗi 401/403 (unauthorized)
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Update token when it changes (chỉ xóa nếu token thực sự bị clear, không xóa nếu localStorage đã có token)
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      // Clean up "undefined" string nếu có
      if (storedToken === 'undefined' || storedToken === 'null') {
        localStorage.removeItem("token");
      }
      
      if (token && token !== 'undefined' && token !== 'null' && typeof token === 'string') {
        // Nếu token state có giá trị hợp lệ, lưu vào localStorage
        localStorage.setItem("token", token);
      } else if (!token && !storedToken) {
        // Chỉ xóa nếu cả state và localStorage đều không có token
        localStorage.removeItem("token");
      }
      // Nếu token state null nhưng localStorage có token, giữ nguyên (có thể đang trong quá trình sync)
    } catch (e) {
      console.error('Error updating token in localStorage:', e);
    }
  }, [token]);

  // Sync token from localStorage when it changes (e.g., after login)
  useEffect(() => {
    let lastCheckedToken = null;
    
    const checkToken = () => {
      let storedToken;
      try {
        storedToken = localStorage.getItem("token");
        // Clean up invalid values
        if (storedToken === 'undefined' || storedToken === 'null') {
          localStorage.removeItem("token");
          storedToken = null;
        }
        // Normalize null/undefined to null
        storedToken = storedToken || null;
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        storedToken = null;
      }
      
      // Chỉ log và sync nếu có thay đổi
      if (storedToken !== lastCheckedToken) {
        lastCheckedToken = storedToken;
        
        if (storedToken && storedToken !== token && typeof storedToken === 'string' && storedToken.length > 0) {
          // Token was set in localStorage (from Login component)
          console.log('Token found in localStorage, syncing to state');
          setToken(storedToken);
          if (!user && !loading) {
            // Fetch user if we have token but no user
            setLoading(true);
            axios.get("http://localhost:8000/api/me", {
              headers: { Authorization: `Bearer ${storedToken}` },
            })
            .then(res => {
              // API trả về user trực tiếp, không wrap trong object
              const userData = res.data.user || res.data;
              console.log('User fetched after token sync:', userData);
              setUser(userData);
            })
            .catch(err => {
              console.log("Token invalid or expired after sync", err);
              // Chỉ xóa nếu lỗi 401/403
              if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem("token");
                setUser(null);
                setToken(null);
              }
            })
            .finally(() => setLoading(false));
          }
        }
      }
    };

    // Check immediately (có thể token đã được set trong cùng tab)
    checkToken();

    // Listen for storage events (from other tabs/windows) - chỉ trigger khi có thay đổi thực sự
    window.addEventListener("storage", checkToken);
    
    // Also check on focus (when user comes back to tab) - giảm frequency
    let focusTimeout;
    window.addEventListener("focus", () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(checkToken, 1000);
    });

    return () => {
      window.removeEventListener("storage", checkToken);
      window.removeEventListener("focus", checkToken);
      clearTimeout(focusTimeout);
    };
  }, [token, user, loading]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
