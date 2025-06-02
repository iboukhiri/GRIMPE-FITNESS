import { FaSortAlphaDown } from 'react-icons/fa';
import { FaSortNumericDown } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { FaArrowsAlt } from 'react-icons/fa';
import { FaFilter } from 'react-icons/fa';
import { FaTh } from 'react-icons/fa';
import { FaList } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import React, { useState, useContext } from 'react';
import Skeleton from './Skeleton';

/**
 * ExerciseList
 * A sortable, filterable, and visually appealing list of exercises.
 * Props:
 *  - exercises: array of exercise objects { name, sets, reps, weight, category, difficulty, favorite }
 *  - onRemove: function(index) to remove an exercise
 *  - onSort: function(newList) to update the order
 *  - onToggleFavorite: function(index) to toggle favorite status
 *  - darkMode: boolean for theme
 *  - loading: boolean to show skeletons
 */
export default function ExerciseList({ exercises, onRemove, onSort, onToggleFavorite, darkMode, loading = false }) {
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Extract unique categories from exercises
  const categories = ['all', ...new Set(exercises.map(ex => ex.category || 'uncategorized'))];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredExercises = [...exercises]
    .filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()))
    .filter(ex => categoryFilter === 'all' || ex.category === categoryFilter)
    .filter(ex => difficultyFilter === 'all' || ex.difficulty === difficultyFilter)
    .filter(ex => !showFavoritesOnly || ex.favorite);

  const sortedExercises = [...filteredExercises]
    .sort((a, b) => {
      let valA = a[sortKey] || '';
      let valB = b[sortKey] || '';
      
      if (sortKey === 'name' || sortKey === 'category') {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      } else {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = key => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const toggleFavorite = (index) => {
    if (onToggleFavorite) {
      onToggleFavorite(index);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rect" height="48px" className="w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-x-auto">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Rechercher un exercice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className={`flex rounded-md overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' 
                ? 'bg-primary-500 text-white' 
                : darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' 
                ? 'bg-primary-500 text-white' 
                : darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              <FaTh />
            </button>
          </div>
          
          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-2 rounded ${showFavoritesOnly 
              ? 'bg-yellow-500 text-white' 
              : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}`}
            title="Afficher les favoris"
          >
            <FaStar />
          </button>
          
          {/* Filter Button (for mobile) */}
          <button 
            className={`sm:hidden p-2 rounded ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
            title="Filtres"
            onClick={() => {
              // Mobile filter toggle could be implemented here
              // For now we'll just show the filters inline
            }}
          >
            <FaFilter />
          </button>
        </div>
      </div>
      
      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Category Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={`w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Toutes les catégories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Difficulty Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className={`w-full rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff === 'all' 
                  ? 'Toutes les difficultés'
                  : diff === 'easy' ? 'Facile'
                  : diff === 'medium' ? 'Intermédiaire' 
                  : 'Difficile'}
              </option>
            ))}
          </select>
        </div>
        
        {/* Sort Options */}
        <div className="flex gap-1 ml-auto">
          <button 
            title="Trier par nom" 
            onClick={() => handleSort('name')} 
            className={`p-2 rounded ${sortKey === 'name' 
              ? 'bg-primary-500 text-white' 
              : `hover:bg-primary-100 ${darkMode ? 'dark:hover:bg-gray-700' : ''}`}`}
          >
            <FaSortAlphaDown className={sortKey === 'name' && sortOrder === 'desc' ? 'transform rotate-180' : ''} />
          </button>
          <button 
            title="Trier par catégorie" 
            onClick={() => handleSort('category')} 
            className={`p-2 rounded ${sortKey === 'category' 
              ? 'bg-primary-500 text-white' 
              : `hover:bg-primary-100 ${darkMode ? 'dark:hover:bg-gray-700' : ''}`}`}
          >
            <FaSortAlphaDown className={sortKey === 'category' && sortOrder === 'desc' ? 'transform rotate-180' : ''} />
          </button>
          <button 
            title="Trier par séries" 
            onClick={() => handleSort('sets')} 
            className={`p-2 rounded ${sortKey === 'sets' 
              ? 'bg-primary-500 text-white' 
              : `hover:bg-primary-100 ${darkMode ? 'dark:hover:bg-gray-700' : ''}`}`}
          >
            <FaSortNumericDown className={sortKey === 'sets' && sortOrder === 'desc' ? 'transform rotate-180' : ''} />
          </button>
          <button 
            title="Trier par répétitions" 
            onClick={() => handleSort('reps')} 
            className={`p-2 rounded ${sortKey === 'reps' 
              ? 'bg-primary-500 text-white' 
              : `hover:bg-primary-100 ${darkMode ? 'dark:hover:bg-gray-700' : ''}`}`}
          >
            <FaSortNumericDown className={sortKey === 'reps' && sortOrder === 'desc' ? 'transform rotate-180' : ''} />
          </button>
          <button 
            title="Trier par poids" 
            onClick={() => handleSort('weight')} 
            className={`p-2 rounded ${sortKey === 'weight' 
              ? 'bg-primary-500 text-white' 
              : `hover:bg-primary-100 ${darkMode ? 'dark:hover:bg-gray-700' : ''}`}`}
          >
            <FaSortNumericDown className={sortKey === 'weight' && sortOrder === 'desc' ? 'transform rotate-180' : ''} />
          </button>
          <button 
            title="Trier par difficulté" 
            onClick={() => handleSort('difficulty')} 
            className={`p-2 rounded ${sortKey === 'difficulty' 
              ? 'bg-primary-500 text-white' 
              : `hover:bg-primary-100 ${darkMode ? 'dark:hover:bg-gray-700' : ''}`}`}
          >
            <FaSortNumericDown className={sortKey === 'difficulty' && sortOrder === 'desc' ? 'transform rotate-180' : ''} />
          </button>
        </div>
      </div>
      
      {/* Results Count */}
      <div className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {sortedExercises.length} exercice{sortedExercises.length !== 1 ? 's' : ''} trouvé{sortedExercises.length !== 1 ? 's' : ''}
      </div>
      
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Exercice</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Catégorie</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Difficulté</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Séries</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Reps</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Poids (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {sortedExercises.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-400">Aucun exercice</td>
                </tr>
              ) : (
                sortedExercises.map((exercise, index) => (
                  <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                    <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{exercise.name}</td>
                    <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {exercise.category ? exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1) : 'N/A'}
                    </td>
                    <td className={`px-4 py-3 text-sm text-center`}>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        exercise.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exercise.difficulty === 'easy' ? 'Facile' :
                         exercise.difficulty === 'medium' ? 'Intermédiaire' :
                         exercise.difficulty === 'hard' ? 'Difficile' : 'N/A'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{exercise.sets}</td>
                    <td className={`px-4 py-3 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{exercise.reps}</td>
                    <td className={`px-4 py-3 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{exercise.weight}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleFavorite(index)}
                          className={`text-sm ${exercise.favorite ? 'text-yellow-500' : darkMode ? 'text-gray-400 hover:text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                          title={exercise.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <FaStar />
                        </button>
                        <button
                          onClick={() => onRemove(index)}
                          className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                          title="Supprimer"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedExercises.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">Aucun exercice</div>
          ) : (
            sortedExercises.map((exercise, index) => (
              <div 
                key={index} 
                className={`rounded-lg border p-4 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{exercise.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleFavorite(index)}
                      className={`text-sm ${exercise.favorite ? 'text-yellow-500' : darkMode ? 'text-gray-400 hover:text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                    >
                      <FaStar />
                    </button>
                    <button
                      onClick={() => onRemove(index)}
                      className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                    exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    exercise.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exercise.difficulty === 'easy' ? 'Facile' :
                     exercise.difficulty === 'medium' ? 'Intermédiaire' :
                     exercise.difficulty === 'hard' ? 'Difficile' : 'N/A'}
                  </span>
                  
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exercise.category ? exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1) : 'Non catégorisé'}
                  </span>
                </div>
                
                <div className={`grid grid-cols-3 gap-2 text-center py-2 rounded-md ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                  <div>
                    <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Séries</div>
                    <div className="font-medium">{exercise.sets}</div>
                  </div>
                  <div>
                    <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reps</div>
                    <div className="font-medium">{exercise.reps}</div>
                  </div>
                  <div>
                    <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Poids</div>
                    <div className="font-medium">{exercise.weight} kg</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
