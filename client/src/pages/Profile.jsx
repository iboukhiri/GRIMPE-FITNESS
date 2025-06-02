import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext, useToast } from '../App';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { FaUser } from 'react-icons/fa';
import { FaBullseye } from 'react-icons/fa';
import { FaWeight } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa';
import { FaSave } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { FaFire } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';
import { FaDumbbell } from 'react-icons/fa';
import { FaChartLine } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';
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

// Enhanced Input Component
const EnhancedInput = ({ 
  label, 
  icon, 
  error, 
  className = '',
  required = false,
  ...props 
}) => {
  const { darkMode } = useContext(ThemeContext);
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={props.id} 
        className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            block w-full rounded-lg border transition-all duration-200 px-4 py-3
            ${isFocused 
              ? 'border-orange-500 ring-2 ring-orange-500/20 transform scale-[1.02]' 
              : darkMode 
                ? 'border-gray-600 hover:border-gray-500' 
                : 'border-gray-300 hover:border-gray-400'
            }
            ${darkMode 
              ? 'bg-slate-700/50 text-slate-200 placeholder-slate-400' 
              : 'bg-white text-gray-900 placeholder-gray-400'
            }
            focus:outline-none shadow-sm hover:shadow-md
            ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}
          `}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaTimes className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <FaTimes className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

function Profile() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, updateUser } = useAuth();
  const addToast = useToast();
  
  // Section states
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    height: user?.height || '',
    activityLevel: user?.activityLevel || 'moderate'
  });
  
  // Goals state
  const [goals, setGoals] = useState([
    { id: 1, type: 'workouts_per_week', title: 'Entraînements par semaine', target: 3, current: 0, unit: 'séances' },
    { id: 2, type: 'duration_per_session', title: 'Durée par séance', target: 60, current: 0, unit: 'min' },
    { id: 3, type: 'calories_per_week', title: 'Calories par semaine', target: 2000, current: 0, unit: 'cal' },
    { id: 4, type: 'weight_target', title: 'Poids cible', target: 70, current: 0, unit: 'kg' }
  ]);
  
  // Body metrics state
  const [bodyMetrics, setBodyMetrics] = useState([]);
  const [newMetric, setNewMetric] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    weightUnit: user?.preferences?.weightUnit || 'kg',
    heightUnit: user?.preferences?.heightUnit || 'cm',
    theme: darkMode ? 'dark' : 'light'
  });
  
  // Error states
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    fetchUserGoals();
    fetchBodyMetrics();
  }, []);
  
  // Sync preferences with user data
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        weightUnit: user.preferences.weightUnit || 'kg',
        heightUnit: user.preferences.heightUnit || 'cm',
        theme: darkMode ? 'dark' : 'light'
      });
    }
  }, [user, darkMode]);
  
  const fetchUserGoals = async () => {
    try {
      setLoading(true);
      const response = await workoutApi.getUserGoals();
      console.log('Goals API response:', response);
      
      if (response.goals && response.goals.length > 0) {
        // Map the real API goals to the expected format
        const mappedGoals = response.goals.map(goal => ({
          id: goal._id,
          type: goal.type,
          title: goal.title,
          target: goal.target,
          current: goal.current,
          unit: goal.unit,
          period: goal.period,
          status: goal.status
        }));
        setGoals(mappedGoals);
        console.log('Mapped goals:', mappedGoals);
      } else {
        // Keep default goals if no API goals exist
        console.log('No goals from API, keeping defaults');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      addToast({
        title: 'Erreur de chargement',
        message: 'Impossible de charger les objectifs',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBodyMetrics = async () => {
    try {
      setLoading(true);
      const response = await workoutApi.getBodyMetrics();
      console.log('Body metrics API response:', response);
      
      if (response.metrics && response.metrics.length > 0) {
        // Sort by date (most recent first)
        const sortedMetrics = response.metrics.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBodyMetrics(sortedMetrics);
        console.log('Loaded body metrics:', sortedMetrics.length);
      } else {
        console.log('No body metrics from API');
      }
    } catch (error) {
      console.error('Error fetching body metrics:', error);
      addToast({
        title: 'Erreur de chargement',
        message: 'Impossible de charger les mesures corporelles',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePersonalInfoSave = async () => {
    setSaving(true);
    setErrors({});
    
    try {
      // Validate required fields
      const newErrors = {};
      if (!personalInfo.name.trim()) newErrors.name = 'Le nom est requis';
      if (!personalInfo.email.trim()) newErrors.email = 'L\'email est requis';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSaving(false);
        return;
      }
      
      await updateUser(personalInfo);
      addToast({
        title: 'Profil mis à jour',
        message: 'Vos informations personnelles ont été sauvegardées',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Erreur',
        message: 'Impossible de sauvegarder le profil',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleGoalUpdate = async (goalId, newTarget) => {
    setSaving(true);
    try {
      // Use the MongoDB ObjectId if available, otherwise use the goalId as is
      const apiGoalId = typeof goalId === 'string' && goalId.length === 24 ? goalId : goalId;
      
      console.log('Updating goal:', apiGoalId, 'with target:', newTarget);
      await workoutApi.updateGoal(apiGoalId, { target: newTarget });
      
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, target: newTarget } : goal
      ));
      
      addToast({
        title: 'Objectif mis à jour',
        message: 'Votre objectif a été sauvegardé avec succès',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      addToast({
        title: 'Erreur',
        message: 'Impossible de sauvegarder l\'objectif: ' + error.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddBodyMetric = async () => {
    if (!newMetric.weight && !newMetric.bodyFat && !newMetric.muscleMass) {
      addToast({
        title: 'Données manquantes',
        message: 'Veuillez renseigner au moins une mesure',
        type: 'warning'
      });
      return;
    }
    
    setSaving(true);
    try {
      const metric = {
        date: newMetric.date,
        weight: newMetric.weight ? parseFloat(newMetric.weight) : null,
        bodyFat: newMetric.bodyFat ? parseFloat(newMetric.bodyFat) : null,
        muscleMass: newMetric.muscleMass ? parseFloat(newMetric.muscleMass) : null
      };
      
      await workoutApi.addBodyMetric(metric);
      setBodyMetrics(prev => [metric, ...prev]);
      setNewMetric({
        weight: '',
        bodyFat: '',
        muscleMass: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      addToast({
        title: 'Mesure ajoutée',
        message: 'Votre mesure corporelle a été enregistrée',
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Erreur',
        message: 'Impossible d\'enregistrer la mesure',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Helper functions for unit conversions
  const convertWeight = (weight, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'kg' && toUnit === 'lbs') return (weight * 2.205).toFixed(1);
    if (fromUnit === 'lbs' && toUnit === 'kg') return (weight / 2.205).toFixed(1);
    return weight;
  };

  const convertHeight = (height, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return height;
    if (fromUnit === 'cm' && toUnit === 'inches') return (height / 2.54).toFixed(1);
    if (fromUnit === 'inches' && toUnit === 'cm') return (height * 2.54).toFixed(1);
    return height;
  };

  const getWeightUnit = () => preferences.weightUnit;
  const getHeightUnit = () => preferences.heightUnit;
  
  const sections = [
    { id: 'personal', label: 'Informations Personnelles', icon: <FaUser /> },
    { id: 'goals', label: 'Objectifs', icon: <FaBullseye /> },
    { id: 'body', label: 'Mesures Corporelles', icon: <FaWeight /> },
    { id: 'preferences', label: 'Préférences', icon: <FaCog /> }
  ];
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 transition-colors ${
            darkMode 
              ? 'text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text' 
              : 'text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text'
          }`}>
            Mon Profil
          </h1>
          <p className={`text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto transition-colors ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Gérez vos informations personnelles, objectifs et préférences
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className={`p-6 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-orange-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Sections
              </h3>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? darkMode
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-orange-600 text-white shadow-md'
                        : darkMode
                          ? 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                          : 'text-slate-600 hover:bg-orange-50 hover:text-slate-800'
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'personal' && (
              <Card className={`p-8 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-orange-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Informations Personnelles
                  </h2>
                  <Button
                    onClick={handlePersonalInfoSave}
                    loading={saving}
                    variant="primary"
                    icon={<FaSave />}
                  >
                    Sauvegarder
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    id="name"
                    label="Nom complet"
                    icon={<FaUser />}
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                    error={errors.name}
                    required
                  />
                  
                  <EnhancedInput
                    id="email"
                    type="email"
                    label="Email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                    error={errors.email}
                    required
                  />
                  
                  <EnhancedInput
                    id="age"
                    type="number"
                    label="Âge"
                    min="10"
                    max="100"
                    value={personalInfo.age}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="ex: 25"
                  />
                  
                  <EnhancedInput
                    id="height"
                    type="number"
                    label={`Taille (${getHeightUnit()})`}
                    min={getHeightUnit() === 'cm' ? "100" : "39"}
                    max={getHeightUnit() === 'cm' ? "250" : "98"}
                    value={personalInfo.height}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, height: e.target.value }))}
                    placeholder={getHeightUnit() === 'cm' ? "ex: 175" : "ex: 69"}
                  />
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Niveau d'activité
                    </label>
                    <select
                      value={personalInfo.activityLevel}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, activityLevel: e.target.value }))}
                      className={`w-full rounded-lg border px-4 py-3 ${
                        darkMode 
                          ? 'bg-slate-700/50 text-slate-200 border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    >
                      <option value="sedentary">Sédentaire (peu ou pas d'exercice)</option>
                      <option value="light">Légèrement actif (exercice léger 1-3 jours/semaine)</option>
                      <option value="moderate">Modérément actif (exercice modéré 3-5 jours/semaine)</option>
                      <option value="active">Très actif (exercice intense 6-7 jours/semaine)</option>
                      <option value="extra">Extrêmement actif (exercice très intense, travail physique)</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}
            
            {activeSection === 'goals' && (
              <Card className={`p-8 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-orange-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Objectifs Fitness
                  </h2>
                  {loading && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Chargement...
                      </span>
                    </div>
                  )}
                </div>
                
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`p-6 rounded-xl border animate-pulse ${
                        darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                          <div className="space-y-2">
                            <div className={`h-4 w-32 rounded ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                            <div className={`h-3 w-24 rounded ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                          </div>
                        </div>
                        <div className={`h-10 rounded-lg ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="space-y-6">
                  {goals.map(goal => (
                    <div
                      key={goal.id}
                      className={`p-6 rounded-xl border transition-all duration-200 ${
                        darkMode ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            goal.type === 'workouts_per_week' ? 'bg-blue-500' :
                            goal.type === 'duration_per_session' ? 'bg-green-500' :
                            goal.type === 'calories_per_week' ? 'bg-red-500' : 'bg-purple-500'
                          }`}>
                            {goal.type === 'workouts_per_week' ? <FaDumbbell className="text-white" /> :
                             goal.type === 'duration_per_session' ? <FaClock className="text-white" /> :
                             goal.type === 'calories_per_week' ? <FaFire className="text-white" /> : <FaWeight className="text-white" />}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                              {goal.title}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              Actuel: <span className="font-medium text-orange-500">{goal.current}</span> {goal.unit}
                              {goal.target > 0 && (
                                <span className="ml-2">
                                  / Objectif: <span className="font-medium">{goal.target}</span> {goal.unit}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Objectif cible
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={goal.target}
                              onChange={(e) => setGoals(prev => prev.map(g => 
                                g.id === goal.id ? { ...g, target: parseFloat(e.target.value) || 0 } : g
                              ))}
                              className={`flex-1 rounded-lg border px-4 py-2 transition-colors ${
                                darkMode 
                                  ? 'bg-slate-700/50 text-slate-200 border-gray-600 focus:border-orange-500' 
                                  : 'bg-white text-gray-900 border-gray-300 focus:border-orange-500'
                              }`}
                              min="0"
                              step={goal.type === 'calories_per_week' ? '100' : '1'}
                            />
                            <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {goal.unit}
                            </span>
                            <Button
                              onClick={() => handleGoalUpdate(goal.id, goal.target)}
                              variant="primary"
                              size="sm"
                              icon={<FaSave />}
                              loading={saving}
                            >
                              Sauver
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Progression</span>
                          <span className={`font-semibold ${
                            goal.target > 0 && goal.current >= goal.target ? 'text-green-500' :
                            goal.target > 0 && goal.current >= goal.target * 0.8 ? 'text-orange-500' :
                            darkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0}%
                          </span>
                        </div>
                        <div className={`w-full bg-gray-200 rounded-full h-2.5 ${darkMode ? 'bg-gray-700' : ''}`}>
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              goal.target > 0 && goal.current >= goal.target ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              goal.target > 0 && goal.current >= goal.target * 0.8 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                              'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}
                            style={{ 
                              width: `${goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </Card>
            )}
            
            {activeSection === 'body' && (
              <Card className={`p-8 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-orange-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Mesures Corporelles
                  </h2>
                </div>
                
                {/* Add new metric form */}
                <div className={`p-6 rounded-xl border mb-8 ${
                  darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Ajouter une nouvelle mesure
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-1">
                      <EnhancedInput
                        id="date"
                        type="date"
                        label="Date"
                        icon={<FaCalendarAlt />}
                        value={newMetric.date}
                        onChange={(e) => setNewMetric(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    
                    <div className="lg:col-span-1">
                      <EnhancedInput
                        id="weight"
                        type="number"
                        label={`Poids (${getWeightUnit()})`}
                        icon={<FaWeight />}
                        step="0.1"
                        min={getWeightUnit() === 'kg' ? "30" : "66"}
                        max={getWeightUnit() === 'kg' ? "200" : "441"}
                        value={newMetric.weight}
                        onChange={(e) => setNewMetric(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder={getWeightUnit() === 'kg' ? "ex: 70.5" : "ex: 155.4"}
                      />
                    </div>
                    
                    <div className="lg:col-span-1">
                      <EnhancedInput
                        id="bodyFat"
                        type="number"
                        label="Masse grasse (%)"
                        icon={<FaFire />}
                        step="0.1"
                        min="5"
                        max="50"
                        value={newMetric.bodyFat}
                        onChange={(e) => setNewMetric(prev => ({ ...prev, bodyFat: e.target.value }))}
                        placeholder="ex: 15.2"
                      />
                    </div>
                    
                    <div className="lg:col-span-1">
                      <EnhancedInput
                        id="muscleMass"
                        type="number"
                        label="Masse musculaire (%)"
                        icon={<FaDumbbell />}
                        step="0.1"
                        min="20"
                        max="60"
                        value={newMetric.muscleMass}
                        onChange={(e) => setNewMetric(prev => ({ ...prev, muscleMass: e.target.value }))}
                        placeholder="ex: 45.2"
                      />
                    </div>
                    
                    <div className="lg:col-span-1 flex items-end">
                      <Button
                        onClick={handleAddBodyMetric}
                        loading={saving}
                        variant="primary"
                        fullWidth
                        icon={<FaPlus />}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Metrics history */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Historique des mesures
                  </h3>
                  
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`p-4 rounded-lg border animate-pulse ${
                          darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`h-4 w-20 rounded ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                              <div className="flex gap-6">
                                <div className={`h-4 w-16 rounded ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                                <div className={`h-4 w-16 rounded ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : bodyMetrics.length === 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <FaChartLine className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="font-medium">Aucune mesure enregistrée</p>
                      <p className="text-sm">Ajoutez votre première mesure pour commencer le suivi</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`text-sm mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {bodyMetrics.length} mesure(s) enregistrée(s)
                      </div>
                      {bodyMetrics.slice(0, 10).map((metric, index) => (
                        <div
                          key={metric._id || index}
                          className={`p-4 rounded-lg border transition-all duration-200 ${
                            darkMode ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                {new Date(metric.date).toLocaleDateString('fr-FR', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex gap-6">
                                {metric.weight && (
                                  <div className="flex items-center gap-1">
                                    <FaWeight className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                      {convertWeight(metric.weight, 'kg', getWeightUnit())}{getWeightUnit()}
                                    </span>
                                  </div>
                                )}
                                {metric.bodyFat && (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>MG:</span>
                                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                      {metric.bodyFat}%
                                    </span>
                                  </div>
                                )}
                                {metric.muscleMass && (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>MM:</span>
                                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                      {metric.muscleMass}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {metric.notes && (
                              <div className={`text-xs italic max-w-48 truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                "{metric.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {bodyMetrics.length > 10 && (
                        <div className={`text-center py-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <p className="text-sm">Et {bodyMetrics.length - 10} autres mesures...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {activeSection === 'preferences' && (
              <Card className={`p-8 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-orange-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Préférences de l'Application
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {/* Theme Section */}
                  <div className={`p-6 rounded-xl border ${
                    darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Apparence
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          Thème de l'interface
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Basculer entre le mode clair et sombre
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {darkMode ? '🌙 Sombre' : '☀️ Clair'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={darkMode}
                            onChange={() => {
                              toggleDarkMode();
                              setPreferences(prev => ({ ...prev, theme: !darkMode ? 'dark' : 'light' }));
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Units Section */}
                  <div className={`p-6 rounded-xl border ${
                    darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Unités de mesure
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Poids
                        </label>
                        <select 
                          value={preferences.weightUnit}
                          onChange={(e) => setPreferences(prev => ({ ...prev, weightUnit: e.target.value }))}
                          className={`w-full rounded-lg border px-4 py-2 ${
                            darkMode 
                              ? 'bg-slate-700/50 text-slate-200 border-gray-600' 
                              : 'bg-white text-gray-900 border-gray-300'
                          }`}
                        >
                          <option value="kg">Kilogrammes (kg)</option>
                          <option value="lbs">Livres (lbs)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Taille
                        </label>
                        <select 
                          value={preferences.heightUnit}
                          onChange={(e) => setPreferences(prev => ({ ...prev, heightUnit: e.target.value }))}
                          className={`w-full rounded-lg border px-4 py-2 ${
                            darkMode 
                              ? 'bg-slate-700/50 text-slate-200 border-gray-600' 
                              : 'bg-white text-gray-900 border-gray-300'
                          }`}
                        >
                          <option value="cm">Centimètres (cm)</option>
                          <option value="inches">Pouces (inches)</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Save preferences button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={async () => {
                          setSaving(true);
                          try {
                            await updateUser({ 
                              preferences: {
                                ...user?.preferences,
                                weightUnit: preferences.weightUnit,
                                heightUnit: preferences.heightUnit,
                                darkMode: darkMode
                              }
                            });
                            addToast({
                              title: 'Préférences sauvegardées',
                              message: 'Vos préférences d\'unités ont été mises à jour',
                              type: 'success'
                            });
                          } catch (error) {
                            addToast({
                              title: 'Erreur',
                              message: 'Impossible de sauvegarder les préférences',
                              type: 'error'
                            });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        variant="primary"
                        size="sm"
                      >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 