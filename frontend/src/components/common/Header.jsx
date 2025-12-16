import React, { useEffect, useState, useContext } from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useNavigate, Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaSearch, FaUser, FaSignInAlt, FaShoppingCart, FaShoppingBag, FaStar } from "react-icons/fa";
import { AuthContext } from '../../context/AuthContext.js';
import { getCategories } from '../../api/category';
import { getOccasions } from '../../api/occasion';
import axios from 'axios';

const Header = () => {
    const navigate = useNavigate();
    const { user, setUser, setToken } = useContext(AuthContext);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        fetchCategoriesAndOccasions();
    }, []);

    const fetchCategoriesAndOccasions = async () => {
        try {
            const [categoriesRes, occasionsRes] = await Promise.all([
                getCategories(),
                getOccasions()
            ]);
            setCategories(categoriesRes.data || []);
            setOccasions(occasionsRes.data || []);
        } catch (error) {
            console.error('Error fetching categories/occasions:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/products');
        }
    };

    return (
        <header className={`site-header hd${scrolled ? ' is-scrolled' : ''}`}>
            <div className='hd-above'>
                <div className="container site-header__container">
                    <Navbar expand="lg" className="site-header__navbar">
                        {/* Logo */}
                        <Navbar.Brand 
                            href="/" 
                            className="site-header__brand"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/');
                            }}
                            style={{ 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textDecoration: 'none'
                            }}
                        >
                            <img 
                                src="/logo.png" 
                                alt="QUÀ TẶNG Logo"
                                onError={(e) => {
                                    // Ẩn logo nếu không tìm thấy và hiển thị text fallback
                                    e.target.style.display = 'none';
                                }}
                                style={{
                                    height: '60px',
                                    width: 'auto',
                                    maxWidth: '120px',
                                    objectFit: 'contain',
                                    transition: 'transform 0.3s ease',
                                    filter: 'drop-shadow(0 2px 4px rgba(93, 42, 66, 0.1))'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            />
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                lineHeight: '1.2'
                            }}>
                                <span style={{ 
                                    color: '#5D2A42', 
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px',
                                    fontFamily: 'serif'
                                }}>
                                    QUÀ TẶNG
                                </span>
                            </div>
                        </Navbar.Brand>

                        {/* Toggle button for mobile */}
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />

                        {/* Navigation Links - Giữa Logo và Search */}
                        <Navbar.Collapse id="basic-navbar-nav" className="site-header__actions">
                            <Nav className="site-header__nav-links">
                                <Nav.Link 
                                    as={Link} 
                                    to="/products" 
                                    className="nav-link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/products');
                                    }}
                                >
                                    Tất cả sản phẩm
                                </Nav.Link>
                                
                                {/* Occasions từ database */}
                                {occasions.slice(0, 2).map((occasion) => (
                                    <Nav.Link
                                        key={occasion.id}
                                        as={Link}
                                        to={`/products?occasion_id=${occasion.id}`}
                                        className="nav-link"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/products?occasion_id=${occasion.id}`);
                                        }}
                                    >
                                        {occasion.name}
                                    </Nav.Link>
                                ))}
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/about" 
                                    className="nav-link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/about');
                                    }}
                                >
                                    Giới thiệu
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/contact" 
                                    className="nav-link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/contact');
                                    }}
                                >
                                    Liên hệ
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>

                        {/* Right side: search, cart, login */}
                        <Navbar.Collapse className="site-header__right">
                            <div className="site-header__utilities ms-auto">
                                {/* Search - Design đẹp hơn */}
                                <Form className="site-header__search d-inline-flex" onSubmit={handleSearch}>
                                    <div className="input-group site-header__search-container" style={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 249, 236, 0.9))',
                                        borderRadius: '30px',
                                        border: '2px solid rgba(251, 99, 118, 0.15)',
                                        boxShadow: '0 4px 15px rgba(93, 42, 66, 0.08)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        overflow: 'hidden',
                                        width: '380px',
                                        maxWidth: '100%'
                                    }}>
                                        <div style={{
                                            padding: '0 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#FB6376',
                                            fontSize: '1rem',
                                            transition: 'transform 0.3s ease'
                                        }}>
                                            <FaSearch />
                                        </div>
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm quà tặng, sản phẩm..."
                                            className="site-header__search-input"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onFocus={(e) => {
                                                const container = e.target.closest('.site-header__search-container');
                                                if (container) {
                                                    container.style.borderColor = 'rgba(251, 99, 118, 0.4)';
                                                    container.style.boxShadow = '0 8px 25px rgba(251, 99, 118, 0.2)';
                                                    container.style.transform = 'scale(1.02)';
                                                }
                                            }}
                                            onBlur={(e) => {
                                                const container = e.target.closest('.site-header__search-container');
                                                if (container) {
                                                    container.style.borderColor = 'rgba(251, 99, 118, 0.15)';
                                                    container.style.boxShadow = '0 4px 15px rgba(93, 42, 66, 0.08)';
                                                    container.style.transform = 'scale(1)';
                                                }
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                padding: '0.85rem 0.5rem 0.85rem 0',
                                                fontSize: '0.95rem',
                                                color: '#5D2A42',
                                                flex: 1,
                                                outline: 'none',
                                                boxShadow: 'none'
                                            }}
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchTerm('')}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    padding: '0.5rem',
                                                    color: '#999',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s ease',
                                                    fontSize: '0.9rem',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    justifyContent: 'center'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#FB6376';
                                                    e.currentTarget.style.background = 'rgba(251, 99, 118, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = '#999';
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                        <button 
                                            className="btn site-header__search-btn" 
                                            type="submit"
                                            onClick={handleSearch}
                                            style={{
                                                background: 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                                                border: 'none',
                                                borderRadius: '0 30px 30px 0',
                                                padding: '0.85rem 1.5rem',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                                boxShadow: 'none',
                                                margin: '0'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #FCB1A6, #FB6376)';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #FB6376, #FCB1A6)';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            <FaSearch style={{ fontSize: '0.9rem' }} />
                                        </button>
                                    </div>
                                </Form>
                                
                                {/* Cart */}
                                <Nav.Link 
                                    as={Link}
                                    to="/cart" 
                                    className="site-header__login"
                                    style={{ 
                                        marginRight: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/cart');
                                    }}
                                >
                                    <FaShoppingCart />
                                    <span>Giỏ hàng</span>
                                </Nav.Link>
                                
                                {/* Đơn hàng của tôi - chỉ hiển thị khi đã đăng nhập */}
                                {user && (
                                    <Nav.Link 
                                        as={Link}
                                        to="/orders" 
                                        className="site-header__login"
                                        style={{ 
                                            marginRight: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/orders');
                                        }}
                                    >
                                        <FaShoppingBag />
                                        <span>Đơn hàng của tôi</span>
                                    </Nav.Link>
                                )}
                                
                                {/* Login or Profile */}
                                <Nav>
                                    {user ? (
                                        <Dropdown align="end" className="user-profile-dropdown">
                                            <Dropdown.Toggle 
                                                as="button" 
                                                className="site-header__profile-btn"
                                                id="user-profile-dropdown"
                                            >
                                                <FaUser className="profile-icon" />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="user-profile-menu">
                                                <Dropdown.Item as="div" className="user-info">
                                                    <div className="user-name">{user.name || user.email}</div>
                                                    <div className="user-email">{user.email}</div>
                                                    {user.loyalty_points !== undefined && (
                                                        <div style={{
                                                            marginTop: '0.5rem',
                                                            padding: '0.5rem',
                                                            background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.1))',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 600,
                                                            color: '#FB6376'
                                                        }}>
                                                            <FaStar style={{ fontSize: '1rem' }} />
                                                            <span>Điểm thưởng: <strong>{user.loyalty_points || 0}</strong> điểm</span>
                                                        </div>
                                                    )}
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/profile" 
                                                    className="profile-menu-item" 
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FaUser className="menu-icon" /> Hồ sơ của tôi
                                                </Dropdown.Item>
                                                <Dropdown.Item 
                                                    onClick={handleLogout} 
                                                    className="profile-menu-item logout"
                                                >
                                                    <FaSignInAlt className="menu-icon" /> Đăng xuất
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ) : (
                                        <Nav.Link 
                                            as={Link}
                                            to="/login" 
                                            className="site-header__login"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/login');
                                            }}
                                        >
                                            <FaSignInAlt className="login-icon" /> Đăng nhập
                                        </Nav.Link>
                                    )}
                                </Nav>
                            </div>
                        </Navbar.Collapse>
                    </Navbar>
                </div>
            </div>
            {/* Đã xóa hd-bot - navigation đã chuyển lên trên */}
        </header>
    )
}

export default Header
