import React from 'react'
import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import img1 from '../../assets/images/goal1.jpeg'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PosterSlider from './PosterSlider';
import { moviesNow, moviesSoon, promos, services } from './data';
const Content = () => {
    const [index, setIndex] = useState(0);

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };
    return (
        <div className="home-container">
            {/* Hero Carousel */}
            <section className="section hero">
                <div className="container">
                    <Carousel
                        activeIndex={index}
                        onSelect={handleSelect}
                        prevIcon={<ChevronLeft size={40} color="white" />}
                        nextIcon={<ChevronRight size={40} color="white" />}
                    >
                        <Carousel.Item>
                            <img className="d-block w-100 carousel-img" src={img1} alt="slide 1" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img className="d-block w-100 carousel-img" src={img1} alt="slide 2" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img className="d-block w-100 carousel-img" src={img1} alt="slide 3" />
                        </Carousel.Item>
                    </Carousel>
                </div>
            </section>

            {/* Quick Booking Bar */}
            <section className="section quick-book">
                <div className="container">
                    <div className="quick-book__grid">
                        <select className="form-select">
                            <option>1. Chọn Rạp</option>
                        </select>
                        <select className="form-select">
                            <option>2. Chọn Phim</option>
                        </select>
                        <select className="form-select">
                            <option>3. Chọn Ngày</option>
                        </select>
                        <select className="form-select">
                            <option>4. Chọn Suất</option>
                        </select>
                        <button className="btn btn-book">Đặt vé ngay</button>
                    </div>
                </div>
            </section>

            {/* Now Showing */}
            <section className="section movies">
                <div className="container">
                    <h3 className="section__title">Phim đang chiếu</h3>
                    <PosterSlider
                        items={moviesNow}
                        renderItem={(m) => (
                            <div className="movie-card">
                                <img src={m.poster} alt={m.title} />
                                <div className="movie-card__meta">
                                    <div className="movie-card__name">{m.title}</div>
                                    <button className="btn btn-sm btn-book">Mua vé</button>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </section>

            {/* Coming Soon */}
            <section className="section movies alt">
                <div className="container">
                    <h3 className="section__title">Phim sắp chiếu</h3>
                    <PosterSlider
                        items={moviesSoon}
                        renderItem={(m) => (
                            <div className="movie-card">
                                <img src={m.poster} alt={m.title} />
                                <div className="movie-card__meta">
                                    <div className="movie-card__name">{m.title}</div>
                                    <button className="btn btn-sm btn-outline">Thông tin</button>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </section>

            {/* Promotions */}
            <section className="section promo">
                <div className="container">
                    <h3 className="section__title">Khuyến mãi</h3>
                    <PosterSlider
                        items={promos}
                        renderItem={(p) => (
                            <div className="promo-card">
                                <img src={p.image} alt={p.title} />
                            </div>
                        )}
                    />
                    <div className="text-center mt-3">
                        <button className="btn btn-outline text-white">Tất cả ưu đãi</button>
                    </div>
                </div>
            </section>

            {/* Membership */}
            <section className="section membership">
                <div className="container">
                    <h3 className="section__title">Chương trình thành viên</h3>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <div className="member-card">
                                <img src={img1} alt="member" />
                                <div className="member-card__content">
                                    <h5>Thành viên C'Friend</h5>
                                    <button className="btn btn-outline">Tìm hiểu</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="member-card">
                                <img src={img1} alt="vip" />
                                <div className="member-card__content">
                                    <h5>Thành viên C'VIP</h5>
                                    <button className="btn btn-outline">Tìm hiểu</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Other Services */}
            <section className="section services">
                <div className="container">
                    <h3 className="section__title">Dịch vụ giải trí khác</h3>
                    <PosterSlider
                        items={services}
                        renderItem={(s) => (
                            <div className="service-card">
                                <img src={s.image} alt={s.title} />
                            </div>
                        )}
                    />
                </div>
            </section>

            {/* Contact */}
            <section className="section contact">
                <div className="container contact__grid">
                    <div className="contact__socials">
                        <button className="btn btn-social">Facebook</button>
                        <button className="btn btn-social alt">Zalo Chat</button>
                    </div>
                    <div className="contact__form">
                        <div className="card p-3">
                            <h5 className="mb-3">Liên hệ với chúng tôi</h5>
                            <div className="row g-2">
                                <div className="col-12 col-md-6">
                                    <input className="form-control" placeholder="Họ và tên" />
                                </div>
                                <div className="col-12 col-md-6">
                                    <input className="form-control" placeholder="Số điện thoại" />
                                </div>
                                <div className="col-12">
                                    <input className="form-control" placeholder="Email" />
                                </div>
                                <div className="col-12">
                                    <textarea className="form-control" rows="4" placeholder="Nội dung"></textarea>
                                </div>
                                <div className="col-12">
                                    <button className="btn btn-book w-100">Gửi ngay</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Content
