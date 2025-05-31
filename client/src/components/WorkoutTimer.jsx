import React, { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../App';
import { FaPlay, FaPause, FaStop, FaRedo, FaHourglassHalf, FaDumbbell } from 'react-icons/fa';
import Button from './Button';

function WorkoutTimer({ 
  initialTime = 0, 
  onComplete, 
  autoStart = false,
  mode = 'workout',  // 'workout' or 'rest'
  className = '' 
}) {
  const { darkMode } = useContext(ThemeContext);
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  
  // Sound effects
  const timerEndSound = useRef(null);
  
  useEffect(() => {
    // Create audio element for timer end
    timerEndSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    
    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          // Timer counting up
          return prevTime + 1;
        });
      }, 1000);
    } else if (!isActive) {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused]);
  
  // Format time as mm:ss
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Timer controls
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };
  
  const pauseTimer = () => {
    setIsPaused(true);
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(initialTime);
  };
  
  const handleComplete = () => {
    // Play sound
    if (timerEndSound.current) {
      timerEndSound.current.play();
    }
    
    // Call onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
  };

  // Dynamic styling based on mode
  const getModeStyles = () => {
    if (mode === 'workout') {
      return {
        bg: darkMode ? 'bg-primary-900' : 'bg-primary-50',
        border: darkMode ? 'border-primary-700' : 'border-primary-200',
        text: darkMode ? 'text-primary-300' : 'text-primary-800',
        icon: <FaDumbbell className={`text-2xl ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />,
        label: 'Entraînement'
      };
    } else {
      return {
        bg: darkMode ? 'bg-secondary-900' : 'bg-secondary-50',
        border: darkMode ? 'border-secondary-700' : 'border-secondary-200',
        text: darkMode ? 'text-secondary-300' : 'text-secondary-800',
        icon: <FaHourglassHalf className={`text-2xl ${darkMode ? 'text-secondary-400' : 'text-secondary-600'}`} />,
        label: 'Repos'
      };
    }
  };
  
  const modeStyles = getModeStyles();
  
  return (
    <div className={`
      rounded-lg border ${modeStyles.border} ${modeStyles.bg} p-4
      ${className}
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {modeStyles.icon}
          <span className={`ml-2 font-medium ${modeStyles.text}`}>{modeStyles.label}</span>
        </div>
      </div>
      
      {/* Timer Display */}
      <div className="flex justify-center mb-4">
        <div className={`
          text-4xl font-mono font-bold tracking-wider
          ${modeStyles.text}
        `}>
          {formatTime(time)}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-2">
        {!isActive && !isPaused ? (
          <Button 
            onClick={startTimer}
            variant={mode === 'workout' ? 'primary' : 'secondary'}
            size="sm"
            icon={<FaPlay />}
          >
            Démarrer
          </Button>
        ) : isPaused ? (
          <Button 
            onClick={resumeTimer}
            variant={mode === 'workout' ? 'primary' : 'secondary'}
            size="sm"
            icon={<FaPlay />}
          >
            Reprendre
          </Button>
        ) : (
          <Button 
            onClick={pauseTimer}
            variant={mode === 'workout' ? 'primary' : 'secondary'}
            size="sm"
            icon={<FaPause />}
          >
            Pause
          </Button>
        )}
        
        <Button 
          onClick={resetTimer}
          variant="outline"
          size="sm"
          icon={<FaRedo />}
        >
          Réinitialiser
        </Button>
        
        {isActive && (
          <Button 
            onClick={handleComplete}
            variant={mode === 'workout' ? 'success' : 'danger'}
            size="sm"
            icon={<FaStop />}
          >
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
}

export default WorkoutTimer; 