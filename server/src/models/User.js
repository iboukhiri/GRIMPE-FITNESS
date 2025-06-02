import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const bodyMetricSchema = new mongoose.Schema({
  weight: { type: Number, min: 30, max: 300 }, // kg
  bodyFat: { type: Number, min: 3, max: 50 }, // percentage
  muscleMass: { type: Number, min: 20, max: 60 }, // percentage
  waterPercentage: { type: Number, min: 40, max: 80 }, // percentage
  visceralFat: { type: Number, min: 1, max: 30 }, // rating
  bmr: { type: Number, min: 800, max: 3000 }, // Base Metabolic Rate
  date: { type: Date, default: Date.now },
  notes: { type: String, maxlength: 200 }
});

const objectiveSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  type: { type: String, required: true, enum: ['workouts', 'calories', 'duration', 'bodyWeight', 'bodyFat', 'strength', 'consistency', 'variety', 'progression', 'totalWorkouts', 'personalRecords', 'bodyTransformation'] },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  category: { type: String, enum: ['frequency', 'performance', 'duration', 'body', 'habit', 'diversity', 'achievement'] },
  startDate: { type: Date, default: Date.now },
  targetDate: { type: Date },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  // Enhanced profile fields
  profile: {
    age: { type: Number, min: 10, max: 120 },
    height: { type: Number, min: 100, max: 250 }, // in centimeters
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
    goals: [{ type: String, enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'health'] }],
    preferences: {
      workoutTypes: [{ type: String, enum: ['entrainement', 'musculation', 'cardio', 'yoga', 'course', 'autre'] }],
      workoutDuration: { type: Number, default: 60 }, // preferred duration in minutes
      weeklyFrequency: { type: Number, default: 3 } // preferred workouts per week
    }
  },
  // Activity and fitness preferences
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'extra'],
    default: 'moderate'
  },
  preferences: {
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'fr' },
    unitSystem: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    notifications: {
      workoutReminders: { type: Boolean, default: true },
      progressReports: { type: Boolean, default: true },
      achievementAlerts: { type: Boolean, default: true }
    }
  },
  // Body metrics tracking
  bodyMetrics: [bodyMetricSchema],
  currentBodyMetrics: {
    weight: Number,
    bodyFat: Number,
    muscleMass: Number,
    waterPercentage: Number,
    visceralFat: Number,
    bmr: Number,
    lastUpdated: Date,
    notes: String
  },
  // Objectives and goals
  objectives: [objectiveSchema],
  // Enhanced stats
  stats: {
    totalWorkouts: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // in minutes
    totalCalories: { type: Number, default: 0 },
    favoriteType: { type: String, default: '' },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    averageDifficulty: { type: Number, default: 0 },
    personalRecords: {
      longestSession: { type: Number, default: 0 },
      highestCalories: { type: Number, default: 0 },
      bestSuccessRate: { type: Number, default: 0 }
    }
  },
  // Achievement system
  achievements: [{
    title: String,
    description: String,
    type: { type: String, enum: ['workout', 'streak', 'calories', 'duration', 'difficulty', 'consistency'] },
    earnedDate: { type: Date, default: Date.now },
    icon: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate username from email if not provided
userSchema.pre('save', function(next) {
  if (!this.username && this.email) {
    // Generate username from email (before @ symbol)
    this.username = this.email.split('@')[0];
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate password
userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Virtual for calculating BMI
userSchema.virtual('bmi').get(function() {
  if (this.profile?.height && this.currentBodyMetrics?.weight) {
    const heightInM = this.profile.height / 100;
    return Math.round((this.currentBodyMetrics.weight / (heightInM * heightInM)) * 10) / 10;
  }
  return null;
});

// Method to add body metric entry
userSchema.methods.addBodyMetric = function(metricData) {
  this.bodyMetrics.push(metricData);
  // Update current metrics
  this.currentBodyMetrics = {
    ...metricData,
    lastUpdated: new Date()
  };
  return this.save();
};

// Method to update objective progress
userSchema.methods.updateObjectiveProgress = function(objectiveId, newProgress) {
  const objective = this.objectives.id(objectiveId);
  if (objective) {
    objective.current = newProgress;
    if (newProgress >= objective.target && !objective.completed) {
      objective.completed = true;
      objective.completedDate = new Date();
    }
  }
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User; 