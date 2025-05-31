import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import pdfExtractionService from '../services/pdfExtractionService.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/pdfs');
    await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and user ID
    const timestamp = Date.now();
    const userId = req.user?.id || 'anonymous';
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${userId}_${sanitizedName}`);
  }
});

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1 // Only one file at a time
  }
});

/**
 * Upload and extract data from PDF
 */
export const uploadAndExtractPDF = async (req, res) => {
  try {
    // Handle file upload
    upload.single('pdf')(req, res, async (uploadError) => {
      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: `Erreur d'upload: ${uploadError.message}`
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier PDF n\'a été fourni.'
        });
      }

      const filePath = req.file.path;

      try {
        // Extract data from PDF
        const extractionResult = await pdfExtractionService.extractDataFromPDF(filePath, {
          userId: req.user?.id,
          preserveOriginal: true
        });

        if (!extractionResult.success) {
          // Clean up uploaded file on extraction failure
          await fs.unlink(filePath).catch(() => {});
          
          return res.status(422).json({
            success: false,
            message: 'Échec de l\'extraction des données du PDF.',
            error: extractionResult.error
          });
        }

        // Save extraction results to database if user is authenticated
        let savedWorkouts = [];
        let savedMetrics = [];
        
        if (req.user && extractionResult.data.workouts.length > 0) {
          try {
            const saveResult = await saveExtractedData(req.user.id, extractionResult.data);
            savedWorkouts = saveResult.workouts;
            savedMetrics = saveResult.metrics;
          } catch (saveError) {
            console.warn('⚠️ Failed to save to database:', saveError);
            // Continue with extraction results even if save fails
          }
        }

        // Clean up temporary files
        setTimeout(async () => {
          try {
            await fs.unlink(filePath);
          } catch (cleanupError) {
            console.warn('⚠️ Failed to cleanup file:', cleanupError);
          }
        }, 5000);

        // Send successful response
        res.status(200).json({
          success: true,
          message: 'Extraction PDF terminée avec succès.',
          data: {
            ...extractionResult,
            saved: {
              workouts: savedWorkouts.length,
              metrics: savedMetrics.length
            }
          }
        });

      } catch (extractionError) {
        console.error('❌ PDF extraction error:', extractionError);
        
        // Clean up uploaded file
        await fs.unlink(filePath).catch(() => {});
        
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'extraction des données du PDF.',
          error: extractionError.message
        });
      }
    });

  } catch (error) {
    console.error('❌ PDF controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du traitement du PDF.'
    });
  }
};

/**
 * Get extraction history for authenticated user
 */
export const getExtractionHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.'
      });
    }

    // Get recent workouts that were imported from PDFs
    const recentImports = await Workout.find({
      user: req.user._id,
      source: 'pdf_import'
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('name type duration exercises createdAt importMetadata');

    res.status(200).json({
      success: true,
      data: {
        recentImports,
        totalImported: recentImports.length
      }
    });

  } catch (error) {
    console.error('❌ Get extraction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique.'
    });
  }
};

/**
 * Preview PDF extraction without saving
 */
export const previewPDFExtraction = async (req, res) => {
  try {
    upload.single('pdf')(req, res, async (uploadError) => {
      if (uploadError) {
        return res.status(400).json({
          success: false,
          message: `Erreur d'upload: ${uploadError.message}`
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier PDF n\'a été fourni.'
        });
      }

      const filePath = req.file.path;
      
      try {
        // Extract data without saving
        const extractionResult = await pdfExtractionService.extractDataFromPDF(filePath, {
          previewMode: true
        });

        // Clean up uploaded file immediately
        await fs.unlink(filePath).catch(() => {});

        if (!extractionResult.success) {
          return res.status(422).json({
            success: false,
            message: 'Échec de l\'extraction des données du PDF.',
            error: extractionResult.error
          });
        }

        res.status(200).json({
          success: true,
          message: 'Aperçu de l\'extraction terminé.',
          data: extractionResult
        });

      } catch (extractionError) {
        // Clean up uploaded file
        await fs.unlink(filePath).catch(() => {});
        
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'extraction des données du PDF.',
          error: extractionError.message
        });
      }
    });

  } catch (error) {
    console.error('❌ PDF preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'aperçu du PDF.'
    });
  }
};

/**
 * Save extracted data to database
 */
async function saveExtractedData(userId, extractedData) {
  const savedWorkouts = [];
  const savedMetrics = [];

  // Save workouts
  for (const workoutData of extractedData.workouts) {
    try {
      const workout = new Workout({
        user: userId,
        name: workoutData.type || 'Entraînement Importé',
        type: mapWorkoutType(workoutData.type),
        duration: workoutData.duration || 0,
        exercises: workoutData.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            reps: set.reps || 0,
            weight: set.weight || 0,
            duration: set.duration || 0,
            restTime: set.restTime || 0
          })),
          notes: exercise.notes?.join(' ') || ''
        })),
        calories: workoutData.calories || 0,
        notes: workoutData.notes?.join(' ') || 'Importé depuis PDF',
        date: workoutData.date || new Date(),
        source: 'pdf_import',
        importMetadata: {
          extractionId: extractedData.id,
          originalFilename: extractedData.filename,
          importDate: new Date()
        }
      });

      const savedWorkout = await workout.save();
      savedWorkouts.push(savedWorkout);
      
    } catch (workoutError) {
      console.warn('⚠️ Failed to save workout:', workoutError);
    }
  }

  // Update user stats
  if (savedWorkouts.length > 0) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          'stats.totalWorkouts': savedWorkouts.length,
          'stats.totalDuration': savedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
        }
      });
    } catch (updateError) {
      console.warn('⚠️ Failed to update user stats:', updateError);
    }
  }

  return { workouts: savedWorkouts, metrics: savedMetrics };
}

/**
 * Map extracted workout types to our system types
 */
function mapWorkoutType(extractedType) {
  if (!extractedType) return 'autre';
  
  const typeMap = {
    'cardio': 'cardio',
    'cardiovasculaire': 'cardio',
    'endurance': 'cardio',
    'course': 'cardio',
    'running': 'cardio',
    'cyclisme': 'cardio',
    'cycling': 'cardio',
    'natation': 'cardio',
    'swimming': 'cardio',
    'musculation': 'force',
    'strength': 'force',
    'force': 'force',
    'resistance': 'force',
    'yoga': 'flexibilite',
    'pilates': 'flexibilite',
    'stretching': 'flexibilite',
    'étirement': 'flexibilite',
    'crossfit': 'crosstraining',
    'hiit': 'crosstraining',
    'interval': 'crosstraining',
    'boxe': 'combat',
    'boxing': 'combat',
    'combat': 'combat',
    'escalade': 'escalade',
    'climbing': 'escalade',
    'grimpe': 'escalade'
  };
  
  const lowerType = extractedType.toLowerCase();
  return typeMap[lowerType] || 'autre';
} 