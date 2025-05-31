/**
 * GRIMPE - Demo Data Generator
 * 
 * This script creates comprehensive test data for the GRIMPE fitness application.
 * It generates 18+ months of realistic workout data with:
 * - 6 workout types (entrainement, musculation, cardio, yoga, course, autre)
 * - Seasonal patterns and progression over time
 * - Realistic metrics and performance data
 * - Demo user account: demo@grimpe.com / demo123
 * 
 * Usage: node createTestData.js
 * 
 * WARNING: This will clear existing data for the demo user!
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grimpe');
    console.log('✅ MongoDB Connected for test data creation');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate realistic workout data with extensive history
const generateTestWorkouts = (userId) => {
  // Use actual enum values from the schema
  const workoutTypes = ['entrainement', 'musculation', 'cardio', 'yoga', 'course', 'autre'];
  const workouts = [];
  
  // Start from 18 months ago for extensive history
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 540); // 18 months
  
  // Seasonal patterns and progression factors
  const getSeasonalFactor = (date) => {
    const month = date.getMonth();
    // Winter months (Dec, Jan, Feb) - lower activity
    if (month === 11 || month === 0 || month === 1) return 0.7;
    // Spring (Mar, Apr, May) - increasing activity
    if (month >= 2 && month <= 4) return 0.9;
    // Summer (Jun, Jul, Aug) - peak activity
    if (month >= 5 && month <= 7) return 1.3;
    // Fall (Sep, Oct, Nov) - moderate activity
    return 1.0;
  };

  const getMotivationCycle = (dayIndex) => {
    // Simulate motivation cycles (ups and downs)
    const cycle = Math.sin(dayIndex / 30) * 0.3 + 1; // Monthly motivation cycles
    const longTermProgress = 1 + (dayIndex / 540) * 0.5; // 50% improvement over 18 months
    return cycle * longTermProgress;
  };

  for (let i = 0; i < 540; i++) { // 18 months of data
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const seasonalFactor = getSeasonalFactor(currentDate);
    const motivationFactor = getMotivationCycle(i);
    
    // More complex skip logic based on real patterns
    let skipChance = 0.35; // Base 35% skip rate
    
    // Adjust skip chance based on day of week
    if (dayOfWeek === 1) skipChance += 0.15; // Monday blues
    if (isWeekend) skipChance -= 0.10; // More likely to workout on weekends
    if (dayOfWeek === 5) skipChance -= 0.05; // Friday motivation
    
    // Apply seasonal and motivation factors
    skipChance = skipChance / (seasonalFactor * motivationFactor);
    skipChance = Math.max(0.1, Math.min(0.8, skipChance)); // Clamp between 10-80%
    
    const shouldSkip = Math.random() < skipChance;
    if (shouldSkip) continue;
    
    // Determine number of workouts (more on weekends, holidays, etc.)
    let workoutsToday = 1;
    if (isWeekend && Math.random() < 0.25) workoutsToday = 2; // 25% chance of 2 workouts on weekends
    if (seasonalFactor > 1.2 && Math.random() < 0.15) workoutsToday = 2; // Summer double sessions
    
    for (let j = 0; j < workoutsToday; j++) {
      // Smart workout type selection based on patterns
      let workoutType;
      
      // Weekend preferences - more variety on weekends
      if (isWeekend) {
        const weekendTypes = ['entrainement', 'musculation', 'cardio', 'yoga', 'course'];
        workoutType = weekendTypes[Math.floor(Math.random() * weekendTypes.length)];
      } else {
        // Weekday preferences - more structured training
        workoutType = Math.random() < 0.4 ? 'entrainement' : workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
      }
      
      // Generate realistic data based on workout type and progression
      let duration, calories, difficulty;
      const progressionFactor = 1 + (i / 540) * 0.8; // 80% improvement over 18 months
      const variationFactor = 0.8 + Math.random() * 0.4; // ±20% daily variation
      
      switch (workoutType) {
        case 'entrainement':
          duration = Math.floor((Math.random() * 50 + 40) * progressionFactor * variationFactor); // 40-90 min
          calories = Math.floor(duration * ((Math.random() * 12 + 10) * progressionFactor)); // 10-22 cal/min
          difficulty = Math.min(5, Math.floor((Math.random() * 4 + 2) * Math.min(progressionFactor, 1.2))); // 2-5
          break;
        case 'musculation':
          duration = Math.floor((Math.random() * 60 + 45) * progressionFactor * variationFactor); // 45-105 min
          calories = Math.floor(duration * ((Math.random() * 8 + 8) * progressionFactor)); // 8-16 cal/min
          difficulty = Math.min(5, Math.floor((Math.random() * 2 + 3) * Math.min(progressionFactor, 1.4))); // 3-5
          break;
        case 'cardio':
          duration = Math.floor((Math.random() * 45 + 30) * progressionFactor * variationFactor); // 30-75 min
          calories = Math.floor(duration * ((Math.random() * 15 + 12) * progressionFactor)); // 12-27 cal/min (higher burn)
          difficulty = Math.min(5, Math.floor((Math.random() * 3 + 2) * Math.min(progressionFactor, 1.3))); // 2-5
          break;
        case 'yoga':
          duration = Math.floor((Math.random() * 30 + 45) * variationFactor); // 45-75 min, steady duration
          calories = Math.floor(duration * (Math.random() * 4 + 3)); // 3-7 cal/min (lower intensity)
          difficulty = Math.floor(Math.random() * 3 + 2); // 2-4, less variation
          break;
        case 'course':
          duration = Math.floor((Math.random() * 45 + 25) * progressionFactor * variationFactor); // 25-70 min
          calories = Math.floor(duration * ((Math.random() * 18 + 14) * progressionFactor)); // 14-32 cal/min (high burn)
          difficulty = Math.min(5, Math.floor((Math.random() * 3 + 2) * Math.min(progressionFactor, 1.3))); // 2-5
          break;
        case 'autre':
          duration = Math.floor((Math.random() * 40 + 30) * variationFactor); // 30-70 min, less progression
          calories = Math.floor(duration * (Math.random() * 6 + 6)); // 6-12 cal/min
          difficulty = Math.floor(Math.random() * 3 + 2); // 2-4, stable
          break;
        default:
          duration = Math.floor((Math.random() * 40 + 40) * progressionFactor);
          calories = Math.floor(duration * (Math.random() * 6 + 6));
          difficulty = Math.floor(Math.random() * 3 + 2);
      }
      
      // Add weekly/monthly variations and achievements
      const isPersonalRecord = Math.random() < 0.02; // 2% chance of PR
      if (isPersonalRecord) {
        duration = Math.floor(duration * 1.3);
        calories = Math.floor(calories * 1.2);
        if (difficulty < 5) difficulty = Math.min(5, difficulty + 1);
      }
      
      // Generate realistic notes, location, and metrics
      const notes = generateWorkoutNotes(workoutType, difficulty, isPersonalRecord, seasonalFactor);
      const location = generateLocation(workoutType, isWeekend);
      
      // Calculate success rate based on difficulty and experience
      const experienceLevel = i / 540; // 0 to 1 over time
      const baseSuccessRate = 60 + (experienceLevel * 25); // 60% to 85% over time
      const difficultyPenalty = (difficulty - 1) * 5; // Harder = lower success rate
      const successRate = Math.max(40, Math.min(95, baseSuccessRate - difficultyPenalty));
      
      // Generate fitness-specific metrics
      const totalSets = workoutType === 'musculation' ? 
        Math.floor(Math.random() * 15 + 8) + Math.floor(experienceLevel * 5) : 
        Math.floor(Math.random() * 8 + 4);
      
      let performanceMetric;
      if (workoutType === 'course') {
        const distance = Math.round((duration / 60) * (8 + experienceLevel * 4) * 100) / 100; // km
        performanceMetric = `${distance}km`;
      } else if (workoutType === 'musculation') {
        const maxWeight = Math.floor(40 + experienceLevel * 30 + difficulty * 5);
        performanceMetric = `${maxWeight}kg max`;
      } else if (workoutType === 'cardio') {
        const avgHR = Math.floor(140 + difficulty * 10 + Math.random() * 20);
        performanceMetric = `${avgHR} bpm avg`;
      }
      
      workouts.push({
        user: userId,
        type: workoutType,
        duration,
        difficulty,
        calories,
        date: new Date(currentDate),
        location,
        notes,
        enjoyment: Math.min(5, Math.floor(Math.random() * 2 + 3 + (isPersonalRecord ? 1 : 0))), // 3-5, higher for PRs
        metrics: {
          totalClimbs: totalSets, // Repurposed as total sets/exercises
          successRate: Math.round(successRate),
          maxGrade: performanceMetric // Repurposed as performance metric
        },
        createdAt: new Date(currentDate),
        updatedAt: new Date(currentDate)
      });
    }
  }
  
  console.log(`🎯 Generated ${workouts.length} workouts over ${Math.floor(540/30)} months`);
  return workouts;
};

// Enhanced workout notes with more variety and context
const generateWorkoutNotes = (type, difficulty, isPersonalRecord, seasonalFactor) => {
  const entrainementNotes = [
    "Séance complète très productive",
    "Excellent travail d'ensemble",
    "Préparation physique générale",
    "Training board productif",
    "Travail antagonistes",
    "Séance power endurance",
    "Focus gainage et stabilité",
    "Travail proprioception",
    "Renforcement préventif",
    "Conditionnement physique optimal",
    "Circuit training intensif",
    "Préparation fonctionnelle"
  ];
  
  const musculationNotes = [
    "Excellent travail sur les surplombs",
    "Progression sur la force",
    "Session productive, bons gains",
    "Travail sur les groupes majeurs",
    "Nouvelles techniques apprises",
    "Focus sur la progression",
    "Séance de power training intensive",
    "Progression sur les charges",
    "Excellent travail de coordination",
    "Dépassement de zone de confort",
    "Records personnels battus",
    "Musculation ciblée efficace"
  ];
  
  const cardioNotes = [
    "Séance cardio intensive",
    "Travail d'endurance payant", 
    "Excellente session cardiovasculaire",
    "Progression en endurance",
    "Gestion parfaite du rythme",
    "Conditionnement cardio optimal",
    "Travail de zone cardiaque",
    "Endurance renforcée",
    "Capacité pulmonaire améliorée",
    "Récupération plus rapide",
    "Seuil anaérobie travaillé",
    "Performance cardio excellente"
  ];
  
  const yogaNotes = [
    "Séance de récupération parfaite",
    "Travail de souplesse excellent",
    "Équilibre et centrage réussis",
    "Détente profonde atteinte",
    "Flexibilité en progression",
    "Méditation et mouvement harmonieux",
    "Postures maîtrisées",
    "Respiration contrôlée",
    "Stress évacué efficacement",
    "Corps et esprit alignés",
    "Relaxation profonde",
    "Conscience corporelle renforcée"
  ];
  
  const courseNotes = [
    "Excellent parcours de course",
    "Rythme soutenu maintenu",
    "Distance objectif atteinte",
    "Foulée fluide et efficace",
    "Endurance en progression",
    "Parcours nature apprécié",
    "Temps personnel amélioré",
    "Récupération optimisée",
    "Plaisir de courir intact",
    "Objectif kilométrage atteint",
    "Technique de course peaufinée",
    "Performance running excellente"
  ];
  
  const autreNotes = [
    "Activité complémentaire bénéfique",
    "Récupération active efficace",
    "Cross-training varié",
    "Bonne alternative à l'entraînement",
    "Maintien de la condition physique",
    "Travail cardiovasculaire",
    "Détente et récupération",
    "Exploration nouvelle activité",
    "Sortie nature ressourçante",
    "Activité en groupe motivante",
    "Découverte nouveau sport",
    "Pause entraînement nécessaire"
  ];
  
  let notesList;
  switch (type) {
    case 'entrainement': notesList = entrainementNotes; break;
    case 'musculation': notesList = musculationNotes; break;
    case 'cardio': notesList = cardioNotes; break;
    case 'yoga': notesList = yogaNotes; break;
    case 'course': notesList = courseNotes; break;
    case 'autre': notesList = autreNotes; break;
    default: notesList = entrainementNotes;
  }
  
  let note = notesList[Math.floor(Math.random() * notesList.length)];
  
  // Add contextual suffixes
  if (isPersonalRecord) {
    note += " - RECORD PERSONNEL! 🚀";
  } else if (difficulty >= 5) {
    note += " - Défi relevé! 💪";
  } else if (difficulty >= 4) {
    note += " - Très satisfait 👍";
  } else if (seasonalFactor > 1.2) {
    note += " - Parfait temps d'été ☀️";
  } else if (seasonalFactor < 0.8) {
    note += " - Motivation hivernale 🔥";
  }
  
  return note;
};

// Enhanced location generation with more variety
const generateLocation = (type, isWeekend) => {
  const locations = {
    'entrainement': {
      indoor: ['Salle de sport', 'Domicile', 'Gymnase municipal', 'Club fitness', 'Salle privée', 'Centre sportif'],
      outdoor: ['Parc municipal', 'Forêt', 'Parcours santé', 'Terrain de sport', 'Plage', 'Parcours outdoor']
    },
    'musculation': {
      indoor: ['Salle de musculation', 'Gym privé', 'Club fitness', 'Domicile équipé', 'Centre de remise en forme'],
      outdoor: ['Parcours musculation', 'Terrain de sport', 'Parc avec équipements', 'Calisthenics park']
    },
    'cardio': {
      indoor: ['Salle de cardio', 'Gym municipal', 'Club fitness', 'Piscine couverte', 'Domicile'],
      outdoor: ['Parc municipal', 'Piste cyclable', 'Stade', 'Bord de mer', 'Forêt', 'Parcours santé']
    },
    'yoga': {
      indoor: ['Studio de yoga', 'Domicile', 'Salle polyvalente', 'Centre wellness', 'Club de yoga'],
      outdoor: ['Parc tranquille', 'Plage', 'Jardin', 'Terrasse', 'Nature', 'Montagne']
    },
    'course': {
      indoor: ['Tapis de course', 'Piste couverte', 'Gym', 'Centre sportif couvert'],
      outdoor: ['Parc municipal', 'Forêt', 'Bord de mer', 'Piste d\'athlétisme', 'Sentiers nature', 'Ville']
    },
    'autre': {
      indoor: ['Centre sportif', 'Piscine', 'Dojo', 'Salle polyvalente', 'Club local'],
      outdoor: ['Nature', 'Montagne', 'Forêt', 'Parcours outdoor', 'Randonnée', 'VTT trail']
    }
  };
  
  const typeLocations = locations[type] || locations['autre'];
  
  // Weekend = more likely to be outdoor
  const useOutdoor = isWeekend ? Math.random() < 0.6 : Math.random() < 0.2;
  const locationSet = useOutdoor && typeLocations.outdoor ? typeLocations.outdoor : typeLocations.indoor;
  
  return locationSet[Math.floor(Math.random() * locationSet.length)];
};

// Calculate comprehensive statistics for the extensive test data
const calculateStats = async (userId) => {
  const workouts = await Workout.find({ user: userId }).sort({ date: -1 });
  
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  
  // Workout type analysis
  const workoutTypes = [...new Set(workouts.map(w => w.type))];
  const typeDistribution = workoutTypes.reduce((acc, type) => {
    acc[type] = workouts.filter(w => w.type === type).length;
    return acc;
  }, {});
  
  // Date range analysis
  const oldestDate = workouts[workouts.length - 1]?.date;
  const newestDate = workouts[0]?.date;
  const totalDays = Math.floor((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
  const activeMonths = Math.ceil(totalDays / 30);
  
  // Activity frequency analysis
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  const recentWorkouts = {
    week: workouts.filter(w => new Date(w.date) >= oneWeekAgo).length,
    month: workouts.filter(w => new Date(w.date) >= oneMonthAgo).length,
    quarter: workouts.filter(w => new Date(w.date) >= threeMonthsAgo).length
  };
  
  // Performance analytics
  const averageDuration = Math.round(totalDuration / totalWorkouts);
  const averageCalories = Math.round(totalCalories / totalWorkouts);
  const averageIntensity = Math.round((totalCalories / totalDuration) * 60); // calories per hour
  
  // Difficulty progression
  const difficultyProgression = {
    overall: workouts.reduce((sum, w) => sum + w.difficulty, 0) / totalWorkouts,
    recent: workouts.slice(0, 30).reduce((sum, w) => sum + w.difficulty, 0) / Math.min(30, workouts.length),
    early: workouts.slice(-30).reduce((sum, w) => sum + w.difficulty, 0) / Math.min(30, workouts.length)
  };
  
  // Personal records
  const records = {
    longestSession: Math.max(...workouts.map(w => w.duration)),
    highestCalories: Math.max(...workouts.map(w => w.calories)),
    highestDifficulty: Math.max(...workouts.map(w => w.difficulty)),
    bestSuccessRate: Math.max(...workouts.filter(w => w.metrics?.successRate).map(w => w.metrics.successRate))
  };
  
  // Consistency metrics
  const workoutFrequency = (totalWorkouts / activeMonths).toFixed(1);
  const monthlyCalories = Math.round(totalCalories / activeMonths);
  
  // Climbing grades analysis
  const climbingGrades = workouts
    .filter(w => w.metrics?.maxGrade)
    .map(w => w.metrics.maxGrade);
  const uniqueGrades = [...new Set(climbingGrades)];
  
  return {
    totalWorkouts,
    totalDuration,
    totalCalories,
    workoutTypes,
    typeDistribution,
    dateRange: {
      start: oldestDate?.toLocaleDateString('fr-FR'),
      end: newestDate?.toLocaleDateString('fr-FR'),
      totalDays,
      activeMonths
    },
    recentWorkouts,
    performance: {
      averageDuration,
      averageCalories,
      averageIntensity,
      workoutFrequency,
      monthlyCalories
    },
    progression: {
      difficultyProgression,
      improvement: Math.round(((difficultyProgression.recent - difficultyProgression.early) / difficultyProgression.early) * 100)
    },
    records,
    climbing: {
      uniqueGrades: uniqueGrades.length,
      gradesSample: uniqueGrades.slice(0, 5).join(', ')
    }
  };
};

// Enhanced test data creation with progress tracking
const createTestData = async () => {
  try {
    console.log('🔄 Starting EXTENSIVE test data creation...');
    console.log('📊 This will generate 18+ months of comprehensive workout data');
    console.log('⏱️  This may take a moment due to the large dataset...\n');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'demo@grimpe.com' });
    let testUser;
    
    if (existingUser) {
      console.log('📝 Test user already exists, updating...');
      testUser = existingUser;
      
      // Clear existing workouts for this user
      const deletedCount = await Workout.deleteMany({ user: existingUser._id });
      console.log(`🗑️ Cleared ${deletedCount.deletedCount} existing workouts`);
    } else {
      // Create test user
      testUser = new User({
        name: 'Alex Martin',
        email: 'demo@grimpe.com',
        username: 'alexgrimpe',
        password: 'demo123', // Let the User model handle the hashing
        createdAt: new Date(Date.now() - 540 * 24 * 60 * 60 * 1000), // 18 months ago
        updatedAt: new Date()
      });
      
      await testUser.save();
      console.log('✅ Test user created: demo@grimpe.com / demo123');
    }
    
    // Generate comprehensive workout data
    console.log('🏋️ Generating extensive workout dataset...');
    const startTime = Date.now();
    const workouts = generateTestWorkouts(testUser._id);
    
    // Insert workouts in optimized batches
    const batchSize = 100;
    for (let i = 0; i < workouts.length; i += batchSize) {
      const batch = workouts.slice(i, i + batchSize);
      await Workout.insertMany(batch);
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(workouts.length/batchSize)} (${batch.length} workouts)`);
    }
    
    // Add extra recent workouts for this week to showcase weekly goals
    console.log('\n➕ Ajout d\'entraînements récents pour la semaine courante...');
    const today = new Date();
    const thisWeekWorkouts = [
      {
        user: testUser._id,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: 'musculation',
        duration: 55,
        difficulty: 4,
        enjoyment: 5,
        calories: 420,
        location: 'Salle de musculation',
        notes: 'Excellent travail sur les groupes majeurs'
      },
      {
        user: testUser._id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        type: 'cardio',
        duration: 35,
        difficulty: 3,
        enjoyment: 4,
        calories: 380,
        location: 'Parc municipal',
        notes: 'Course matinale très agréable'
      },
      {
        user: testUser._id,
        date: new Date(today.getTime() - 0.5 * 24 * 60 * 60 * 1000), // Today (12 hours ago)
        type: 'entrainement',
        duration: 45,
        difficulty: 4,
        enjoyment: 5,
        calories: 350,
        location: 'Domicile',
        notes: 'Séance complète très productive'
      }
    ];
    
    await Workout.insertMany(thisWeekWorkouts);
    console.log(`✅ ${thisWeekWorkouts.length} entraînements récents ajoutés pour cette semaine`);
    
    // Calculate and display comprehensive statistics
    console.log('\n📊 Calculating comprehensive analytics...');
    const stats = await calculateStats(testUser._id);
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n📊 COMPREHENSIVE DATA SUMMARY:');
    console.log(`   👤 User: ${testUser.name} (${testUser.username})`);
    console.log(`   🏋️ Total Workouts: ${(stats.totalWorkouts + thisWeekWorkouts.length).toLocaleString()}`);
    console.log(`   📅 Time Span: ${stats.dateRange.activeMonths} months (${stats.dateRange.totalDays} days)`);
    console.log(`   ⏱️ Generation Time: ${generationTime}s`);
    console.log(`   🎯 Best Success Rate: ${stats.records.bestSuccessRate}%`);
    
    console.log('\n📈 PROGRESSION ANALYSIS:');
    console.log(`   📊 Average Difficulty: ${stats.progression.difficultyProgression.overall.toFixed(1)}/5`);
    console.log(`   🚀 Recent vs Early: ${stats.progression.improvement > 0 ? '+' : ''}${stats.progression.improvement}% improvement`);
    console.log('💡 Try the PDF export to see comprehensive 18-month analytics!');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('❌ Error creating extensive test data:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createTestData();
  
  console.log('\n⏳ Waiting 3 seconds before closing connection...');
  setTimeout(() => {
    mongoose.connection.close();
    console.log('👋 Database connection closed. Happy testing!');
    process.exit(0);
  }, 3000);
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Process interrupted');
  mongoose.connection.close();
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
}); 