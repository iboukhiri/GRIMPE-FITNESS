import Workout from '../models/Workout.js';
import User from '../models/User.js';

// Get all workouts for a user
export const getWorkouts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter = { user: userId };
    
    if (type) {
      filter.type = type;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const workouts = await Workout.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Workout.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: workouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get a single workout by ID
export const getWorkoutById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const workout = await Workout.findOne({ _id: id, user: userId });

    if (!workout) {
      return res.status(404).json({ 
        success: false, 
        message: 'Workout not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: workout 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create a new workout
export const createWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Add user ID to workout data
    const workoutData = {
      ...req.body,
      user: userId
    };

    const workout = new Workout(workoutData);
    const savedWorkout = await workout.save();

    res.status(201).json({ 
      success: true, 
      data: savedWorkout 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update a workout
export const updateWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const workout = await Workout.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ 
        success: false, 
        message: 'Workout not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: workout 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const workout = await Workout.findOneAndDelete({ _id: id, user: userId });

    if (!workout) {
      return res.status(404).json({ 
        success: false, 
        message: 'Workout not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Workout deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get workout statistics
export const getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    // Set date filter based on period
    switch (period) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        dateFilter = { $gte: weekStart };
        break;
      case 'month':
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        dateFilter = { $gte: monthStart };
        break;
      case 'year':
        const yearStart = new Date(now);
        yearStart.setFullYear(now.getFullYear() - 1);
        dateFilter = { $gte: yearStart };
        break;
      default:
        // No filter, all time
        break;
    }
    
    // Stats by type
    const statsByType = await Workout.aggregate([
      { $match: { user: userId, ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}) } },
      { $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDifficulty: { $avg: '$difficulty' },
          avgEnjoyment: { $avg: '$enjoyment' }
        }
      }
    ]);
    
    // Stats by day/month for charts
    const timeGrouping = period === 'week' || period === 'month' 
      ? { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
      : { $dateToString: { format: '%Y-%m', date: '$date' } };
    
    const statsByTime = await Workout.aggregate([
      { $match: { user: userId, ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}) } },
      { $group: {
          _id: timeGrouping,
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Overall stats
    const overallStats = await Workout.aggregate([
      { $match: { user: userId, ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}) } },
      { $group: {
          _id: null,
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          avgDifficulty: { $avg: '$difficulty' },
          avgEnjoyment: { $avg: '$enjoyment' }
        }
      }
    ]);
    
    const stats = {
      byType: statsByType,
      byTime: statsByTime,
      overall: overallStats.length > 0 ? overallStats[0] : {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        avgDifficulty: 0,
        avgEnjoyment: 0
      }
    };
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DYNAMIC STATS & CHART ENDPOINTS ---

// 1. Overview stats for dashboard cards
export const getStatsOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Aggregate overall stats
    const [agg] = await Workout.aggregate([
      { $match: { user: userId } },
      { $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: { $ifNull: ['$calories', 0] } },
        avgDuration: { $avg: '$duration' },
        avgDifficulty: { $avg: '$difficulty' },
        avgEnjoyment: { $avg: '$enjoyment' }
      }}
    ]);
    
    // Calculate weekly stats (current week)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const [weeklyAgg] = await Workout.aggregate([
      { 
        $match: { 
          user: userId,
          date: { $gte: startOfWeek }
        } 
      },
      { $group: {
        _id: null,
        weeklyWorkouts: { $sum: 1 },
        weeklyDuration: { $sum: '$duration' },
        weeklyCalories: { $sum: { $ifNull: ['$calories', 0] } }
      }}
    ]);
    
    // Streak calculation: count consecutive days with a workout
    const workouts = await Workout.find({ user: userId }).sort({ date: -1 });
    let streak = 0;
    let prev = null;
    for (const w of workouts) {
      const d = new Date(w.date);
      if (!prev) { streak = 1; prev = d; continue; }
      const diff = (prev - d) / (1000 * 60 * 60 * 24);
      if (diff <= 1.1) { streak++; prev = d; } else { break; }
    }
    
    // Favorite type
    const [fav] = await Workout.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    // Default weekly goals (in a real app, these would come from user preferences)
    const weeklyGoals = {
      weeklyGoal: 5, // target 5 workouts per week
      weeklyCalorieGoal: 2000, // target 2000 calories per week
      weeklyDurationGoal: 300 // target 300 minutes (5 hours) per week
    };
    
    res.json({
      totalWorkouts: agg?.totalWorkouts || 0,
      totalDuration: agg?.totalDuration || 0,
      totalCalories: agg?.totalCalories || 0,
      avgDuration: agg?.avgDuration || 0,
      avgDifficulty: agg?.avgDifficulty || 0,
      avgEnjoyment: agg?.avgEnjoyment || 0,
      streak,
      favoriteType: fav?._id || null,
      // Weekly data
      weeklyWorkouts: weeklyAgg?.weeklyWorkouts || 0,
      weeklyDuration: weeklyAgg?.weeklyDuration || 0,
      weeklyCalories: weeklyAgg?.weeklyCalories || 0,
      ...weeklyGoals
    });
  } catch (e) { 
    console.error('Error in getStatsOverview:', e);
    res.status(500).json({ message: e.message }); 
  }
};

