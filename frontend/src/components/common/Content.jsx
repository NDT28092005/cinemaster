import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../api/product';
import { getCategories } from '../../api/category';
import PosterSlider from './PosterSlider';
import HeroSlider from './HeroSlider';
import { FaEnvelope, FaUser, FaPhone, FaComment } from 'react-icons/fa';

// Fallback images cho categories
const CATEGORY_FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508233661973-36e2ae67bc3f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=600&q=80'
];

// Testimonials sẽ được load từ reviews thực tế

const BRAND_STRIP = ['Birthday', 'Anniversary', 'Corporate', 'Holiday', 'Handmade'];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60';

const Content = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoryImages, setCategoryImages] = useState({});
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [addingToCartId, setAddingToCartId] = useState(null);
    const [sliders, setSliders] = useState([]);
    const [slidersLoading, setSlidersLoading] = useState(true);
    const [contactFormData, setContactFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [contactLoading, setContactLoading] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);
    const [contactError, setContactError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { token, loading: authLoading } = useContext(AuthContext);

    // Fetch sliders
    useEffect(() => {
        let isMounted = true;

        const fetchSliders = async () => {
            try {
                setSlidersLoading(true);
                const response = await axios.get('http://localhost:8000/api/sliders');
                if (!isMounted) return;
                const slidersList = Array.isArray(response.data) ? response.data : [];
                setSliders(slidersList);
            } catch (err) {
                if (!isMounted) return;
                console.error('Error fetching sliders:', err);
                setSliders([]);
            } finally {
                if (isMounted) setSlidersLoading(false);
            }
        };

        fetchSliders();
        return () => {
            isMounted = false;
        };
    }, []);

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

    // Fetch categories và ảnh cho mỗi category
    useEffect(() => {
        let isMounted = true;

        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const { data } = await getCategories();
                if (!isMounted) return;
                
                const categoriesList = Array.isArray(data) ? data : [];
                setCategories(categoriesList);

                // Lấy ảnh cho mỗi category: ưu tiên image_url của category, nếu không có thì lấy từ sản phẩm đầu tiên
                const imageMap = {};
                for (const category of categoriesList) {
                    // Ưu tiên dùng ảnh của category nếu có
                    if (category.image_url) {
                        imageMap[category.id] = category.image_url;
                    } else {
                        // Nếu không có, lấy từ sản phẩm đầu tiên
                        try {
                            const productsRes = await getProducts({ category_id: category.id });
                            const categoryProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
                            if (categoryProducts.length > 0) {
                                // Lấy sản phẩm đầu tiên
                                const firstProduct = categoryProducts[0];
                                if (firstProduct.image_url) {
                                    imageMap[category.id] = firstProduct.image_url;
                                } else if (Array.isArray(firstProduct.images) && firstProduct.images.length > 0) {
                                    imageMap[category.id] = firstProduct.images[0].image_url || FALLBACK_IMAGE;
                                } else {
                                    // Dùng fallback image theo index
                                    imageMap[category.id] = CATEGORY_FALLBACK_IMAGES[category.id % CATEGORY_FALLBACK_IMAGES.length] || FALLBACK_IMAGE;
                                }
                            } else {
                                // Không có sản phẩm, dùng fallback
                                imageMap[category.id] = CATEGORY_FALLBACK_IMAGES[category.id % CATEGORY_FALLBACK_IMAGES.length] || FALLBACK_IMAGE;
                            }
                        } catch (err) {
                            console.error(`Error fetching products for category ${category.id}:`, err);
                            imageMap[category.id] = CATEGORY_FALLBACK_IMAGES[category.id % CATEGORY_FALLBACK_IMAGES.length] || FALLBACK_IMAGE;
                        }
                    }
                }
                
                if (!isMounted) return;
                setCategoryImages(imageMap);
            } catch (err) {
                if (!isMounted) return;
                console.error('Error fetching categories:', err);
            } finally {
                if (isMounted) setCategoriesLoading(false);
            }
        };

        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch reviews để hiển thị testimonials
    useEffect(() => {
        let isMounted = true;

        const fetchReviews = async () => {
            try {
                setReviewsLoading(true);
                const response = await axios.get('http://localhost:8000/api/reviews/');
                if (!isMounted) return;
                
                const allReviews = Array.isArray(response.data) ? response.data : [];
                // Lọc reviews: không bị block, có comment, và có user info
                const validReviews = allReviews
                    .filter(review => 
                        review && 
                        !review.is_blocked && 
                        review.comment && 
                        review.comment.trim() !== '' &&
                        review.user &&
                        review.rating >= 4 // Chỉ lấy reviews 4-5 sao
                    )
                    .slice(0, 10) // Lấy tối đa 10 reviews
                    .map(review => ({
                        id: review.review_id || review.id,
                        name: review.user?.name || 'Khách hàng',
                        rating: review.rating || 5,
                        content: review.comment
                    }));
                
                if (!isMounted) return;
                setReviews(validReviews);
            } catch (err) {
                if (!isMounted) return;
                console.error('Error fetching reviews:', err);
                setReviews([]);
            } finally {
                if (isMounted) setReviewsLoading(false);
            }
        };

        fetchReviews();
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
        if (authLoading || addingToCartId === product.id) {
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
            setAddingToCartId(product.id);
            await axios.post(
                "http://localhost:8000/api/cart/add",
                { product_id: product.id, quantity: 1 },
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );
            
            // Hiển thị thông báo và tùy chọn đi đến giỏ hàng
            const goToCart = window.confirm("✅ Đã thêm vào giỏ hàng!\n\nBạn có muốn xem giỏ hàng không?");
            if (goToCart) {
                navigate('/cart');
            }
        } catch (err) {
            console.error("Add to cart error:", err);
            alert("❌ Lỗi khi thêm vào giỏ hàng: " + (err.response?.data?.message || err.message));
        } finally {
            setAddingToCartId(null);
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
                <div className="product-card__actions">
                    <button
                        className="product-card__btn product-card__btn--outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(product.id);
                        }}
                    >
                        Chi tiết
                    </button>
                    <button
                        className="product-card__btn product-card__btn--primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                        }}
                        disabled={addingToCartId === product.id}
                    >
                        {addingToCartId === product.id ? 'Đang thêm...' : 'Thêm vào giỏ'}
                    </button>
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
                    {slidersLoading ? (
                        <div style={{ 
                            height: '700px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.1))',
                            borderRadius: '16px'
                        }}>
                            <div className="loading-spinner" style={{ 
                                width: '50px', 
                                height: '50px', 
                                border: '4px solid rgba(251, 99, 118, 0.2)', 
                                borderTopColor: '#FB6376', 
                                borderRadius: '50%', 
                                animation: 'spin 1s linear infinite'
                            }}></div>
                        </div>
                    ) : sliders.length > 0 ? (
                        <HeroSlider slides={sliders} autoPlayInterval={5000} />
                    ) : (
                        <div style={{ 
                            height: '700px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(251, 99, 118, 0.1), rgba(252, 177, 166, 0.1))',
                            borderRadius: '16px',
                            color: '#666'
                        }}>
                            Chưa có slider nào được thiết lập
                        </div>
                    )}
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

            {/* Danh mục sản phẩm */}
            <section className="gift-style">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">DANH MỤC SẢN PHẨM</h2>
                    </div>
                    <div className="gift-style__grid">
                        {categoriesLoading ? (
                            // Skeleton loading
                            Array.from({ length: 4 }).map((_, index) => (
                                <article className="gift-style__card skeleton" key={`skeleton-${index}`}>
                                    <div className="shimmer" style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
                                </article>
                            ))
                        ) : categories.length > 0 ? (
                            categories.map((category) => (
                                <article 
                                    className="gift-style__card" 
                                    key={category.id}
                                    onClick={() => navigate(`/products?category_id=${category.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img 
                                        src={categoryImages[category.id] || FALLBACK_IMAGE} 
                                        alt={category.name} 
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = CATEGORY_FALLBACK_IMAGES[category.id % CATEGORY_FALLBACK_IMAGES.length] || FALLBACK_IMAGE;
                                        }}
                                    />
                                    <div className="overlay">
                                        <h4>{category.name}</h4>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="empty-state">Chưa có danh mục sản phẩm.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Testimonials - Slider */}
            <section className="testimonials">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">OUR HAPPY CUSTOMERS</h2>
                    </div>
                    {reviewsLoading ? (
                        // Skeleton loading
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <article className="testimonial-card skeleton" key={`skeleton-${index}`} style={{ minWidth: '300px' }}>
                                    <div className="shimmer-line w-50" style={{ height: '20px', marginBottom: '1rem' }} />
                                    <div className="shimmer-line w-100" style={{ height: '60px', marginBottom: '1rem' }} />
                                    <div className="shimmer-line w-30" style={{ height: '16px' }} />
                                </article>
                            ))}
                        </div>
                    ) : reviews.length > 0 ? (
                        <PosterSlider
                            items={reviews}
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
                    ) : (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                            Chưa có đánh giá nào để hiển thị.
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="newsletter" style={{ background: 'linear-gradient(135deg, #5D2A42, #8B4A5C)' }}>
                <div className="container">
                    <div className="newsletter-card" style={{ 
                        background: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '20px',
                        padding: '3rem 2rem',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                    }}>
                        <div className="newsletter-content" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <h2 style={{ 
                                color: '#5D2A42', 
                                fontSize: '2rem', 
                                fontWeight: 700,
                                marginBottom: '1rem'
                            }}>
                                LIÊN HỆ VỚI CHÚNG TÔI
                            </h2>
                            <p style={{ color: '#666', fontSize: '1rem' }}>
                                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                            </p>
                        </div>
                        {contactSuccess && (
                            <div style={{
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))',
                                border: '2px solid #4CAF50',
                                borderRadius: '10px',
                                color: '#2E7D32',
                                textAlign: 'center',
                                fontWeight: 600
                            }}>
                                ✓ Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
                            </div>
                        )}
                        {contactError && (
                            <div style={{
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(239, 154, 154, 0.1))',
                                border: '2px solid #F44336',
                                borderRadius: '10px',
                                color: '#C62828',
                                textAlign: 'center',
                                fontWeight: 600
                            }}>
                                ✗ {contactError}
                            </div>
                        )}
                        <form
                            className="newsletter-form"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setContactLoading(true);
                                setContactError('');
                                setContactSuccess(false);

                                try {
                                    const currentToken = token || localStorage.getItem('token');
                                    const headers = currentToken ? {
                                        'Authorization': `Bearer ${currentToken}`,
                                        'Content-Type': 'application/json'
                                    } : {
                                        'Content-Type': 'application/json'
                                    };

                                    const response = await axios.post(
                                        'http://localhost:8000/api/contact',
                                        contactFormData,
                                        { headers }
                                    );

                                    if (response.data.success) {
                                        setContactSuccess(true);
                                        setContactFormData({
                                            name: '',
                                            email: '',
                                            phone: '',
                                            message: ''
                                        });
                                        setTimeout(() => setContactSuccess(false), 5000);
                                    }
                                } catch (err) {
                                    if (err.response?.data?.errors) {
                                        const errors = err.response.data.errors;
                                        const firstError = Object.values(errors)[0][0];
                                        setContactError(firstError);
                                    } else {
                                        setContactError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
                                    }
                                } finally {
                                    setContactLoading(false);
                                }
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: '#5D2A42',
                                        fontWeight: 600,
                                        fontSize: '0.95rem'
                                    }}>
                                        Họ và tên *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <FaUser style={{ 
                                            position: 'absolute', 
                                            left: '1rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)',
                                            color: '#5D2A42',
                                            opacity: 0.6,
                                            pointerEvents: 'none',
                                            zIndex: 1
                                        }} />
                                        <input 
                                            type="text" 
                                            placeholder="Nhập họ và tên của bạn" 
                                            required
                                            name="name"
                                            value={contactFormData.name}
                                            onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})}
                                            disabled={contactLoading}
                                            style={{
                                                width: '100%',
                                                padding: '0.9rem 1rem 0.9rem 2.8rem',
                                                border: '2px solid rgba(93, 42, 66, 0.2)',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                background: '#fff',
                                                color: '#333',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#FB6376';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(93, 42, 66, 0.2)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: '#5D2A42',
                                        fontWeight: 600,
                                        fontSize: '0.95rem'
                                    }}>
                                        Email *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <FaEnvelope style={{ 
                                            position: 'absolute', 
                                            left: '1rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)',
                                            color: '#5D2A42',
                                            opacity: 0.6,
                                            pointerEvents: 'none',
                                            zIndex: 1
                                        }} />
                                        <input 
                                            type="email" 
                                            placeholder="Nhập email của bạn" 
                                            required
                                            name="email"
                                            value={contactFormData.email}
                                            onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
                                            disabled={contactLoading}
                                            style={{
                                                width: '100%',
                                                padding: '0.9rem 1rem 0.9rem 2.8rem',
                                                border: '2px solid rgba(93, 42, 66, 0.2)',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                background: '#fff',
                                                color: '#333',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#FB6376';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(93, 42, 66, 0.2)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#5D2A42',
                                    fontWeight: 600,
                                    fontSize: '0.95rem'
                                }}>
                                    Số điện thoại <span style={{ color: '#999', fontWeight: 400 }}>(tùy chọn)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaPhone style={{ 
                                        position: 'absolute', 
                                        left: '1rem', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        color: '#5D2A42',
                                        opacity: 0.6,
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }} />
                                    <input 
                                        type="tel" 
                                        placeholder="Nhập số điện thoại của bạn"
                                        name="phone"
                                        value={contactFormData.phone}
                                        onChange={(e) => setContactFormData({...contactFormData, phone: e.target.value})}
                                        disabled={contactLoading}
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem 1rem 0.9rem 2.8rem',
                                            border: '2px solid rgba(93, 42, 66, 0.2)',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.3s ease',
                                            background: '#fff',
                                            color: '#333',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#FB6376';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(93, 42, 66, 0.2)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#5D2A42',
                                    fontWeight: 600,
                                    fontSize: '0.95rem'
                                }}>
                                    Tin nhắn *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaComment style={{ 
                                        position: 'absolute', 
                                        left: '1rem', 
                                        top: '1.2rem',
                                        color: '#5D2A42',
                                        opacity: 0.6,
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }} />
                                    <textarea 
                                        placeholder="Nhập tin nhắn của bạn..." 
                                        required
                                        name="message"
                                        rows="5"
                                        value={contactFormData.message}
                                        onChange={(e) => setContactFormData({...contactFormData, message: e.target.value})}
                                        disabled={contactLoading}
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem 1rem 0.9rem 2.8rem',
                                            border: '2px solid rgba(93, 42, 66, 0.2)',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.3s ease',
                                            resize: 'vertical',
                                            fontFamily: 'inherit',
                                            background: '#fff',
                                            color: '#333',
                                            boxSizing: 'border-box',
                                            minHeight: '120px'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#FB6376';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(251, 99, 118, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(93, 42, 66, 0.2)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={contactLoading}
                                style={{
                                    width: '100%',
                                    padding: '1.1rem 2rem',
                                    background: contactLoading 
                                        ? 'linear-gradient(135deg, #ccc, #999)' 
                                        : 'linear-gradient(135deg, #FB6376, #FCB1A6)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: contactLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: contactLoading 
                                        ? 'none' 
                                        : '0 4px 20px rgba(251, 99, 118, 0.4)',
                                    opacity: contactLoading ? 0.7 : 1,
                                    marginTop: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    if (!contactLoading) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 25px rgba(251, 99, 118, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!contactLoading) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(251, 99, 118, 0.4)';
                                    }
                                }}
                            >
                                {contactLoading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Content;
