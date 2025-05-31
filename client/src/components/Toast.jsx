import React, { useState, useEffect, useContext } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { ThemeContext } from '../App';

const Toast = ({ 
  type = 'success', 
  message, 
  duration = 3000,
  onClose,
  position = 'bottom-right' 
}) => {
  const { darkMode } = useContext(ThemeContext);
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Wait for exit animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <FaExclamationCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };
  
  const getBgColor = () => {
    if (darkMode) {
      switch (type) {
        case 'success': return 'bg-green-900 border-green-700';
        case 'error': return 'bg-red-900 border-red-700';
        case 'info': return 'bg-blue-900 border-blue-700';
        case 'warning': return 'bg-yellow-900 border-yellow-700';
        default: return 'bg-gray-800 border-gray-700';
      }
    } else {
      switch (type) {
        case 'success': return 'bg-green-50 border-green-200';
        case 'error': return 'bg-red-50 border-red-200';
        case 'info': return 'bg-blue-50 border-blue-200';
        case 'warning': return 'bg-yellow-50 border-yellow-200';
        default: return 'bg-white border-gray-200';
      }
    }
  };
  
  const getTextColor = () => {
    if (darkMode) {
      switch (type) {
        case 'success': return 'text-green-200';
        case 'error': return 'text-red-200';
        case 'info': return 'text-blue-200';
        case 'warning': return 'text-yellow-200';
        default: return 'text-gray-200';
      }
    } else {
      switch (type) {
        case 'success': return 'text-green-800';
        case 'error': return 'text-red-800';
        case 'info': return 'text-blue-800';
        case 'warning': return 'text-yellow-800';
        default: return 'text-gray-800';
      }
    }
  };
  
  return (
    <div 
      className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ${getBgColor()} border`}>
        <div className="p-4 flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={`inline-flex ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;

// Create a Toast container component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

// Create a toast context to manage toasts
export const ToastContext = React.createContext({
  addToast: () => {},
  removeToast: () => {},
}); 