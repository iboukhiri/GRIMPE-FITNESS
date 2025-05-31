import React, { useState, useContext } from 'react';
import { ThemeContext, useToast } from '../App';
import Card from '../components/Card';
import Button from '../components/Button';
import { FaDumbbell, FaFire, FaPlus, FaTimes } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';

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

  const handleSubmit = e => {
    e && e.preventDefault();
    if (!date || !duration || !calories || !type) {
      setError('Veuillez remplir tous les champs essentiels');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Entraînement enregistré !');
      addToast({ title: 'Succès', message: 'Entraînement enregistré.', type: 'success' });
      setError('');
    }, 800);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} py-4 px-1`}>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Form Card */}
        <div className="col-span-2">
          {loading ? (
            <Skeleton variant="rect" height="400px" className="w-full mb-6" />
          ) : (
            <Card className="p-4 sm:p-6 md:p-8 w-full shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <FaDumbbell className="text-primary-500" /> Enregistrer un entraînement
              </h2>
              {error && <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-700 border border-red-300 text-sm">{error}</div>}
              {success && <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-700 border border-green-300 text-sm">{success}</div>}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Durée (min)</label>
                    <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. 45" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Calories</label>
                    <input type="number" min="0" value={calories} onChange={e => setCalories(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. 300" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Type d'entraînement</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
                      <option value="">Choisir...</option>
                      {workoutTypes.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Difficulté (1-5)</label>
                    <input type="number" min="1" max="5" value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Plaisir (1-5)</label>
                    <input type="number" min="1" max="5" value={enjoyment} onChange={e => setEnjoyment(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Exercices</label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input type="text" placeholder="Exercice" value={currentExercise} onChange={e => setCurrentExercise(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                    <input type="number" min="1" placeholder="Séries" value={sets} onChange={e => setSets(e.target.value)} className="w-full sm:w-20 rounded-lg border px-3 py-2 text-sm" />
                    <input type="number" min="1" placeholder="Répétitions" value={reps} onChange={e => setReps(e.target.value)} className="w-full sm:w-24 rounded-lg border px-3 py-2 text-sm" />
                    <input type="number" min="0" placeholder="Poids (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="w-full sm:w-28 rounded-lg border px-3 py-2 text-sm" />
                    <Button type="button" onClick={handleAddExercise} className="px-3 py-2 text-base"><FaPlus /></Button>
                  </div>
                  <div className="space-y-2">
                    {exerciseList.map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2">
                        <span className="flex-1 text-xs sm:text-sm">{ex.name} ({ex.sets}x{ex.reps}@{ex.weight}kg)</span>
                        <button type="button" onClick={() => removeExercise(i)} className="text-red-500 hover:text-red-700 text-lg sm:text-base"><FaTimes /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button type="submit" loading={loading} variant="primary" className="px-8 py-3 flex items-center gap-2 w-full sm:w-auto">
                    <FaFire /> Enregistrer
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
        {/* Summary Sidebar (desktop) or below (mobile) */}
        <div className="md:block w-full mt-6 md:mt-0 md:col-span-1">
          {loading ? (
            <Skeleton variant="rect" height="200px" className="w-full" />
          ) : (
            <Card className="p-4 sm:p-6 md:p-6 sticky top-8">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Résumé</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><strong>Date:</strong> {date}</li>
                <li><strong>Durée:</strong> {duration} min</li>
                <li><strong>Calories:</strong> {calories}</li>
                <li><strong>Type:</strong> {type}</li>
                <li><strong>Difficulté:</strong> {difficulty}/5</li>
                <li><strong>Plaisir:</strong> {enjoyment}/5</li>
                <li><strong>Notes:</strong> {notes || '-'}</li>
                <li><strong>Exercices:</strong> {exerciseList.length > 0 ? exerciseList.map(ex => ex.name).join(', ') : '-'}</li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogWorkout;