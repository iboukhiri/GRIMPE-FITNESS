const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for making API requests
async function apiRequest(endpoint, method = 'GET', data = null, withAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if needed
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
    credentials: 'include',
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`Making API request to: ${API_URL}${endpoint}`, { method, data });
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    console.log(`API Response: ${response.status} ${response.statusText}`, { endpoint });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`API Success Response:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check if the backend is running.');
    }
    
    throw error;
  }
}

// Auth API
export const authApi = {
  register: (userData) => apiRequest('/auth/register', 'POST', userData, false),
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials, false),
  logout: () => apiRequest('/auth/logout', 'POST'),
  verify: () => apiRequest('/auth/verify', 'GET'),
  updateProfile: (profileData) => apiRequest('/auth/profile', 'PUT', profileData),
  updatePreferences: (preferencesData) => apiRequest('/auth/preferences', 'PUT', preferencesData),
};

// Workout API
export const workoutApi = {
  getWorkouts: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    return apiRequest(`/workouts${queryString ? `?${queryString}` : ''}`);
  },
  getWorkoutById: (id) => apiRequest(`/workouts/${id}`),
  createWorkout: (workoutData) => apiRequest('/workouts', 'POST', workoutData),
  updateWorkout: (id, workoutData) => apiRequest(`/workouts/${id}`, 'PUT', workoutData),
  deleteWorkout: (id) => apiRequest(`/workouts/${id}`, 'DELETE'),
  getStats: (period) => apiRequest(`/workouts/stats${period ? `?period=${period}` : ''}`),
  getStatsOverview: () => apiRequest('/workouts/stats/overview'),
  getStatsTrends: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiRequest(`/workouts/stats/trends${queryString ? `?${queryString}` : ''}`);
  },
  getStatsTypes: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiRequest(`/workouts/stats/types${queryString ? `?${queryString}` : ''}`);
  },
  getStatsPerformance: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiRequest(`/workouts/stats/performance${queryString ? `?${queryString}` : ''}`);
  },
  getStatsRecords: () => apiRequest('/workouts/stats/records'),
  getStatsGoals: () => apiRequest('/workouts/stats/goals'),
  
  // Goals management
  getUserGoals: () => apiRequest('/users/goals'),
  updateGoal: (goalId, goalData) => apiRequest(`/users/goals/${goalId}`, 'PUT', goalData),
  createGoal: (goalData) => apiRequest('/users/goals', 'POST', goalData),
  deleteGoal: (goalId) => apiRequest(`/users/goals/${goalId}`, 'DELETE'),
  
  // Body metrics
  getBodyMetrics: () => apiRequest('/users/body-metrics'),
  addBodyMetric: (metricData) => apiRequest('/users/body-metrics', 'POST', metricData),
  updateBodyMetric: (metricId, metricData) => apiRequest(`/users/body-metrics/${metricId}`, 'PUT', metricData),
  deleteBodyMetric: (metricId) => apiRequest(`/users/body-metrics/${metricId}`, 'DELETE'),
};

export default {
  auth: authApi,
  workouts: workoutApi,
}; 