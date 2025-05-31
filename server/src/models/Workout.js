import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  notes: {
    type: String,
    trim: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['entrainement', 'musculation', 'cardio', 'yoga', 'course', 'autre'],
    default: 'entrainement'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number,  // In minutes
    required: true,
    min: 1
  },
  calories: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  enjoyment: {
    type: Number,
    min: 1,
    max: 5
  },
  exercises: [exerciseSchema],
  notes: {
    type: String,
    trim: true
  },
  metrics: {
    maxGrade: {
      type: String,
      trim: true
    },
    totalClimbs: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100
    }
  }
}, { timestamps: true });

// Create indexes for better query performance
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ type: 1 });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout; 