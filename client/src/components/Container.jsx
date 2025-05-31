import React from 'react';

const Container = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto w-full max-w-xl px-4 lg:max-w-5xl lg:px-6 ${className}`}>
      {children}
    </div>
  );
};

export default Container; 