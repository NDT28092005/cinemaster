import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { token, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // Debug: Kiểm tra token khi component mount
    const storedToken = localStorage.getItem('token');
    console.log('ProductList mounted - token from context:', token, 'token from localStorage:', storedToken);
  }, [token]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Fetch products error:', err));
  }, []);

  const addToCart = async (productId) => {
    // Đợi loading xong trước khi kiểm tra
    if (loading) {
      console.log('Still loading, waiting...');
      return;
    }
    
    // Kiểm tra token từ context hoặc localStorage (fallback)
    const tokenFromContext = token;
    let tokenFromStorage = localStorage.getItem('token');
    
    // Clean up invalid token values
    if (tokenFromStorage === 'undefined' || tokenFromStorage === 'null') {
      localStorage.removeItem('token');
      tokenFromStorage = null;
    }
    
    const currentToken = tokenFromContext || tokenFromStorage;
    
    // Chỉ log khi có vấn đề
    if (!currentToken || currentToken === 'undefined' || currentToken === 'null') {
      console.log('Token check - no valid token found:', {
        tokenFromContext,
        tokenFromStorage,
        currentToken,
        loading
      });
    }
    
    if (!currentToken || currentToken === 'undefined' || currentToken === 'null') {
      console.log('No token found, redirecting to login');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/cart/add",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Lỗi khi thêm vào giỏ hàng");
    }
  };

  return (
    <div>
      <h2>Products</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map(p => (
          <li key={p.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <img
              src={p.images[0]?.image_url || 'https://via.placeholder.com/100'}
              alt={p.name}
              style={{ width: '100px', height: '100px', objectFit: 'cover', marginBottom: '10px' }}
            />
            <div><strong>{p.name}</strong></div>
            <div>${Number(p.price).toFixed(2)}</div>
            <button
              onClick={() => addToCart(p.id)}
              style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}
            >
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
