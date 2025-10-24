import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
