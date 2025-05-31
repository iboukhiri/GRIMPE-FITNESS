import React, { useState, useEffect, useContext } from 'react';
import { 
  FaChartLine, 
  FaTrophy, 
  FaFire, 
  FaHeartbeat, 
  FaRunning, 
  FaDumbbell, 
  FaCalendarAlt,
  FaClock
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
      
      try {
        console.log('Récupération des données de progression pour la période:', filter);
        
        // Calculate previous period dates for comparison
        const getPreviousPeriodDates = (currentFilter) => {
          const now = new Date();
          let periodDays;
          
          switch (currentFilter) {
            case '1week':
              periodDays = 7;
              break;
            case '1month':
              periodDays = 30;
              break;
            case '3months':
              periodDays = 90;
              break;
            case '6months':
              periodDays = 180;
              break;
            case '1year':
              periodDays = 365;
              break;
            default:
              periodDays = 7; // default to week
          }
          
          const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
          const previousStart = new Date(currentStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
          const previousEnd = currentStart;
          
          return {
            startDate: previousStart.toISOString(),
            endDate: previousEnd.toISOString()
          };
        };
        
        const previousPeriod = getPreviousPeriodDates(filter);
        
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
        
        console.log('Réponses API progression:', { overview, trends, types, yearly, records, goals, previousTrends });
        
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
        console.error('Erreur lors de la récupération des données de progression:', err);
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
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 shadow-lg'
          }`}>
            <p className="font-bold text-lg tracking-wide">
              "Les fondements de tout bonheur sont une bonne santé." – Leigh Hunt
            </p>
            <p className={`text-sm mt-2 font-medium ${
              darkMode ? 'text-slate-300' : 'text-red-200'
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
                  <Skeleton variant="rect" height="100%" width="100%" />
                ) : error ? (
                  <div className="text-red-500 p-4 text-center">
                    <p className="font-semibold">⚠️ Graphique indisponible</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : typesData.length === 0 ? (
                  <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-center h-full`}>
                    <div>
                      <div className="mb-4">
                        <span className="text-4xl">🎯</span>
                      </div>
                      <p className="font-semibold text-lg mb-2">Variez Vos Entraînements !</p>
                      <p className="text-sm">Un entraînement diversifié donne des résultats diversifiés</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <ResponsiveContainer width="100%" height="65%">
                      <PieChart>
                        <Pie
                          data={typesData.filter((_, i) => !hiddenPie.includes(i)).map(type => ({
                            name: type._id,
                            displayName: getTypeDisplayName(type._id),
                            value: type.count,
                            color: getTypeColor(type._id),
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={30}
                          paddingAngle={5}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) => 
                            <span className={`font-bold text-xs ${
                              darkMode ? 'fill-slate-200' : 'fill-slate-800'
                            }`} style={{ fill: darkMode ? '#f1f5f9' : '#1e293b' }}>
                              {getTypeDisplayName(name)} {(percent * 100).toFixed(0)}%
                            </span>
                          }
                          isAnimationActive={true}
                          animationDuration={1200}
                        >
                          {typesData.map((type, index) =>
                            hiddenPie.includes(index) ? null : (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={getTypeColor(type._id)}
                                stroke={darkMode ? "#1e293b" : "#fff"} 
                                strokeWidth={2}
                                style={{
                                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                                  transition: 'all 0.3s ease'
                                }}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip content={pieChartTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Enhanced Legend with proper spacing */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
                      {typesData.map((type, i) => {
                        const isHidden = hiddenPie.includes(i);
                        return (
                          <button
                            key={type._id}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 text-xs ${
                              isHidden 
                                ? `opacity-40 scale-90 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}` 
                                : 'opacity-100 scale-100 hover:scale-105 shadow-sm'
                            }`}
                            style={{ 
                              backgroundColor: isHidden ? undefined : `${getTypeColor(type._id)}20`,
                              borderColor: getTypeColor(type._id),
                              borderWidth: '1px'
                            }}
                            onClick={() => setHiddenPie(h => h.includes(i) ? h.filter(x => x !== i) : [...h, i])}
                            type="button"
                          >
                            <span 
                              className="inline-block w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: getTypeColor(type._id) }}
                            />
                            <span className="font-medium" style={{ color: getTypeColor(type._id) }}>
                              {getTypeDisplayName(type._id)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
