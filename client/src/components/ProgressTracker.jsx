import React, { useContext } from 'react';
import { ThemeContext } from '../App';

function ProgressTracker({ 
  value, 
  maxValue, 
  label, 
  variant = 'primary',
  size = 'md',
  showValue = true,
  className = '',
  animate = true,
  unit = '' 
}) {
  const { darkMode } = useContext(ThemeContext);
  
  // Calculate the percentage
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Color variants
  const variants = {
    primary: {
      bg: darkMode ? 'bg-primary-200 bg-opacity-20' : 'bg-primary-100',
      fill: darkMode ? 'bg-primary-500' : 'bg-primary-600',
      text: darkMode ? 'text-primary-300' : 'text-primary-700'
    },
    secondary: {
      bg: darkMode ? 'bg-secondary-200 bg-opacity-20' : 'bg-secondary-100',
      fill: darkMode ? 'bg-secondary-500' : 'bg-secondary-600',
      text: darkMode ? 'text-secondary-300' : 'text-secondary-700'
    },
    success: {
      bg: darkMode ? 'bg-green-200 bg-opacity-20' : 'bg-green-100',
      fill: darkMode ? 'bg-green-500' : 'bg-green-600',
      text: darkMode ? 'text-green-300' : 'text-green-700'
    },
    warning: {
      bg: darkMode ? 'bg-yellow-200 bg-opacity-20' : 'bg-yellow-100',
      fill: darkMode ? 'bg-yellow-500' : 'bg-yellow-600',
      text: darkMode ? 'text-yellow-300' : 'text-yellow-700'
    },
    danger: {
      bg: darkMode ? 'bg-red-200 bg-opacity-20' : 'bg-red-100',
      fill: darkMode ? 'bg-red-500' : 'bg-red-600',
      text: darkMode ? 'text-red-300' : 'text-red-700'
    }
  };
  
  // Size variants
  const sizes = {
    sm: {
      height: 'h-1.5',
      textSize: 'text-xs'
    },
    md: {
      height: 'h-2.5',
      textSize: 'text-sm'
    },
    lg: {
      height: 'h-4',
      textSize: 'text-base'
    }
  };
  
  const selectedVariant = variants[variant];
  const selectedSize = sizes[size];
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className={`${selectedSize.textSize} font-medium ${selectedVariant.text}`}>
            {label}
          </span>
          
          {showValue && (
            <span className={`${selectedSize.textSize} font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {value}{unit} / {maxValue}{unit}
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full ${selectedVariant.bg} ${selectedSize.height} rounded-full overflow-hidden`}>
        <div 
          className={`${selectedVariant.fill} h-full rounded-full ${animate ? 'transition-all duration-1000 ease-out' : ''}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {!label && showValue && (
        <div className="mt-1 text-right">
          <span className={`${selectedSize.textSize} font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default ProgressTracker; 