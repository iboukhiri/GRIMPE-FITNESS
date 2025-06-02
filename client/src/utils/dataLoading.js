/**
 * Helper functions for data loading in the Progress component
 * Centralizes data fetching logic and error handling
 */
import { createDemoData } from './demoData';
import { workoutApi } from '../services/api';

// Helper function to format duration intelligently
const formatDuration = (durationInMinutes) => {
  if (!durationInMinutes || durationInMinutes === 0) return '0 min';
  
  if (durationInMinutes < 60) {
    return `${Math.round(durationInMinutes)} min`;
  } else {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.round(durationInMinutes % 60);
    if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }
};

/**
 * Determines if an account appears to be new or has insufficient data
 * @param {Object} data The API response data
 * @returns {boolean} True if this seems like a new account
 */
export const isNewAccount = (data) => {
  const { timeStats, typeStats, overview } = data;
  
  // Check if data is completely missing (API error case)
  if (!timeStats && !typeStats && !overview) return true;
  
  // If we have an overview but no workouts, it's a new account
  if (overview && overview.totalWorkouts === 0) return true;
  
  // If we have stats arrays but they're empty, it's a new account
  if (Array.isArray(timeStats) && Array.isArray(typeStats) && 
      timeStats.length === 0 && typeStats.length === 0) return true;
  
  // Otherwise, not a new account
  return false;
};

/**
 * Loads all the required data for the Progress page with proper error handling
 * @param {Object} options Loading options and state setters
 * @returns {Promise} Promise that resolves when data is loaded
 */
export const loadProgressData = async ({
  activeTab,
  filterPeriod,
  setStatsByTime,
  setStatsByType,
  setYearlyProgress,
  setBodyComposition,
  setPersonalRecords,
  setFitnessGoals,
  setOverview,
  setLoading,
  setError,
  setUsingDemoData
}) => {
  setLoading(true);
  setError(null);
  
  try {
    // Demo data should only be shown to new accounts or as fallback for API errors
    // Check if the user has explicitly requested demo data for testing
    const explicitDemoMode = localStorage.getItem('forceDemoData') === 'true';
    
    if (explicitDemoMode) {
      // Use demo data when explicitly requested (for testing)
      console.log('Using demo data because forceDemoData is set');
      loadDemoData({
        setStatsByTime,
        setStatsByType,
        setYearlyProgress,
        setBodyComposition,
        setPersonalRecords, 
        setFitnessGoals,
        setOverview,
        setUsingDemoData
      });
      return;
    }
    
    // Reset demo data flag when a real user is active
    if (localStorage.getItem('token')) {
      localStorage.removeItem('useDemoData');
    }
    
    // Determine API period parameter based on filterPeriod
    let apiPeriod = 'month';
    if (filterPeriod === '3months') apiPeriod = '3months';
    if (filterPeriod === '6months') apiPeriod = '6months';
    if (filterPeriod === '1year') apiPeriod = 'year';
    if (filterPeriod === 'all') apiPeriod = 'all';
    
    // Load data based on the active tab with sequential API calls
    try {
      // First load essential data for all tabs
      console.log('Loading essential data...');
      
      // 1. Get trends data first
      const trendsData = await workoutApi.getStatsTrends({ period: apiPeriod }).catch(e => {
        console.error('Failed to fetch trends data:', e);
        return [];
      });
      
      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 2. Get workout type distribution
      const typesData = await workoutApi.getStatsTypes({ period: apiPeriod }).catch(e => {
        console.error('Failed to fetch workout types data:', e);
        return [];
      });
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 3. Get overall statistics
      const overviewData = await workoutApi.getStatsOverview().catch(e => {
        console.error('Failed to fetch overview stats:', e);
        return { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, streak: 0 };
      });
      
      // Check if this appears to be a new account
      const data = { timeStats: trendsData, typeStats: typesData, overview: overviewData };
      
      if (isNewAccount(data)) {
        console.log('New account detected - using demo data for better UX');
        loadDemoData({
          setStatsByTime,
          setStatsByType,
          setYearlyProgress,
          setBodyComposition,
          setPersonalRecords, 
          setFitnessGoals,
          setOverview,
          setUsingDemoData
        });
        return;
      }
      
      // Otherwise use real data
      console.log('Using real data from API');
      setUsingDemoData(false);
      
      // Set the data we already loaded
      setStatsByTime(trendsData);
      setStatsByType(typesData);
      setOverview(overviewData);
      
      // Now load tab-specific data
      if (activeTab === 'yearly' || activeTab === 'overview') {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get yearly data for charts
        const yearlyData = await workoutApi.getStatsTrends({ period: 'year' }).catch(e => {
          console.error('Failed to fetch yearly data:', e);
          return [];
        });
        
        setYearlyProgress(yearlyData);
      }
      
      if (activeTab === 'records' || activeTab === 'overview') {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get personal records
        const recordsData = await workoutApi.getStatsRecords().catch(e => {
          console.error('Failed to fetch records data:', e);
          return {};
        });
        
        // Process records data
        const processedRecords = processRecordsData(recordsData);
        setPersonalRecords(processedRecords);
      }
      
      if (activeTab === 'goals' || activeTab === 'overview') {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get fitness goals
        const goalsData = await workoutApi.getStatsGoals().catch(e => {
          console.error('Failed to fetch goals data:', e);
          return { goals: [] };
        });
        
        // Process goals data
        const processedGoals = processGoalsData(goalsData);
        setFitnessGoals(processedGoals);
      }
      
      // Body composition data (always demo since there's no API endpoint yet)
      setBodyComposition(createDemoData().bodyComp);
      
      // Remember data type for session
      localStorage.setItem('useDemoData', 'false');
    } catch (error) {
      console.error('Error loading real data, falling back to demo:', error);
      throw error; // Let the outer catch handle fallback
    }
  } catch (error) {
    console.error('Error in loadProgressData:', error);
    setError('Unable to load progress data. Please try again later.');
    
    // Fall back to demo data
    loadDemoData({
      setStatsByTime,
      setStatsByType,
      setYearlyProgress,
      setBodyComposition,
      setPersonalRecords, 
      setFitnessGoals,
      setOverview,
      setUsingDemoData
    });
  } finally {
    setLoading(false);
  }
};

