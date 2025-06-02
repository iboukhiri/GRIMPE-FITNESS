import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getBodyMetrics,
  addBodyMetric,
  updateBodyMetric,
  deleteBodyMetric
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Goals routes
router.get('/goals', getUserGoals);
router.post('/goals', createGoal);
router.put('/goals/:goalId', updateGoal);
router.delete('/goals/:goalId', deleteGoal);

// Body metrics routes
router.get('/body-metrics', getBodyMetrics);
router.post('/body-metrics', addBodyMetric);
router.put('/body-metrics/:metricId', updateBodyMetric);
router.delete('/body-metrics/:metricId', deleteBodyMetric);

export default router; 