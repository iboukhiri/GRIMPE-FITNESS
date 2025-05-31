import React, { useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { ThemeContext } from '../App';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
}) => {
  const { darkMode } = useContext(ThemeContext);
  const modalRef = useRef(null);
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Handle clicking outside
  const handleOutsideClick = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title}
      role="dialog"
      aria-modal="true"
      onClick={handleOutsideClick}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
        
        {/* Modal panel */}
        <div 
          ref={modalRef}
          className={`${sizeClasses[size]} w-full transform overflow-hidden rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl transition-all animate-fade-in-up`}
        >
          {/* Header */}
          {title && (
            <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
              {showCloseButton && (
                <button
                  type="button"
                  className={`rounded-full p-1 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} focus:outline-none`}
                  onClick={onClose}
                  aria-label="Close"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="p-4 overflow-y-auto max-h-[70vh]">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-2`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 