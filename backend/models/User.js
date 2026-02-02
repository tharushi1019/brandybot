/**
 * User Model
 * Stores user information synced from Firebase Authentication
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Firebase UID (unique identifier from Firebase Auth)
  uid: {
    type: String,
    required: [true, 'Firebase UID is required'],
    unique: true,
    index: true
  },
  
  // User email
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  
  // Display name
  displayName: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Profile photo URL
  photoURL: {
    type: String,
    default: ''
  },
  
  // Authentication provider (google, facebook, microsoft, password)
  provider: {
    type: String,
    enum: ['google', 'facebook', 'microsoft', 'password'],
    default: 'password'
  },
  
  // User role (for future admin features)
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // User preferences
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  
  // Statistics
  stats: {
    logosGenerated: {
      type: Number,
      default: 0
    },
    brandsCreated: {
      type: Number,
      default: 0
    }
  },
  
  // Last login timestamp
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users'
});

// Indexes for performance
userSchema.index({ email: 1, uid: 1 });
userSchema.index({ createdAt: -1 });

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Instance method to increment logo count
userSchema.methods.incrementLogoCount = function() {
  this.stats.logosGenerated += 1;
  return this.save();
};

// Instance method to increment brand count
userSchema.methods.incrementBrandCount = function() {
  this.stats.brandsCreated += 1;
  return this.save();
};

// Static method to find user by Firebase UID
userSchema.statics.findByUid = function(uid) {
  return this.findOne({ uid });
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Pre-save hook to ensure email is lowercase
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
