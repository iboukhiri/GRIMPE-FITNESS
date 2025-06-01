import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaMountain, FaBolt, FaRocket, FaUser, FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaUserPlus, FaTrophy } from 'react-icons/fa';
import { ThemeContext, useToast } from '../App';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const { darkMode } = useContext(ThemeContext);
  const { register, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Apply register-page class to body for scrollbar styling
  useEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  const validateField = (field, value) => {
    switch (field) {
      case 'firstName':
        return value.trim().length >= 2 ? '' : 'Le prénom doit contenir au moins 2 caractères';
      case 'lastName':
        return value.trim().length >= 2 ? '' : 'Le nom doit contenir au moins 2 caractères';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Adresse e-mail invalide';
      case 'password':
        if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        if (!/[A-Z]/.test(value)) return 'Le mot de passe doit contenir au moins une majuscule';
        if (!/[a-z]/.test(value)) return 'Le mot de passe doit contenir au moins une minuscule';
        if (!/[0-9]/.test(value)) return 'Le mot de passe doit contenir au moins un chiffre';
        return '';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Les mots de passe ne correspondent pas';
      default:
        return '';
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Très faible', color: 'red' };
      case 2:
        return { score, label: 'Faible', color: 'orange' };
      case 3:
        return { score, label: 'Moyen', color: 'yellow' };
      case 4:
        return { score, label: 'Fort', color: 'green' };
      case 5:
        return { score, label: 'Très fort', color: 'emerald' };
      default:
        return { score: 0, label: '', color: '' };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const errorMessage = validateField(field, formData[field]);
    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    // Mark all fields as touched
    const allFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    setTouchedFields(Object.fromEntries(allFields.map(field => [field, true])));

    // Validate all fields
    const errors = {};
    allFields.forEach(field => {
      const errorMessage = validateField(field, formData[field]);
      if (errorMessage || !formData[field].trim()) {
        errors[field] = errorMessage || 'Ce champ est requis';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      };

      const result = await register(userData);
      
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
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Inscription échouée. Veuillez réessayer.';
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className={`register-page min-h-screen flex transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200'
    }`}>
      {/* Left Panel - Desktop Only */}
      <div className={`hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-emerald-600 to-teal-600'
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
                  <FaMountain className={`h-28 w-28 text-white animate-bounce-motivational`} />
                  <FaTrophy className="absolute -top-4 -right-4 h-12 w-12 text-yellow-300 animate-pulse" />
                </div>
              </div>
              <h1 className="text-6xl xl:text-8xl font-black text-white drop-shadow-2xl">
                GRIMPE
              </h1>
              <p className="text-2xl xl:text-3xl font-medium opacity-95">
                Commencez Votre Transformation
              </p>
            </div>

            {/* Description Section */}
            <div className="space-y-8">
              <h2 className="text-3xl xl:text-4xl font-bold">
                Rejoignez la Communauté
              </h2>
              <p className="text-xl xl:text-2xl opacity-90 leading-relaxed">
                Créez votre compte et démarrez votre voyage vers la meilleure version de vous-même.
              </p>
            </div>
            
            {/* Benefits Section */}
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="flex items-center space-x-4 bg-white/15 rounded-xl p-6 backdrop-blur-lg text-left transform hover:scale-105 transition-all duration-300">
                <FaCheckCircle className="h-8 w-8 text-teal-200 flex-shrink-0" />
                <span className="text-base font-medium">Suivi personnalisé de vos progrès</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/15 rounded-xl p-6 backdrop-blur-lg text-left transform hover:scale-105 transition-all duration-300">
                <FaCheckCircle className="h-8 w-8 text-teal-300 flex-shrink-0" />
                <span className="text-base font-medium">Programmes d'entraînement adaptés</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/15 rounded-xl p-6 backdrop-blur-lg text-left transform hover:scale-105 transition-all duration-300">
                <FaCheckCircle className="h-8 w-8 text-teal-100 flex-shrink-0" />
                <span className="text-base font-medium">Communauté motivante et bienveillante</span>
              </div>
              <div className="flex items-center space-x-4 bg-white/15 rounded-xl p-6 backdrop-blur-lg text-left transform hover:scale-105 transition-all duration-300">
                <FaCheckCircle className="h-8 w-8 text-teal-400 flex-shrink-0" />
                <span className="text-base font-medium">Analyses détaillées et statistiques</span>
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
                  darkMode ? 'text-teal-400' : 'text-teal-600'
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
              Commencez Votre Transformation
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center animate-fade-in-up">
            <div className="flex items-center justify-center mb-4">
              <FaUserPlus className={`h-12 w-12 ${
                darkMode ? 'text-teal-400' : 'text-emerald-600'
              }`} />
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Créer un Compte
            </h2>
            <p className={`text-base ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Rejoignez notre communauté fitness
            </p>
          </div>

          {/* Register Form */}
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

              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name Field */}
                <div>
                  <label htmlFor="firstName" className={`block text-sm font-semibold mb-2 transition-colors ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className={`h-5 w-5 transition-colors ${
                        fieldErrors.firstName 
                          ? 'text-red-400' 
                          : darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('firstName')}
                      className={`appearance-none relative block w-full pl-10 pr-3 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                        fieldErrors.firstName
                          ? 'border-red-400 ring-red-400 focus:border-red-400 focus:ring-red-400'
                          : darkMode 
                            ? 'bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                            : 'bg-gray-50/50 border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                      }`}
                      placeholder="Votre prénom"
                    />
                    {touchedFields.firstName && !fieldErrors.firstName && formData.firstName && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FaCheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {fieldErrors.firstName && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <FaTimesCircle className="mr-1 h-3 w-3" />
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name Field */}
                <div>
                  <label htmlFor="lastName" className={`block text-sm font-semibold mb-2 transition-colors ${
                    darkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className={`h-5 w-5 transition-colors ${
                        fieldErrors.lastName 
                          ? 'text-red-400' 
                          : darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('lastName')}
                      className={`appearance-none relative block w-full pl-10 pr-3 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                        fieldErrors.lastName
                          ? 'border-red-400 ring-red-400 focus:border-red-400 focus:ring-red-400'
                          : darkMode 
                            ? 'bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                            : 'bg-gray-50/50 border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                      }`}
                      placeholder="Votre nom"
                    />
                    {touchedFields.lastName && !fieldErrors.lastName && formData.lastName && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FaCheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {fieldErrors.lastName && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <FaTimesCircle className="mr-1 h-3 w-3" />
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

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
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('email')}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                      fieldErrors.email
                        ? 'border-red-400 ring-red-400 focus:border-red-400 focus:ring-red-400'
                        : darkMode 
                          ? 'bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                          : 'bg-gray-50/50 border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                    }`}
                    placeholder="votre@email.com"
                  />
                  {touchedFields.email && !fieldErrors.email && formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {fieldErrors.email && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <FaTimesCircle className="mr-1 h-3 w-3" />
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
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('password')}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                      fieldErrors.password
                        ? 'border-red-400 ring-red-400 focus:border-red-400 focus:ring-red-400'
                        : darkMode 
                          ? 'bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                          : 'bg-gray-50/50 border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Force du mot de passe
                      </span>
                      <span className={`text-xs font-medium text-${passwordStrength.color}-500`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {fieldErrors.password && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <FaTimesCircle className="mr-1 h-3 w-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-2 transition-colors ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  Confirmer le Mot de Passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 transition-colors ${
                      fieldErrors.confirmPassword 
                        ? 'text-red-400' 
                        : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('confirmPassword')}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                      fieldErrors.confirmPassword
                        ? 'border-red-400 ring-red-400 focus:border-red-400 focus:ring-red-400'
                        : darkMode 
                          ? 'bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-orange-400 focus:border-orange-400' 
                          : 'bg-gray-50/50 border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className={`h-5 w-5 transition-colors ${
                        darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                      }`} />
                    ) : (
                      <FaEye className={`h-5 w-5 transition-colors ${
                        darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                      }`} />
                    )}
                  </button>
                  {touchedFields.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-10 pr-3 flex items-center">
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <FaTimesCircle className="mr-1 h-3 w-3" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  className={`group w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500' 
                      : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création du compte...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaRocket className="mr-2" />
                      Créer mon Compte
                      <FaArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className={`text-sm transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Vous avez déjà un compte ?{' '}
                  <Link
                    to="/login"
                    className={`font-bold transition-colors hover:underline ${
                      darkMode 
                        ? 'text-orange-400 hover:text-orange-300' 
                        : 'text-orange-600 hover:text-orange-700'
                    }`}
                  >
                    Se connecter
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
              <span className={darkMode ? 'text-teal-400' : 'text-teal-600'}>🚀</span> Votre aventure fitness commence maintenant <span className={darkMode ? 'text-teal-400' : 'text-teal-600'}>🚀</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register; 