import React, { useState, useContext } from 'react';
import { ThemeContext } from '../App';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaRunning, FaDumbbell, FaHeartbeat } from 'react-icons/fa';

function WorkoutCalendar({ workouts = [], onSelectDate }) {
  const { darkMode } = useContext(ThemeContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  // Function to navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Get the month name
  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(currentDate);
  
  // Get the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  
  // Get the last day of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
  let firstDayOfWeek = firstDayOfMonth.getDay();
  // Adjust for Monday as first day of week (European calendar)
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  // Total number of days in the month
  const totalDays = lastDayOfMonth.getDate();
  
  // Create an array of day names
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Create calendar grid
  const createCalendarGrid = () => {
    const totalCells = Math.ceil((totalDays + firstDayOfWeek) / 7) * 7;
    const grid = [];
    
    // Add days from previous month to fill the first row
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = prevMonthLastDay - firstDayOfWeek + i + 1;
      grid.push({
        day,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= totalDays; i++) {
      grid.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to complete the grid
    const remainingCells = totalCells - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({
        day: i,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false
      });
    }
    
    return grid;
  };
  
  // Format a date to YYYY-MM-DD
  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  // Check if a date has workouts
  const getWorkoutsForDate = (year, month, day) => {
    const dateString = formatDate(year, month, day);
    return workouts.filter(workout => workout.date === dateString);
  };
  
  // Get icon based on workout type
  const getWorkoutIcon = (type) => {
    if (type.toLowerCase().includes('cardio') || type.toLowerCase().includes('running')) {
      return <FaRunning />;
    } else if (type.toLowerCase().includes('strength') || type.toLowerCase().includes('weight')) {
      return <FaDumbbell />;
    } 
    return <FaHeartbeat />;
  };
  
  // Create the calendar grid
  const calendarGrid = createCalendarGrid();
  
  // Today's date for highlighting
  const today = new Date();
  const isToday = (day, month, year) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Calendar Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center">
          <FaCalendarAlt className={`mr-2 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {currentYear}
          </h3>
        </div>
        
        <div className="flex space-x-1">
          <button 
            onClick={goToPreviousMonth}
            className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            aria-label="Mois précédent"
          >
            <FaChevronLeft className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <button 
            onClick={goToNextMonth}
            className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            aria-label="Mois suivant"
          >
            <FaChevronRight className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>
      
      {/* Days of Week */}
      <div className={`grid grid-cols-7 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        {dayNames.map((day, index) => (
          <div key={index} className="text-center py-2 text-xs font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarGrid.map((date, index) => {
          const { day, month, year, isCurrentMonth } = date;
          const dateWorkouts = getWorkoutsForDate(year, month, day);
          const hasWorkouts = dateWorkouts.length > 0;
          const todayHighlight = isToday(day, month, year);
          
          return (
            <div 
              key={index}
              onClick={() => onSelectDate && onSelectDate(formatDate(year, month, day))}
              className={`
                border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}
                min-h-[70px] p-1 relative
                ${index % 7 !== 6 ? darkMode ? 'border-r border-gray-700' : 'border-r border-gray-200' : ''}
                ${!isCurrentMonth ? darkMode ? 'text-gray-600' : 'text-gray-400' : darkMode ? 'text-white' : 'text-gray-800'}
                ${hasWorkouts ? 'cursor-pointer hover:bg-opacity-10 hover:bg-primary-500' : ''}
                ${onSelectDate ? 'cursor-pointer' : ''}
              `}
            >
              {/* Day Number */}
              <div 
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full mb-1
                  ${todayHighlight 
                    ? darkMode 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-primary-600 text-white' 
                    : ''
                  }
                `}
              >
                {day}
              </div>
              
              {/* Workout indicators */}
              {hasWorkouts && (
                <div className="flex flex-col space-y-1">
                  {dateWorkouts.slice(0, 2).map((workout, wIndex) => (
                    <div 
                      key={wIndex}
                      className={`
                        text-xs px-1.5 py-0.5 rounded flex items-center
                        ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
                      `}
                    >
                      <span className="mr-1">{getWorkoutIcon(workout.type)}</span>
                      <span className="truncate">{workout.type}</span>
                    </div>
                  ))}
                  
                  {dateWorkouts.length > 2 && (
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{dateWorkouts.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorkoutCalendar; 