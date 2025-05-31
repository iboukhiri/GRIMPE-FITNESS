import React, { useContext } from 'react';
import { ThemeContext } from '../App';

/**
 * Skeleton - Un composant de chargement simple
 * Props:
 *  - variant: 'rect' | 'text' | 'circle'
 *  - width, height: Taille CSS (ex: '100px', '2rem', '100%')
 *  - className: classes supplémentaires
 */
function Skeleton({ 
  width = '100%', 
  height = '20px', 
  shape = 'rounded', 
  className = '',
  ...props 
}) {
  const { darkMode } = useContext(ThemeContext);
  
  // Shape variants
  const shapeClass = {
    rounded: 'rounded',
    circle: 'rounded-full',
    square: 'rounded-none'
  }[shape];
  
  return (
    <div
      className={`animate-pulse ${darkMode
        ? 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700'
        : 'bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100'
      } ${shapeClass} ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
}

export default Skeleton;