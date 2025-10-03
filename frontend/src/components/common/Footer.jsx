import React from 'react'

const Footer = () => {
  return (
    <>
        <footer className="site-footer">
            <div className="container">
                <div className="row g-4">
                    <div className="col-12 col-md-3">
                        <h6 className="site-footer__title">Về chúng tôi</h6>
                        <ul className="site-footer__list">
                            <li><a href="#">Giới thiệu</a></li>
                            <li><a href="#">Tuyển dụng</a></li>
                            <li><a href="#">Liên hệ</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-3">
                        <h6 className="site-footer__title">Hỗ trợ</h6>
                        <ul className="site-footer__list">
                            <li><a href="#">Điều khoản sử dụng</a></li>
                            <li><a href="#">Chính sách bảo mật</a></li>
                            <li><a href="#">Câu hỏi thường gặp</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-3">
                        <h6 className="site-footer__title">Hệ thống rạp</h6>
                        <ul className="site-footer__list">
                            <li><a href="#">CineStar HCM</a></li>
                            <li><a href="#">CineStar Hà Nội</a></li>
                            <li><a href="#">CineStar Đà Nẵng</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-3">
                        <h6 className="site-footer__title">Kết nối</h6>
                        <p className="site-footer__desc">Theo dõi chúng tôi để cập nhật khuyến mãi mới nhất.</p>
                        <div className="d-flex gap-2">
                            <button className="btn btn-social">Facebook</button>
                            <button className="btn btn-social alt">Zalo</button>
                        </div>
                    </div>
                </div>
                <div className="site-footer__bottom">© 2025 Cinestar. All rights reserved.</div>
            </div>
        </footer>
    </>
  )
}

export default Footer
