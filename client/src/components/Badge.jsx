import React, { useContext } from 'react';
import { ThemeContext } from '../App';

function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  rounded = 'full', 
  dot = false,
  glow = false,
  removable = false,
  onRemove,
  ...props 
}) {
  const { darkMode } = useContext(ThemeContext);
  
  // Different variants
  const variants = {
    primary: `
      ${darkMode 
        ? 'bg-primary-900 bg-opacity-70 text-primary-200 border-primary-700' 
        : 'bg-primary-100 text-primary-800 border-primary-200'
      }
    `,
    secondary: `
      ${darkMode 
        ? 'bg-secondary-900 bg-opacity-70 text-secondary-200 border-secondary-700' 
        : 'bg-secondary-100 text-secondary-800 border-secondary-200'
      }
    `,
    success: `
      ${darkMode 
        ? 'bg-green-900 bg-opacity-70 text-green-200 border-green-700' 
        : 'bg-green-100 text-green-800 border-green-200'
      }
    `,
    warning: `
      ${darkMode 
        ? 'bg-yellow-900 bg-opacity-70 text-yellow-200 border-yellow-700' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    `,
    danger: `
      ${darkMode 
        ? 'bg-red-900 bg-opacity-70 text-red-200 border-red-700' 
        : 'bg-red-100 text-red-800 border-red-200'
      }
    `,
    info: `
      ${darkMode 
        ? 'bg-blue-900 bg-opacity-70 text-blue-200 border-blue-700' 
        : 'bg-blue-100 text-blue-800 border-blue-200'
      }
    `,
    neutral: `
      ${darkMode 
        ? 'bg-gray-800 text-gray-200 border-gray-700' 
        : 'bg-gray-100 text-gray-700 border-gray-200'
      }
    `
  };
  
  // Size variants
  const sizes = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  
  // Border radius variants
  const radiusVariants = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  
  // Add glow effect
  const glowEffect = glow ? `${
    variant === 'primary' ? 'shadow-sm shadow-primary-500/50' :
    variant === 'secondary' ? 'shadow-sm shadow-secondary-500/50' :
    variant === 'success' ? 'shadow-sm shadow-green-500/50' :
    variant === 'warning' ? 'shadow-sm shadow-yellow-500/50' :
    variant === 'danger' ? 'shadow-sm shadow-red-500/50' :
    variant === 'info' ? 'shadow-sm shadow-blue-500/50' :
    'shadow-sm shadow-gray-500/50'
  }` : '';
  
  return (
    <span
      className={`
        inline-flex items-center font-medium border 
        ${sizes[size]}
        ${variants[variant]}
        ${radiusVariants[rounded]}
        ${glowEffect}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span 
          className={`mr-1.5 h-2 w-2 rounded-full ${
            variant === 'primary' ? `${darkMode ? 'bg-primary-400' : 'bg-primary-600'}` :
            variant === 'secondary' ? `${darkMode ? 'bg-secondary-400' : 'bg-secondary-600'}` :
            variant === 'success' ? `${darkMode ? 'bg-green-400' : 'bg-green-600'}` :
            variant === 'warning' ? `${darkMode ? 'bg-yellow-400' : 'bg-yellow-600'}` :
            variant === 'danger' ? `${darkMode ? 'bg-red-400' : 'bg-red-600'}` :
            variant === 'info' ? `${darkMode ? 'bg-blue-400' : 'bg-blue-600'}` :
            `${darkMode ? 'bg-gray-400' : 'bg-gray-600'}`
          }`}
        />
      )}
      
      {children}
      
      {removable && (
        <button
          type="button"
          className={`ml-1 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center focus:outline-none ${
            darkMode ? 'hover:bg-opacity-30 hover:bg-gray-600' : 'hover:bg-opacity-30 hover:bg-gray-300'
          }`}
          onClick={onRemove}
          aria-label="Remove badge"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
}

export default Badge; 