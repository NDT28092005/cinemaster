import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../api/product';
import PosterSlider from './PosterSlider';
import HeroSlider from './HeroSlider';

const GIFT_STYLES = [
    {
        id: 'birthday',
        title: 'Sinh nhật',
        description: 'Bùng nổ niềm vui cho ngày tuổi mới',
        image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'anniversary',
        title: 'Kỷ niệm',
        description: 'Giữ trọn khoảnh khắc hai người',
        image: 'https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'corporate',
        title: 'Doanh nghiệp',
        description: 'Tinh tế dành cho đối tác quan trọng',
        image: 'https://images.unsplash.com/photo-1508233661973-36e2ae67bc3f?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'holiday',
        title: 'Ngày lễ',
        description: 'Trang trí ngọt ngào cho mùa lễ hội',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
    }
];

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Ngọc Anh',
        role: 'Content Creator',
        rating: 5,
        content: 'Mình cực kỳ ấn tượng với chất liệu và cách đóng gói sản phẩm. Đặt hàng từ Shop.co chưa bao giờ khiến mình thất vọng.'
    },
    {
        id: 2,
        name: 'Minh Tuấn',
        role: 'Photographer',
        rating: 5,
        content: 'Giao hàng nhanh, sản phẩm đúng như mô tả. Bộ sưu tập mới luôn được cập nhật liên tục nên rất dễ để bắt kịp xu hướng.'
    },
    {
        id: 3,
        name: 'Bích Trâm',
        role: 'Brand Executive',
        rating: 4,
        content: 'Thiết kế tinh tế, màu sắc trendy. Dịch vụ chăm sóc khách hàng thân thiện và hỗ trợ đổi size rất nhanh chóng.'
    }
];

const BRAND_STRIP = ['Birthday', 'Anniversary', 'Corporate', 'Holiday', 'Handmade'];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60';

// Hero Slider Data - Có thể thêm nhiều slide ở đây
const HERO_SLIDES = [
    {
        id: 1,
        title: 'TÌM MÓN QUÀ PHÙ HỢP VỚI PHONG CÁCH CỦA BẠN',
        description: 'Khám phá bộ sưu tập quà tặng đa dạng với hơn 2.000 sản phẩm chất lượng cao. Từ những món quà tinh tế đến set quà sang trọng, chúng tôi có tất cả những gì bạn cần để tạo nên những khoảnh khắc đáng nhớ.',
        ctaText: 'Mua sắm ngay',
        ctaLink: '/products',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        stats: [
            { value: '200+', label: 'Thương hiệu quốc tế' },
            { value: '2.000+', label: 'Sản phẩm chất lượng cao' },
            { value: '30.000+', label: 'Khách hàng hài lòng' }
        ]
    },
    {
        id: 2,
        title: 'QUÀ TẶNG CHO MỌI DỊP ĐẶC BIỆT',
        description: 'Từ sinh nhật, kỷ niệm đến các ngày lễ quan trọng, chúng tôi mang đến những món quà ý nghĩa và tinh tế nhất. Mỗi sản phẩm được chọn lọc kỹ lưỡng để thể hiện tình cảm chân thành của bạn.',
        ctaText: 'Khám phá ngay',
        ctaLink: '/products',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80',
        stats: [
            { value: '500+', label: 'Mẫu quà độc đáo' },
            { value: '24/7', label: 'Hỗ trợ khách hàng' },
            { value: '100%', label: 'Hài lòng chất lượng' }
        ]
    },
    {
        id: 3,
        title: 'SET QUÀ SANG TRỌNG VÀ TINH TẾ',
        description: 'Bộ sưu tập set quà cao cấp được thiết kế tỉ mỉ, phù hợp cho những dịp đặc biệt. Mỗi set quà là sự kết hợp hoàn hảo giữa chất lượng và thẩm mỹ, tạo nên trải nghiệm quà tặng đáng nhớ.',
        ctaText: 'Xem bộ sưu tập',
        ctaLink: '/products',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
        stats: [
            { value: '50+', label: 'Set quà độc quyền' },
            { value: '5★', label: 'Đánh giá trung bình' },
            { value: '99%', label: 'Khách hàng quay lại' }
        ]
    }
];

