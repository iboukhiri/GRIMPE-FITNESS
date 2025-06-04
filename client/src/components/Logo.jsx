import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import { FaMountain, FaBolt } from 'react-icons/fa';

const Logo = ({ 
  size = 'md', 
  className = '', 
  showText = true, 
  animate = false,
  variant = 'full',
  textColor = 'gradient',
  iconColor = 'auto'
}) => {
  const { darkMode } = useContext(ThemeContext);

  // Size variants
  const sizes = {
    xs: { icon: 'h-4 w-4', text: 'text-sm', bolt: 'h-2 w-2', spacing: 'space-x-1' },
    sm: { icon: 'h-6 w-6', text: 'text-base', bolt: 'h-3 w-3', spacing: 'space-x-2' },
    md: { icon: 'h-8 w-8', text: 'text-xl', bolt: 'h-4 w-4', spacing: 'space-x-3' },
    lg: { icon: 'h-12 w-12', text: 'text-3xl', bolt: 'h-6 w-6', spacing: 'space-x-3' },
    xl: { icon: 'h-16 w-16', text: 'text-4xl', bolt: 'h-8 w-8', spacing: 'space-x-4' },
    '2xl': { icon: 'h-20 w-20', text: 'text-5xl', bolt: 'h-10 w-10', spacing: 'space-x-4' }
  };

  const sizeClass = sizes[size];

  // Get mountain icon color
  const getMountainColor = () => {
    if (iconColor === 'white') return 'text-white';
    if (iconColor === 'orange') return darkMode ? 'text-orange-400' : 'text-orange-600';
    // Auto color based on context
    return darkMode ? 'text-orange-400' : 'text-orange-600';
  };

  // Get text color classes
  const getTextColor = () => {
    if (textColor === 'white') return 'text-white';
    if (textColor === 'black') return darkMode ? 'text-white' : 'text-black';
    // Default gradient
    return darkMode 
      ? 'text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text' 
      : 'text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text';
  };

  if (variant === 'icon-only') {
    return (
      <div className={`relative inline-flex ${className}`}>
        <FaMountain className={`${sizeClass.icon} ${getMountainColor()} ${animate ? 'animate-bounce-motivational' : ''} transition-colors`} />
        <FaBolt className={`absolute -top-1 -right-1 ${sizeClass.bolt} text-yellow-400 ${animate ? 'animate-pulse' : ''} transition-colors`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${sizeClass.spacing} ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <FaMountain className={`${sizeClass.icon} ${getMountainColor()} ${animate ? 'animate-bounce-motivational' : ''} transition-colors`} />
        <FaBolt className={`absolute -top-1 -right-1 ${sizeClass.bolt} text-yellow-400 ${animate ? 'animate-pulse' : ''} transition-colors`} />
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizeClass.text} font-black tracking-wider transition-colors ${getTextColor()}`}>
            GRIMPE
          </span>
          {(size === 'lg' || size === 'xl' || size === '2xl') && (
            <span className={`text-xs uppercase tracking-widest font-semibold -mt-1 ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Dépassez vos limites
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo; 