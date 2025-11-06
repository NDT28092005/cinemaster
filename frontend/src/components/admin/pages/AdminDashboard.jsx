import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { Users, ShoppingBag, ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Gọi các API để lấy thống kê
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:8000/api/users'),
        axios.get('http://localhost:8000/api/products'),
        axios.get('http://localhost:8000/api/orders')
      ]);

      const users = usersRes.data.data || usersRes.data || [];
      const products = productsRes.data.data || productsRes.data || [];
      const orders = ordersRes.data.data || ordersRes.data || [];

      const revenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalRevenue: revenue,
        recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        topProducts: Array.isArray(products) ? products.slice(0, 5) : []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const statCards = [
    {
      icon: Users,
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      color: '#FB6376',
      bg: 'rgba(251, 99, 118, 0.1)'
    },
    {
      icon: ShoppingBag,
      title: 'Tổng sản phẩm',
      value: stats.totalProducts,
      color: '#FCB1A6',
      bg: 'rgba(252, 177, 166, 0.1)'
    },
    {
      icon: ShoppingCart,
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      color: '#5D2A42',
      bg: 'rgba(93, 42, 66, 0.1)'
    },
    {
      icon: DollarSign,
      title: 'Tổng doanh thu',
      value: formatPrice(stats.totalRevenue),
      color: '#FB6376',
      bg: 'rgba(251, 99, 118, 0.1)'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="loading-spinner" style={{ 
            width: '60px', 
            height: '60px', 
            border: '5px solid rgba(251, 99, 118, 0.2)', 
            borderTopColor: '#FB6376', 
            borderRightColor: '#FCB1A6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <h1 className="mb-4" style={{ 
          color: '#5D2A42', 
          fontSize: '2rem', 
          fontWeight: '600',
          marginBottom: '2rem'
        }}>
          Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="admin-card" style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#666', 
                        marginBottom: '0.5rem',
                        fontWeight: '500'
                      }}>
                        {card.title}
                      </div>
                      <div className="admin-card-value" style={{ fontSize: '1.8rem' }}>
                        {card.value}
                      </div>
                    </div>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '15px',
                      background: card.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color
                    }}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders & Top Products */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="admin-card">
              <div className="admin-card-title">
                <ShoppingCart size={20} />
                Đơn hàng gần đây
              </div>
              {stats.recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{formatPrice(order.total_amount || 0)}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '15px',
                              fontSize: '0.85rem',
                              background: order.status === 'completed' 
                                ? 'rgba(40, 167, 69, 0.1)' 
                                : 'rgba(255, 193, 7, 0.1)',
                              color: order.status === 'completed' ? '#28a745' : '#ffc107'
                            }}>
                              {order.status || 'pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                  Chưa có đơn hàng nào
                </p>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="admin-card">
              <div className="admin-card-title">
                <Package size={20} />
                Sản phẩm nổi bật
              </div>
              {stats.topProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name || 'N/A'}</td>
                          <td>{formatPrice(product.price || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                  Chưa có sản phẩm nào
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
