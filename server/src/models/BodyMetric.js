import mongoose from 'mongoose';

const bodyMetricSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    min: 30,
    max: 300 // kg
  },
  bodyFat: {
    type: Number,
    min: 3,
    max: 50 // percentage
  },
  muscleMass: {
    type: Number,
    min: 10,
    max: 150 // kg
  },
  bmi: {
    type: Number,
    min: 10,
    max: 50
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for faster queries and ensure one entry per user per date
bodyMetricSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual for BMI calculation if height is available
bodyMetricSchema.virtual('calculatedBMI').get(function() {
  if (this.weight && this.user && this.user.height) {
    const heightInMeters = this.user.height / 100;
    return this.weight / (heightInMeters * heightInMeters);
  }
  return null;
});

// Pre-save middleware to calculate BMI if weight is provided
bodyMetricSchema.pre('save', async function(next) {
  if (this.weight && !this.bmi) {
    // We would need to populate user to get height, but for now we'll leave BMI manual
    // In a production app, you might want to fetch the user's height here
  }
  next();
});

export default mongoose.model('BodyMetric', bodyMetricSchema); 