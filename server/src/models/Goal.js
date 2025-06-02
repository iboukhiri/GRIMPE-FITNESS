import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['workouts_per_week', 'duration_per_session', 'calories_per_week', 'weight_target', 'custom']
  },
  title: {
    type: String,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'session'],
    default: 'weekly'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
goalSchema.index({ user: 1, status: 1 });

export default mongoose.model('Goal', goalSchema); 