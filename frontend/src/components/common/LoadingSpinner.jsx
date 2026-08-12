import React from 'react';

const LoadingSpinner = ({ size = 'md', light = false }) => {
  const sizeClasses = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' };
  const colorClasses = light
    ? 'border-white/30 border-t-white'
    : 'border-[#cfd9de] border-t-[#1d9bf0]';

  return (
    <div className="flex justify-center items-center" role="status" aria-label="Loading">
      <div className={`${sizeClasses[size]} ${colorClasses} rounded-full animate-spin`} />
    </div>
  );
};

export default LoadingSpinner;
