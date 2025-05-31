import React, { useContext } from 'react';
import { ThemeContext } from '../App';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  icon = null,
  loading = false,
  ...props 
}) {
  const { darkMode } = useContext(ThemeContext);
  
  // Different variants styling
  const variants = {
    primary: `
      ${darkMode 
        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-md'
        : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-md'
      }
    `,
    secondary: `
      ${darkMode 
        ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-md'
        : 'bg-slate-600 hover:bg-slate-500 text-white shadow-md'
      }
    `,
    success: `
      ${darkMode 
        ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30' 
        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
      }
    `,
    danger: `
      ${darkMode 
        ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
        : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
      }
    `,
    outline: `
      bg-transparent border 
      ${darkMode 
        ? 'border-gray-600 hover:bg-gray-700 text-gray-200 hover:text-white' 
        : 'border-gray-300 hover:bg-gray-100 text-gray-700 hover:border-gray-400'
      }
    `,
    ghost: `
      bg-transparent 
      ${darkMode 
        ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
        : 'hover:bg-gray-100 text-gray-700'
      }
    `,
    link: `
      bg-transparent shadow-none 
      ${darkMode 
        ? 'text-primary-400 hover:text-primary-300' 
        : 'text-primary-600 hover:text-primary-700'
      }
      hover:underline
    `
  };
  
  // Button sizes
  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-7 py-3.5 text-xl'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200
        ${sizes[size]}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled 
          ? 'opacity-60 cursor-not-allowed' 
          : 'transform hover:-translate-y-0.5 active:translate-y-0'
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${darkMode ? 'focus:ring-primary-500 focus:ring-offset-gray-900' : 'focus:ring-primary-500 focus:ring-offset-white'}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
    </button>
  );
}

export default Button; 