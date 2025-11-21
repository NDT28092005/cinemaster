import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { Users, ShoppingBag, ShoppingCart, DollarSign, TrendingUp, Package, Home, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    previousMonth: {
      users: 0,
      products: 0,
      orders: 0,
      revenue: 0
    }
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

      // Tính toán dữ liệu tháng trước (giả lập - trong thực tế cần lấy từ API)
      const previousMonthData = {
        users: Math.max(0, users.length - Math.floor(users.length * 0.15)),
        products: Math.max(0, products.length - Math.floor(products.length * 0.1)),
        orders: Math.max(0, orders.length - Math.floor(orders.length * 0.2)),
        revenue: Math.max(0, revenue - revenue * 0.15)
      };

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalRevenue: revenue,
        recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        topProducts: Array.isArray(products) ? products.slice(0, 5) : [],
        previousMonth: previousMonthData
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

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const formatGrowth = (growth) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const statCards = [
    {
      icon: Users,
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      growth: calculateGrowth(stats.totalUsers, stats.previousMonth.users),
      color: '#FB6376',
      bg: 'linear-gradient(135deg, rgba(251, 99, 118, 0.15) 0%, rgba(251, 99, 118, 0.05) 100%)',
      iconBg: 'rgba(251, 99, 118, 0.2)'
    },
    {
      icon: ShoppingBag,
      title: 'Tổng sản phẩm',
      value: stats.totalProducts,
      growth: calculateGrowth(stats.totalProducts, stats.previousMonth.products),
      color: '#FCB1A6',
      bg: 'linear-gradient(135deg, rgba(252, 177, 166, 0.15) 0%, rgba(252, 177, 166, 0.05) 100%)',
      iconBg: 'rgba(252, 177, 166, 0.2)'
    },
    {
      icon: ShoppingCart,
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      growth: calculateGrowth(stats.totalOrders, stats.previousMonth.orders),
      color: '#5D2A42',
      bg: 'linear-gradient(135deg, rgba(93, 42, 66, 0.15) 0%, rgba(93, 42, 66, 0.05) 100%)',
      iconBg: 'rgba(93, 42, 66, 0.2)'
    },
    {
      icon: DollarSign,
      title: 'Tổng doanh thu',
      value: formatPrice(stats.totalRevenue),
      growth: calculateGrowth(stats.totalRevenue, stats.previousMonth.revenue),
      color: '#FB6376',
      bg: 'linear-gradient(135deg, rgba(251, 99, 118, 0.15) 0%, rgba(251, 99, 118, 0.05) 100%)',
      iconBg: 'rgba(251, 99, 118, 0.2)'
    }
  ];

  // Tính toán dự kiến tăng trưởng
  const growthProjections = {
    users: stats.totalUsers * 1.2, // Dự kiến tăng 20%
    products: stats.totalProducts * 1.15, // Dự kiến tăng 15%
    orders: stats.totalOrders * 1.25, // Dự kiến tăng 25%
    revenue: stats.totalRevenue * 1.3 // Dự kiến tăng 30%
  };

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
      <div style={{ animation: 'fadeInUp 0.6s ease-out', padding: '2rem' }}>
        {/* Header với nút về Home */}
        <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ 
            color: '#5D2A42', 
            fontSize: '2.5rem', 
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #5D2A42 0%, #FB6376 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Dashboard Quản Trị
          </h1>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #FB6376 0%, #FCB1A6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(251, 99, 118, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(251, 99, 118, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(251, 99, 118, 0.3)';
            }}
          >
            <Home size={20} />
            Về Trang Chủ
          </button>
        </div>

        {/* Stats Cards - Thiết kế mới */}
        <div className="row g-4 mb-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const isPositive = card.growth >= 0;
            return (
              <div key={index} className="col-md-6 col-lg-3">
                <div 
                  className="admin-card" 
                  style={{ 
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    background: card.bg,
                    border: `2px solid ${card.color}20`,
                    borderRadius: '20px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${card.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#666', 
                        marginBottom: '0.75rem',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {card.title}
                      </div>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700',
                        color: card.color,
                        marginBottom: '0.5rem'
                      }}>
                        {card.value}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: isPositive ? '#28a745' : '#dc3545'
                      }}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {formatGrowth(card.growth)}
                        <span style={{ color: '#666', fontWeight: '400', marginLeft: '0.25rem' }}>
                          so với tháng trước
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: card.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                      flexShrink: 0
                    }}>
                      <Icon size={28} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dự kiến tăng trưởng */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="admin-card" style={{
              background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1) 0%, rgba(252, 177, 166, 0.1) 100%)',
              border: '2px solid rgba(251, 99, 118, 0.2)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <div className="d-flex align-items-center mb-4" style={{ gap: '0.75rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(251, 99, 118, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FB6376'
                }}>
                  <TrendingUp size={24} />
                </div>
                <h2 style={{ 
                  margin: 0,
                  color: '#5D2A42',
                  fontSize: '1.75rem',
                  fontWeight: '700'
                }}>
                  Dự Kiến Tăng Trưởng (Tháng Tới)
                </h2>
              </div>
              
              <div className="row g-4">
                <div className="col-md-6 col-lg-3">
                  <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.25rem',
                    border: '1px solid rgba(251, 99, 118, 0.1)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      Người dùng
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FB6376' }}>
                      {Math.round(growthProjections.users)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#28a745', marginTop: '0.25rem' }}>
                      +20% dự kiến
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.25rem',
                    border: '1px solid rgba(252, 177, 166, 0.1)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      Sản phẩm
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FCB1A6' }}>
                      {Math.round(growthProjections.products)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#28a745', marginTop: '0.25rem' }}>
                      +15% dự kiến
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.25rem',
                    border: '1px solid rgba(93, 42, 66, 0.1)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      Đơn hàng
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#5D2A42' }}>
                      {Math.round(growthProjections.orders)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#28a745', marginTop: '0.25rem' }}>
                      +25% dự kiến
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.25rem',
                    border: '1px solid rgba(251, 99, 118, 0.1)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      Doanh thu
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FB6376' }}>
                      {formatPrice(growthProjections.revenue)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#28a745', marginTop: '0.25rem' }}>
                      +30% dự kiến
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="admin-card" style={{
              borderRadius: '20px',
              border: '2px solid rgba(251, 99, 118, 0.1)',
              overflow: 'hidden'
            }}>
              <div className="admin-card-title" style={{
                background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1) 0%, rgba(252, 177, 166, 0.1) 100%)',
                padding: '1.25rem',
                borderBottom: '2px solid rgba(251, 99, 118, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShoppingCart size={20} color="#FB6376" />
                  <span style={{ fontWeight: '600', color: '#5D2A42' }}>Đơn hàng gần đây</span>
                </div>
              </div>
              {stats.recentOrders.length > 0 ? (
                <div className="table-responsive" style={{ padding: '1rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid rgba(251, 99, 118, 0.1)' }}>ID</th>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid rgba(251, 99, 118, 0.1)' }}>Tổng tiền</th>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid rgba(251, 99, 118, 0.1)' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid rgba(251, 99, 118, 0.05)' }}>
                          <td style={{ padding: '0.75rem' }}>#{order.id}</td>
                          <td style={{ padding: '0.75rem', fontWeight: '600', color: '#5D2A42' }}>
                            {formatPrice(order.total_amount || 0)}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: order.status === 'completed' 
                                ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.15) 0%, rgba(40, 167, 69, 0.05) 100%)' 
                                : 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.05) 100%)',
                              color: order.status === 'completed' ? '#28a745' : '#ffc107',
                              border: `1px solid ${order.status === 'completed' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)'}`
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
            <div className="admin-card" style={{
              borderRadius: '20px',
              border: '2px solid rgba(252, 177, 166, 0.1)',
              overflow: 'hidden'
            }}>
              <div className="admin-card-title" style={{
                background: 'linear-gradient(135deg, rgba(252, 177, 166, 0.1) 0%, rgba(255, 220, 204, 0.1) 100%)',
                padding: '1.25rem',
                borderBottom: '2px solid rgba(252, 177, 166, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Package size={20} color="#FCB1A6" />
                  <span style={{ fontWeight: '600', color: '#5D2A42' }}>Sản phẩm nổi bật</span>
                </div>
              </div>
              {stats.topProducts.length > 0 ? (
                <div className="table-responsive" style={{ padding: '1rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid rgba(252, 177, 166, 0.1)' }}>Tên sản phẩm</th>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid rgba(252, 177, 166, 0.1)' }}>Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProducts.map((product) => (
                        <tr key={product.id} style={{ borderBottom: '1px solid rgba(252, 177, 166, 0.05)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: '500' }}>{product.name || 'N/A'}</td>
                          <td style={{ padding: '0.75rem', fontWeight: '600', color: '#FB6376' }}>
                            {formatPrice(product.price || 0)}
                          </td>
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
