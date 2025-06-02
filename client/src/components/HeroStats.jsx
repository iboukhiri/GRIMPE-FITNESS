import React, { useContext } from 'react';
import { FaChartLine } from 'react-icons/fa';
import { FaFire } from 'react-icons/fa';
import { ThemeContext } from '../App';

const HeroStats = ({
  title = 'Enregistrer un entraînement',
  subtitle = 'Gérez vos séances simplement',
  workoutsThisWeek = 0,
  caloriesThisWeek = 0
}) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`relative overflow-hidden rounded-lg mb-8 p-6 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white`}>
      {/* Decorative Blobs - less intrusive */}
      <div className="absolute top-0 -left-10 w-60 h-60 bg-white opacity-10 rounded-full transform -translate-y-1/2 rotate-45 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full translate-x-1/4 translate-y-1/4 rotate-12 pointer-events-none z-0"></div>
      <div className="relative z-10">
        <h1 className="text-h2 font-bold drop-shadow-lg">{title}</h1>
        <p className="mt-2 opacity-90 drop-shadow">{subtitle}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 relative z-10">
        <div className="flex items-center gap-3 bg-white/30 rounded-lg p-4 backdrop-blur-sm">
          <FaChartLine className="text-2xl drop-shadow" />
          <div>
            <p className="text-lg font-semibold drop-shadow">{workoutsThisWeek}</p>
            <p className="text-sm opacity-90">Entraînements cette semaine</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/30 rounded-lg p-4 backdrop-blur-sm">
          <FaFire className="text-2xl drop-shadow" />
          <div>
            <p className="text-lg font-semibold drop-shadow">{caloriesThisWeek}</p>
            <p className="text-sm opacity-90">Calories brûlées</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroStats; 