import React, { useState, useContext } from 'react';
import { ThemeContext, useToast } from '../App';
import Card from '../components/Card';
import Button from '../components/Button';
import { FaDumbbell, FaFire, FaPlus, FaTimes } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';
import { workoutApi } from '../services/api';

const workoutTypes = [
  'entrainement', 'musculation', 'cardio', 'yoga', 'course', 'autre'
];

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

  // Handlers
  const handleAddExercise = () => {
    if (!currentExercise) return;
    setExerciseList(list => [...list, { name: currentExercise, sets, reps, weight }]);
    setCurrentExercise(''); setSets(''); setReps(''); setWeight('');
  };

  const removeExercise = index => {
    setExerciseList(list => list.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e && e.preventDefault();
    if (!date || !duration || !calories || !type) {
      if (typeof setError === 'function') setError('Veuillez remplir tous les champs essentiels: Date, Durée, Calories et Type.');
      if (typeof addToast === 'function') {
        addToast({ title: 'Erreur de validation', message: 'Veuillez remplir tous les champs essentiels: Date, Durée, Calories et Type.', type: 'error' });
      }
      return;
    }
    setLoading(true);
    if (typeof setError === 'function') setError('');
    if (typeof setSuccess === 'function') setSuccess('');

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
        if (typeof setSuccess === 'function') setSuccess('Entraînement enregistré avec succès !');
        if (typeof addToast === 'function') {
          addToast({ title: 'Succès!', message: 'Votre entraînement a été enregistré.', type: 'success' });
        }
      } else {
        console.error("API response missing expected data:", response);
        if (typeof setError === 'function') setError('Erreur lors de l\'enregistrement. Réponse API inattendue.');
        if (typeof addToast === 'function') {
          addToast({ title: 'Erreur Inattendue', message: 'Réponse inattendue du serveur. Veuillez réessayer.', type: 'error' });
        }
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue.';
      if (typeof setError === 'function') setError(`Erreur: ${errorMessage}`);
      if (typeof addToast === 'function') {
        addToast({ title: 'Échec de l\'enregistrement', message: errorMessage, type: 'error' });
      }
      console.error("Failed to log workout:", err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Form Card */}
        <div className="md:col-span-2">
          {loading ? (
            <Skeleton variant="rect" height="400px" className="w-full mb-6" />
          ) : (
            <Card className={`p-6 sm:p-8 w-full shadow-xl rounded-xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <h2 className={`text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 flex items-center gap-3 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                <FaDumbbell className={`${darkMode ? 'text-orange-400' : 'text-orange-600'} text-3xl`} /> Enregistrer un Nouvel Entraînement
              </h2>
              {error && (
                <div className={`mb-4 px-4 py-3 rounded-md text-sm font-medium ${darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  {error}
                </div>
              )}
              {success && (
                <div className={`mb-4 px-4 py-3 rounded-md text-sm font-medium ${darkMode ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-50 text-gray-900'}`} />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durée (min)</label>
                    <input type="number" id="duration" min="1" value={duration} onChange={e => setDuration(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400' : 'bg-slate-50 text-gray-900 placeholder-gray-400'}`} placeholder="ex: 45" />
                  </div>
                  <div>
                    <label htmlFor="calories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories</label>
                    <input type="number" id="calories" min="0" value={calories} onChange={e => setCalories(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400' : 'bg-slate-50 text-gray-900 placeholder-gray-400'}`} placeholder="ex: 300" />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'entraînement</label>
                    <select id="type" value={type} onChange={e => setType(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-50 text-gray-900'}`}>
                      <option value="">Choisir un type...</option>
                      {workoutTypes.map(w => <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulté (1-5)</label>
                    <input type="number" id="difficulty" min="1" max="5" value={difficulty} onChange={e => setDifficulty(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-50 text-gray-900'}`} />
                  </div>
                  <div>
                    <label htmlFor="enjoyment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plaisir (1-5)</label>
                    <input type="number" id="enjoyment" min="1" max="5" value={enjoyment} onChange={e => setEnjoyment(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-50 text-gray-900'}`} />
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optionnel)</label>
                  <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400' : 'bg-slate-50 text-gray-900 placeholder-gray-400'}`} placeholder="Ajoutez des détails sur votre séance..." />
                </div>
                
                {/* Exercises Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exercices</label>
                  <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-3 mb-3">
                    {/* Exercise Name Input - takes up more space */}
                    <div className="md:col-span-5">
                      <label htmlFor="currentExercise" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'exercice</label>
                      <input type="text" id="currentExercise" placeholder="Ex: Pompes" value={currentExercise} onChange={e => setCurrentExercise(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400' : 'bg-slate-50 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                    {/* Sets Input */}
                    <div className="md:col-span-2">
                      <label htmlFor="sets" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Séries</label>
                      <input type="number" id="sets" min="1" placeholder="Ex: 3" value={sets} onChange={e => setSets(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400' : 'bg-slate-50 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                    {/* Reps Input */}
                    <div className="md:col-span-2">
                      <label htmlFor="reps" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reps</label>
                      <input type="number" id="reps" min="1" placeholder="Ex: 10" value={reps} onChange={e => setReps(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400' : 'bg-slate-50 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                    {/* Weight Input */}
                    <div className="md:col-span-2">
                      <label htmlFor="weight" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Poids (kg)</label>
                      <input type="number" id="weight" min="0" placeholder="Ex: 20" value={weight} onChange={e => setWeight(e.target.value)} className={`block w-full rounded-md border-slate-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400' : 'bg-slate-50 text-gray-900 placeholder-gray-400'}`} />
                    </div>
                    {/* Add Button */}
                    <div className="md:col-span-1 flex items-end">
                      <Button 
                        type="button" 
                        onClick={handleAddExercise} 
                        variant="secondary"
                        className={`w-full px-4 py-2 text-sm ${darkMode ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'} rounded-md flex items-center justify-center`}>
                        <FaPlus />
                        <span className="sr-only md:not-sr-only md:ml-2">Ajouter</span>
                      </Button>
                    </div>
                  </div>
                  {exerciseList.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {exerciseList.map((ex, i) => (
                        <div key={i} className={`flex items-center justify-between gap-3 p-3 rounded-md border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}> {/* Enhanced list item styling */}
                          <div className="flex-1">
                            <span className={`font-medium ${darkMode? 'text-slate-200' : 'text-slate-700'}`}>{ex.name}</span>
                            <span className={`block text-xs ${darkMode? 'text-slate-400' : 'text-slate-500'}`}>
                              {ex.sets && `${ex.sets} séries`}{ex.reps && `, ${ex.reps} reps`}{ex.weight && ` @ ${ex.weight}kg`}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeExercise(i)} 
                            className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-100'}`}
                            aria-label="Supprimer exercice"
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700"> {/* Added border-top and padding */}
                  <Button 
                    type="submit" 
                    loading={loading} 
                    variant="primary" 
                    className={`px-8 py-3 flex items-center justify-center gap-2 w-full sm:w-auto text-base font-semibold rounded-lg shadow-md transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'} text-white transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'focus:ring-orange-400' : 'focus:ring-orange-600'}`}>
                    <FaFire /> Enregistrer l'Entraînement
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
        {/* Summary Sidebar */}
        <div className="md:col-span-1 w-full mt-8 md:mt-0">
          {loading ? (
            <Skeleton variant="rect" height="300px" className="w-full rounded-xl" />
          ) : (
            <Card className={`p-6 shadow-xl rounded-xl sticky top-8 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}> {/* Enhanced Card styling */}
              <h3 className={`text-xl font-semibold mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Résumé de la Séance</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Date: </span>
                  <span className={`${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{date ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
                </li>
                <li>
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Durée: </span>
                  <span className={`${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{duration ? `${duration} min` : '-'}</span>
                </li>
                <li>
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Calories: </span>
                  <span className={`${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{calories ? `${calories} cal` : '-'}</span>
                </li>
                <li>
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Type: </span>
                  <span className={`${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{type ? type.charAt(0).toUpperCase() + type.slice(1) : '-'}</span>
                </li>
                <li>
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Difficulté: </span>
                  <span className={`${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{difficulty ? `${difficulty}/5` : '-'}</span>
                </li>
                <li>
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Plaisir: </span>
                  <span className={`${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{enjoyment ? `${enjoyment}/5` : '-'}</span>
                </li>
                <li className="flex flex-col">
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Notes: </span>
                  <span className={`mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'} whitespace-pre-wrap`}>{notes || '-'}</span>
                </li>
                {exerciseList.length > 0 && (
                  <li className="flex flex-col pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className={`font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Exercices ({exerciseList.length}):</span>
                    <ul className="space-y-1 pl-2">
                      {exerciseList.map((ex, i) => (
                        <li key={i} className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {ex.name}
                          {ex.sets || ex.reps || ex.weight ? 
                            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}> ({ex.sets && `${ex.sets}s`}{ex.reps && ` ${ex.reps}r`}{ex.weight && ` @${ex.weight}kg`})</span> : ''}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogWorkout;