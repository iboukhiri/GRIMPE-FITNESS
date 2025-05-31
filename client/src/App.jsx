import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import About from './pages/About';
import { FaMoon, FaSun, FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCog, FaUser, FaMountain, FaBolt, FaRocket } from 'react-icons/fa';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Create context for toasts
export const ToastContext = createContext();

// Create dark mode context
export const ThemeContext = createContext();

// One-time cleanup function
const cleanupDemoData = () => {
  // Remove any demo-related data
  localStorage.removeItem('authDemoMode');
  localStorage.removeItem('useDemoData');
};

// MainLayout with auth integration
function MainLayout({ children, darkMode, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    try {
      const result = await logout();
      if (result.success) {
        addToast({
          type: 'info',
          message: result.message,
          duration: 3000
        });
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [mobileMenuOpen]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuOpen && !event.target.closest('.profile-menu') && !event.target.closest('.profile-menu-button')) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [profileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 transition-all duration-300">
      
      {/* Navigation Bar */}
      <nav className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-gray-800 dark:via-gray-900 dark:to-slate-900 shadow-xl backdrop-blur-sm border-b border-orange-400/30 dark:border-gray-700/50 z-50" aria-label="Navigation principale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-3 group" aria-label="Tableau de bord">
                <div className="relative">
                  <FaMountain className="h-8 w-8 text-white dark:text-orange-400 group-hover:text-yellow-300 dark:group-hover:text-yellow-400 transition-all duration-300 transform group-hover:scale-105" />
                  <FaBolt className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 dark:text-yellow-300 group-hover:text-yellow-200 dark:group-hover:text-yellow-100 transition-all duration-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white dark:text-gray-100 group-hover:text-yellow-300 dark:group-hover:text-yellow-400 transition-colors duration-300 tracking-wider">
                    GRIMPE
                  </span>
                  <span className="text-xs text-orange-100 dark:text-gray-300 font-semibold uppercase tracking-widest -mt-1">
                    DÉPASSEZ VOS LIMITES
                  </span>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1 ml-8">
                <NavLink href="/dashboard" icon={<FaRocket />}>Tableau de bord</NavLink>
                <NavLink href="/log-workout" icon={<FaBolt />}>Enregistrer</NavLink>
                <NavLink href="/progress" icon={<FaMountain />}>Progrès</NavLink>
                <NavLink href="/settings" icon={<FaCog />}>Paramètres</NavLink>
                <NavLink href="/about" icon={<FaUser />}>À propos</NavLink>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button 
                onClick={toggleDarkMode}
                className="relative p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white focus:outline-none shadow-md transform hover:scale-110 transition-all duration-300 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                aria-label="Basculer le mode sombre"
              >
                <div className="relative z-10">
                  {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
                </div>
              </button>

              {/* Profile Dropdown */}
              <div className="relative profile-menu">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="profile-menu-button flex items-center space-x-2 p-2 rounded-xl bg-white/10 dark:bg-gray-700/50 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-600/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:ring-offset-2"
                  aria-label="Menu utilisateur"
                  aria-expanded={profileMenuOpen}
                >
                  <FaUserCircle className="h-6 w-6" />
                  <span className="hidden sm:block font-semibold text-sm">
                    {user?.name || 'Utilisateur'}
                  </span>
                  <svg 
                    className={`h-4 w-4 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                          <FaUserCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {user?.name || 'Alex Martin'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.email || 'demo@grimpe.com'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/settings');
                        }}
                        className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaCog className="h-4 w-4" />
                        <span>Paramètres</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-menu-button lg:hidden p-2 rounded-xl bg-white/10 dark:bg-gray-700/50 text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-600/70 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:ring-offset-2 transition-all duration-300"
                aria-label="Ouvrir le menu de navigation"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="mobile-menu absolute top-full left-0 right-0 bg-gradient-to-b from-orange-600 to-orange-700 dark:from-gray-800 dark:to-gray-900 shadow-xl border-t border-orange-500/30 dark:border-gray-700/50 z-50 lg:hidden">
              <div className="px-4 py-6 space-y-4">
                {/* User Info in Mobile */}
                <div className="flex items-center space-x-3 p-4 bg-white/10 dark:bg-gray-700/30 rounded-xl">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                    <FaUserCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white dark:text-gray-100">
                      {user?.name || 'Alex Martin'}
                    </p>
                    <p className="text-sm text-orange-100 dark:text-gray-400">
                      {user?.email || 'demo@grimpe.com'}
                    </p>
                  </div>
                </div>
                
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  <MobileNavLink 
                    href="/dashboard" 
                    icon={<FaRocket />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </MobileNavLink>
                  <MobileNavLink 
                    href="/log-workout" 
                    icon={<FaBolt />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Enregistrer
                  </MobileNavLink>
                  <MobileNavLink 
                    href="/progress" 
                    icon={<FaMountain />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Progrès
                  </MobileNavLink>
                  <MobileNavLink 
                    href="/settings" 
                    icon={<FaCog />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Paramètres
                  </MobileNavLink>
                  <MobileNavLink 
                    href="/about" 
                    icon={<FaUser />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    À propos
                  </MobileNavLink>
                </div>
                
                {/* Dark Mode Toggle in Mobile */}
                <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-600/50">
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 dark:from-gray-700 dark:to-gray-600 hover:from-orange-400 hover:to-orange-500 dark:hover:from-orange-500 dark:hover:to-orange-400 text-white transition-all duration-300 shadow-md"
                  >
                    {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
                    <span className="font-medium">
                      {darkMode ? 'Mode clair' : 'Mode sombre'}
                    </span>
                  </button>
                </div>
                
                {/* Logout Button in Mobile */}
                <div className="mt-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl bg-red-500/20 dark:bg-red-500/30 text-red-200 dark:text-red-300 hover:bg-red-500/30 dark:hover:bg-red-500/40 transition-colors"
                  >
                    <FaSignOutAlt className="h-5 w-5" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
      
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Compact Footer */}
      <footer className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border-t border-orange-400/30 dark:border-gray-600/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-2">
              <FaMountain className="h-4 w-4 text-white dark:text-orange-300" />
              <span className="text-sm font-bold text-white dark:text-gray-100">GRIMPE</span>
              <FaBolt className="h-3 w-3 text-yellow-300 dark:text-yellow-400" />
            </div>
            <p className="text-orange-100 dark:text-gray-300 text-xs">
              © {new Date().getFullYear()} • Conçu pour inspirer la grandeur
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Desktop Navigation Link Component
const NavLink = ({ href, children, icon }) => (
  <a 
    href={href} 
    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 font-semibold group"
  >
    <span className="text-yellow-300 dark:text-orange-400 group-hover:text-yellow-200 dark:group-hover:text-orange-300">{icon}</span>
    <span>{children}</span>
  </a>
);

// Mobile Navigation Link Component
const MobileNavLink = ({ href, children, icon, onClick }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="flex items-center space-x-4 px-4 py-4 text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-gray-700/30 rounded-xl transition-all duration-300 font-semibold group"
  >
    <span className="text-yellow-300 dark:text-orange-400 group-hover:text-yellow-200 dark:group-hover:text-orange-300 text-lg">{icon}</span>
    <span>{children}</span>
  </a>
);

// Auth layout for authentication pages (login/register)
function AuthLayout({ children, darkMode, toggleDarkMode }) {
  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark">
      {/* Dark mode toggle for auth pages */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={toggleDarkMode}
          className="relative p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white focus:outline-none shadow-md transform hover:scale-110 transition-all duration-300 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          aria-label="Basculer le mode sombre"
        >
          {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
        </button>
      </div>
      {children}
    </div>
  );
}

// Toast component
export function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);
  
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg flex justify-between items-center transform transition-all duration-500 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 
            toast.type === 'error' ? 'bg-red-600 text-white' : 
            toast.type === 'info' ? 'bg-blue-600 text-white' : 
            'bg-gray-700 text-white'
          }`}
        >
          <div>
            {toast.title && <p className="font-semibold">{toast.title}</p>}
            <p>{toast.message}</p>
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-white hover:text-gray-200"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    // Clean up any demo data on app start
    cleanupDemoData();
    
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addToast = (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove toast after duration
    if (toast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Provide both contexts
  return (
    <Router>
      <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
          <AuthProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={
                <AuthLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Login />
                </AuthLayout>
              } />
              <Route path="/register" element={
                <AuthLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                  <Register />
                </AuthLayout>
              } />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/log-workout" element={
                <ProtectedRoute>
                  <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <LogWorkout />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Progress />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/about" element={
                <ProtectedRoute>
                  <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <About />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* Redirect root to login or dashboard */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <ToastContainer />
          </AuthProvider>
        </ToastContext.Provider>
      </ThemeContext.Provider>
    </Router>
  );
}

// Hook for using toast context
export const useToast = () => useContext(ToastContext);

export default App;
