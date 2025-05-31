import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import pdf2pic from 'pdf2pic';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import natural from 'natural';
import nlp from 'compromise';
import { format, parse, isValid } from 'date-fns';
import { fr } from 'date-fns/locale/index.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temporary directory for file processing
const TEMP_DIR = path.join(__dirname, '../../temp');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure directories exist
await fs.mkdir(TEMP_DIR, { recursive: true }).catch(() => {});
await fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(() => {});

class PDFExtractionService {
  constructor() {
    this.workoutPatterns = {
      // Exercise patterns in French and English
      exercises: [
        /(?:exercice|exercise|mouvement|movement)[\s:]*(.*?)(?=\n|$)/gi,
        /(?:série|series|set|reps?|répétitions?)[\s:]*(\d+)/gi,
        /(?:poids|weight|charge)[\s:]*(\d+(?:\.\d+)?)\s*(?:kg|lbs?)/gi,
        /(?:durée|duration|temps|time)[\s:]*(\d+(?::\d+)?)\s*(?:min|minutes?|sec|secondes?|h|heures?)/gi,
        /(?:distance)[\s:]*(\d+(?:\.\d+)?)\s*(?:km|m|miles?)/gi,
        /(?:calories?)[\s:]*(\d+)/gi,
        /(?:fréquence cardiaque|heart rate|bpm)[\s:]*(\d+)/gi
      ],
      
      // Date patterns
      dates: [
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g,
        /(\d{2,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
        /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
        /(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)/gi
      ],
      
      // Fitness metrics
      metrics: [
        /(?:imc|bmi)[\s:]*(\d+(?:\.\d+)?)/gi,
        /(?:masse corporelle|body mass|poids corporel|weight)[\s:]*(\d+(?:\.\d+)?)\s*(?:kg|lbs?)/gi,
        /(?:taille|height)[\s:]*(\d+(?:\.\d+)?)\s*(?:cm|m|ft|inches?)/gi,
        /(?:masse grasse|body fat|graisse)[\s:]*(\d+(?:\.\d+)?)\s*%/gi,
        /(?:masse musculaire|muscle mass)[\s:]*(\d+(?:\.\d+)?)\s*(?:kg|lbs?|%)/gi,
        /(?:vo2\s*max)[\s:]*(\d+(?:\.\d+)?)/gi,
        /(?:fc\s*max|max\s*hr|fréquence cardiaque maximale)[\s:]*(\d+)/gi
      ],
      
      // Workout types
      types: [
        /(?:cardio|cardiovasculaire|endurance|aérobic)/gi,
        /(?:musculation|strength|force|resistance)/gi,
        /(?:course|running|jogging|sprint)/gi,
        /(?:cyclisme|cycling|vélo|bike)/gi,
        /(?:natation|swimming|nage)/gi,
        /(?:yoga|pilates|stretching|étirement)/gi,
        /(?:crossfit|hiit|interval)/gi,
        /(?:boxe|boxing|combat|martial)/gi,
        /(?:escalade|climbing|grimpe)/gi,
        /(?:football|basketball|tennis|sport collectif)/gi
      ]
    };
    
    this.nlpProcessor = natural;
    this.stemmer = natural.PorterStemmerFr || natural.PorterStemmer;
  }

  /**
   * Main extraction method - handles the complete PDF processing pipeline
   */
  async extractDataFromPDF(filePath, options = {}) {
    try {
      console.log(`🔍 Starting PDF extraction for: ${filePath}`);
      
      const extractionId = uuidv4();
      const results = {
        id: extractionId,
        filename: path.basename(filePath),
        timestamp: new Date().toISOString(),
        success: false,
        data: {
          rawText: '',
          ocrText: '',
          workouts: [],
          metrics: [],
          dates: [],
          summary: {}
        },
        errors: []
      };

      // Step 1: Extract text directly from PDF
      try {
        console.log('📄 Extracting text from PDF...');
        results.data.rawText = await this.extractTextFromPDF(filePath);
        console.log(`✅ Extracted ${results.data.rawText.length} characters of text`);
      } catch (error) {
        console.warn('⚠️ Direct text extraction failed, will rely on OCR');
        results.errors.push(`Text extraction: ${error.message}`);
      }

      // Step 2: OCR if text extraction failed or yielded poor results
      if (!results.data.rawText || results.data.rawText.length < 100) {
        try {
          console.log('🔍 Performing OCR on PDF pages...');
          results.data.ocrText = await this.performOCROnPDF(filePath);
          console.log(`✅ OCR extracted ${results.data.ocrText.length} characters`);
        } catch (error) {
          console.error('❌ OCR failed:', error);
          results.errors.push(`OCR: ${error.message}`);
        }
      }

      // Combine text sources
      const combinedText = [results.data.rawText, results.data.ocrText].join('\n').trim();
      
      if (!combinedText) {
        throw new Error('Aucun texte n\'a pu être extrait du PDF');
      }

      // Step 3: Parse and structure the extracted data
      console.log('🧠 Analyzing and structuring data...');
      
      // Extract dates
      results.data.dates = this.extractDates(combinedText);
      
      // Extract workout data
      results.data.workouts = this.extractWorkoutData(combinedText);
      
      // Extract fitness metrics
      results.data.metrics = this.extractFitnessMetrics(combinedText);
      
      // Generate summary
      results.data.summary = this.generateSummary(results.data);

      // Step 4: Clean up and validate
      results.data = this.cleanAndValidateData(results.data);
      
      results.success = true;
      console.log('✅ PDF extraction completed successfully');
      
      return results;

    } catch (error) {
      console.error('❌ PDF extraction failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract text directly from PDF using pdf-parse
   */
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer, {
        // Enhanced parsing options
        pagerender: (pageData) => {
          // Custom page rendering for better text extraction
          let text = pageData.getTextContent().then((textContent) => {
            return textContent.items.map(item => item.str).join(' ');
          });
          return text;
        }
      });
      
      return data.text;
    } catch (error) {
      throw new Error(`Échec de l'extraction de texte: ${error.message}`);
    }
  }

  /**
   * Perform OCR on PDF pages using Tesseract
   */
  async performOCROnPDF(filePath) {
    try {
      const tempImageDir = path.join(TEMP_DIR, uuidv4());
      await fs.mkdir(tempImageDir, { recursive: true });

      // Convert PDF pages to images
      const convert = pdf2pic.fromPath(filePath, {
        density: 300,           // High DPI for better OCR
        saveFilename: "page",
        savePath: tempImageDir,
        format: "png",
        width: 2000,
        height: 2000
      });

      // Convert all pages
      const pages = await convert.bulk(-1, { responseType: "image" });
      
      let allText = '';
      
      // Process each page with OCR
      for (let i = 0; i < pages.length; i++) {
        try {
          console.log(`📖 Processing page ${i + 1}/${pages.length} with OCR...`);
          
          // Enhance image for better OCR
          const enhancedImagePath = path.join(tempImageDir, `enhanced_page_${i}.png`);
          await this.enhanceImageForOCR(pages[i].path, enhancedImagePath);
          
          // Perform OCR with French and English
          const { data: { text } } = await Tesseract.recognize(enhancedImagePath, 'fra+eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                process.stdout.write(`\r📝 OCR Progress: ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          
          allText += `\n--- Page ${i + 1} ---\n${text}\n`;
          
        } catch (pageError) {
          console.warn(`⚠️ OCR failed for page ${i + 1}:`, pageError.message);
        }
      }

      // Clean up temporary files
      await fs.rm(tempImageDir, { recursive: true, force: true });
      
      return allText;
      
    } catch (error) {
      throw new Error(`Échec de l'OCR: ${error.message}`);
    }
  }

  /**
   * Enhance image quality for better OCR results
   */
  async enhanceImageForOCR(inputPath, outputPath) {
    try {
      await sharp(inputPath)
        .greyscale()                    // Convert to greyscale
        .normalize()                    // Improve contrast
        .sharpen()                      // Sharpen edges
        .threshold(128)                 // Apply threshold for cleaner text
        .png({ quality: 100 })
        .toFile(outputPath);
    } catch (error) {
      // If enhancement fails, just copy the original
      await fs.copyFile(inputPath, outputPath);
    }
  }

  /**
   * Extract workout data from text
   */
  extractWorkoutData(text) {
    const workouts = [];
    const lines = text.split('\n');
    
    let currentWorkout = null;
    let currentDate = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for date
      const dateMatch = this.findDateInText(line);
      if (dateMatch) {
        currentDate = dateMatch;
      }
      
      // Check for workout type
      const workoutType = this.identifyWorkoutType(line);
      if (workoutType) {
        if (currentWorkout) {
          workouts.push(currentWorkout);
        }
        currentWorkout = {
          id: uuidv4(),
          type: workoutType,
          date: currentDate,
          exercises: [],
          duration: null,
          calories: null,
          notes: []
        };
      }
      
      // Extract exercise details
      if (currentWorkout) {
        const exercise = this.parseExerciseLine(line);
        if (exercise) {
          currentWorkout.exercises.push(exercise);
        }
        
        // Extract duration
        const durationMatch = line.match(/(?:durée|duration|temps|time)[\s:]*(\d+(?::\d+)?)\s*(?:min|minutes?|sec|secondes?|h|heures?)/gi);
        if (durationMatch) {
          currentWorkout.duration = this.parseDuration(durationMatch[1]);
        }
        
        // Extract calories
        const caloriesMatch = line.match(/(?:calories?)[\s:]*(\d+)/gi);
        if (caloriesMatch) {
          currentWorkout.calories = parseInt(caloriesMatch[1]);
        }
      }
    }
    
    // Add last workout
    if (currentWorkout) {
      workouts.push(currentWorkout);
    }
    
    return workouts;
  }

  /**
   * Parse individual exercise lines
   */
  parseExerciseLine(line) {
    // Look for exercise patterns
    const exercisePatterns = [
      /(?:exercice|exercise)[\s:]*([^,\n]+?)(?:\s*[-,]|\s*\d+|$)/i,
      /^([A-Za-zÀ-ÿ\s]+?)(?:\s*[-:]?\s*\d+)/,
      /(\d+)\s*(?:x|×)\s*(\d+)\s*(?:kg|lbs?)?\s*([A-Za-zÀ-ÿ\s]+)/i,
      /([A-Za-zÀ-ÿ\s]+?)\s*[-:]\s*(\d+)\s*(?:série|series|set|reps?)/i
    ];
    
    for (const pattern of exercisePatterns) {
      const match = line.match(pattern);
      if (match) {
        const exercise = {
          id: uuidv4(),
          name: this.cleanExerciseName(match[1] || match[3]),
          sets: [],
          notes: []
        };
        
        // Extract sets and reps
        const setsMatch = line.match(/(\d+)\s*(?:série|series|set)/gi);
        const repsMatch = line.match(/(\d+)\s*(?:reps?|répétitions?)/gi);
        const weightMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:kg|lbs?)/gi);
        
        if (setsMatch && repsMatch) {
          const sets = parseInt(setsMatch[0].match(/\d+/)[0]);
          const reps = parseInt(repsMatch[0].match(/\d+/)[0]);
          const weight = weightMatch ? parseFloat(weightMatch[0].match(/[\d.]+/)[0]) : null;
          
          for (let i = 0; i < sets; i++) {
            exercise.sets.push({
              reps,
              weight,
              restTime: null
            });
          }
        }
        
        return exercise;
      }
    }
    
    return null;
  }

