import React, { useState, useContext } from 'react';
import { ThemeContext, useToast } from '../App';
import Card from '../components/Card';
import Button from '../components/Button';
import { FaDumbbell } from 'react-icons/fa';
import { FaFire } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import { FaStarHalfAlt } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaBurn } from 'react-icons/fa';
import { FaHeartbeat } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';
import { workoutApi } from '../services/api';

const workoutTypes = [
  'entrainement', 'musculation', 'cardio', 'yoga', 'course', 'autre'
];

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

// Star Rating Component
const StarRating = ({ rating, onRatingChange, label, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className="flex flex-col gap-2">
      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} ({rating}/5)
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            onClick={() => !disabled && onRatingChange(star.toString())}
            className={`transition-all duration-200 ${disabled ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
          >
            <FaStar 
              className={`text-xl ${
                star <= (hoverRating || parseInt(rating)) 
                  ? 'text-yellow-400' 
                  : darkMode ? 'text-gray-600' : 'text-gray-300'
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>
    </div>
  );
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

// Enhanced Select Component
const EnhancedSelect = ({ 
  label, 
  icon, 
  children, 
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
      <select
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
            ? 'bg-slate-700/50 text-slate-200' 
            : 'bg-white text-gray-900'
          }
          focus:outline-none shadow-sm hover:shadow-md
          ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}
        `}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <FaTimes className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Textarea Component
const EnhancedTextarea = ({ 
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
      <textarea
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
          block w-full rounded-lg border transition-all duration-200 px-4 py-3 resize-none
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
        <p className="text-sm text-red-500 flex items-center gap-1">
          <FaTimes className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

function LogWorkout() {
  const { darkMode } = useContext(ThemeContext);
  const addToast = useToast();

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('3');
  const [enjoyment, setEnjoyment] = useState('3');
  const [notes, setNotes] = useState('');
  const [exerciseList, setExerciseList] = useState([]);
  const [currentExercise, setCurrentExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation state
  const [fieldErrors, setFieldErrors] = useState({});

  // Handlers
  const handleAddExercise = () => {
    if (!currentExercise.trim()) {
      setFieldErrors(prev => ({ ...prev, currentExercise: 'Le nom de l\'exercice est requis' }));
      return;
    }
    setExerciseList(list => [...list, { name: currentExercise.trim(), sets, reps, weight }]);
    setCurrentExercise(''); 
    setSets(''); 
    setReps(''); 
    setWeight('');
    setFieldErrors(prev => ({ ...prev, currentExercise: null }));
  };

  const removeExercise = index => {
    setExerciseList(list => list.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!date) errors.date = 'La date est requise';
    if (!duration) errors.duration = 'La durée est requise';
    if (!calories) errors.calories = 'Les calories sont requises';
    if (!type) errors.type = 'Le type d\'entraînement est requis';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e && e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs essentiels.');
      addToast({ 
        title: 'Erreur de validation', 
        message: 'Veuillez remplir tous les champs essentiels.', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const workoutData = {
      date,
      duration: parseInt(duration, 10),
      calories: parseInt(calories, 10),
      type,
      difficulty: parseInt(difficulty, 10),
      enjoyment: parseInt(enjoyment, 10),
      notes,
      exercises: exerciseList.map(ex => ({
        name: ex.name,
        sets: ex.sets ? parseInt(ex.sets, 10) : undefined,
        reps: ex.reps ? parseInt(ex.reps, 10) : undefined,
        weight: ex.weight ? parseFloat(ex.weight) : undefined,
      }))
    };

    try {
      const response = await workoutApi.createWorkout(workoutData);
      setLoading(false);
      if (response && response.data && response.data._id) {
        setSuccess('Entraînement enregistré avec succès !');
        addToast({ 
          title: 'Succès!', 
          message: 'Votre entraînement a été enregistré.', 
          type: 'success' 
        });
        
        // Reset form after successful submission
        setDate(new Date().toISOString().split('T')[0]);
        setDuration('');
        setCalories('');
        setType('');
        setDifficulty('3');
        setEnjoyment('3');
        setNotes('');
        setExerciseList([]);
        setFieldErrors({});
      } else {
        console.error("API response missing expected data:", response);
        setError('Erreur lors de l\'enregistrement. Réponse API inattendue.');
        addToast({ 
          title: 'Erreur Inattendue', 
          message: 'Réponse inattendue du serveur. Veuillez réessayer.', 
          type: 'error' 
        });
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue.';
      setError(`Erreur: ${errorMessage}`);
      addToast({ 
        title: 'Échec de l\'enregistrement', 
        message: errorMessage, 
        type: 'error' 
      });
      console.error("Failed to log workout:", err);
    }
  };

  const clearForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setDuration('');
    setCalories('');
    setType('');
    setDifficulty('3');
    setEnjoyment('3');
    setNotes('');
    setExerciseList([]);
    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 transition-colors ${
            darkMode 
              ? 'text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text' 
              : 'text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text'
          }`}>
            Nouvel Entraînement
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Enregistrez votre séance et suivez vos progrès
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Card */}
          <div className="lg:col-span-2">
            {loading ? (
              <Skeleton variant="rect" height="600px" className="w-full rounded-2xl" />
            ) : (
              <Card className={`p-8 shadow-2xl rounded-2xl backdrop-blur-sm ${darkMode ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-white'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                      <FaDumbbell className="text-white text-xl" />
                    </div>
                    Détails de l'Entraînement
                  </h2>
                  <Button
                    type="button"
                    onClick={clearForm}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    <FaTimes className="mr-2" />
                    Effacer
                  </Button>
                </div>

                {error && (
                  <div className={`mb-6 px-6 py-4 rounded-xl text-sm font-medium border-l-4 border-red-500 ${darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'} animate-pulse`}>
                    <div className="flex items-center gap-2">
                      <FaTimes className="text-red-500" />
                      {error}
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className={`mb-6 px-6 py-4 rounded-xl text-sm font-medium border-l-4 border-green-500 ${darkMode ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-green-50 text-green-700 border border-green-200'} animate-pulse`}>
                    <div className="flex items-center gap-2">
                      <FaFire className="text-green-500" />
                      {success}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <h3 className={`text-lg font-semibold pb-2 border-b ${darkMode ? 'text-slate-200 border-slate-600' : 'text-slate-700 border-slate-200'}`}>
                      Informations de Base
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <EnhancedInput
                        type="date"
                        id="date"
                        label="Date"
                        icon={<FaCalendarAlt />}
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        error={fieldErrors.date}
                        required
                      />
                      <EnhancedInput
                        type="number"
                        id="duration"
                        label="Durée"
                        icon={<FaClock />}
                        min="1"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="ex: 45 minutes"
                        error={fieldErrors.duration}
                        required
                      />
                      <EnhancedInput
                        type="number"
                        id="calories"
                        label="Calories brûlées"
                        icon={<FaBurn />}
                        min="0"
                        value={calories}
                        onChange={e => setCalories(e.target.value)}
                        placeholder="ex: 300 calories"
                        error={fieldErrors.calories}
                        required
                      />
                      <EnhancedSelect
                        id="type"
                        label="Type d'entraînement"
                        icon={<FaDumbbell />}
                        value={type}
                        onChange={e => setType(e.target.value)}
                        error={fieldErrors.type}
                        required
                      >
                        <option value="">Choisir un type...</option>
                        {workoutTypes.map(w => (
                          <option key={w} value={w}>
                            {w.charAt(0).toUpperCase() + w.slice(1)}
                          </option>
                        ))}
                      </EnhancedSelect>
                    </div>
                  </div>

                  {/* Ratings Section */}
                  <div className="space-y-6">
                    <h3 className={`text-lg font-semibold pb-2 border-b ${darkMode ? 'text-slate-200 border-slate-600' : 'text-slate-700 border-slate-200'}`}>
                      Évaluation de la Séance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${darkMode ? 'bg-slate-700/30 border-slate-600 hover:border-slate-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                        <StarRating
                          rating={difficulty}
                          onRatingChange={setDifficulty}
                          label="Difficulté"
                        />
                      </div>
                      <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${darkMode ? 'bg-slate-700/30 border-slate-600 hover:border-slate-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                        <StarRating
                          rating={enjoyment}
                          onRatingChange={setEnjoyment}
                          label="Plaisir ressenti"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold pb-2 border-b ${darkMode ? 'text-slate-200 border-slate-600' : 'text-slate-700 border-slate-200'}`}>
                      Notes Personnelles
                    </h3>
                    <EnhancedTextarea
                      id="notes"
                      label="Commentaires sur votre séance"
                      icon={<FaEdit />}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Comment s'est passée votre séance ? Notez vos ressentis, améliorations ou observations..."
                    />
                  </div>
                  
                  {/* Exercises Section */}
                  <div className="space-y-6">
                    <h3 className={`text-lg font-semibold pb-2 border-b ${darkMode ? 'text-slate-200 border-slate-600' : 'text-slate-700 border-slate-200'}`}>
                      Exercices Réalisés
                    </h3>
                    <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                        <div className="lg:col-span-5">
                          <EnhancedInput
                            type="text"
                            id="currentExercise"
                            label="Nom de l'exercice"
                            placeholder="Ex: Pompes, Squats, Tractions..."
                            value={currentExercise}
                            onChange={e => setCurrentExercise(e.target.value)}
                            error={fieldErrors.currentExercise}
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <EnhancedInput
                            type="number"
                            id="sets"
                            label="Séries"
                            min="1"
                            placeholder="3"
                            value={sets}
                            onChange={e => setSets(e.target.value)}
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <EnhancedInput
                            type="number"
                            id="reps"
                            label="Répétitions"
                            min="1"
                            placeholder="12"
                            value={reps}
                            onChange={e => setReps(e.target.value)}
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <EnhancedInput
                            type="number"
                            id="weight"
                            label="Poids (kg)"
                            min="0"
                            step="0.5"
                            placeholder="20"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                          />
                        </div>
                        <div className="lg:col-span-1 flex items-end">
                          <Button 
                            type="button" 
                            onClick={handleAddExercise} 
                            variant="primary"
                            size="md"
                            className="w-full h-12"
                          >
                            <FaPlus />
                          </Button>
                        </div>
                      </div>
                      
                      {exerciseList.length > 0 && (
                        <div className="space-y-3">
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Exercices ajoutés ({exerciseList.length})
                          </h4>
                          {exerciseList.map((ex, i) => (
                            <div 
                              key={i} 
                              className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${darkMode ? 'bg-slate-600/50 border-slate-500 hover:bg-slate-600/70' : 'bg-white border-slate-200 hover:shadow-md'}`}
                            >
                              <div className="flex-1">
                                <h5 className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                  {ex.name}
                                </h5>
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {ex.sets && `${ex.sets} séries`}
                                  {ex.reps && ` • ${ex.reps} répétitions`}
                                  {ex.weight && ` • ${ex.weight}kg`}
                                </p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeExercise(i)}
                                variant="danger"
                                size="sm"
                                className="shrink-0"
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      type="submit" 
                      loading={loading} 
                      variant="primary" 
                      size="lg"
                      fullWidth
                      className="text-lg font-bold"
                    >
                      <FaFire className="mr-2" />
                      {loading ? 'Enregistrement...' : 'Enregistrer l\'Entraînement'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>

          {/* Enhanced Summary Sidebar */}
          <div className="lg:col-span-1">
            {loading ? (
              <Skeleton variant="rect" height="400px" className="w-full rounded-2xl" />
            ) : (
              <div className="sticky top-8 space-y-6">
                <Card className={`p-6 shadow-2xl rounded-2xl backdrop-blur-sm ${darkMode ? 'bg-slate-800/90 border border-slate-700' : 'bg-white/90 border border-white'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                      <FaHeartbeat className="text-white text-lg" />
                    </div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      Aperçu de la Séance
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <FaCalendarAlt className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Date</span>
                      </div>
                      <p className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {date ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Non définie'}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <FaClock className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Durée</span>
                      </div>
                      <p className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {duration ? formatDuration(parseInt(duration)) : 'Non définie'}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <FaBurn className={`${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Calories</span>
                      </div>
                      <p className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {calories ? `${calories} cal` : 'Non définies'}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <FaDumbbell className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Type</span>
                      </div>
                      <p className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Non défini'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <div className="text-center">
                          <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-2`}>Difficulté</p>
                          <div className="flex justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar 
                                key={star}
                                className={`text-sm ${
                                  star <= parseInt(difficulty) 
                                    ? 'text-yellow-400' 
                                    : darkMode ? 'text-gray-600' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {difficulty}/5
                          </p>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <div className="text-center">
                          <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-2`}>Plaisir</p>
                          <div className="flex justify-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar 
                                key={star}
                                className={`text-sm ${
                                  star <= parseInt(enjoyment) 
                                    ? 'text-yellow-400' 
                                    : darkMode ? 'text-gray-600' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {enjoyment}/5
                          </p>
                        </div>
                      </div>
                    </div>

                    {exerciseList.length > 0 && (
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <FaDumbbell className={`${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                          <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Exercices ({exerciseList.length})
                          </span>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {exerciseList.map((ex, i) => (
                            <div key={i} className={`text-sm p-2 rounded ${darkMode ? 'bg-slate-600/50 text-slate-200' : 'bg-white text-slate-700'}`}>
                              <p className="font-medium">{ex.name}</p>
                              {(ex.sets || ex.reps || ex.weight) && (
                                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {ex.sets && `${ex.sets}s`}
                                  {ex.reps && ` • ${ex.reps}r`}
                                  {ex.weight && ` • ${ex.weight}kg`}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {notes && (
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <FaEdit className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                          <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Notes</span>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'} line-clamp-3`}>
                          {notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogWorkout;