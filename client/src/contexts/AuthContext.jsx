import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../services/api';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verify user authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await authApi.verify();
        
        if (response.success && response.isAuthenticated) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Authentication verification error:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, message: 'Login successful!' };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, message: 'Registration successful!' };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true, message: 'You have been logged out.' };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authApi.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, message: 'Profile updated successfully!' };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Profile update failed.'
      };
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await authApi.updatePreferences({ preferences });
      
      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        throw new Error(response.message || 'Preferences update failed');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 