  /**
   * Extract fitness metrics from text
   */
  extractFitnessMetrics(text) {
    const metrics = [];
    
    for (const pattern of this.workoutPatterns.metrics) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const value = parseFloat(match[1]);
        const type = this.identifyMetricType(match[0]);
        
        if (type && !isNaN(value)) {
          metrics.push({
            id: uuidv4(),
            type,
            value,
            unit: this.extractUnit(match[0]),
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    return metrics;
  }

  /**
   * Extract dates from text
   */
  extractDates(text) {
    const dates = [];
    const datePatterns = this.workoutPatterns.dates;
    
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dateStr = match[0];
        const parsedDate = this.parseDate(dateStr);
        
        if (parsedDate && isValid(parsedDate)) {
          dates.push({
            original: dateStr,
            parsed: parsedDate.toISOString(),
            formatted: format(parsedDate, 'dd/MM/yyyy', { locale: fr })
          });
        }
      }
    }
    
    return dates;
  }

  /**
   * Utility methods
   */
  
  findDateInText(text) {
    const datePatterns = this.workoutPatterns.dates;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return this.parseDate(match[0]);
      }
    }
    return null;
  }

  identifyWorkoutType(text) {
    for (const pattern of this.workoutPatterns.types) {
      if (pattern.test(text)) {
        return pattern.source.replace(/[()[\]{}*+?^$|\\]/g, '').split('|')[0];
      }
    }
    return null;
  }

  identifyMetricType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('imc') || lowerText.includes('bmi')) return 'bmi';
    if (lowerText.includes('poids') || lowerText.includes('weight')) return 'weight';
    if (lowerText.includes('taille') || lowerText.includes('height')) return 'height';
    if (lowerText.includes('graisse') || lowerText.includes('fat')) return 'bodyFat';
    if (lowerText.includes('muscle')) return 'muscleMass';
    if (lowerText.includes('vo2')) return 'vo2Max';
    if (lowerText.includes('fc') || lowerText.includes('hr')) return 'heartRate';
    return 'other';
  }

  extractUnit(text) {
    const units = text.match(/(?:kg|lbs?|cm|m|ft|inches?|%|bpm)/i);
    return units ? units[0].toLowerCase() : null;
  }

  parseDate(dateStr) {
    const formats = [
      'dd/MM/yyyy',
      'MM/dd/yyyy',
      'yyyy-MM-dd',
      'dd-MM-yyyy',
      'dd.MM.yyyy'
    ];
    
    for (const formatStr of formats) {
      try {
        const parsed = parse(dateStr, formatStr, new Date());
        if (isValid(parsed)) {
          return parsed;
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  parseDuration(durationStr) {
    const timeMatch = durationStr.match(/(\d+)(?::(\d+))?/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1]);
      const seconds = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      return minutes * 60 + seconds; // Return in seconds
    }
    return null;
  }

  cleanExerciseName(name) {
    return name.trim()
      .replace(/[^\w\sÀ-ÿ]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Clean and validate extracted data
   */
  cleanAndValidateData(data) {
    // Remove duplicates and validate
    data.workouts = data.workouts.filter((workout, index, self) => 
      index === self.findIndex(w => w.type === workout.type && w.date === workout.date)
    );
    
    data.metrics = data.metrics.filter((metric, index, self) => 
      index === self.findIndex(m => m.type === metric.type && m.value === metric.value)
    );
    
    // Sort by date
    data.workouts.sort((a, b) => new Date(a.date) - new Date(b.date));
    data.dates.sort((a, b) => new Date(a.parsed) - new Date(b.parsed));
    
    return data;
  }

  /**
   * Generate summary of extracted data
   */
  generateSummary(data) {
    return {
      totalWorkouts: data.workouts.length,
      totalExercises: data.workouts.reduce((sum, w) => sum + w.exercises.length, 0),
      totalMetrics: data.metrics.length,
      dateRange: data.dates.length > 0 ? {
        from: data.dates[0].formatted,
        to: data.dates[data.dates.length - 1].formatted
      } : null,
      workoutTypes: [...new Set(data.workouts.map(w => w.type))],
      metricTypes: [...new Set(data.metrics.map(m => m.type))]
    };
  }
}

export default new PDFExtractionService(); 