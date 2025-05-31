import React, { useState, useContext, useEffect } from 'react';
import { FaCog, FaUser, FaLock, FaPalette, FaSave } from 'react-icons/fa';
import { ThemeContext } from '../App';
import { useToast } from '../App';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { addToast } = useToast();
  const { user, updateProfile, updatePreferences } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [theme, setTheme] = useState(darkMode ? 'dark' : 'light');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Keep theme value in sync with app's dark mode
  useEffect(() => {
    setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Set user data when user object changes
  useEffect(() => {
    if (user) {
      setName(user.name || user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      addToast({
        type: 'error',
        message: 'Veuillez remplir tous les champs du profil.',
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, email });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      addToast({
        type: 'error',
        message: 'Veuillez remplir tous les champs pour le mot de passe.',
        duration: 3000
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast({
        type: 'error',
        message: 'Les nouveaux mots de passe ne correspondent pas.',
        duration: 3000
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    
    // Apply theme change to app
    if (newTheme === 'dark' && !darkMode) {
      toggleDarkMode();
      updatePreferences({ darkMode: true });
    } else if (newTheme === 'light' && darkMode) {
      toggleDarkMode();
      updatePreferences({ darkMode: false });
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-full ${
              darkMode ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-orange-600 to-red-600'
            }`}>
              <FaCog className="text-3xl text-white" />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 transition-colors ${
            darkMode 
              ? 'text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text' 
              : 'text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text'
          }`}>
            Paramètres
          </h1>
          <p className={`text-lg font-medium transition-colors ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Personnalisez votre expérience et gérez votre compte
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className={`p-6 rounded-xl transition-all duration-300 animate-fade-in-up animation-delay-100 ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
              : 'bg-white/95 backdrop-blur-sm border border-orange-200'
          }`}>
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-full mr-4 ${
                darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <FaUser className={`text-xl ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold transition-colors ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  Informations du Profil
                </h2>
                <p className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Mettez à jour vos informations personnelles
                </p>
              </div>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-2 transition-colors ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Nom complet
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                        : 'bg-white border-orange-300 placeholder-slate-500 text-slate-900 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                        : 'bg-white border-orange-300 placeholder-slate-500 text-slate-900 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 shadow-md' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md'
                  } text-white ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <FaSave className="mr-2" />
                  {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className={`p-6 rounded-xl transition-all duration-300 animate-fade-in-up animation-delay-200 ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
              : 'bg-white/95 backdrop-blur-sm border border-orange-200'
          }`}>
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-full mr-4 ${
                darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <FaLock className={`text-xl ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold transition-colors ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  Sécurité du Compte
                </h2>
                <p className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Changez votre mot de passe pour sécuriser votre compte
                </p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="current-password" className={`block text-sm font-medium mb-2 transition-colors ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Mot de passe actuel
                </label>
                <input
                  id="current-password"
                  name="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                      : 'bg-white border-orange-300 placeholder-slate-500 text-slate-900 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="new-password" className={`block text-sm font-medium mb-2 transition-colors ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Nouveau mot de passe
                  </label>
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                        : 'bg-white border-orange-300 placeholder-slate-500 text-slate-900 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className={`block text-sm font-medium mb-2 transition-colors ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirm-new-password"
                    name="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                        : 'bg-white border-orange-300 placeholder-slate-500 text-slate-900 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    placeholder="Confirmez le nouveau mot de passe"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 shadow-md' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-md'
                  } text-white ${passwordLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <FaLock className="mr-2" />
                  {passwordLoading ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </div>
            </form>
          </div>

          {/* Preferences Section */}
          <div className={`p-6 rounded-xl transition-all duration-300 animate-fade-in-up animation-delay-300 ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
              : 'bg-white/95 backdrop-blur-sm border border-orange-200'
          }`}>
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-full mr-4 ${
                darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <FaPalette className={`text-xl ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold transition-colors ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  Préférences d'Affichage
                </h2>
                <p className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Personnalisez l'apparence de l'application
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="theme" className={`block text-sm font-medium mb-2 transition-colors ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Thème de l'interface
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={theme}
                  onChange={handleThemeChange}
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                      : 'bg-white border-orange-300 text-slate-900 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                >
                  <option value="light">🌞 Mode Clair</option>
                  <option value="dark">🌙 Mode Sombre</option>
                </select>
                <p className={`mt-2 text-sm ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Le thème sombre est parfait pour les entraînements en soirée et réduit la fatigue oculaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 