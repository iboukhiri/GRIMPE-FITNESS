import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import { FaMountain } from 'react-icons/fa';
import { FaBolt } from 'react-icons/fa';
import { FaSignInAlt } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa';
import { FaEyeSlash } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa';
import { FaShieldAlt } from 'react-icons/fa';
import { FaFingerprint } from 'react-icons/fa';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Adresse e-mail invalide';
      case 'password':
        return value.length >= 6 ? '' : 'Le mot de passe doit contenir au moins 6 caractères';
      default:
        return '';
    }
  };

  const handleFieldChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    // Validate fields
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    
    if (emailError || passwordError || !email || !password) {
      setFieldErrors({
        email: emailError || (!email ? 'Ce champ est requis' : ''),
        password: passwordError || (!password ? 'Ce champ est requis' : '')
      });
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
    <div className={`min-h-screen flex transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200'
    }`}>
      {/* Left Panel - Desktop Only */}
      <div className={`hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-orange-400 to-orange-600'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.1'%3e%3cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-8 lg:p-12">
          <div className="text-center text-white max-w-2xl mx-auto space-y-12">
            {/* Logo and Title Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <FaMountain className="h-28 w-28 text-white animate-bounce-motivational" />
                  <FaBolt className="absolute -top-4 -right-4 h-12 w-12 text-yellow-300" />
                </div>
              </div>
              <h1 className="text-6xl xl:text-8xl font-black text-white drop-shadow-2xl">
                GRIMPE
              </h1>
              <p className="text-2xl xl:text-3xl font-medium opacity-95">
                Bon Retour, Champion
              </p>
            </div>

            {/* Description Section */}
            <div className="space-y-8">
              <h2 className="text-3xl xl:text-4xl font-bold">
                Reprenez où vous vous êtes arrêté
              </h2>
              <p className="text-xl xl:text-2xl opacity-90 leading-relaxed">
                Votre parcours de transformation vous attend. Connectez-vous pour continuer à écraser vos objectifs.
              </p>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 transform hover:scale-110 transition-all duration-300 hover:bg-white/25">
                <div className="text-4xl font-bold mb-3">💪</div>
                <div className="text-base font-semibold opacity-95">Force</div>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 transform hover:scale-110 transition-all duration-300 hover:bg-white/25">
                <div className="text-4xl font-bold mb-3">🔥</div>
                <div className="text-base font-semibold opacity-95">Endurance</div>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 transform hover:scale-110 transition-all duration-300 hover:bg-white/25">
                <div className="text-4xl font-bold mb-3">🚀</div>
                <div className="text-base font-semibold opacity-95">Progrès</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Header */}
          <div className="text-center lg:hidden animate-fade-in-up">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <FaMountain className={`h-16 w-16 transition-colors ${
                  darkMode ? 'text-orange-400' : 'text-orange-600'
                } animate-bounce-motivational`} />
                <FaBolt className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500" />
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
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center animate-fade-in-up">
            <div className="flex items-center justify-center mb-4">
              <FaFingerprint className={`h-12 w-12 ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Connexion
            </h2>
            <p className={`text-base ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Accédez à votre espace d'entraînement
            </p>
          </div>

          {/* Login Form */}
          <div className={`py-8 px-6 shadow-2xl rounded-2xl transition-all duration-300 animate-fade-in-up animation-delay-200 border ${
            darkMode 
              ? 'bg-slate-800/95 backdrop-blur-lg border-slate-700/50' 
              : 'bg-white/95 backdrop-blur-lg border-orange-200/50'
          }`}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Global Error Message */}
              {error && (
                <div className={`px-4 py-3 rounded-xl text-sm animate-shake border flex items-center ${
                  darkMode 
                    ? 'bg-red-900/30 border-red-700/50 text-red-300' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <FaShieldAlt className="mr-2 h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 transition-colors ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Adresse E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`h-5 w-5 transition-colors ${
                      fieldErrors.email 
                        ? 'text-red-400' 
                        : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                      fieldErrors.email
                        ? 'border-red-400 ring-red-400 focus:border-red-400 focus:ring-red-400'
                        : darkMode 
                          ? 'bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                          : 'bg-gray-50/50 border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <span className="mr-1">⚠</span>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className={`block text-sm font-semibold mb-2 transition-colors ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Mot de Passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 transition-colors ${
                      fieldErrors.password 
                        ? 'text-red-400' 
                        : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                      fieldErrors.password
                        ? 'border-red-400 ring-red-400 focus:border-red-400 focus:ring-red-400'
                        : darkMode 
                          ? 'bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                          : 'bg-gray-50/50 border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
                    }`}
                    placeholder="••••••••"
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
                {fieldErrors.password && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <span className="mr-1">⚠</span>
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 ${
                      darkMode ? 'bg-slate-700 border-slate-600' : ''
                    }`}
                  />
                  <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Se souvenir de moi
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  className={`group w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
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
                      <FaArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                    className={`font-bold transition-colors hover:underline ${
                      darkMode 
                        ? 'text-teal-400 hover:text-teal-300' 
                        : 'text-teal-600 hover:text-teal-500'
                    }`}
                  >
                    S'inscrire maintenant
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
              🔥 Votre parcours fitness continue ici 🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 