/**
 * Loads demo data for all charts and stats
 */
export const loadDemoData = ({
  setStatsByTime,
  setStatsByType,
  setYearlyProgress,
  setBodyComposition,
  setPersonalRecords,
  setFitnessGoals,
  setOverview,
  setUsingDemoData
}) => {
  console.log('Loading demo data...');
  setUsingDemoData(true);
  
  // Generate consistent demo data
  const demoData = createDemoData();
  
  // Set all state variables with demo data
  setStatsByTime(demoData.timeStats);
  setStatsByType(demoData.typeStats);
  setYearlyProgress(demoData.yearlyProgress);
  setBodyComposition(demoData.bodyComp);
  setPersonalRecords(demoData.records);
  setFitnessGoals(demoData.goals);
  setOverview(demoData.overview);
  
  // Save the demo status for session consistency
  localStorage.setItem('useDemoData', 'true');
};

/**
 * Process records data from the API
 */
export const processRecordsData = (data) => {
  if (!data) return createDemoData().records;
  
  const records = [];
  
  // Process max duration workout
  if (data.maxDuration) {
    records.push({
      exercise: 'Durée d\'entraînement',
      value: formatDuration(data.maxDuration.duration || 0),
      previous: formatDuration(Math.round((data.maxDuration.duration || 0) * 0.85)),
      date: data.maxDuration.date
    });
  }
  
  // Process max calories workout
  if (data.maxCalories) {
    records.push({
      exercise: 'Calories brûlées',
      value: data.maxCalories.calories,
      previous: Math.round(data.maxCalories.calories * 0.9),
      unit: 'cal',
      date: data.maxCalories.date
    });
  }
  
  // Process max reps exercise
  if (data.maxReps) {
    records.push({
      exercise: data.maxReps.name || 'Répétitions maximales',
      value: data.maxReps.reps,
      previous: Math.round(data.maxReps.reps * 0.8),
      unit: 'reps',
      date: data.maxReps.date
    });
  }
  
  // Process max sets exercise
  if (data.maxSets) {
    records.push({
      exercise: data.maxSets.name || 'Séries maximales',
      value: data.maxSets.sets,
      previous: Math.round(data.maxSets.sets * 0.8),
      unit: 'sets',
      date: data.maxSets.date
    });
  }
  
  return records.length > 0 ? records : createDemoData().records;
};

/**
 * Process goals data from the API
 */
export const processGoalsData = (data) => {
  if (!data || !data.goals || !Array.isArray(data.goals) || data.goals.length === 0) {
    return createDemoData().goals;
  }
  
  // Transform the goals format to match our component needs
  return data.goals.map(goal => ({
    id: goal.id,
    name: goal.title || goal.name,
    current: goal.current,
    target: goal.target,
    unit: goal.unit
  }));
};

export default {
  loadProgressData,
  loadDemoData,
  isNewAccount,
  processRecordsData,
  processGoalsData
};
