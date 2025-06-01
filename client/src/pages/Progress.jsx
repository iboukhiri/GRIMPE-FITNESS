import React, { useState, useEffect, useContext } from 'react';
import { 
  FaChartLine, 
  FaTrophy, 
  FaFire, 
  FaHeartbeat, 
  FaRunning, 
  FaDumbbell, 
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { ThemeContext } from '../App';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressTracker from '../components/ProgressTracker';
import Badge from '../components/Badge';
import StatsSummary from '../components/StatsSummary';
import { workoutApi } from '../services/api';
import Skeleton from '../components/Skeleton';

// Enhanced Modern Pie Chart Component for Progress page
const ModernPieChart = ({ data, hiddenItems, onToggleItem, darkMode }) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const visibleData = data.filter((_, i) => !hiddenItems.includes(i));
  const total = visibleData.reduce((sum, item) => sum + item.value || item.count, 0);

  // Enhanced tooltip content
  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className={`px-4 py-3 rounded-lg border shadow-lg transform transition-all duration-200 ${
          darkMode 
            ? 'bg-slate-800/95 border-slate-600 text-white' 
            : 'bg-white/95 border-gray-300 text-gray-900'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-sm">
              {data.displayName || data.name}
            </p>
          </div>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between gap-4">
              <span className={darkMode ? 'text-slate-300' : 'text-gray-600'}>Séances:</span>
              <span className="font-medium">{data.value}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className={darkMode ? 'text-slate-300' : 'text-gray-600'}>Pourcentage:</span>
              <span className="font-medium">{percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced label rendering
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (percent < 0.05) return null; // Don't show labels for segments less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={darkMode ? '#f8fafc' : '#1e293b'}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Pie Chart Container with better sizing */}
      <div className="relative flex-1 min-h-0 px-2 py-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={visibleData.map((type, index) => ({
                ...type,
                value: type.value || type.count,
                displayName: type.displayName || type.name,
                originalIndex: data.findIndex(d => d._id === type._id || d.name === type.name)
              }))}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={70}
              innerRadius={25}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {visibleData.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                
                return (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={darkMode ? "#1e293b" : "#ffffff"}
                    strokeWidth={isHovered ? 3 : 2}
                    style={{
                      filter: isHovered 
                        ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3)) brightness(1.1)' 
                        : 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transformOrigin: 'center'
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>

        {/* Smaller center statistics */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-center p-2 rounded-full border ${
            darkMode 
              ? 'border-slate-500 bg-slate-800/80' 
              : 'border-gray-400 bg-white/80'
          } shadow-md backdrop-blur-sm`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {total}
            </div>
            <div className={`text-[10px] font-medium uppercase tracking-wide ${
              darkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Total
            </div>
          </div>
        </div>
      </div>
      
      {/* Simplified compact legend */}
      <div className="mt-2 px-2">
        <h4 className={`text-sm font-semibold mb-3 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Types d'Entraînement
        </h4>
        <div className="max-h-28 overflow-y-auto space-y-1">
          {data.map((type, i) => {
            const isHidden = hiddenItems.includes(i);
            const value = type.value || type.count;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            return (
              <div
                key={type._id || type.name}
                className={`flex items-center justify-between p-2 rounded-md transition-all duration-200 ${
                  isHidden 
                    ? `opacity-40 ${darkMode ? 'bg-slate-700/20' : 'bg-gray-100/50'}` 
                    : `opacity-100 ${darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'}`
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => onToggleItem(i)}
                    className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
                    type="button"
                  >
                    <div className="relative">
                      <div 
                        className={`w-3 h-3 rounded-full ${isHidden ? 'opacity-50' : 'opacity-100'}`}
                        style={{ backgroundColor: type.color }}
                      />
                      {isHidden && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaEyeSlash className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    {isHidden ? (
                      <FaEyeSlash className={`w-3 h-3 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                    ) : (
                      <FaEye className={`w-3 h-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isHidden 
                          ? darkMode ? 'text-slate-500' : 'text-gray-400'
                          : darkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        {type.displayName || type.name}
                      </span>
                      <span className={`text-sm font-semibold ${
                        isHidden 
                          ? darkMode ? 'text-slate-500' : 'text-gray-400'
                          : darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {isHidden ? '—' : `${percentage}%`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        isHidden 
                          ? darkMode ? 'text-slate-600' : 'text-gray-400'
                          : darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {value} séances
                      </span>
                      {!isHidden && (
                        <div className={`h-1 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-gray-200'} flex-1 mx-2 max-w-16`}>
                          <div 
                            className="h-1 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: type.color,
                              maxWidth: '100%'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function Progress() {
  const { darkMode } = useContext(ThemeContext);
  const [filter, setFilter] = useState('1week');
  const [activeTab, setActiveTab] = useState('overview');

  // Dynamic state for stats and charts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [trendsData, setTrendsData] = useState([]); // for line charts
  const [typesData, setTypesData] = useState([]); // for pie charts
  const [yearlyData, setYearlyData] = useState([]); // for yearly progress
  const [recordsData, setRecordsData] = useState(null); // for records tab
  const [goalsData, setGoalsData] = useState([]); // for goals tab
  const [hiddenPie, setHiddenPie] = useState([]); // for pie chart legend hiding
  const [periodChanges, setPeriodChanges] = useState({ 
    workouts: 0, 
    workoutsPerWeek: 0, 
    duration: 0, 
    calories: 0,
    contexts: {
      workouts: '',
      workoutsPerWeek: '',
      duration: '',
      calories: ''
    }
  });

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      setError(null);

      // Helper function to calculate previous period's date range
      const calculatePreviousPeriodDateRange = (currentFilter) => {
        const now = new Date();
        let startDate = new Date(now);
        let endDate = new Date(now); // End date of the previous period is start date of current period (exclusive)

        // Set end of current period to today, start of current period based on filter
        // Then calculate previous period relative to that
        
        let currentPeriodStartDate = new Date(now);

        switch (currentFilter) {
          case '1week':
            currentPeriodStartDate.setDate(now.getDate() - 7);
            endDate = new Date(currentPeriodStartDate); // End of prev period is start of current
            startDate = new Date(currentPeriodStartDate);
            startDate.setDate(currentPeriodStartDate.getDate() - 7);
            break;
          case '1month':
            currentPeriodStartDate.setMonth(now.getMonth() - 1);
            endDate = new Date(currentPeriodStartDate);
            startDate = new Date(currentPeriodStartDate);
            startDate.setMonth(currentPeriodStartDate.getMonth() - 1);
            break;
          case '3months':
            currentPeriodStartDate.setMonth(now.getMonth() - 3);
            endDate = new Date(currentPeriodStartDate);
            startDate = new Date(currentPeriodStartDate);
            startDate.setMonth(currentPeriodStartDate.getMonth() - 3);
            break;
          case '6months':
            currentPeriodStartDate.setMonth(now.getMonth() - 6);
            endDate = new Date(currentPeriodStartDate);
            startDate = new Date(currentPeriodStartDate);
            startDate.setMonth(currentPeriodStartDate.getMonth() - 6);
            break;
          case '1year':
            currentPeriodStartDate.setFullYear(now.getFullYear() - 1);
            endDate = new Date(currentPeriodStartDate);
            startDate = new Date(currentPeriodStartDate);
            startDate.setFullYear(currentPeriodStartDate.getFullYear() - 1);
            break;
          default: // Default to 1 week if filter is unknown or 'all' (comparison for 'all' might not be meaningful)
            currentPeriodStartDate.setDate(now.getDate() - 7);
            endDate = new Date(currentPeriodStartDate);
            startDate = new Date(currentPeriodStartDate);
            startDate.setDate(currentPeriodStartDate.getDate() - 7);
            break;
        }
        
        // We want just the date part, in YYYY-MM-DD format for the API
        const formatDate = (date) => date.toISOString().split('T')[0];

        return {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate), // End date of previous period (exclusive for current)
        };
      };

      const previousPeriod = calculatePreviousPeriodDateRange(filter);

      try {
        // Fetch data based on current filter
        const [overview, trends, types, yearly, records, goals, previousTrends] = await Promise.all([
          workoutApi.getStatsOverview(),
          workoutApi.getStatsTrends({ period: filter }),
          workoutApi.getStatsTypes({ period: filter }),
          workoutApi.getStatsTrends({ period: 'year' }),
          workoutApi.getStatsRecords().catch(() => null), // Records might not exist
          workoutApi.getStatsGoals().catch(() => ({ goals: [] })), // Goals might not exist
          // Get previous period data for comparison
          workoutApi.getStatsTrends({ 
            period: filter,
            startDate: previousPeriod.startDate,
            endDate: previousPeriod.endDate
          }).catch(() => [])
        ]);
        
        // Calculate percentage changes
        const calculatePercentageChange = (current, previous) => {
          if (!previous || previous === 0) {
            return current > 0 ? 100 : 0; // 100% increase if went from 0 to something, 0% if still 0
          }
          return Math.round(((current - previous) / previous) * 100);
        };
        
        // Calculate current period totals
        const currentTotals = (trends || []).reduce((acc, item) => ({
          workouts: acc.workouts + (item.count || 0),
          duration: acc.duration + (item.totalDuration || 0),
          calories: acc.calories + (item.totalCalories || 0),
        }), { workouts: 0, duration: 0, calories: 0 });
        
        // Calculate previous period totals
        const previousTotals = (previousTrends || []).reduce((acc, item) => ({
          workouts: acc.workouts + (item.count || 0),
          duration: acc.duration + (item.totalDuration || 0),
          calories: acc.calories + (item.totalCalories || 0),
        }), { workouts: 0, duration: 0, calories: 0 });
        
        // Calculate percentage changes
        const workoutChange = calculatePercentageChange(currentTotals.workouts, previousTotals.workouts);
        const durationChange = calculatePercentageChange(currentTotals.duration, previousTotals.duration);
        const caloriesChange = calculatePercentageChange(currentTotals.calories, previousTotals.calories);
        
        // Calculate average per week change
        const periodDays = {
          '1week': 7,
          '1month': 30,
          '3months': 90,
          '6months': 180,
          '1year': 365,
          'all': 365
        };
        const days = periodDays[filter] || 7; // default to week
        const weeks = days / 7;
        
        const currentWorkoutsPerWeek = currentTotals.workouts / weeks;
        const previousWorkoutsPerWeek = previousTotals.workouts / weeks;
        const workoutsPerWeekChange = calculatePercentageChange(currentWorkoutsPerWeek, previousWorkoutsPerWeek);
        
        setOverview(overview);
        setTrendsData(trends || []);
        setTypesData(types || []);
        setYearlyData(yearly || []);
        setRecordsData(records);
        setGoalsData(goals?.goals || []);
        
        // Store percentage changes for StatsSummary
        setPeriodChanges({
          workouts: workoutChange,
          workoutsPerWeek: workoutsPerWeekChange,
          duration: durationChange,
          calories: caloriesChange,
          contexts: {
            workouts: currentTotals.workouts > 0 || previousTotals.workouts > 0 ? `vs. période précédente` : 'Première période',
            workoutsPerWeek: currentTotals.workouts > 0 || previousTotals.workouts > 0 ? `vs. période précédente` : 'Première période',
            duration: currentTotals.duration > 0 || previousTotals.duration > 0 ? `vs. période précédente` : 'Première période',
            calories: currentTotals.calories > 0 || previousTotals.calories > 0 ? `vs. période précédente` : 'Première période'
          }
        });
        
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
        
        // Set default empty data
        setOverview({ totalWorkouts: 0, totalDuration: 0, totalCalories: 0, streak: 0 });
        setTrendsData([]);
        setTypesData([]);
        setYearlyData([]);
        setRecordsData(null);
        setGoalsData([]);
        setPeriodChanges({ workouts: 0, workoutsPerWeek: 0, duration: 0, calories: 0, contexts: { workouts: '', workoutsPerWeek: '', duration: '', calories: '' } });
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [filter]);

  // Calculate current period stats
  const calculatePeriodStats = () => {
    if (!trendsData || trendsData.length === 0) {
      return { totalWorkouts: 0, totalDuration: 0, totalCalories: 0, workoutsPerWeek: 0 };
    }
    
    const totalWorkouts = trendsData.reduce((sum, item) => sum + (item.count || 0), 0);
    const totalDuration = trendsData.reduce((sum, item) => sum + (item.totalDuration || 0), 0);
    const totalCalories = trendsData.reduce((sum, item) => sum + (item.totalCalories || 0), 0);
    
    // Calculate average per week (rough estimate)
    const periodDays = {
      '1week': 7,
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365,
      'all': 365
    };
    const days = periodDays[filter] || 7; // default to week
    const weeks = days / 7;
    const workoutsPerWeek = totalWorkouts / weeks;
    
    return { totalWorkouts, totalDuration, totalCalories, workoutsPerWeek };
  };
  
  const periodStats = calculatePeriodStats();

  // Helper function to get color for workout types
  const getTypeColor = (type) => {
    const colorMap = {
      // Main workout types with distinct vibrant colors
      'entrainement': '#FF6B35', // Bright orange for general training
      'musculation': '#E63946', // Bright red for strength training
      'cardio': '#10B981', // Green for cardiovascular
      'yoga': '#9333EA', // Purple for yoga/flexibility
      'course': '#F59E0B', // Amber for running
      'autre': '#6B7280', // Gray for other activities
      // Legacy support for old types
      'bloc': '#FF6B35',
      'voie': '#E63946', 
      'Climbing': '#4F46E5',
      'Escalade': '#4F46E5', 
      'Strength': '#E63946',
      'Musculation': '#E63946',
      'Cardio': '#10B981',
      'Other': '#6B7280',
      'Autre': '#6B7280',
    };
    return colorMap[type] || '#6B7280';
  };

  // Helper function to get display name for workout types
  const getTypeDisplayName = (type) => {
    const nameMap = {
      // Main workout types with clear French names
      'entrainement': 'Entraînement Général',
      'musculation': 'Musculation',
      'cardio': 'Cardio',
      'yoga': 'Yoga & Flexibilité',
      'course': 'Course à Pied',
      'autre': 'Autres Activités',
      // Legacy support for old types
      'bloc': 'Escalade en Bloc',
      'voie': 'Escalade en Voie', 
      'Climbing': 'Escalade',
      'Escalade': 'Escalade', 
      'Strength': 'Musculation',
      'Musculation': 'Musculation',
      'Cardio': 'Cardio',
      'Other': 'Autres',
      'Autre': 'Autres',
    };
    return nameMap[type] || type;
  };

  // Format tooltip for charts
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip specifically for pie charts
  const pieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const totalWorkouts = typesData.reduce((sum, t) => sum + t.count, 0);
      return (
        <div className={`p-3 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.displayName || getTypeDisplayName(data.name)}
          </p>
          <p className="text-sm" style={{ color: data.color }}>
            {data.value} entraînements ({totalWorkouts > 0 ? ((data.value / totalWorkouts) * 100).toFixed(1) : 0}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 transition-colors ${
            darkMode 
              ? 'text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text' 
              : 'text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text'
          }`}>
            Suivez Votre Évolution
          </h1>
          <p className={`text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto transition-colors ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Le progrès ne concerne pas seulement les chiffres – il s'agit de devenir la meilleure version de vous-même. Chaque pas en avant compte.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm font-bold uppercase tracking-widest">
            <span className={darkMode ? 'text-orange-400' : 'text-orange-600'}>📈 DEVENEZ PLUS FORT</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-red-400' : 'text-red-600'}>⚡ REPOUSSEZ LES LIMITES</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-green-400' : 'text-green-600'}>🎯 ATTEIGNEZ VOS OBJECTIFS</span>
          </div>
        </div>
        
        {/* Period filter and Tabs */}
        <div className="mb-8 animate-fade-in-up animation-delay-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Period Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: '1week', label: '7 jours' },
                { key: '1month', label: '30 jours' },
                { key: '3months', label: '3 mois' },
                { key: '6months', label: '6 mois' },
                { key: '1year', label: '1 an' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => setFilter(period.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === period.key
                      ? darkMode
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                      : darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        : 'bg-white text-slate-700 hover:bg-orange-50 border border-orange-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            {/* Tabs */}
            <div className={`flex rounded-lg p-1 ${
              darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-orange-200'
            }`}>
              {[
                { key: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                { key: 'trends', label: 'Tendances', icon: '📈' },
                { key: 'records', label: 'Records', icon: '🏆' },
                { key: 'goals', label: 'Objectifs', icon: '🎯' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? darkMode
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                      : darkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-orange-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Motivational Banner */}
        {!loading && !error && trendsData && trendsData.length > 0 && activeTab === 'overview' && (
          <div className={`mb-8 p-6 rounded-xl text-white text-center animate-fade-in-scale ${
            darkMode 
              ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border border-slate-600' 
              : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shadow-lg'
          }`}>
            <p className="font-bold text-lg tracking-wide">
              "Les fondements de tout bonheur sont une bonne santé." – Leigh Hunt
            </p>
            <p className={`text-sm mt-2 font-medium ${
              darkMode ? 'text-slate-300' : 'text-orange-100'
            }`}>
              Continuez à construire vos fondations de force
            </p>
          </div>
        )}
        
        {/* Empty state motivational message */}
        {!loading && !error && (!trendsData || trendsData.length === 0) && activeTab === 'overview' && (
          <div className="mb-8 p-8 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10 border-2 border-primary-300 dark:border-primary-700 rounded-motivational backdrop-blur-sm animate-bounce-motivational">
            <div className="text-center">
              <div className="mb-4">
                <span className="text-6xl">📊</span>
              </div>
              <h3 className="heading-section mb-4">Votre Histoire de Progrès Commence Maintenant !</h3>
              <p className="text-motivational-subtitle mb-6">
                Chaque légende du fitness a commencé par un seul entraînement. Enregistrez vos séances et regardez vos progrès se révéler en graphiques et analyses magnifiques.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-bold uppercase tracking-wide">
                <span className={`px-4 py-2 text-white rounded-full ${
                  darkMode ? 'bg-slate-600 border border-orange-400/50' : 'bg-gradient-to-r from-orange-500 to-red-500 shadow-md'
                }`}>Commencez Fort</span>
                <span className={`px-4 py-2 text-white rounded-full ${
                  darkMode ? 'bg-slate-600 border border-red-400/50' : 'bg-gradient-to-r from-red-500 to-pink-500 shadow-md'
                }`}>Restez Concentré</span>
                <span className={`px-4 py-2 text-white rounded-full ${
                  darkMode ? 'bg-slate-600 border border-green-400/50' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}>Suivez Tout</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats summary */}
        <div className="mb-8 animate-fade-in-up animation-delay-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Period Stats */}
            <div className="card-motivational animate-fade-in-scale">
              {loading ? (
                <Skeleton variant="rect" height="200px" />
              ) : error ? (
                <div className="text-red-500 p-4 text-center">
                  <p className="font-semibold">⚠️ Impossible de charger les statistiques</p>
                  <p className="text-sm">{error}</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="heading-section">Analyse de Période</h3>
                      <p className="text-motivational-subtitle">
                        {filter === '1month' ? 'Aperçu du dernier mois' : 
                         filter === '3months' ? 'Performance trimestrielle' : 
                         filter === '6months' ? 'Vue d\'ensemble semestrielle' :
                         filter === '1year' ? 'Réalisations annuelles' : 'Parcours complet'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      darkMode ? 'bg-slate-600 border border-orange-400/50' : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>
                      <span className="text-2xl">⚡</span>
                    </div>
                  </div>
                  <StatsSummary
                    title=""
                    subtitle=""
                    stats={[
                      { 
                        label: "Total Entraînements", 
                        value: periodStats.totalWorkouts, 
                        type: 'workout',
                        change: periodChanges.workouts,
                        subtitle: periodChanges.contexts?.workouts || ''
                      },
                      { 
                        label: "Moyenne Hebdomadaire", 
                        value: periodStats.workoutsPerWeek.toFixed(1), 
                        type: 'cardio',
                        change: periodChanges.workoutsPerWeek,
                        subtitle: periodChanges.contexts?.workoutsPerWeek || 'Entraînements par semaine'
                      },
                      { 
                        label: "Durée Totale", 
                        value: periodStats.totalDuration, 
                        type: 'time',
                        unit: 'min',
                        change: periodChanges.duration,
                        subtitle: periodChanges.contexts?.duration || ''
                      },
                      { 
                        label: "Calories Brûlées", 
                        value: periodStats.totalCalories, 
                        type: 'calories',
                        unit: 'cal',
                        change: periodChanges.calories,
                        subtitle: periodChanges.contexts?.calories || ''
                      }
                    ]}
                  />
                </div>
              )}
            </div>
            
            {/* Enhanced Type Distribution */}
            <div className="card-motivational animate-fade-in-scale">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="heading-section">Mix d'Entraînement</h3>
                  <p className="text-motivational-subtitle">La variété nourrit la croissance</p>
                </div>
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-slate-600 border border-red-400/50' : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`}>
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="space-y-4 text-center">
                      <div className={`w-32 h-32 rounded-full border-4 border-dashed animate-spin ${
                        darkMode ? 'border-slate-600' : 'border-gray-300'
                      }`}></div>
                      <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                        Chargement des données...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 p-4">{error}</div>
                ) : typesData.length === 0 ? (
                  <div className={`text-center flex flex-col items-center justify-center h-full space-y-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="text-6xl">📊</div>
                    <div>
                      <p className="text-lg font-medium">Aucune donnée disponible</p>
                      <p className="text-sm">Commencez à enregistrer vos entraînements pour voir la répartition</p>
                    </div>
                  </div>
                ) : (
                  <ModernPieChart 
                    data={typesData.map(type => ({
                      ...type,
                      name: type._id,
                      value: type.count,
                      displayName: getTypeDisplayName(type._id),
                      color: getTypeColor(type._id),
                    }))}
                    hiddenItems={hiddenPie}
                    onToggleItem={(index) => setHiddenPie(prev => 
                      prev.includes(index) ? prev.filter(x => x !== index) : [...prev, index]
                    )}
                    darkMode={darkMode}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Workout Trends */}
            <Card>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tendances d'entraînement</h3>
              <div className="h-80">
                {loading ? (
                  <Skeleton variant="rect" height="100%" width="100%" />
                ) : error ? (
                  <div className="text-red-500 p-4">{error}</div>
                ) : trendsData.length === 0 ? (
                  <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-center h-full`}>
                    <div>
                      <p>Aucune tendance à afficher</p>
                      <p className="text-sm">Enregistrez plus d'entraînements pour voir les tendances</p>
                    </div>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData.map(item => ({
                      name: new Date(item._id).toLocaleDateString('fr-FR', { 
                        month: 'short', 
                        day: 'numeric' 
                      }),
                      count: item.count,
                      duration: item.totalDuration,
                      calories: item.totalCalories || 0,
                    }))} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: darkMode ? '#9CA3AF' : '#4B5563' }} 
                      axisLine={{ stroke: darkMode ? '#4B5563' : '#D1D5DB' }}
                    />
                    <YAxis 
                      tick={{ fill: darkMode ? '#9CA3AF' : '#4B5563' }} 
                      axisLine={{ stroke: darkMode ? '#4B5563' : '#D1D5DB' }}
                    />
                    <Tooltip content={customTooltip} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Entraînements" 
                      stroke="#4F46E5" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      name="Durée (min)" 
                      stroke="#10B981" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
                )}
              </div>
            </Card>
            
            {/* Yearly Progress */}
              <Card>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Progression annuelle</h3>
                <div className="h-64">
                {loading ? (
                  <Skeleton variant="rect" height="100%" width="100%" />
                ) : error ? (
                  <div className="text-red-500 p-4">{error}</div>
                ) : yearlyData.length === 0 ? (
                  <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-center h-full`}>
                    <p>Aucune donnée annuelle disponible</p>
                </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={yearlyData.map(item => ({
                        month: new Date(item._id).toLocaleDateString('fr-FR', { month: 'short' }),
                        workouts: item.count,
                        calories: item.totalCalories || 0,
                      }))}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: darkMode ? '#9CA3AF' : '#4B5563' }} 
                        axisLine={{ stroke: darkMode ? '#4B5563' : '#D1D5DB' }}
                      />
                      <YAxis 
                        tick={{ fill: darkMode ? '#9CA3AF' : '#4B5563' }} 
                        axisLine={{ stroke: darkMode ? '#4B5563' : '#D1D5DB' }}
                      />
                      <Tooltip content={customTooltip} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="workouts" 
                        name="Entraînements" 
                        fill="#4F46E5" 
                        stroke="#4F46E5"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                </div>
              </Card>
          </div>
        )}
        
        {activeTab === 'trends' && (
          <div className="space-y-8">
            {/* Enhanced Trends Chart */}
            <Card>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analyse des Tendances
              </h3>
              <div className="h-80">
                {loading ? (
                  <Skeleton variant="rect" height="100%" width="100%" />
                ) : error ? (
                  <div className="text-red-500 p-4 text-center">
                    <p className="font-semibold">⚠️ Impossible de charger les tendances</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : trendsData.length === 0 ? (
                  <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-center h-full`}>
                    <div>
                      <div className="mb-4">
                        <span className="text-4xl">📈</span>
                      </div>
                      <p className="font-semibold text-lg mb-2">Découvrez Vos Tendances !</p>
                      <p className="text-sm">Accumuez des données d'entraînement pour révéler vos patterns de performance</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={trendsData.map(item => ({
                        name: new Date(item._id).toLocaleDateString('fr-FR', { 
                          month: 'short', 
                          day: 'numeric' 
                        }),
                        count: item.count,
                        duration: item.totalDuration,
                        calories: item.totalCalories || 0,
                        difficulty: item.avgDifficulty || 0,
                        enjoyment: item.avgEnjoyment || 0,
                      }))} 
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#fed7aa'} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: darkMode ? '#e2e8f0' : '#7c2d12', fontWeight: 600 }}
                        axisLine={{ stroke: darkMode ? '#64748b' : '#ea580c' }}
                      />
                      <YAxis 
                        tick={{ fill: darkMode ? '#e2e8f0' : '#7c2d12', fontWeight: 600 }}
                        axisLine={{ stroke: darkMode ? '#64748b' : '#ea580c' }}
                      />
                      <Tooltip content={customTooltip} cursor={{ fill: darkMode ? '#f97316' + '22' : '#ea580c22' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Entraînements" 
                        stroke={darkMode ? "#f97316" : "#ea580c"}
                        activeDot={{ r: 8 }}
                        strokeWidth={3}
                        isAnimationActive={true}
                        animationDuration={1200}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        name="Durée (min)" 
                        stroke={darkMode ? "#10B981" : "#059669"}
                        strokeWidth={3}
                        isAnimationActive={true}
                        animationDuration={1400}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        name="Calories" 
                        stroke={darkMode ? "#dc2626" : "#b91c1c"}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        isAnimationActive={true}
                        animationDuration={1600}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
            
            {/* Performance Insights */}
            <Card>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Insights de Performance
              </h3>
              {loading ? (
                <Skeleton variant="rect" height="200px" />
              ) : trendsData.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Insights disponibles après quelques entraînements</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'} transition-all duration-300 hover:shadow-lg`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-orange-500' : 'bg-orange-600'}`}>
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fréquence</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {periodStats.workoutsPerWeek.toFixed(1)}/sem
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'} transition-all duration-300 hover:shadow-lg`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-600'}`}>
                        <span className="text-white text-lg">⏱️</span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Durée Moy.</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {Math.round(periodStats.totalDuration / Math.max(periodStats.totalWorkouts, 1))}min
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30' : 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200'} transition-all duration-300 hover:shadow-lg`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-red-500' : 'bg-red-600'}`}>
                        <span className="text-white text-lg">🔥</span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Intensité</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {Math.round(periodStats.totalCalories / Math.max(periodStats.totalWorkouts, 1))} cal/session
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'} transition-all duration-300 hover:shadow-lg`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-500' : 'bg-purple-600'}`}>
                        <span className="text-white text-lg">📈</span>
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Progression</p>
                        <p className={`text-lg font-bold ${periodChanges.workouts >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {periodChanges.workouts >= 0 ? '+' : ''}{periodChanges.workouts}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
        
        {activeTab === 'records' && (
          <div className="space-y-8">
            <Card>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Records personnels
              </h3>
              
              {loading ? (
                <Skeleton variant="rect" height="200px" />
              ) : error ? (
                <div className="text-red-500 p-4">{error}</div>
              ) : !recordsData ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FaTrophy className="mx-auto h-12 w-12 mb-4" />
                  <p>Aucun record personnel disponible</p>
                  <p className="text-sm">Enregistrez plus d'entraînements pour voir vos records</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recordsData.maxDuration && (
                    <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center">
                        <FaClock className="text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">Durée maximale</p>
                          <p className="text-lg font-bold">{recordsData.maxDuration.duration} min</p>
                          <p className="text-sm text-gray-500">{recordsData.maxDuration.type}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {recordsData.maxCalories && (
                    <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center">
                        <FaFire className="text-orange-500 mr-2" />
                        <div>
                          <p className="font-medium">Calories maximales</p>
                          <p className="text-lg font-bold">{recordsData.maxCalories.calories} cal</p>
                          <p className="text-sm text-gray-500">{recordsData.maxCalories.type}</p>
                        </div>
                      </div>
                  </div>
                  )}
                  
                  {recordsData.maxDifficulty && (
                    <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center">
                        <FaTrophy className="text-yellow-500 mr-2" />
                        <div>
                          <p className="font-medium">Difficulté maximale</p>
                          <p className="text-lg font-bold">{recordsData.maxDifficulty.difficulty}/10</p>
                          <p className="text-sm text-gray-500">{recordsData.maxDifficulty.type}</p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              )}
            </Card>
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div className="space-y-8">
            <Card>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Objectifs et progression
              </h3>
              
              {loading ? (
                <Skeleton variant="rect" height="200px" />
              ) : error ? (
                <div className="text-red-500 p-4">{error}</div>
              ) : goalsData.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FaFire className="mx-auto h-12 w-12 mb-4" />
                  <p>Aucun objectif défini</p>
                  <p className="text-sm">Les objectifs vous aideront à rester motivé et à suivre vos progrès</p>
                </div>
              ) : (
              <div className="space-y-6">
                  {goalsData.map(goal => (
                  <div key={goal.id}>
                    <ProgressTracker 
                      value={goal.current} 
                      maxValue={goal.target} 
                        label={goal.title}
                      unit={goal.unit}
                      variant="primary"
                      size="lg"
                    />
                  </div>
                ))}
              </div>
              )}
            </Card>
          </div>
        )}
        
        {activeTab === 'body' && (
          <div className="space-y-6">
            <Card>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Composition corporelle
              </h3>
              
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FaHeartbeat className="mx-auto h-12 w-12 mb-4" />
                <p>Fonctionnalité de composition corporelle</p>
                <p className="text-sm">Cette fonctionnalité sera bientôt disponible</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Progress; 
