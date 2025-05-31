import express from 'express';
import { 
  register, 
  login, 
  verifyToken, 
  logout, 
  updateProfile, 
  updatePreferences 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/verify', authenticate, verifyToken);
router.post('/logout', authenticate, logout);
router.put('/profile', authenticate, updateProfile);
router.put('/preferences', authenticate, updatePreferences);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is running.',
    timestamp: new Date().toISOString()
  });
});

export default router; 