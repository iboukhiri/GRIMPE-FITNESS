import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import { FaTrophy, FaMedal, FaAward, FaCrown, FaStar, FaCheck } from 'react-icons/fa';

function Achievement({ 
  title, 
  description, 
  type = 'bronze', 
  icon = 'trophy',
  progress = 100,
  date,
  onClick,
  className = ''
}) {
  const { darkMode } = useContext(ThemeContext);
  
  // Define types with their colors and icons
  const types = {
    bronze: {
      bg: darkMode ? 'bg-amber-900' : 'bg-amber-100',
      border: darkMode ? 'border-amber-700' : 'border-amber-300',
      text: darkMode ? 'text-amber-200' : 'text-amber-800',
      icon: <FaMedal className={darkMode ? 'text-amber-400' : 'text-amber-600'} />,
      iconBg: darkMode ? 'bg-amber-800' : 'bg-amber-200'
    },
    silver: {
      bg: darkMode ? 'bg-gray-800' : 'bg-gray-100',
      border: darkMode ? 'border-gray-600' : 'border-gray-300',
      text: darkMode ? 'text-gray-200' : 'text-gray-800',
      icon: <FaMedal className={darkMode ? 'text-gray-400' : 'text-gray-500'} />,
      iconBg: darkMode ? 'bg-gray-700' : 'bg-gray-200'
    },
    gold: {
      bg: darkMode ? 'bg-yellow-900' : 'bg-yellow-100',
      border: darkMode ? 'border-yellow-700' : 'border-yellow-300',
      text: darkMode ? 'text-yellow-200' : 'text-yellow-800',
      icon: <FaMedal className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />,
      iconBg: darkMode ? 'bg-yellow-800' : 'bg-yellow-200'
    },
    platinum: {
      bg: darkMode ? 'bg-blue-900' : 'bg-blue-100',
      border: darkMode ? 'border-blue-700' : 'border-blue-300',
      text: darkMode ? 'text-blue-200' : 'text-blue-800',
      icon: <FaCrown className={darkMode ? 'text-blue-400' : 'text-blue-600'} />,
      iconBg: darkMode ? 'bg-blue-800' : 'bg-blue-200'
    },
    special: {
      bg: darkMode ? 'bg-purple-900' : 'bg-purple-100',
      border: darkMode ? 'border-purple-700' : 'border-purple-300',
      text: darkMode ? 'text-purple-200' : 'text-purple-800',
      icon: <FaStar className={darkMode ? 'text-purple-400' : 'text-purple-600'} />,
      iconBg: darkMode ? 'bg-purple-800' : 'bg-purple-200'
    },
    completed: {
      bg: darkMode ? 'bg-green-900' : 'bg-green-100',
      border: darkMode ? 'border-green-700' : 'border-green-300',
      text: darkMode ? 'text-green-200' : 'text-green-800',
      icon: <FaCheck className={darkMode ? 'text-green-400' : 'text-green-600'} />,
      iconBg: darkMode ? 'bg-green-800' : 'bg-green-200'
    }
  };
  
  // Handle icon selection
  const getIcon = () => {
    if (icon === 'trophy') return <FaTrophy />;
    if (icon === 'medal') return <FaMedal />;
    if (icon === 'award') return <FaAward />;
    if (icon === 'crown') return <FaCrown />;
    if (icon === 'star') return <FaStar />;
    if (icon === 'check') return <FaCheck />;
    return <FaTrophy />;
  };
  
  const selectedType = types[type];
  
  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden border rounded-lg p-4 transform transition-all duration-300 
        ${selectedType.bg} ${selectedType.border}
        ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : ''}
        ${className}
      `}
    >
      {/* Progress bar for partial achievements */}
      {progress < 100 && (
        <div className="absolute bottom-0 left-0 h-1 bg-opacity-20 bg-white w-full">
          <div 
            className={`h-full ${selectedType.text} bg-opacity-50`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        <div className={`
          flex-shrink-0 p-3 rounded-full ${selectedType.iconBg}
        `}>
          {types[type].icon}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-bold ${selectedType.text}`}>{title}</h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
          
          {date && (
            <div className="mt-2 text-xs italic text-gray-500">
              Débloqué le: {date}
            </div>
          )}
          
          {progress < 100 && (
            <div className="mt-2 text-xs font-medium">
              <span className={selectedType.text}>{progress}% complété</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Achievement; 