// 2. Trends: workouts per day/week/month
export const getStatsTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month', startDate, endDate } = req.query;
    let groupFormat = '%Y-%m-%d';
    
    // Set group format based on period
    if (period === 'year') groupFormat = '%Y-%m';
    if (period === 'week' || period === '1week') groupFormat = '%Y-%m-%d';
    
    // Build match criteria
    const match = { user: userId };
    if (req.query.type) match.type = req.query.type;
    
    // Add date filtering based on period or explicit dates
    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (period) {
      const now = new Date();
      let from;
      
      // Handle different period formats
      switch (period) {
        case 'week':
        case '1week':
          from = new Date(now);
          from.setDate(now.getDate() - 7);
          break;
        case 'month':
        case '1month':
          from = new Date(now);
          from.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          from = new Date(now);
          from.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          from = new Date(now);
          from.setMonth(now.getMonth() - 6);
          break;
        case 'year':
        case '1year':
          from = new Date(now);
          from.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (from) {
        match.date = { $gte: from };
      }
    }
    
    // Group by date
    const data = await Workout.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: groupFormat, date: '$date' } },
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: { $ifNull: ['$calories', 0] } },
        avgDifficulty: { $avg: '$difficulty' },
        avgEnjoyment: { $avg: '$enjoyment' }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json(data);
  } catch (e) { 
    console.error('Error in getStatsTrends:', e);
    res.status(500).json({ message: e.message }); 
  }
};

// 3. Types: distribution by workout type
export const getStatsTypes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period, startDate, endDate } = req.query;
    const match = { user: userId };
    
    // Add date filtering based on period or explicit dates
    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (period) {
      const now = new Date();
      let from;
      
      // Handle different period formats
      switch (period) {
        case 'week':
        case '1week':
          from = new Date(now);
          from.setDate(now.getDate() - 7);
          break;
        case 'month':
        case '1month':
          from = new Date(now);
          from.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          from = new Date(now);
          from.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          from = new Date(now);
          from.setMonth(now.getMonth() - 6);
          break;
        case 'year':
        case '1year':
          from = new Date(now);
          from.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (from) {
        match.date = { $gte: from };
      }
    }
    
    const data = await Workout.aggregate([
      { $match: match },
      { $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        avgDifficulty: { $avg: '$difficulty' },
        avgEnjoyment: { $avg: '$enjoyment' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    res.json(data);
  } catch (e) { 
    console.error('Error in getStatsTypes:', e);
    res.status(500).json({ message: e.message }); 
  }
};

// 4. Performance trends (difficulty/enjoyment over time)
export const getStatsPerformance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query;
    let groupFormat = '%Y-%m-%d';
    if (period === 'year') groupFormat = '%Y-%m';
    if (period === 'week') groupFormat = '%Y-%m-%d';
    const match = { user: userId };
    if (req.query.type) match.type = req.query.type;
    const data = await Workout.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: groupFormat, date: '$date' } },
        avgDifficulty: { $avg: '$difficulty' },
        avgEnjoyment: { $avg: '$enjoyment' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// 5. Personal records (max reps, weight, duration, etc.)
export const getStatsRecords = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find max duration workout
    const maxDuration = await Workout.findOne({ user: userId }).sort({ duration: -1 });
    // Find max calories workout
    const maxCalories = await Workout.findOne({ user: userId }).sort({ calories: -1 });
    // Find max difficulty
    const maxDifficulty = await Workout.findOne({ user: userId }).sort({ difficulty: -1 });
    // Find max enjoyment
    const maxEnjoyment = await Workout.findOne({ user: userId }).sort({ enjoyment: -1 });
    // Find max reps/sets in exercises
    const workouts = await Workout.find({ user: userId });
    let maxReps = null, maxSets = null;
    workouts.forEach(w => {
      w.exercises?.forEach(e => {
        if (!maxReps || e.reps > maxReps.reps) maxReps = { ...e, workout: w._id, date: w.date };
        if (!maxSets || e.sets > maxSets.sets) maxSets = { ...e, workout: w._id, date: w.date };
      });
    });
    res.json({
      maxDuration,
      maxCalories,
      maxDifficulty,
      maxEnjoyment,
      maxReps,
      maxSets
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// 6. Goals (stub, for future use)
export const getStatsGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // For now, return some sample goals
    // In a real implementation, you'd fetch these from the database
    const defaultGoals = [
      {
        id: 1,
        type: 'workout_frequency',
        title: 'Fréquence d\'entraînement',
        target: 3,
        period: 'week',
        current: 2,
        unit: 'sessions',
        startDate: new Date().toISOString(),
        endDate: null,
        status: 'active'
      },
      {
        id: 2,
        type: 'duration',
        title: 'Durée d\'entraînement',
        target: 60,
        period: 'session',
        current: 45,
        unit: 'min',
        startDate: new Date().toISOString(),
        endDate: null,
        status: 'active'
      },
      {
        id: 3,
        type: 'calories',
        title: 'Calories brûlées',
        target: 1500,
        period: 'week',
        current: 1100,
        unit: 'cal',
        startDate: new Date().toISOString(),
        endDate: null,
        status: 'active'
      }
    ];
    
    res.json({ goals: defaultGoals });
  } catch (e) { 
    console.error('Error fetching goals:', e);
    res.status(500).json({ message: e.message }); 
  }
}; 