import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', text = 'Đang tải...' }) => {
  const sizeClass = size === 'small' ? 'loader-small' : size === 'large' ? 'loader-large' : '';
  
  return (
    <div className={`loader-container ${sizeClass}`}>
      <div className="loader-wrapper">
        <div className="loading-spinner"></div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
