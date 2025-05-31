import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaMountain, FaBolt, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ThemeContext, useToast } from '../App';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { darkMode } = useContext(ThemeContext);
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        addToast({
          type: 'success',
          message: result.message,
          duration: 3000
        });
        navigate('/dashboard');
      } else {
        setError(result.message);
        addToast({
          type: 'error',
          message: result.message,
          duration: 5000
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Connexion échouée. Veuillez réessayer.';
      setError(errorMessage);
      addToast({
        type: 'error',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'
    }`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header with Logo */}
        <div className="text-center animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <FaMountain className={`h-16 w-16 transition-colors ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              } animate-bounce-motivational`} />
              <FaBolt className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 transition-colors ${
            darkMode 
              ? 'text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text' 
              : 'text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text'
          }`}>
            GRIMPE
          </h1>
          <p className={`text-lg md:text-xl font-medium mb-6 transition-colors ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Bon Retour, Champion
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest">
            <span className={darkMode ? 'text-orange-400' : 'text-orange-600'}>🔥 ENFLAMMER</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-red-400' : 'text-red-600'}>💪 ÉLEVER</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-green-400' : 'text-green-600'}>🚀 RÉUSSIR</span>
          </div>
        </div>

        {/* Login Form */}
        <div className={`py-8 px-6 shadow-xl rounded-xl transition-all duration-300 animate-fade-in-up animation-delay-200 ${
          darkMode 
            ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
            : 'bg-white/95 backdrop-blur-sm border border-orange-200'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className={`px-4 py-3 rounded-lg text-sm animate-shake border ${
                darkMode 
                  ? 'bg-red-900/30 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Adresse E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`h-5 w-5 transition-colors ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                      : 'bg-gray-50 border-orange-300 placeholder-gray-600 text-gray-900 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
                  }`}
                  placeholder="Entrez votre adresse e-mail"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors ${
                darkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Mot de Passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 transition-colors ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                      : 'bg-gray-50 border-orange-300 placeholder-gray-600 text-gray-900 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
                  }`}
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className={`h-5 w-5 transition-colors ${
                      darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                    }`} />
                  ) : (
                    <FaEye className={`h-5 w-5 transition-colors ${
                      darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                    }`} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-white font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400' 
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaSignInAlt className="mr-2" />
                    Se Connecter
                  </span>
                )}
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className={`text-sm transition-colors ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Vous n'avez pas de compte ?{' '}
                <Link
                  to="/register"
                  className={`font-bold transition-colors ${
                    darkMode 
                      ? 'text-orange-400 hover:text-orange-300' 
                      : 'text-orange-600 hover:text-orange-500'
                  }`}
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Motivational Footer */}
        <div className="text-center animate-fade-in-up animation-delay-400">
          <p className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
            darkMode ? 'text-slate-500' : 'text-slate-500'
          }`}>
            Votre parcours fitness continue ici
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; 