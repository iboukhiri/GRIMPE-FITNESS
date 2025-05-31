import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et mot de passe sont requis.'
      });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée.'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription.'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis.'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Check password
    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion.'
    });
  }
};

// Verify token and get user data
export const verifyToken = async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    res.status(200).json({
      success: true,
      isAuthenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        preferences: req.user.preferences
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification.'
    });
  }
};

// Logout user (client-side token removal)
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username } = req.body;
    const userId = req.user._id;

    // Check if username is already taken (if provided and different)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken.'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...(name && { name }), ...(username && { username }) },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update.'
    });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences: { ...req.user.preferences, ...preferences } } },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during preferences update.'
    });
  }
}; 