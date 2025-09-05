import React from 'react';

const LoadingSpinner = ({ show = false, className = '' }) => {
  if (!show) return null;

  return (
    <div className={`loader ${className}`} style={{ display: 'block' }}></div>
  );
};

export default LoadingSpinner;
