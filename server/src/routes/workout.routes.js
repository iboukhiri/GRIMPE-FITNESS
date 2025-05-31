import express from 'express';
import { 
  getWorkouts, 
  getWorkoutById, 
  createWorkout, 
  updateWorkout, 
  deleteWorkout,
  getWorkoutStats,
  getStatsOverview,
  getStatsTrends,
  getStatsTypes,
  getStatsPerformance,
  getStatsRecords,
  getStatsGoals
} from '../controllers/workout.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Get all workouts and create new workout
router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

// Get workout statistics - IMPORTANT: These specific routes must come BEFORE the /:id route
router.get('/stats', getWorkoutStats);
router.get('/stats/overview', getStatsOverview);
router.get('/stats/trends', getStatsTrends);
router.get('/stats/types', getStatsTypes);
router.get('/stats/performance', getStatsPerformance);
router.get('/stats/records', getStatsRecords);
router.get('/stats/goals', getStatsGoals);

// Get, update, and delete workout by ID
// This comes AFTER the specific routes to prevent '/stats/*' being treated as an ID
router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

export default router; 