import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
        <footer className="site-footer">
            <div className="container">
                <div className="row g-4">
                    <div className="col-12 col-md-4">
                        <h6 className="site-footer__title">Giới thiệu</h6>
                        <p className="site-footer__desc">
                            GiftShop - Shop quà tặng chuyên nghiệp, mang đến những món quà ý nghĩa cho mọi dịp đặc biệt.
                        </p>
                    </div>
                    <div className="col-12 col-md-2">
                        <h6 className="site-footer__title">Pháp lý & Câu hỏi</h6>
                        <ul className="site-footer__list">
                            <li><a href="#">Hướng dẫn thanh toán</a></li>
                            <li><a href="#">Chính sách đổi trả</a></li>
                            <li><a href="#">Chính sách bảo mật</a></li>
                            <li><a href="#">Điều khoản dịch vụ</a></li>
                            <li><Link to="/contact">Liên hệ</Link></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-3">
                        <h6 className="site-footer__title">Danh mục</h6>
                        <ul className="site-footer__list">
                            <li><a href="/products?category=birthday">Quà sinh nhật</a></li>
                            <li><a href="/products?category=valentine">Quà Valentine</a></li>
                            <li><a href="/products?category=anniversary">Quà kỷ niệm</a></li>
                            <li><a href="/products?category=graduation">Quà tốt nghiệp</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-3">
                        <h6 className="site-footer__title">Thông tin liên hệ</h6>
                        <p className="site-footer__desc" style={{ marginBottom: '0.5rem' }}>
                            care@giftshop.com
                        </p>
                        <div className="d-flex gap-2" style={{ marginTop: '1rem' }}>
                            <button className="btn btn-social">Facebook</button>
                            <button className="btn btn-social alt">Zalo</button>
                        </div>
                    </div>
                </div>
                <div className="site-footer__bottom">© 2025 GiftShop. All rights reserved.</div>
            </div>
        </footer>
    </>
  )
}

export default Footer
