import React, { useState, useEffect, useContext } from 'react';
import { FaDumbbell, FaFire, FaClock, FaTrophy, FaCalendarAlt, FaChartLine, FaMedal, FaCheck, FaFileDownload, FaFileCode, FaFilePdf, FaFileExcel } from 'react-icons/fa';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Récupération des données du tableau de bord...');
        
        // Fetch current period data and previous period for comparison
        const [overviewData, trendsData, typesData, workoutsResponse, previousWeekTrends, previousOverview] = await Promise.all([
          workoutApi.getStatsOverview(),
          workoutApi.getStatsTrends({ period: 'week' }),
          workoutApi.getStatsTypes({ period: 'month' }),
          workoutApi.getWorkouts({ limit: 50 }),
          // Get previous week data for comparison
          workoutApi.getStatsTrends({ 
            period: 'week',
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
            endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()    // 1 week ago
          }).catch(() => []),
          // Get previous month overview for comparison (rough estimate)
          workoutApi.getStatsTrends({ 
            period: 'month',
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months ago
            endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()    // 1 month ago
          }).catch(() => [])
        ]);
        
        console.log('Réponses API du tableau de bord:', { overviewData, trendsData, typesData, workoutsResponse, previousWeekTrends, previousOverview });
        
        // Calculate percentage changes
        const calculatePercentageChange = (current, previous) => {
          if (!previous || previous === 0) {
            return current > 0 ? 100 : 0; // 100% increase if went from 0 to something, 0% if still 0
          }
          return Math.round(((current - previous) / previous) * 100);
        };
        
        // Calculate current week totals
        const currentWeekTotals = (trendsData || []).reduce((acc, item) => ({
          workouts: acc.workouts + (item.count || 0),
          duration: acc.duration + (item.totalDuration || 0),
          calories: acc.calories + (item.totalCalories || 0),
        }), { workouts: 0, duration: 0, calories: 0 });
        
        // Calculate previous week totals
        const previousWeekTotals = (previousWeekTrends || []).reduce((acc, item) => ({
          workouts: acc.workouts + (item.count || 0),
          duration: acc.duration + (item.totalDuration || 0),
          calories: acc.calories + (item.totalCalories || 0),
        }), { workouts: 0, duration: 0, calories: 0 });
        
        // Calculate previous month totals for overall comparison
        const previousMonthTotals = (previousOverview || []).reduce((acc, item) => ({
          workouts: acc.workouts + (item.count || 0),
          duration: acc.duration + (item.totalDuration || 0),
          calories: acc.calories + (item.totalCalories || 0),
        }), { workouts: 0, duration: 0, calories: 0 });
        
        // Calculate percentage changes with proper context
        const workoutChange = calculatePercentageChange(currentWeekTotals.workouts, previousWeekTotals.workouts);
        const caloriesChange = calculatePercentageChange(overviewData?.totalCalories || 0, previousMonthTotals.calories);
        const durationChange = calculatePercentageChange(overviewData?.totalDuration || 0, previousMonthTotals.duration);
        
        // For streak, show positive change if streak exists, otherwise 0
        const streakChange = overviewData?.streak > 0 ? Math.min(overviewData.streak * 10, 100) : 0;
        
        // Create context messages
        const hasWeeklyData = currentWeekTotals.workouts > 0 || previousWeekTotals.workouts > 0;
        const hasMonthlyData = (overviewData?.totalCalories || 0) > 0 || previousMonthTotals.calories > 0;
        
        console.log('Changements calculés:', {
          currentWeek: currentWeekTotals,
          previousWeek: previousWeekTotals,
          currentTotal: { calories: overviewData?.totalCalories, duration: overviewData?.totalDuration },
          previousMonth: previousMonthTotals,
          changes: { workoutChange, caloriesChange, durationChange, streakChange },
          hasData: { weekly: hasWeeklyData, monthly: hasMonthlyData }
        });
        
        // Process trends data for bar chart
        const processedTrends = (trendsData || []).map(item => {
          // Format date for display
          const date = new Date(item._id);
          const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
          
          return {
            name: dayName,
            workouts: item.count || 0,
            duration: item.totalDuration || 0,
            calories: item.totalCalories || 0,
          };
        });
        
        setWorkoutData(processedTrends);
        
        // Process types data for pie chart
        const processedTypes = (typesData || []).map(type => ({
          name: type._id || 'autre',
          displayName: getTypeDisplayName(type._id || 'autre'),
          value: type.count || 0,
          color: getTypeColor(type._id),
        }));
        
        setWorkoutTypes(processedTypes);
        
        // Process workouts for calendar
        const workoutsArray = workoutsResponse?.data || [];
        const processedWorkouts = workoutsArray.map(w => ({
          ...w,
          date: w.date ? new Date(w.date).toISOString().slice(0, 10) : null,
        })).filter(w => w.date); // Remove invalid dates
        
        setCalendarWorkouts(processedWorkouts);
        
        console.log('Données traitées avec changements de pourcentage:', { 
          overview: overviewData, 
          trends: processedTrends, 
          types: processedTypes, 
          workouts: processedWorkouts.length,
          changes: {
            workouts: workoutChange,
            calories: caloriesChange,
            duration: durationChange,
            streak: streakChange
          }
        });
        
        // Store calculated changes for use in StatsSummary
        setOverview({
          ...overviewData,
          changes: {
            workouts: hasWeeklyData ? workoutChange : 0,
            calories: hasMonthlyData ? caloriesChange : 0,
            duration: hasMonthlyData ? durationChange : 0,
            streak: streakChange
          },
          contexts: {
            workouts: hasWeeklyData ? 'vs. semaine précédente' : 'Première semaine',
            calories: hasMonthlyData ? 'vs. mois précédent' : 'Premier mois',
            duration: hasMonthlyData ? 'vs. mois précédent' : 'Premier mois',
            streak: overviewData?.streak > 0 ? 'Jours consécutifs' : 'Aucune série'
          }
        });
        
      } catch (err) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        setError(err.message || 'Erreur lors du chargement des données');
        
        // Set default empty data instead of mock data
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
    { id: 2, name: 'Minutes par séance', current: 45, target: 60, unit: 'min', color: '#0EA5E9' },
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

  // Custom tooltip specifically for pie charts
  const pieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const totalWorkouts = workoutTypes.reduce((sum, t) => sum + t.value, 0);
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
  
  const handleCalendarDateSelect = (date) => {
    // Find workouts for the selected date
    const selectedWorkouts = calendarWorkouts.filter(w => w.date === date);
    if (selectedWorkouts.length > 0) {
      addToast({
        title: `Entraînements du ${new Date(date).toLocaleDateString('fr-FR')}`,
        message: `${selectedWorkouts.length} entraînement${selectedWorkouts.length > 1 ? 's' : ''} trouvé${selectedWorkouts.length > 1 ? 's' : ''}`,
        type: 'info',
        duration: 3000
      });
    } else {
      addToast({
        title: `Aucun entraînement`,
        message: `Pas d'entraînement le ${new Date(date).toLocaleDateString('fr-FR')}`,
        type: 'info',
        duration: 3000
      });
    }
  };
  
  // Export data function
  const exportData = async (format) => {
    console.log('🚀 exportData function called with format:', format);
    
    try {
      // Simple test first
      if (format === 'pdf') {
        console.log('📄 PDF format detected');
        
        // Test PDF generation without data first
        const testDoc = new jsPDF();
        testDoc.text('Test PDF', 20, 20);
        console.log('📄 jsPDF object created successfully');
        
        // Test save function
        try {
          testDoc.save('test.pdf');
          console.log('✅ Basic PDF save test successful');
        } catch (saveError) {
          console.error('❌ PDF save test failed:', saveError);
          addToast({
            title: '❌ Erreur PDF',
            message: 'Erreur lors de la sauvegarde du PDF: ' + saveError.message,
            type: 'error',
            duration: 5000
          });
          return;
        }
      }
      
      // Fetch fresh workout data for export
      setPdfLoading(true);
      console.log('Récupération des données pour export PDF...');
      
      // Add initial notification for new users
      addToast({
        title: 'Génération du rapport en cours...',
        message: 'Veuillez patienter pendant la création de votre rapport PDF personnalisé',
        type: 'info',
        duration: 3000
      });
      
      const workoutsResponse = await workoutApi.getWorkouts({ limit: 1000 });
      console.log('Raw API response:', workoutsResponse);
      
      // Access the correct data property from API response
      const workoutsForExport = workoutsResponse?.data || [];
      console.log('Workouts for export:', workoutsForExport);
      
      if (workoutsForExport.length === 0) {
        addToast({
          title: 'Aucun entraînement trouvé',
          message: '📋 Vous devez d\'abord enregistrer quelques entraînements ! Cliquez sur "Enregistrer" dans le menu pour commencer votre parcours fitness.',
          type: 'info',
          duration: 6000
        });
        setPdfLoading(false);
        return;
      }
      
      // Provide guidance for users with few workouts
      if (workoutsForExport.length < 5) {
        addToast({
          title: 'Rapport généré avec données limitées',
          message: `📊 Votre rapport contient ${workoutsForExport.length} entraînement(s). Pour des analyses plus détaillées, ajoutez plus d'entraînements !`,
          type: 'info',
          duration: 4000
        });
      } else if (workoutsForExport.length >= 20) {
        addToast({
          title: 'Excellent historique détecté !',
          message: `🎯 Votre rapport comprend ${workoutsForExport.length} entraînements - parfait pour une analyse complète !`,
          type: 'success',
          duration: 4000
        });
      }
      
      console.log(`${workoutsForExport.length} entraînements trouvés pour l'export`);
      
      // Prepare clean data
      const workoutsWithDetails = workoutsForExport.map(w => ({
        id: w._id,
        date: new Date(w.date).toLocaleDateString('fr-FR'),
        type: w.type || 'Non défini',
        duration: w.duration || 0,
        difficulty: w.difficulty || 1,
        calories: w.calories || 0,
        location: w.location || 'Non spécifié'
      }));
      
      // Calculate workout type distribution
      const typeStats = {};
      workoutsWithDetails.forEach(workout => {
        typeStats[workout.type] = (typeStats[workout.type] || 0) + 1;
      });
      
      const totalWorkouts = workoutsWithDetails.length;
      const totalDuration = workoutsWithDetails.reduce((sum, w) => sum + w.duration, 0);
      const totalCalories = workoutsWithDetails.reduce((sum, w) => sum + w.calories, 0);
      const avgDuration = Math.round(totalDuration / totalWorkouts);
      const avgCalories = Math.round(totalCalories / totalWorkouts);
      
      // Export PDF
      if (format === 'pdf') {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        let y = 20;
        
        // Helper function for new page
        const addNewPage = () => {
          doc.addPage();
          y = 20;
        };
        
        // COVER PAGE - Simple and clean
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
        doc.text(`Utilisateur: ${user?.name || 'Athlète GRIMPE'}`, pageWidth / 2, 90, { align: 'center' });
        
        // Stats box - WHITE background for readability
        doc.setFillColor(255, 255, 255);
        doc.rect(30, 110, pageWidth - 60, 90, 'F');
        
        // Stats content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('STATISTIQUES PRINCIPALES', pageWidth / 2, 130, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.text(`📊 Total Entraînements: ${totalWorkouts} séances`, pageWidth / 2, 150, { align: 'center' });
        doc.text(`⏱️ Durée Totale: ${Math.round(totalDuration / 60)}h ${totalDuration % 60}min`, pageWidth / 2, 165, { align: 'center' });
        doc.text(`🔥 Calories Brûlées: ${totalCalories.toLocaleString()} cal`, pageWidth / 2, 180, { align: 'center' });
        doc.text(`📈 Moyenne par session: ${avgDuration}min - ${avgCalories} cal`, pageWidth / 2, 195, { align: 'center' });
        
        // Date and user info
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} pour ${user?.name || 'Utilisateur'}`, pageWidth / 2, 260, { align: 'center' });
        doc.setFontSize(9);
        doc.text(`${totalWorkouts} entraînements analysés • Données personnalisées`, pageWidth / 2, 275, { align: 'center' });
        
        // PAGE 2 - Analysis
        addNewPage();
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('ANALYSE DETAILLEE', 20, y);
        y += 20;
        
        // Performance section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance Globale', 20, y);
        y += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`${user?.name || 'Cet utilisateur'} a complete ${totalWorkouts} entrainements au total.`, 20, y);
        y += 8;
        doc.text(`Votre duree totale d'entrainement est de ${Math.round(totalDuration / 60)} heures et ${totalDuration % 60} minutes.`, 20, y);
        y += 8;
        doc.text(`Vous avez brule ${totalCalories.toLocaleString()} calories en tout.`, 20, y);
        y += 8;
        doc.text(`En moyenne, vos sessions durent ${avgDuration} minutes et brulent ${avgCalories} calories.`, 20, y);
        y += 8;
        
        // Exercise count highlight
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(255, 247, 237);
        doc.rect(20, y, pageWidth - 40, 15, 'F');
        doc.setTextColor(255, 107, 53);
        doc.text(`🏆 TOTAL: ${totalWorkouts} EXERCICES LOGGED DANS VOTRE PARCOURS FITNESS!`, 25, y + 10);
        doc.setTextColor(0, 0, 0);
        y += 20;
        
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
        
        y += 10;
        
        // Recent workouts section
        if (y > pageHeight - 80) {
          addNewPage();
        }
        
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
          .sort((a, b) => new Date(b.date) - new Date(a.date))
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
          doc.text(`${workout.duration}min`, 100, y);
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
        const userName = user?.name ? user.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Athlete_GRIMPE';
        const filename = `GRIMPE_${userName}_${totalWorkouts}exercices_${new Date().toISOString().slice(0, 10)}.pdf`;
        
        console.log('Saving PDF with filename:', filename);
        
        // Save the PDF file
        doc.save(filename);
        
        // Wait a moment to ensure file is saved before stopping loading animation
        setTimeout(() => {
          setPdfLoading(false);
          
          // Enhanced success notification
          addToast({
            title: '🎉 Rapport PDF téléchargé !',
            message: `Votre rapport fitness complet (${totalWorkouts} entraînements) a été généré et téléchargé avec succès. Fichier: ${filename}`,
            type: 'success',
            duration: 7000
          });
        }, 500); // Small delay to ensure file download starts
      }
      
    } catch (error) {
      console.error("Erreur d'exportation PDF:", error);
      setPdfLoading(false); // Ensure loading stops on error
      addToast({
        title: '❌ Erreur de génération',
        message: `Une erreur est survenue lors de la création du PDF: ${error.message}. Veuillez vérifier votre connexion et réessayer.`,
        type: 'error',
        duration: 5000
      });
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
            <span className={darkMode ? 'text-orange-400' : 'text-orange-600'}>📊 ANALYSEZ</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-red-400' : 'text-red-600'}>💪 PROGRESSEZ</span>
            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>•</span>
            <span className={darkMode ? 'text-green-400' : 'text-green-600'}>🚀 EXCELLEZ</span>
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
                <div className={`p-3 rounded-full ${
                  darkMode ? 'bg-slate-600 border border-orange-400/50' : 'bg-gradient-to-r from-orange-600 to-red-600'
                }`}>
                  <FaFilePdf className="text-white text-xl" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold transition-colors ${
                    darkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    📊 Exportation de Données
                  </h3>
                  <p className={`text-sm transition-colors ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Générez un rapport PDF détaillé avec vos entraînements et statistiques
                  </p>
                  <p className={`text-xs mt-1 transition-colors ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ✅ Analyses graphiques • Historique complet • Données personnalisées
                  </p>
                </div>
              </div>
              
              <div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => exportData('pdf')}
                  disabled={pdfLoading}
                  className={`${
                    darkMode 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400' 
                      : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
                  } text-white shadow-md transform hover:scale-105 transition-all duration-300 px-8 py-3 ${
                    pdfLoading ? 'opacity-75 cursor-not-allowed transform-none' : ''
                  }`}
                  title="Générer un rapport PDF complet de votre progression"
                >
                  {pdfLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Génération en cours...
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
                value: overview?.totalDuration || 0, 
                type: 'time', 
                unit: 'min', 
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
                  Répartition d'Entraînement
                </h3>
                <p className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Diversifiez pour l'excellence
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-slate-600 border border-purple-400/50' : 'bg-gradient-to-r from-purple-600 to-pink-600'
              }`}>
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="h-80 min-w-[320px] flex flex-col items-center justify-center">
              {loading ? (
                <Skeleton variant="rect" height="100%" width="100%" />
              ) : error ? (
                <div className="text-red-500 p-4 text-center">
                  <p className="font-semibold">⚠️ Graphique indisponible</p>
                  <p className="text-sm">{error}</p>
                </div>
              ) : workoutTypes.length === 0 ? (
                <div className={`text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className="mb-4">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <p className="font-semibold text-lg mb-2">Diversifiez Votre Entraînement</p>
                  <p className="text-sm">Mélangez différents types d'entraînement pour des résultats optimaux</p>
                  <div className={`mt-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                    darkMode 
                      ? 'bg-slate-600 border border-purple-400/50 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  }`}>
                    La Variété Forge la Force
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full w-full">
                  <ResponsiveContainer width="100%" height="65%">
                    <PieChart>
                      <Pie
                        data={workoutTypes.filter((_, i) => !hiddenPie.includes(i)).map(type => ({
                          ...type,
                          displayName: getTypeDisplayName(type.name)
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={30}
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
                        {workoutTypes.map((entry, index) =>
                          hiddenPie.includes(index) ? null : (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
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
                  
                  {/* Enhanced Legend with consistent spacing */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
                    {workoutTypes.map((type, i) => {
                      const isHidden = hiddenPie.includes(i);
                      return (
                        <button
                          key={type.name}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 text-xs ${
                            isHidden 
                              ? `opacity-40 scale-90 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}` 
                              : 'opacity-100 scale-100 hover:scale-105 shadow-sm'
                          }`}
                          style={{ 
                            backgroundColor: isHidden ? undefined : `${type.color}20`,
                            borderColor: type.color,
                            borderWidth: '1px'
                          }}
                          onClick={() => setHiddenPie(h => h.includes(i) ? h.filter(x => x !== i) : [...h, i])}
                          type="button"
                        >
                          <span 
                            className="inline-block w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="font-medium" style={{ color: type.color }}>
                            {type.displayName}
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