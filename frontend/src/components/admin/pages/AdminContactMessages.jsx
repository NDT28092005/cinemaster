import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from '../../../layouts/AdminLayout';
import { Mail, Search, Eye, CheckCircle, Circle, MessageSquare, X, User, Phone, Calendar, MessageCircle } from "lucide-react";

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/admin/contact-messages", {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter },
      });
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        alert("Bạn không có quyền truy cập trang này!");
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleOpenDetail = (message) => {
    setSelectedMessage(message);
    setOpenDetail(true);
    // Đánh dấu đã đọc nếu chưa đọc
    if (message.status === 'new') {
      handleMarkAsRead(message.id);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedMessage(null);
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/admin/contact-messages/${messageId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages();
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      }
    } catch (err) {
      console.error(err);
      alert("Không thể đánh dấu đã đọc");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { 
        label: 'Mới', 
        bgColor: 'linear-gradient(135deg, #3B82F6, #2563EB)', 
        icon: Circle,
        textColor: '#fff'
      },
      read: { 
        label: 'Đã đọc', 
        bgColor: 'linear-gradient(135deg, #10B981, #059669)', 
        icon: CheckCircle,
        textColor: '#fff'
      },
      replied: { 
        label: 'Đã trả lời', 
        bgColor: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
        icon: MessageSquare,
        textColor: '#fff'
      },
    };
    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.9rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 600,
        background: config.bgColor,
        color: config.textColor,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const filteredMessages = messages.filter((msg) => {
    const searchLower = search.toLowerCase();
    return (
      msg.name?.toLowerCase().includes(searchLower) ||
      msg.email?.toLowerCase().includes(searchLower) ||
      msg.phone?.toLowerCase().includes(searchLower) ||
      msg.message?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', animation: 'fadeInUp 0.6s ease-out' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1) 0%, rgba(252, 177, 166, 0.1) 100%)',
          borderRadius: '20px',
          border: '2px solid rgba(251, 99, 118, 0.2)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 15px rgba(251, 99, 118, 0.3)'
          }}>
            <Mail size={28} />
          </div>
          <div>
            <h1 style={{ 
              color: '#5D2A42', 
              fontSize: '2rem', 
              fontWeight: 700,
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              Quản lý liên hệ
            </h1>
            <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>
              Quản lý và xem các tin nhắn liên hệ từ khách hàng
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Circle size={24} color="#3B82F6" />
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Tin nhắn mới</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3B82F6' }}>{stats.new}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={24} color="#10B981" />
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Đã đọc</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{stats.read}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
            border: '2px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <MessageSquare size={24} color="#8B5CF6" />
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Đã trả lời</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8B5CF6' }}>{stats.replied}</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.05))',
            border: '2px solid rgba(251, 99, 118, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(251, 99, 118, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Mail size={24} color="#FB6376" />
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>Tổng cộng</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FB6376' }}>{stats.total}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(251, 99, 118, 0.1)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  pointerEvents: 'none'
                }} size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 3rem',
                    border: '2px solid rgba(93, 42, 66, 0.15)',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FB6376';
                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(93, 42, 66, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: '2px solid rgba(93, 42, 66, 0.15)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FB6376';
                  e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(93, 42, 66, 0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="new">Mới</option>
                <option value="read">Đã đọc</option>
                <option value="replied">Đã trả lời</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        {loading ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '4rem',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(251, 99, 118, 0.2)',
              borderTopColor: '#FB6376',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#666', fontSize: '1rem' }}>Đang tải...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '4rem',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
          }}>
            <Mail size={64} color="#ccc" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
            <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: 500 }}>
              {search ? 'Không tìm thấy tin nhắn nào' : 'Không có tin nhắn liên hệ nào'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 99, 118, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(251, 99, 118, 0.1)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.1))',
                    borderBottom: '2px solid rgba(251, 99, 118, 0.2)'
                  }}>
                    <th style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Người gửi
                    </th>
                    <th style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Số điện thoại
                    </th>
                    <th style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Tin nhắn
                    </th>
                    <th style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Trạng thái
                    </th>
                    <th style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Ngày gửi
                    </th>
                    <th style={{
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((message, index) => (
                    <tr
                      key={message.id}
                      style={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease',
                        background: message.status === 'new' ? 'rgba(59, 130, 246, 0.05)' : 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = message.status === 'new' 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : 'rgba(251, 99, 118, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = message.status === 'new' 
                          ? 'rgba(59, 130, 246, 0.05)' 
                          : 'white';
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}>
                            {message.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#333', marginBottom: '0.25rem' }}>
                              {message.name}
                            </div>
                            {message.user && (
                              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                Thành viên
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <a
                          href={`mailto:${message.email}`}
                          style={{
                            color: '#FB6376',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#FCB1A6';
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#FB6376';
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          {message.email}
                        </a>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {message.phone ? (
                          <a
                            href={`tel:${message.phone}`}
                            style={{
                              color: '#5D2A42',
                              textDecoration: 'none',
                              fontSize: '0.95rem'
                            }}
                          >
                            {message.phone}
                          </a>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.95rem' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', maxWidth: '300px' }}>
                        <div style={{
                          fontSize: '0.95rem',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {message.message}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        {getStatusBadge(message.status)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {formatDate(message.created_at)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <button
                          onClick={() => handleOpenDetail(message)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(251, 99, 118, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 99, 118, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 99, 118, 0.2)';
                          }}
                        >
                          <Eye size={16} />
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {openDetail && selectedMessage && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={handleCloseDetail}
          >
            <div style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                padding: '2rem',
                borderBottom: '2px solid rgba(251, 99, 118, 0.2)',
                background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.05), rgba(252, 177, 166, 0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <MessageCircle size={24} />
                  </div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#5D2A42'
                  }}>
                    Chi tiết tin nhắn
                  </h2>
                </div>
                <button
                  onClick={handleCloseDetail}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgba(251, 99, 118, 0.1)',
                    color: '#FB6376',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FB6376';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(251, 99, 118, 0.1)';
                    e.currentTarget.style.color = '#FB6376';
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(251, 99, 118, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(251, 99, 118, 0.1)'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#666',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Trạng thái
                    </label>
                    <div>{getStatusBadge(selectedMessage.status)}</div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#5D2A42',
                        marginBottom: '0.75rem'
                      }}>
                        <User size={18} />
                        Họ và tên
                      </label>
                      <div style={{
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        color: '#333',
                        fontWeight: 500
                      }}>
                        {selectedMessage.name}
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#5D2A42',
                        marginBottom: '0.75rem'
                      }}>
                        <Mail size={18} />
                        Email
                      </label>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        style={{
                          display: 'block',
                          padding: '1rem',
                          background: '#f8f9fa',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          color: '#FB6376',
                          textDecoration: 'none',
                          fontWeight: 500,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(251, 99, 118, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8f9fa';
                        }}
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#5D2A42',
                        marginBottom: '0.75rem'
                      }}>
                        <Phone size={18} />
                        Số điện thoại
                      </label>
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        style={{
                          display: 'block',
                          padding: '1rem',
                          background: '#f8f9fa',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          color: '#FB6376',
                          textDecoration: 'none',
                          fontWeight: 500,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(251, 99, 118, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8f9fa';
                        }}
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      marginBottom: '0.75rem'
                    }}>
                      <MessageCircle size={18} />
                      Tin nhắn
                    </label>
                    <div style={{
                      padding: '1.5rem',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      color: '#333',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid rgba(251, 99, 118, 0.1)',
                      minHeight: '120px'
                    }}>
                      {selectedMessage.message}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#5D2A42',
                      marginBottom: '0.75rem'
                    }}>
                      <Calendar size={18} />
                      Ngày gửi
                    </label>
                    <div style={{
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      color: '#666'
                    }}>
                      {formatDate(selectedMessage.created_at)}
                    </div>
                  </div>

                  {selectedMessage.status === 'new' && (
                    <div style={{
                      paddingTop: '1.5rem',
                      borderTop: '2px solid rgba(251, 99, 118, 0.2)'
                    }}>
                      <button
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <CheckCircle size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Đánh dấu đã đọc
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminContactMessages;
