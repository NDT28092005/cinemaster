import React, { useEffect, useState, useContext } from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useNavigate, Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaSearch, FaUser, FaSignInAlt } from "react-icons/fa";
import { AuthContext } from '../../context/AuthContext.js';

const Header = () => {
    const navigate = useNavigate();
    const { user, setUser, setToken } = useContext(AuthContext);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [scrolled, setScrolled] = useState(false);
    
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        navigate('/');
    };

    return (
        <header className={`site-header hd${scrolled ? ' is-scrolled' : ''}`}>
            <div className='hd-above'>
                <div className="container site-header__container">
                    <Navbar expand="lg" className="site-header__navbar">
                        {/* Logo */}
                        <Navbar.Brand href="/" className="site-header__brand">
                            GiftShop
                        </Navbar.Brand>
                        {/* Right side: search, cart, login */}
                        <Navbar.Collapse className="site-header__right">
                            <div className="site-header__utilities ms-auto">
                                {/* Search */}
                                <Form inline className="site-header__search">
                                    <div className="input-group">
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm quà tặng..."
                                            className="site-header__search-input"
                                        />
                                        <button className="btn site-header__search-btn" type="button">
                                            <FaSearch />
                                        </button>
                                    </div>
                                </Form>
                                {/* Cart */}
                                <Nav.Link 
                                    href="/cart" 
                                    className="site-header__login"
                                    style={{ marginRight: '1rem' }}
                                >
                                    Giỏ hàng
                                </Nav.Link>
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
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item as={Link} to="/profile" className="profile-menu-item" onClick={(e) => e.stopPropagation()}>
                                                    <FaUser className="menu-icon" /> Hồ sơ của tôi
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={handleLogout} className="profile-menu-item logout">
                                                    <FaSignInAlt className="menu-icon" /> Đăng xuất
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ) : (
                                        <Nav.Link href="/login" className="site-header__login">
                                            <FaSignInAlt className="login-icon" /> Đăng nhập
                                        </Nav.Link>
                                    )}
                                </Nav>
                            </div>
                        </Navbar.Collapse>
                    </Navbar>
                </div>
            </div>
            <div className='hd-bot'>
                <div className="container">
                    <Navbar.Collapse className="">
                        <Nav>
                            <Nav.Link href="/products" className="">
                                Tất cả sản phẩm
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/products?category=birthday" className="">
                                Sinh nhật
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/products?category=anniversary" className="">
                                Kỷ niệm
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/products?category=valentine" className="">
                                Valentine
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/products?category=graduation" className="">
                                Tốt nghiệp
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/about" className="">
                                Giới thiệu
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </div>
        </header>
    )
}

export default Header
