import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './database/connection.js';
import authRoutes from './routes/authRoutes.js';
import workoutRoutes from './routes/workout.routes.js';
import userRoutes from './routes/user.routes.js';
// import pdfRoutes from './routes/pdfRoutes.js'; // Temporarily disabled due to pdf-parse issue

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_HOSTS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Express middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for PDF uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Disabled rate limiting for development - causing too many 429 errors
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: { message: 'Too many requests, please try again later.' },
//   // Special rate limiting for PDF uploads
//   skip: (req, res) => {
//     return req.path.includes('/pdf/') && req.method === 'POST';
//   }
// }));

// PDF-specific rate limiting (temporarily disabled)
/*
app.use('/api/pdf', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 PDF uploads per hour
  message: { message: 'Limite de téléchargement PDF atteinte. Réessayez dans une heure.' }
}));
*/

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    features: ['auth', 'workouts'], // 'pdf-extraction' temporarily disabled
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/pdf', pdfRoutes); // Temporarily disabled

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API GRIMPE running on http://localhost:${PORT}`);
  console.log(`⚠️ PDF extraction temporarily disabled`);
}); 