const Content = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { token, loading: authLoading } = useContext(AuthContext);

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data } = await getProducts();
                if (!isMounted) return;
                const list = Array.isArray(data) ? data : [];
                setProducts(list);
                setError('');
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProducts();
        return () => {
            isMounted = false;
        };
    }, []);

    const newArrivals = useMemo(() => products.slice(0, 4), [products]);

    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'Đang cập nhật';
        return new Intl.NumberFormat('vi-VN').format(Number(price)) + ' đ';
    };

    const getProductImage = (product) => {
        if (!product) return FALLBACK_IMAGE;
        if (product.image_url) return product.image_url;
        if (Array.isArray(product.images) && product.images.length > 0) {
            return product.images[0].image_url || FALLBACK_IMAGE;
        }
        return FALLBACK_IMAGE;
    };

    const handleViewDetail = (id) => navigate(`/products/${id}`);

    const handleAddToCart = async (product) => {
        if (authLoading) {
            return;
        }
        
        const tokenFromContext = token;
        let tokenFromStorage = localStorage.getItem('token');
        
        if (tokenFromStorage === 'undefined' || tokenFromStorage === 'null') {
            localStorage.removeItem('token');
            tokenFromStorage = null;
        }
        
        const currentToken = tokenFromContext || tokenFromStorage;
        
        if (!currentToken || currentToken === 'undefined' || currentToken === 'null') {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        try {
            await axios.post(
                "http://localhost:8000/api/cart/add",
                { product_id: product.id, quantity: 1 },
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );
            alert("✅ Đã thêm vào giỏ hàng!");
        } catch (err) {
            console.error("Add to cart error:", err);
            alert("❌ Lỗi khi thêm vào giỏ hàng: " + (err.response?.data?.message || err.message));
        }
    };

    const renderProductCard = (product) => (
        <article
            key={product.id}
            className="product-card"
        >
            <div className="product-card__image" onClick={() => handleViewDetail(product.id)}>
                <img src={getProductImage(product)} alt={product.name} loading="lazy" />
                <span className="product-card__badge">Mới</span>
            </div>
            <div className="product-card__body">
                <h4 onClick={() => handleViewDetail(product.id)}>{product.name}</h4>
                <div className="product-card__rating">
                    {'★'.repeat(5)}
                </div>
                <div className="product-card__price-row">
                    <span className="product-card__price">{formatPrice(product.price)}</span>
                    {product.original_price && product.original_price > product.price && (
                        <>
                            <span className="product-card__original-price">{formatPrice(product.original_price)}</span>
                            <span className="product-card__discount">
                                -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                            </span>
                        </>
                    )}
                </div>
            </div>
        </article>
    );

    const renderSkeleton = (index) => (
        <div className="product-card skeleton" key={`skeleton-${index}`}>
            <div className="product-card__image shimmer" />
            <div className="product-card__body">
                <div className="shimmer-line w-70" />
                <div className="shimmer-line w-50" />
                <div className="shimmer-line w-40" />
            </div>
        </div>
    );

    return (
        <div className="home-container fashion-home">
            {/* Hero Section - Slider */}
            <section className="home-hero">
                <div className="container">
                    <HeroSlider slides={HERO_SLIDES} autoPlayInterval={5000} />
                </div>
            </section>

            {/* Brand Strip */}
            <section className="brand-strip">
                <div className="container">
                    {BRAND_STRIP.map((brand) => (
                        <span key={brand}>{brand}</span>
                    ))}
                </div>
            </section>

            {/* New Arrivals - Grid 4 columns */}
            <section className="product-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">NEW ARRIVALS</h2>
                        <button className="view-all-link" onClick={() => navigate('/products')}>
                            View All
                        </button>
                    </div>
                    {error && <div className="alert-error">{error}</div>}
                    <div className="product-grid">
                        {loading
                            ? Array.from({ length: 4 }).map((_, index) => renderSkeleton(index))
                            : newArrivals.length
                                ? newArrivals.map(renderProductCard)
                                : <div className="empty-state">Chưa có sản phẩm mới để hiển thị.</div>}
                    </div>
                </div>
            </section>

            {/* Browse by Dress Style */}
            <section className="gift-style">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">BROWSE BY DRESS STYLE</h2>
                    </div>
                    <div className="gift-style__grid">
                        {GIFT_STYLES.map((style) => (
                            <article className="gift-style__card" key={style.id}>
                                <img src={style.image} alt={style.title} loading="lazy" />
                                <div className="overlay">
                                    <h4>{style.title}</h4>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials - Slider */}
            <section className="testimonials">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">OUR HAPPY CUSTOMERS</h2>
                    </div>
                    <PosterSlider
                        items={TESTIMONIALS}
                        renderItem={(item) => (
                            <article className="testimonial-card">
                                <div className="rating">
                                    {'★'.repeat(item.rating)}
                                </div>
                                <p className="content">"{item.content}"</p>
                                <div className="author">
                                    <strong>{item.name}</strong>
                                </div>
                            </article>
                        )}
                    />
                </div>
            </section>

            {/* Newsletter */}
            <section className="newsletter">
                <div className="container">
                    <div className="newsletter-card">
                        <div className="newsletter-content">
                            <h2>STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>
                        </div>
                        <form
                            className="newsletter-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <input type="email" placeholder="Enter your email" required />
                            <button type="submit">Subscribe to Newsletter</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Content;
