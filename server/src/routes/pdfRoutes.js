import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  uploadAndExtractPDF,
  getExtractionHistory,
  previewPDFExtraction
} from '../controllers/pdfController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/pdf/extract
 * @desc    Upload PDF and extract workout data
 * @access  Private
 * @param   {File} pdf - PDF file to extract data from
 */
router.post('/extract', uploadAndExtractPDF);

/**
 * @route   POST /api/pdf/preview
 * @desc    Preview PDF extraction without saving to database
 * @access  Private
 * @param   {File} pdf - PDF file to preview extraction
 */
router.post('/preview', previewPDFExtraction);

/**
 * @route   GET /api/pdf/history
 * @desc    Get PDF extraction history for authenticated user
 * @access  Private
 */
router.get('/history', getExtractionHistory);

export default router; 