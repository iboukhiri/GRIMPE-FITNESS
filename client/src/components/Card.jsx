import React, { useContext } from 'react';
import { ThemeContext } from '../App';

function Card({ children, className = '', onClick, hoverEffect = true, animate = true }) {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-4
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        shadow-card
        ${hoverEffect ? 'hover:shadow-hover hover:-translate-y-1 transition-transform duration-150' : ''}
        ${animate ? 'animate-fade-in-up' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 opacity-5 pointer-events-none
        ${darkMode 
          ? 'bg-gradient-to-br from-primary-400 via-transparent to-transparent' 
          : 'bg-gradient-to-br from-primary-100 via-transparent to-transparent'
        }`}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default Card; 