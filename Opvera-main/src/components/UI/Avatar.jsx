import React from 'react';

const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  className = '',
  fallback = '👤' 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center text-white font-semibold ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};

export default Avatar;
