import User from '../models/User.js';
import Goal from '../models/Goal.js';
import BodyMetric from '../models/BodyMetric.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, age, height, activityLevel } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, age, height, activityLevel },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === GOALS MANAGEMENT ===

// Get user goals
export const getUserGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new goal
export const createGoal = async (req, res) => {
  try {
    const { type, title, target, period, unit } = req.body;
    
    const goal = new Goal({
      user: req.user._id,
      type,
      title,
      target,
      period,
      unit,
      current: 0,
      status: 'active'
    });
    
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update goal
export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { target, current, status } = req.body;
    
    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, user: req.user._id },
      { target, current, status },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    
    const goal = await Goal.findOneAndDelete({ _id: goalId, user: req.user._id });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === BODY METRICS MANAGEMENT ===

// Get body metrics
export const getBodyMetrics = async (req, res) => {
  try {
    const metrics = await BodyMetric.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(50);
    
    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add body metric
export const addBodyMetric = async (req, res) => {
  try {
    const { date, weight, bodyFat, muscleMass } = req.body;
    
    // Check if metric already exists for this date
    const existingMetric = await BodyMetric.findOne({ 
      user: req.user._id, 
      date: new Date(date) 
    });
    
    if (existingMetric) {
      // Update existing metric
      existingMetric.weight = weight || existingMetric.weight;
      existingMetric.bodyFat = bodyFat || existingMetric.bodyFat;
      existingMetric.muscleMass = muscleMass || existingMetric.muscleMass;
      
      await existingMetric.save();
      res.json(existingMetric);
    } else {
      // Create new metric
      const metric = new BodyMetric({
        user: req.user._id,
        date: new Date(date),
        weight,
        bodyFat,
        muscleMass
      });
      
      await metric.save();
      res.status(201).json(metric);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update body metric
export const updateBodyMetric = async (req, res) => {
  try {
    const { metricId } = req.params;
    const { weight, bodyFat, muscleMass } = req.body;
    
    const metric = await BodyMetric.findOneAndUpdate(
      { _id: metricId, user: req.user._id },
      { weight, bodyFat, muscleMass },
      { new: true }
    );
    
    if (!metric) {
      return res.status(404).json({ message: 'Body metric not found' });
    }
    
    res.json(metric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete body metric
export const deleteBodyMetric = async (req, res) => {
  try {
    const { metricId } = req.params;
    
    const metric = await BodyMetric.findOneAndDelete({ 
      _id: metricId, 
      user: req.user._id 
    });
    
    if (!metric) {
      return res.status(404).json({ message: 'Body metric not found' });
    }
    
    res.json({ message: 'Body metric deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 