/**
 * Clear all application data from localStorage
 */
export const clearAllAppData = () => {
  try {
    // Remove authentication related data
    localStorage.removeItem('token');
    localStorage.removeItem('authDemoMode');
    localStorage.removeItem('useDemoData');
    
    // Remove user preferences
    localStorage.removeItem('darkMode');
    localStorage.removeItem('userPreferences');
    
    // Remove any cached data
    localStorage.removeItem('workoutCache');
    localStorage.removeItem('progressCache');
    
    // Clear session storage as well
    sessionStorage.clear();
    
    console.log('✅ All app data cleared from local storage');
    return true;
  } catch (error) {
    console.error('❌ Error clearing app data:', error);
    return false;
  }
};

/**
 * Reset app to initial state
 */
export const resetApp = () => {
  clearAllAppData();
  
  // Reload the page to restart the app
  window.location.reload();
}; 