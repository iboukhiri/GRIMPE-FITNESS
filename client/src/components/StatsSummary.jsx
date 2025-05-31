import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../App';
import { 
  FaDumbbell, 
  FaFire, 
  FaClock, 
  FaTrophy, 
  FaRunning, 
  FaHeartbeat,
  FaChartLine,
  FaWeight,
  FaBolt
} from 'react-icons/fa';

function StatsSummary({ 
  stats = [], 
  title = 'Statistics',
  subtitle = '',
  highlightRecent = false,
  animate = true,
  className = '',
  loading = false
}) {
  const { darkMode } = useContext(ThemeContext);
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));
  const prevLoading = React.useRef(loading);
  
  useEffect(() => {
    // If loading, reset values to 0
    if (loading) {
      setAnimatedValues(stats.map(() => 0));
      prevLoading.current = true;
      return;
    }
    // Only animate if loading just turned false
    if (prevLoading.current && !loading) {
      prevLoading.current = false;
      if (!animate) {
        setAnimatedValues(stats.map(stat => stat.value));
        return;
      }
      // Start animation
      const animationDuration = 1500; // ms
      const framesPerSecond = 60;
      const frameDuration = 1000 / framesPerSecond;
      const totalFrames = animationDuration / frameDuration;
      let frame = 0;
      const timer = setInterval(() => {
        frame++;
        const progress = Math.min(frame / totalFrames, 1);
        // Calculate current value based on easing function (easeOutExpo)
        const newValues = stats.map(stat => {
          if (typeof stat.value === 'number') {
            const easing = 1 - Math.pow(2, -10 * progress);
            return Math.round(stat.value * easing);
          }
          return 0;
        });
        setAnimatedValues(newValues);
        if (frame >= totalFrames) {
          clearInterval(timer);
        }
      }, frameDuration);
      return () => clearInterval(timer);
    } else {
      // If not animating, just set values
      setAnimatedValues(stats.map(stat => stat.value));
    }
  }, [stats, animate, loading]);
  
  // Get icon based on type
  const getIcon = (type) => {
    switch (type) {
      case 'workout':
        return <FaDumbbell className="text-2xl" />;
      case 'calories':
        return <FaFire className="text-2xl" />;
      case 'time':
        return <FaClock className="text-2xl" />;
      case 'streak':
        return <FaTrophy className="text-2xl" />;
      case 'cardio':
        return <FaRunning className="text-2xl" />;
      case 'intensity':
        return <FaBolt className="text-2xl" />;
      case 'weight':
        return <FaWeight className="text-2xl" />;
      case 'progress':
        return <FaChartLine className="text-2xl" />;
      default:
        return <FaHeartbeat className="text-2xl" />;
    }
  };
  
  // Color variants based on type
  const getColorClass = (type) => {
    switch (type) {
      case 'workout':
        return darkMode ? 'text-primary-400' : 'text-primary-600';
      case 'calories':
        return darkMode ? 'text-red-400' : 'text-red-600';
      case 'time':
        return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'streak':
        return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'cardio':
        return darkMode ? 'text-green-400' : 'text-green-600';
      case 'intensity':
        return darkMode ? 'text-orange-400' : 'text-orange-600';
      case 'weight':
        return darkMode ? 'text-purple-400' : 'text-purple-600';
      case 'progress':
        return darkMode ? 'text-teal-400' : 'text-teal-600';
      default:
        return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };
  
  // Format values
  const formatValue = (value, unit) => {
    // If the value is a string, return it directly
    if (typeof value !== 'number') {
      return value;
    }
    
    // Format number with comma as thousands separator
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (unit ? ` ${unit}` : '');
  };
  
  return (
    <div className={`${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:justify-center">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`
              relative flex flex-col flex-1 min-h-[120px] min-h-0 box-border justify-between h-full p-4 lg:p-3 border transition-all duration-200
              ${darkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                : 'bg-white border-gray-200 hover:shadow-md'
              }
              ${highlightRecent && index === 0 
                ? darkMode 
                  ? 'ring-2 ring-primary-500 ring-opacity-50' 
                  : 'ring-2 ring-primary-500 ring-opacity-30'
                : ''
              }
              ${index === 0 ? 'lg:rounded-l-lg' : ''}
              ${index === stats.length - 1 ? 'lg:rounded-r-lg' : ''}
            `}
          >
            <div className="flex flex-col items-center mb-1 gap-2">
              <div className={`mb-1 ${getColorClass(stat.type)}`}>{getIcon(stat.type)}</div>
              <div className={`text-base lg:text-sm font-medium break-words text-center px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className={`text-2xl lg:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatValue(animatedValues[index], stat.unit)}</div>
              {stat.change !== undefined && (
                <div className={`text-sm lg:text-xs font-medium ${
                  stat.change > 0 
                    ? 'text-green-500' 
                    : stat.change < 0 
                      ? 'text-red-500' 
                      : darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </div>
              )}
            </div>
            {stat.subtitle && (
              <div className={`mt-1 text-xs lg:text-[0.8rem] break-words text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.subtitle}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsSummary; 