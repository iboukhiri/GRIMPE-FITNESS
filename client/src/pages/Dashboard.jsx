import React, { useState, useEffect, useContext } from 'react';
import { FaDumbbell } from 'react-icons/fa';
import { FaFire } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';
import { FaTrophy } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaChartLine } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';
import { FaFileDownload } from 'react-icons/fa';
import { FaFileCode } from 'react-icons/fa';
import { FaFilePdf } from 'react-icons/fa';
import { FaFileExcel } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa';
import { FaEyeSlash } from 'react-icons/fa';
import { ThemeContext } from '../App';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Import our components
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Achievement from '../components/Achievement';
import ProgressTracker from '../components/ProgressTracker';
import WorkoutCalendar from '../components/WorkoutCalendar';
import { useToast } from '../App';
import StatsSummary from '../components/StatsSummary';
import { workoutApi } from '../services/api';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';

// Enhanced Modern Pie Chart Component
const ModernPieChart = ({ data, hiddenItems, onToggleItem, darkMode }) => {
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  const visibleData = data.filter((_, i) => !hiddenItems.includes(i));
  const total = visibleData.reduce((sum, item) => sum + item.value, 0);

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
                displayName: type.displayName || type.name,
                originalIndex: data.findIndex(d => d.name === type.name)
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
            const percentage = total > 0 ? ((type.value / total) * 100).toFixed(1) : 0;
            
            return (
              <div
                key={type.name}
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
                        {type.value} séances
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

function Dashboard() {
  const { darkMode } = useContext(ThemeContext);
  const addToast = useToast();
  const { user } = useAuth(); // Get user information
  
  // Dynamic state for stats and charts
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [workoutData, setWorkoutData] = useState([]);
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [calendarWorkouts, setCalendarWorkouts] = useState([]);
  const [hiddenPie, setHiddenPie] = useState([]);
  const [previousTrends, setPreviousTrends] = useState([]);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        // Fetch all data in parallel
        const [overviewData, trendsData, typesData, workoutsResponse] = await Promise.all([
          workoutApi.getStatsOverview(),
          workoutApi.getStatsTrends({ period: 'week' }),
          workoutApi.getStatsTypes({ period: 'week' }),
          workoutApi.getWorkouts({ limit: 50 })
        ]);

        console.log('Raw trendsData from API (Dashboard):', trendsData);

        // Calculate percentage changes for key metrics
        const calculatePercentageChange = (current, previous) => {
          if (!previous || previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        // Add percentage change calculations to overview
        const processedOverview = {
          ...overviewData,
          changes: {
            workouts: 0, // We'll calculate this based on weekly data
            calories: 0,
            duration: 0,
            streak: 0
          },
          contexts: {
            workouts: 'Cette semaine',
            calories: 'Cette semaine', 
            duration: 'Cette semaine',
            streak: 'Jours consécutifs'
          }
        };

        // Process trends data for charts
        const processedTrends = trendsData?.map(item => {
          const date = new Date(item._id);
          const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
          
          return {
            name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            date: item._id,
            workouts: item.count || 0,
            calories: item.totalCalories || 0,
            duration: Math.round((item.totalDuration || 0) / 60) // Convert to hours
          };
        }) || [];

        console.log('Processed trendsData for chart (Dashboard):', processedTrends);

        // Process types data for pie chart
        const processedTypes = typesData?.map(type => ({
          name: type._id || 'autre',
          displayName: getTypeDisplayName(type._id || 'autre'),
          value: type.count || 0,
          color: getTypeColor(type._id),
        })) || [];

        // Process workouts for calendar
        const workoutsArray = workoutsResponse?.data || [];
        const processedWorkouts = workoutsArray.map(w => ({
          ...w,
          date: w.date ? new Date(w.date).toISOString().slice(0, 10) : null,
        })).filter(w => w.date); // Remove invalid dates

        setOverview(processedOverview);
        setWorkoutData(processedTrends);
        setWorkoutTypes(processedTypes);
        setCalendarWorkouts(processedWorkouts);
        setPreviousTrends(processedTrends);

      } catch (error) {
        addToast({
          title: 'Erreur de chargement',
          message: 'Impossible de charger les données du tableau de bord',
          type: 'error',
          duration: 5000
        });
        
        // Set default empty data
        setOverview({ 
          totalWorkouts: 0, 
          totalDuration: 0, 
          totalCalories: 0, 
          streak: 0,
          changes: { workouts: 0, calories: 0, duration: 0, streak: 0 }
        });
        setWorkoutData([]);
        setWorkoutTypes([]);
        setCalendarWorkouts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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

  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('stats');

  // New data for workout goals and statistics
  const workoutGoals = [
    { id: 1, name: 'Séances par semaine', current: 4, target: 5, unit: '', color: '#4F46E5' },
    { id: 2, name: 'Durée par séance', current: formatDuration(45), target: formatDuration(60), unit: '', color: '#0EA5E9' },
    { id: 3, name: 'Calories brûlées par semaine', current: 1200, target: 1500, unit: 'cal', color: '#EF4444' },
  ];

  // Function to format the tooltip for the charts
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
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

  const handleCalendarDateSelect = (date) => {
    if (!date) return;

    const workoutsOnDate = calendarWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date).toISOString().slice(0, 10);
      const selectedDate = new Date(date).toISOString().slice(0, 10);
      return workoutDate === selectedDate;
    });

    if (workoutsOnDate.length > 0) {
      addToast({
        title: `Entraînements du ${new Date(date).toLocaleDateString('fr-FR')}`,
        message: `${workoutsOnDate.length} entraînement(s) trouvé(s) ce jour`,
        type: 'success',
        duration: 4000
      });
    } else {
      addToast({
        title: 'Aucun entraînement',
        message: `Pas d'entraînement le ${new Date(date).toLocaleDateString('fr-FR')}`,
        type: 'info',
        duration: 3000
      });
    }
  };
  
  // Export data function
  const exportData = async (format) => {
    if (format !== 'pdf') return;
    
    try {
      setPdfLoading(true);
      
      // Add initial notification
      if (typeof addToast === 'function') {
        addToast({
          title: 'Génération du rapport en cours...',
          message: 'Veuillez patienter pendant la création de votre rapport PDF personnalisé',
          type: 'info',
          duration: 3000
        });
      } else {
        console.warn('addToast is not a function, skipping "Génération du rapport en cours..." toast.');
      }
      
      const workoutsResponse = await workoutApi.getWorkouts({ limit: 1000 });
      const workoutsForExport = workoutsResponse?.data || [];
      
      // Check for minimal workout requirement (this toast is kept but cleaned)
      if (workoutsForExport.length < 3) {
        if (typeof addToast === 'function') {
          addToast({
            title: 'Données insuffisantes',
            message: `Vous avez ${workoutsForExport.length} entraînement(s). Pour un rapport détaillé, nous recommandons au moins 3 entraînements. Continuez à enregistrer vos séances !`,
            type: 'warning',
            duration: 6000
          });
        } else {
          console.warn('addToast is not a function, skipping "Données insuffisantes" toast.');
        }
      }
      
      // Provide guidance for users with few workouts (cleaned toasts)
      if (workoutsForExport.length >= 3 && workoutsForExport.length < 10) {
        if (typeof addToast === 'function') {
          addToast({
            title: 'Rapport généré avec données limitées',
            message: `Votre rapport contient ${workoutsForExport.length} entraînement(s). Pour des analyses plus complètes, continuez d'ajouter d'entraînements !`,
            type: 'info',
            duration: 4000
          });
        } else {
          console.warn('addToast is not a function, skipping "Rapport généré avec données limitées" toast.');
        }
      } else if (workoutsForExport.length >= 20) {
        if (typeof addToast === 'function') {
          addToast({
            title: 'Excellent historique détecté !',
            message: `Votre rapport comprend ${workoutsForExport.length} entraînements - parfait pour une analyse complète !`,
            type: 'success',
            duration: 4000
          });
        } else {
          console.warn('addToast is not a function, skipping "Excellent historique détecté !" toast.');
        }
      }
      
      // Prepare clean data
      const workoutsWithDetails = workoutsForExport.map(w => ({
        id: w._id,
        date: new Date(w.date).toLocaleDateString('fr-FR'),
        type: w.type || 'Non défini',
        duration: w.duration || 0,
        difficulty: w.difficulty || 1,
        calories: w.calories || 0,
        location: w.location || 'Non spécifié',
        notes: w.notes ? w.notes.replace(/[^\w\s\-_àâäéèêëíîïóôöúûüýÿç]/g, '') : 'Aucune note', // Clean special chars
        metrics: w.metrics || {}
      }));
      
      // Calculate workout type distribution
      const typeStats = {};
      workoutsWithDetails.forEach(workout => {
        typeStats[workout.type] = (typeStats[workout.type] || 0) + 1;
      });
      
      const totalWorkouts = workoutsWithDetails.length;

      // If no workouts available
      if (totalWorkouts === 0) {
        if (typeof addToast === 'function') {
          addToast({
              title: 'Aucune donnée à exporter',
              message: 'Impossible de générer le PDF car aucune donnée d\'entraînement n\'a été trouvée après la récupération.',
              type: 'info',
              duration: 6000
          });
        } else {
          console.warn('addToast is not a function, skipping "Aucune donnée à exporter" toast.');
        }
        setPdfLoading(false);
        return;
      }

      const totalDuration = workoutsWithDetails.reduce((sum, w) => sum + w.duration, 0);
      const totalCalories = workoutsWithDetails.reduce((sum, w) => sum + w.calories, 0);
      const avgDuration = Math.round(totalDuration / totalWorkouts);
      const avgCalories = Math.round(totalCalories / totalWorkouts);
      
      // Calculate additional metrics
      const avgDifficulty = (workoutsWithDetails.reduce((sum, w) => sum + w.difficulty, 0) / totalWorkouts).toFixed(1);
      const maxCaloriesSession = Math.max(...workoutsWithDetails.map(w => w.calories));
      const maxDurationSession = Math.max(...workoutsWithDetails.map(w => w.duration));
      
      // Time period analysis
      const dates = workoutsWithDetails.map(w => new Date(w.date.split('/').reverse().join('-')));
      const oldestDate = new Date(Math.min(...dates));
      const newestDate = new Date(Math.max(...dates));
      const periodDays = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
      const periodMonths = Math.ceil(periodDays / 30);
      
      // Mock body metrics for comprehensive demo (would come from API in real app)
      const mockBodyMetrics = {
        currentWeight: 72.5,
        startWeight: 75.0,
        currentBodyFat: 14.2,
        startBodyFat: 18.0,
        currentMuscle: 44.8,
        startMuscle: 42.0,
        currentBMR: 1785,
        startBMR: 1650
      };
      
      // Mock objectives progress
      const mockObjectives = [
        { title: 'Objectif mensuel: 15 entrainements', progress: 87, target: 15, current: 13 },
        { title: 'Bruler 8000 calories ce mois', progress: 92, target: 8000, current: 7360 },
        { title: 'Atteindre 73kg', progress: 75, target: 73, current: 72.5 },
        { title: 'Reduire masse grasse a 15%', progress: 95, target: 15, current: 14.2 }
      ];
      
      // Generate PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let y = 20;
      
      // Helper function for new page
      const addNewPage = () => {
        doc.addPage();
        y = 20;
      };
      
      // COVER PAGE - Clean and professional
      doc.setFillColor(255, 107, 53);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('GRIMPE FITNESS', pageWidth / 2, 50, { align: 'center' });
      
      doc.setFontSize(20);
      doc.text('Rapport d\'Entrainement Personnel', pageWidth / 2, 70, { align: 'center' });
      
      // User info section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      const userName = user?.name || 'Athlète GRIMPE';
      doc.text(`Utilisateur: ${userName}`, pageWidth / 2, 90, { align: 'center' });
      
      // Stats box - WHITE background for readability
      doc.setFillColor(255, 255, 255);
      doc.rect(30, 110, pageWidth - 60, 120, 'F');
      
      // Stats content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('STATISTIQUES PRINCIPALES', pageWidth / 2, 130, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.text(`Total Entrainements: ${totalWorkouts} seances`, pageWidth / 2, 150, { align: 'center' });
      doc.text(`Duree Totale: ${formatDuration(totalDuration)}`, pageWidth / 2, 165, { align: 'center' });
      doc.text(`Calories Brulees: ${totalCalories.toLocaleString()} cal`, pageWidth / 2, 180, { align: 'center' });
      doc.text(`Moyenne par session: ${formatDuration(avgDuration)} - ${avgCalories} cal`, pageWidth / 2, 195, { align: 'center' });
      doc.text(`Difficulte moyenne: ${avgDifficulty}/5`, pageWidth / 2, 210, { align: 'center' });
      
      // Date and period info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(`Rapport genere le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 255, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Periode analysee: ${periodMonths} mois (${periodDays} jours)`, pageWidth / 2, 270, { align: 'center' });
      doc.text(`${totalWorkouts} entrainements analyses - Donnees personnalisees`, pageWidth / 2, 280, { align: 'center' });
      
      // PAGE 2 - Body Metrics and Performance Analysis
      addNewPage();
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ANALYSE PHYSIQUE ET PERFORMANCE', 20, y);
      y += 20;
      
      // Body metrics section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Evolution des Metriques Corporelles', 20, y);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      // Create metrics comparison table
      const metricsData = [
        ['Metrique', 'Debut', 'Actuel', 'Evolution'],
        ['Poids (kg)', mockBodyMetrics.startWeight.toString(), mockBodyMetrics.currentWeight.toString(), 
         `${(mockBodyMetrics.currentWeight - mockBodyMetrics.startWeight).toFixed(1)} kg`],
        ['Masse grasse (%)', mockBodyMetrics.startBodyFat.toString(), mockBodyMetrics.currentBodyFat.toString(),
         `${(mockBodyMetrics.currentBodyFat - mockBodyMetrics.startBodyFat).toFixed(1)}%`],
        ['Masse musculaire (%)', mockBodyMetrics.startMuscle.toString(), mockBodyMetrics.currentMuscle.toString(),
         `+${(mockBodyMetrics.currentMuscle - mockBodyMetrics.startMuscle).toFixed(1)}%`],
        ['BMR (cal/jour)', mockBodyMetrics.startBMR.toString(), mockBodyMetrics.currentBMR.toString(),
         `+${mockBodyMetrics.currentBMR - mockBodyMetrics.startBMR} cal`]
      ];
      
      metricsData.forEach((row, index) => {
        const isHeader = index === 0;
        
        if (isHeader) {
          doc.setFillColor(75, 85, 99);
          doc.rect(20, y - 2, 150, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
        } else {
          if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(20, y - 2, 150, 8, 'F');
          }
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(row[0], 22, y + 3);
        doc.text(row[1], 60, y + 3);
        doc.text(row[2], 90, y + 3);
        doc.text(row[3], 120, y + 3);
        
        y += 8;
      });
      
      y += 15;
      
      // Performance section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Globale', 20, y);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`${userName} a complete ${totalWorkouts} entrainements au total.`, 20, y);
      y += 8;
      doc.text(`Votre duree totale d'entrainement est de ${formatDuration(totalDuration)}.`, 20, y);
      y += 8;
      doc.text(`Vous avez brule ${totalCalories.toLocaleString()} calories en tout.`, 20, y);
      y += 8;
      doc.text(`En moyenne, vos sessions durent ${formatDuration(avgDuration)} et brulent ${avgCalories} calories.`, 20, y);
      y += 8;
      doc.text(`Session la plus longue: ${formatDuration(maxDurationSession)}`, 20, y);
      y += 8;
      doc.text(`Session la plus intense: ${maxCaloriesSession} calories`, 20, y);
      y += 8;
      
      // Exercise count highlight
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(255, 247, 237);
      doc.rect(20, y, pageWidth - 40, 15, 'F');
      doc.setTextColor(255, 107, 53);
      doc.text(`TOTAL: ${totalWorkouts} EXERCICES DANS VOTRE PARCOURS FITNESS!`, 25, y + 10);
      doc.setTextColor(0, 0, 0);
      y += 25;
      
      // PAGE 3 - Objectives and Workout Distribution
      addNewPage();
      
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('OBJECTIFS ET REPARTITION', 20, y);
      y += 20;
      
      // Objectives section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Progres des Objectifs', 20, y);
      y += 15;
      
      mockObjectives.forEach((objective, index) => {
        // Objective title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(objective.title, 20, y);
        y += 8;
        
        // Progress bar
        const barWidth = 100;
        const barHeight = 6;
        
        // Background bar
        doc.setFillColor(230, 230, 230);
        doc.rect(20, y - 3, barWidth, barHeight, 'F');
        
        // Progress bar
        doc.setFillColor(34, 197, 94); // Green for completed objectives
        doc.rect(20, y - 3, (objective.progress / 100) * barWidth, barHeight, 'F');
        
        // Progress text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${objective.progress}% - ${objective.current}/${objective.target}`, 125, y);
        
        y += 15;
      });
      
      y += 10;
      
      // Workout types section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Repartition par Type d\'Entrainement', 20, y);
      y += 15;
      
      // Create visual bars for workout types
      const sortedTypes = Object.entries(typeStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      
      sortedTypes.forEach(([type, count]) => {
        const percentage = Math.round((count / totalWorkouts) * 100);
        
        // Type name and stats
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${getTypeDisplayName(type)}`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${count} sessions (${percentage}%)`, 100, y);
        
        // Visual bar
        const barWidth = 80;
        const barHeight = 6;
        
        // Background bar
        doc.setFillColor(230, 230, 230);
        doc.rect(20, y + 2, barWidth, barHeight, 'F');
        
        // Progress bar
        doc.setFillColor(255, 107, 53);
        doc.rect(20, y + 2, (percentage / 100) * barWidth, barHeight, 'F');
        
        y += 15;
      });
      
      // PAGE 4 - Recent workouts and detailed history
      addNewPage();
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Historique Recent (20 derniers entrainements)', 20, y);
      y += 15;
      
      // Table header
      doc.setFillColor(75, 85, 99);
      doc.rect(20, y - 5, pageWidth - 40, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 25, y + 2);
      doc.text('Type', 60, y + 2);
      doc.text('Duree', 100, y + 2);
      doc.text('Difficulte', 130, y + 2);
      doc.text('Calories', 165, y + 2);
      
      y += 12;
      
      // Table rows
      const recentWorkouts = workoutsWithDetails
        .sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')))
        .slice(0, 20);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      recentWorkouts.forEach((workout, index) => {
        // Check if we need a new page
        if (y > pageHeight - 20) {
          addNewPage();
          y += 10;
        }
        
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, y - 4, pageWidth - 40, 10, 'F');
        }
        
        doc.text(workout.date, 25, y);
        doc.text(workout.type.length > 12 ? workout.type.substring(0, 12) + '...' : workout.type, 60, y);
        doc.text(`${formatDuration(workout.duration)}`, 100, y);
        doc.text(`${workout.difficulty}/5`, 135, y);
        doc.text(`${workout.calories}`, 165, y);
        
        y += 10;
      });
      
      // Footer
      doc.setFillColor(255, 107, 53);
      doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Continuez vos efforts! Chaque entrainement compte.', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // Save PDF with user-specific filename
      const userNameClean = userName ? userName.replace(/[^a-zA-Z0-9]/g, '_') : 'Athlete_GRIMPE';
      const filename = `GRIMPE_${userNameClean}_${totalWorkouts}exercices_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Save the PDF file
      doc.save(filename);
      
      // Wait a moment to ensure file is saved before stopping loading animation
      setTimeout(() => {
        setPdfLoading(false);
        
        // Enhanced success notification (cleaned)
        if (typeof addToast === 'function') {
          addToast({
            title: 'Rapport PDF téléchargé !',
            message: `Votre rapport fitness complet (${totalWorkouts} entraînements) a été généré et téléchargé avec succès. Fichier: ${filename}`,
            type: 'success',
            duration: 7000
          });
        } else {
          console.warn('addToast is not a function, skipping "Rapport PDF téléchargé !" toast.');
        }
      }, 500);
      
    } catch (error) {
      setPdfLoading(false);
      if (typeof addToast === 'function') {
        addToast({
          title: 'Erreur de génération',
          message: `Une erreur est survenue lors de la création du PDF: ${error.message}. Veuillez vérifier votre connexion et réessayer.`,
          type: 'error',
          duration: 5000
        });
      } else {
        console.warn('addToast is not a function, skipping "Erreur de génération" toast. Error: ', error);
        alert('Une erreur est survenue lors de la création du PDF. Veuillez vérifier votre connexion et réessayer.'); // Fallback alert
      }
    }
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
            Tableau de Bord
          </h1>
          <p className={`text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto transition-colors ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Suivez vos progrès, atteignez vos objectifs et dépassez vos limites. 
            Chaque entraînement vous rapproche de la grandeur.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm font-bold uppercase tracking-widest">
            <span className={darkMode ? 'text-orange-400' : 'text-orange-600'}>ANALYSEZ</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-red-400' : 'text-red-600'}>PROGRESSEZ</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-green-400' : 'text-green-600'}>EXCELLEZ</span>
          </div>
        </div>

        {/* Export Actions - Enhanced (PDF Only) */}
        <div className="mb-6 animate-fade-in-up animation-delay-100">
          <div className={`p-6 rounded-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
              : 'bg-white/95 backdrop-blur-sm border border-orange-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full transition-all duration-300 ${
                  (overview?.totalWorkouts || 0) === 0
                    ? darkMode 
                      ? 'bg-slate-700 border border-slate-600' 
                      : 'bg-gray-300 border border-gray-400'
                    : darkMode 
                      ? 'bg-slate-600 border border-orange-400/50' 
                      : 'bg-gradient-to-r from-orange-600 to-red-600'
                }`}>
                  {(overview?.totalWorkouts || 0) === 0 ? (
                    <FaLock className={`text-xl ${darkMode ? 'text-slate-500' : 'text-gray-500'}`} />
                  ) : (
                    <FaFilePdf className="text-white text-xl" />
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-bold transition-colors ${
                    darkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    {(overview?.totalWorkouts || 0) === 0 ? 'Exportation Verrouillée' : 'Exportation de Données'}
                  </h3>
                  <p className={`text-sm transition-colors ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {(overview?.totalWorkouts || 0) === 0 
                      ? 'Minimum 1 entraînement requis • Commencez dès maintenant !'
                      : 'Analyses graphiques • Historique complet • Données personnalisées'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => exportData('pdf')}
                  disabled={pdfLoading || (overview?.totalWorkouts || 0) === 0}
                  className={`${
                    (overview?.totalWorkouts || 0) === 0
                      ? darkMode
                        ? 'bg-slate-600 hover:bg-slate-600 cursor-not-allowed opacity-60'
                        : 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-60'
                      : darkMode 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400' 
                        : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                  } text-white shadow-md transition-all duration-300 px-8 py-3 ${
                    pdfLoading ? 'opacity-75 cursor-not-allowed transform-none' : 
                    (overview?.totalWorkouts || 0) === 0 ? 'transform-none' : 'transform hover:scale-105'
                  }`}
                  title={
                    (overview?.totalWorkouts || 0) === 0 
                      ? 'Enregistrez au moins un entraînement pour débloquer l\'exportation PDF'
                      : 'Générer un rapport PDF complet de votre progression'
                  }
                >
                  {pdfLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Génération en cours...
                    </>
                  ) : (overview?.totalWorkouts || 0) === 0 ? (
                    <>
                      <FaLock className="mr-3 text-lg" />
                      Exportation Verrouillée
                    </>
                  ) : (
                    <>
                      <FaFilePdf className="mr-3 text-lg" />
                      Générer Rapport PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 animate-fade-in-up animation-delay-200">
          <StatsSummary 
            stats={[
              { 
                label: "Total Entraînements", 
                value: overview?.totalWorkouts || 0, 
                type: 'workout', 
                change: overview?.changes?.workouts || 0,
                subtitle: overview?.contexts?.workouts || ''
              },
              { 
                label: "Calories Brûlées", 
                value: overview?.totalCalories || 0, 
                type: 'calories', 
                unit: 'cal', 
                change: overview?.changes?.calories || 0,
                subtitle: overview?.contexts?.calories || ''
              },
              { 
                label: "Durée Totale", 
                value: formatDuration(overview?.totalDuration || 0), 
                type: 'time', 
                change: overview?.changes?.duration || 0,
                subtitle: overview?.contexts?.duration || ''
              },
              { 
                label: "Série Actuelle", 
                value: overview?.streak || 0, 
                type: 'streak', 
                unit: 'jours', 
                change: overview?.changes?.streak || 0,
                subtitle: overview?.contexts?.streak || ''
              }
            ]}
            loading={loading}
            highlightRecent={true}
            animate={true}
          />
        </div>

        {/* Achievements Section */}
        {!loading && overview && overview.recentAchievements && overview.recentAchievements.length > 0 && (
          <div className="mb-8 animate-fade-in-up animation-delay-300">
            <div className={`p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
                : 'bg-white/95 backdrop-blur-sm border border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-2xl font-bold transition-colors ${
                    darkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    Nouveaux Accomplissements
                  </h3>
                  <p className={`transition-colors ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Célébrez vos victoires récentes
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-slate-600 border border-orange-400/50' : 'bg-gradient-to-r from-orange-600 to-red-600'
                }`}>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overview.recentAchievements.map((achievement, index) => (
                  <Achievement
                    key={index}
                    title={achievement.title}
                    description={achievement.description}
                    type={achievement.type || 'workout'}
                    icon={achievement.icon || 'trophy'}
                    date={achievement.date}
                    animate={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Goals Section */}
        {!loading && overview && (
          <div className="mb-8 animate-fade-in-up animation-delay-400">
            <div className={`p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
                : 'bg-white/95 backdrop-blur-sm border border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-2xl font-bold transition-colors ${
                    darkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    Objectifs Hebdomadaires
                  </h3>
                  <p className={`transition-colors ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Votre progression cette semaine
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-slate-600 border border-green-400/50' : 'bg-gradient-to-r from-green-600 to-emerald-600'
                }`}>
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="space-y-4">
                <ProgressTracker
                  label="Entraînements"
                  value={overview.weeklyWorkouts || 0}
                  maxValue={overview.weeklyGoal || 5}
                  variant="primary"
                  showValue={true}
                  unit="séances"
                />
                <ProgressTracker
                  label="Calories brûlées"
                  value={overview.weeklyCalories || 0}
                  maxValue={overview.weeklyCalorieGoal || 2000}
                  variant="warning"
                  showValue={true}
                  unit="cal"
                />
                <ProgressTracker
                  label="Temps d'entraînement"
                  value={Math.round((overview.weeklyDuration || 0) / 60)}
                  maxValue={Math.round((overview.weeklyDurationGoal || 600) / 60)}
                  variant="success"
                  showValue={true}
                  unit="heures"
                />
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Bar Chart */}
          <div className={`p-6 rounded-xl transition-all duration-300 animate-fade-in-up ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
              : 'bg-white/95 backdrop-blur-sm border border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-2xl font-bold transition-colors ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  Progrès Hebdomadaires
                </h3>
                <p className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  La régularité forge les champions
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-slate-600 border border-blue-400/50' : 'bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}>
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <div className="h-80 min-w-[320px] flex items-center justify-center">
              {loading ? (
                <Skeleton variant="rect" height="100%" width="100%" />
              ) : error ? (
                <div className="text-red-500 p-4 text-center">
                  <p className="font-semibold">⚠️ Graphique indisponible</p>
                  <p className="text-sm">{error}</p>
                </div>
              ) : workoutData.length === 0 ? (
                <div className={`text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className="mb-4">
                    <span className="text-4xl">📊</span>
                  </div>
                  <p className="font-semibold text-lg mb-2">Prêt à Voir Vos Progrès ?</p>
                  <p className="text-sm">Commencez à enregistrer des entraînements pour débloquer des analyses puissantes</p>
                  <div className={`mt-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                    darkMode 
                      ? 'bg-slate-600 border border-orange-400/50 text-white' 
                      : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                  }`}>
                    Votre Graphique Vous Attend
                  </div>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
                  <Bar 
                    dataKey="workouts" 
                    name="Entraînements" 
                      fill="url(#barGradientEnergy)" 
                      barSize={40}
                      radius={[12, 12, 0, 0]}
                    isAnimationActive={true}
                      animationDuration={1200}
                  />
                  <defs>
                      <linearGradient id="barGradientEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={darkMode ? "#f97316" : "#ea580c"} stopOpacity="1" />
                        <stop offset="100%" stopColor={darkMode ? "#dc2626" : "#dc2626"} stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
          
          {/* Enhanced Pie Chart */}
          <div className={`p-6 rounded-xl transition-all duration-300 animate-fade-in-up ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
              : 'bg-white/95 backdrop-blur-sm border border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-2xl font-bold transition-colors ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  Répartition des Entraînements
                </h3>
                <p className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Diversifiez vos efforts pour progresser
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-slate-600 border border-purple-400/50' : 'bg-gradient-to-r from-purple-600 to-pink-600'
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
              ) : workoutTypes.length === 0 ? (
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
                  data={workoutTypes}
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

        {/* Workout Calendar */}
        <div className="mt-8 animate-fade-in-up animation-delay-600">
          <div className={`p-6 rounded-xl transition-all duration-300 ${
            darkMode 
              ? 'bg-slate-800/90 backdrop-blur-sm border border-slate-700' 
              : 'bg-white/95 backdrop-blur-sm border border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-2xl font-bold transition-colors ${
                  darkMode ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  Calendrier d'Entraînement
                </h3>
                <p className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Vue d'ensemble de vos séances
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-slate-600 border border-blue-400/50' : 'bg-gradient-to-r from-blue-600 to-cyan-600'
              }`}>
                <FaCalendarAlt className="text-xl text-white" />
              </div>
            </div>
            <WorkoutCalendar 
              workouts={calendarWorkouts}
              onSelectDate={handleCalendarDateSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;