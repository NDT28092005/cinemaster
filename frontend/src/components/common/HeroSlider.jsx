import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSlider = ({ slides = [], autoPlayInterval = 5000 }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const intervalRef = useRef(null);
    const navigate = useNavigate();

    // Auto-play functionality
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (slides.length > 1) {
            intervalRef.current = setInterval(() => {
                nextSlide();
            }, autoPlayInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [slides.length, autoPlayInterval, currentSlide]);

    const goToSlide = (index) => {
        if (index === currentSlide || isTransitioning) return;
        
        setIsTransitioning(true);
        setCurrentSlide(index);
        
        // Reset transition flag after animation
        setTimeout(() => {
            setIsTransitioning(false);
        }, 800);
        
        // Reset interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (slides.length > 1) {
            intervalRef.current = setInterval(() => {
                nextSlide();
            }, autoPlayInterval);
        }
    };

    const nextSlide = () => {
        if (isTransitioning) return;
        goToSlide((currentSlide + 1) % slides.length);
    };

    const prevSlide = () => {
        if (isTransitioning) return;
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    };

    if (!slides || slides.length === 0) {
        return null;
    }

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

                {/* Slides Container */}
                <div className="hero-slider__slides-wrapper">
                    {slides.map((slide, index) => {
                        const isActive = index === currentSlide;
                        const slideClass = `hero-slider__slide-item ${isActive ? 'active' : ''} ${
                            index < currentSlide ? 'prev' : index > currentSlide ? 'next' : ''
                        }`;
                        
                        return (
                            <div
                                key={slide.id || index}
                                className={slideClass}
                                onClick={() => slide.link && navigate(slide.link)}
                                style={{ cursor: slide.link ? 'pointer' : 'default' }}
                            >
                                <img
                                    src={slide.image_url || slide.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'}
                                    alt={slide.title || `Slide ${index + 1}`}
                                    loading={isActive ? 'eager' : 'lazy'}
                                />
                            </div>
                        );
                    })}
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
