import React, { useState, useContext, useEffect } from 'react';
import { FaFilter, FaSearch, FaDumbbell } from 'react-icons/fa';
import { ThemeContext } from '../App';
import Button from './Button';
import Badge from './Badge';
import Modal from './Modal';
import { exerciseDatabase } from '../data/exercises';

function ExerciseBrowser({ isOpen, onClose, onSelectExercise }) {
  const { darkMode } = useContext(ThemeContext);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);

  // Filter exercises by category and search term
  const filterExercises = () => {
    let exercises = [];
    
    if (selectedCategory === 'all') {
      exercises = Object.values(exerciseDatabase).flatMap(category => category.exercises);
    } else {
      exercises = exerciseDatabase[selectedCategory]?.exercises || [];
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      exercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(term) || 
        ex.muscles.some(m => m.toLowerCase().includes(term)) ||
        ex.equipment.toLowerCase().includes(term)
      );
    }
    
    setFilteredExercises(exercises);
  };

  // Filter exercises when category or search term changes
  useEffect(() => {
    filterExercises();
  }, [selectedCategory, searchTerm]);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory('all');
      setSearchTerm('');
      filterExercises();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Parcourir les exercices"
      size="lg"
    >
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un exercice, muscle, ou équipement..."
              className={`w-full rounded-md pl-10 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500`}
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500`}
            >
              <option value="all">Toutes les catégories</option>
              {Object.entries(exerciseDatabase).map(([key, category]) => (
                <option key={key} value={key}>{category.category}</option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedCategory !== 'all' && (
          <div className="mb-3">
            <h3 className={`text-md font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {exerciseDatabase[selectedCategory]?.category || 'Category'}
            </h3>
          </div>
        )}
        
        <div className={`max-h-96 overflow-y-auto border rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {filteredExercises.length === 0 ? (
            <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucun exercice trouvé. Essayez une autre recherche.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExercises.map((exercise, index) => (
                <div 
                  key={index}
                  className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center`}
                  onClick={() => onSelectExercise(exercise)}
                >
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {exercise.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.muscles.slice(0, 3).map((muscle, i) => (
                        <Badge key={i} variant="info" size="xs">
                          {muscle}
                        </Badge>
                      ))}
                      <Badge variant="success" size="xs">
                        {exercise.equipment}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExercise(exercise);
                    }}
                  >
                    Sélectionner
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Fermer
        </Button>
      </div>
    </Modal>
  );
}

export default ExerciseBrowser;
