import React, { useContext } from 'react';
import { ThemeContext } from '../App';

function About() {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${darkMode ? 'from-gray-800 via-gray-900 to-gray-800' : 'from-primary-100 via-white to-primary-200'} py-6 px-4 sm:px-6 lg:px-8 animate-fade-in transition-colors duration-200`}>
      <div className={`max-w-3xl mx-auto ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow'} rounded-lg p-6 card`}>
        <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-primary-700'} mb-4 text-center`}>À propos de GRIMPE</h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-secondary-700'} mb-8 text-center`}>
          GRIMPE est votre compagnon ultime pour suivre vos entraînements, surveiller vos progrès et atteindre vos objectifs de remise en forme. Notre application est conçue pour les passionnés de fitness, les grimpeurs et tous ceux qui souhaitent améliorer leur santé.
        </p>
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-primary-600'} mb-2`}>Fonctionnalités clés</h2>
          <ul className={`list-disc pl-6 ${darkMode ? 'text-gray-300' : 'text-secondary-700'} space-y-1`}>
            <li>Suivi des entraînements et calories brûlées</li>
            <li>Visualisation des progrès avec des graphiques interactifs</li>
            <li>Gestion du profil et des préférences</li>
            <li>Interface moderne et intuitive</li>
          </ul>
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-primary-600'} mb-2`}>Notre équipe</h2>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-primary-800 text-primary-300' : 'bg-primary-200 text-primary-700'} flex items-center justify-center text-3xl font-bold mb-2`}>I</div>
              <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-secondary-800'}`}>Iliass Boukhiri</span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-secondary-500'}`}>Développeur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 