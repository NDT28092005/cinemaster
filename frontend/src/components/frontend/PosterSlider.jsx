import React, { useRef } from 'react'

const PosterSlider = ({ items = [], renderItem, title }) => {
  const trackRef = useRef(null);
  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };
  return (
    <div className="poster-slider">
      {title && <h4 className="poster-slider__title">{title}</h4>}
      <button className="poster-slider__nav left" onClick={() => scrollBy(-1)} aria-label="Prev">‹</button>
      <div className="poster-slider__track" ref={trackRef}>
        {items.map((item) => (
          <div key={item.id} className="poster-slider__item">
            {renderItem ? renderItem(item) : (
              <img src={item.poster || item.image} alt={item.title} />
            )}
          </div>
        ))}
      </div>
      <button className="poster-slider__nav right" onClick={() => scrollBy(1)} aria-label="Next">›</button>
    </div>
  )
}

export default PosterSlider


