import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../api/product';
import { getCategories } from '../../api/category';
import PosterSlider from './PosterSlider';
import HeroSlider from './HeroSlider';

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
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoryImages, setCategoryImages] = useState({});
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
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
