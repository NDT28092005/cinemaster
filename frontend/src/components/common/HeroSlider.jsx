import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSlider = ({ slides = [], autoPlayInterval = 5000 }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const intervalRef = useRef(null);
    const navigate = useNavigate();

    // Auto-play functionality - tự động chuyển slide mỗi 5 giây
    useEffect(() => {
        // Clear interval cũ nếu có
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Chỉ start auto-play nếu có nhiều hơn 1 slide
        if (slides.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, autoPlayInterval);
        }

        // Cleanup khi unmount hoặc khi dependencies thay đổi
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [slides.length, autoPlayInterval]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        // Reset interval khi người dùng tương tác thủ công
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        // Tiếp tục auto-play sau khi chuyển slide
        if (slides.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, autoPlayInterval);
        }
    };

    const nextSlide = () => {
        goToSlide((currentSlide + 1) % slides.length);
    };

    const prevSlide = () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    };

    if (!slides || slides.length === 0) {
        return null;
    }

    const currentSlideData = slides[currentSlide];

    return (
        <div className="hero-slider">
            <div className="hero-slider__container">
                {/* Navigation Buttons */}
                {slides.length > 1 && (
                    <>
                        <button
                            className="hero-slider__nav hero-slider__nav--prev"
                            onClick={prevSlide}
                            aria-label="Previous slide"
                        >
                            ‹
                        </button>
                        <button
                            className="hero-slider__nav hero-slider__nav--next"
                            onClick={nextSlide}
                            aria-label="Next slide"
                        >
                            ›
                        </button>
                    </>
                )}

                {/* Slide Content */}
                <div className="hero-slider__slide">
                    <div className="hero-grid">
                        <div className="hero-content">
                            {currentSlideData.title && (
                                <h1 className="hero-title">{currentSlideData.title}</h1>
                            )}
                            {currentSlideData.description && (
                                <p className="hero-description">{currentSlideData.description}</p>
                            )}
                            {currentSlideData.ctaText && currentSlideData.ctaLink && (
                                <button
                                    className="hero-cta"
                                    onClick={() => navigate(currentSlideData.ctaLink)}
                                >
                                    {currentSlideData.ctaText}
                                </button>
                            )}
                            {currentSlideData.stats && (
                                <div className="hero-stats">
                                    {currentSlideData.stats.map((stat, index) => (
                                        <div key={index} className="stat-item">
                                            <strong>{stat.value}</strong>
                                            <span>{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="hero-image">
                            <img
                                src={currentSlideData.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'}
                                alt={currentSlideData.title || 'Hero'}
                                loading="eager"
                            />
                        </div>
                    </div>
                </div>

                {/* Dots Indicator */}
                {slides.length > 1 && (
                    <div className="hero-slider__dots">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`hero-slider__dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroSlider;

