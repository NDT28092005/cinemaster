import React from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="site-header hd">
            <div className='hd-above'>
                <div className="container site-header__container">
                    <Navbar expand="lg" className="site-header__navbar">
                        {/* Logo */}
                        <Navbar.Brand href="/" className="site-header__brand">
                            Cinestar
                        </Navbar.Brand>
                        {/* Action buttons */}
                        <Nav className="site-header__actions">
                            <Button
                                className="site-header__btn"
                                onClick={() => navigate("/movie")}
                            >
                                Đặt vé ngay
                            </Button>
                            <Button
                                className="site-header__btn"
                                onClick={() => navigate("/popcorn-drink")}
                            >
                                Đặt bắp nước
                            </Button>
                        </Nav>
                        {/* Right side: search, login, language */}
                        <Navbar.Collapse className="site-header__right">
                            <div className="site-header__utilities ms-auto">
                                {/* Search */}
                                <Form inline className="site-header__search">
                                    <div className="input-group">
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm phim"
                                            className="site-header__search-input"
                                        />
                                        <button className="btn site-header__search-btn" type="button">
                                            <FaSearch />
                                        </button>
                                    </div>
                                </Form>
                                {/* Login */}
                                <Nav>
                                    <Nav.Link href="/login" className="site-header__login">
                                        Đăng nhập
                                    </Nav.Link>
                                </Nav>
                                {/* Language dropdown */}
                                <Dropdown className="site-header__lang">
                                    <Dropdown.Toggle variant="success" size="sm">
                                        VN
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="#/action-1">ENG</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Navbar.Collapse>
                    </Navbar>
                </div>
            </div>
            <div className='hd-bot'>
                <div className="container">
                    <Navbar.Collapse className="">
                        <Nav>
                            <Nav.Link href="/" className="">
                                Chọn rạp
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/" className="">
                                Lịch chiếu
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Collapse className="">
                        <Nav>
                            <Nav.Link href="/" className="">
                                Khuyến mãi
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/" className="">
                                Tổ chức sự kiện
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/" className="">
                                Dịch vụ giải trí khác
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="/" className="">
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
