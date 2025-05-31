import React, { useContext } from 'react';
import { FaHome, FaPlusCircle, FaChartBar, FaUser } from 'react-icons/fa';
import { ThemeContext } from '../App';

const BottomNav = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-around items-center z-50`}>      
      <button className="flex flex-col items-center text-gray-600 dark:text-gray-300">
        <FaHome size={20} />
        <span className="text-xs">Accueil</span>
      </button>
      <button className="flex flex-col items-center text-primary-600 dark:text-primary-400">
        <FaPlusCircle size={28} />
        <span className="text-xs">Enregistrer</span>
      </button>
      <button className="flex flex-col items-center text-gray-600 dark:text-gray-300">
        <FaChartBar size={20} />
        <span className="text-xs">Stats</span>
      </button>
      <button className="flex flex-col items-center text-gray-600 dark:text-gray-300">
        <FaUser size={20} />
        <span className="text-xs">Profil</span>
      </button>
    </nav>
  );
};

export default BottomNav; 