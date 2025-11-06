import React from 'react'
import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import img1 from '../../assets/images/goal1.jpeg'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PosterSlider from './PosterSlider';
import { featuredGifts, newGifts, promos, categories } from './data';
import { useNavigate } from 'react-router-dom';
const Content = () => {
    const [index, setIndex] = useState(0);
    const navigate = useNavigate();

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
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
                            <img className="d-block w-100 carousel-img" src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200" alt="slide 1" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img className="d-block w-100 carousel-img" src="https://images.unsplash.com/photo-1518895949257-8f5e228be325?w=1200" alt="slide 2" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img className="d-block w-100 carousel-img" src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200" alt="slide 3" />
                        </Carousel.Item>
                    </Carousel>
                </div>
            </section>

            {/* Featured Gifts */}
            <section className="section movies">
                <div className="container">
                    <h3 className="section__title">Quà tặng nổi bật</h3>
                    <PosterSlider
                        items={featuredGifts}
                        renderItem={(gift) => (
                            <div className="movie-card" onClick={() => navigate('/products')}>
                                <img src={gift.image} alt={gift.title} />
                                <div className="movie-card__meta">
                                    <div className="movie-card__name">{gift.title}</div>
                                    <div className="movie-card__price">{formatPrice(gift.price)}</div>
                                    <button className="btn btn-sm btn-book" onClick={(e) => { e.stopPropagation(); navigate('/products'); }}>Xem chi tiết</button>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </section>

            {/* New Gifts */}
            <section className="section movies alt">
                <div className="container">
                    <h3 className="section__title">Quà tặng mới về</h3>
                    <PosterSlider
                        items={newGifts}
                        renderItem={(gift) => (
                            <div className="movie-card" onClick={() => navigate('/products')}>
                                <img src={gift.image} alt={gift.title} />
                                <div className="movie-card__meta">
                                    <div className="movie-card__name">{gift.title}</div>
                                    <div className="movie-card__price">{formatPrice(gift.price)}</div>
                                    <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); navigate('/products'); }}>Xem ngay</button>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </section>

            {/* Categories */}
            <section className="section services">
                <div className="container">
                    <h3 className="section__title">Danh mục quà tặng</h3>
                    <PosterSlider
                        items={categories}
                        renderItem={(cat) => (
                            <div className="service-card" onClick={() => navigate(`/products?category=${cat.title.toLowerCase()}`)}>
                                <img src={cat.image} alt={cat.title} />
                                <div className="service-card__title">{cat.title}</div>
                            </div>
                        )}
                    />
                </div>
            </section>

            {/* Promotions */}
            <section className="section promo">
                <div className="container">
                    <h3 className="section__title">Khuyến mãi đặc biệt</h3>
                    <PosterSlider
                        items={promos}
                        renderItem={(p) => (
                            <div className="promo-card">
                                <img src={p.image} alt={p.title} />
                                <div className="promo-card__title">{p.title}</div>
                            </div>
                        )}
                    />
                    <div className="text-center mt-4">
                        <button className="btn btn-outline" onClick={() => navigate('/products')}>Xem tất cả ưu đãi</button>
                    </div>
                </div>
            </section>


            {/* Contact */}
            <section className="section contact" style={{ background: '#f8f8f8', padding: '60px 0' }}>
                <div className="container">
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h3 className="section__title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Liên hệ với chúng tôi</h3>
                        <div className="card" style={{ borderRadius: '0', border: '1px solid rgba(0,0,0,0.08)', background: '#ffffff', padding: '2rem' }}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <input 
                                        className="form-control" 
                                        placeholder="Họ và tên"
                                        style={{ borderRadius: '0', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <input 
                                        className="form-control" 
                                        placeholder="Số điện thoại"
                                        style={{ borderRadius: '0', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div className="col-12">
                                    <input 
                                        className="form-control" 
                                        placeholder="Email"
                                        style={{ borderRadius: '0', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div className="col-12">
                                    <textarea 
                                        className="form-control" 
                                        rows="4" 
                                        placeholder="Nội dung"
                                        style={{ borderRadius: '0', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem' }}
                                    ></textarea>
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
