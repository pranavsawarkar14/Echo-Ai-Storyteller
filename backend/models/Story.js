const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  }
}, { _id: false });

const StorySchema = new mongoose.Schema({
  // Clerk user ID
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Story basic info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  author: {
    type: String,
    required: true,
    trim: true,
    default: 'Echo AI'
  },
  
  category: {
    type: String,
    required: true,
    enum: ['Adventure', 'Mystery', 'Sci-Fi', 'Fantasy', 'Horror', 'Romance', 'Comedy', 'Drama'],
    index: true
  },
  
  duration: {
    type: String,
    required: true,
    default: '10 min'
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  // Story content
  content: {
    type: String,
    required: true
  },
  
  chapters: [ChapterSchema],
  
  // Media
  imageUrl: {
    type: String,
    default: null
  },
  
  images: [{
    type: String
  }],
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  playCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Story properties
  isNew: {
    type: Boolean,
    default: true
  },
  
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // AI generation metadata
  generationParams: {
    genre: String,
    length: String,
    tone: String,
    audience: String,
    creativityLevel: Number,
    prompt: String
  },
  
  // Admin fields
  isPublic: {
    type: Boolean,
    default: false
  },
  
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  moderatedBy: String,
  moderatedAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
StorySchema.index({ userId: 1, createdAt: -1 });
StorySchema.index({ category: 1, createdAt: -1 });
StorySchema.index({ isPublic: 1, moderationStatus: 1, createdAt: -1 });
StorySchema.index({ tags: 1 });

// Update the updatedAt field before saving
StorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
StorySchema.methods.toPublicJSON = function() {
  const story = this.toObject();
  
  // Remove sensitive data for public view
  delete story.__v;
  delete story.moderationStatus;
  delete story.moderatedBy;
  delete story.moderatedAt;
  
  return story;
};

StorySchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

// Static methods
StorySchema.statics.findPublicStories = function(options = {}) {
  const { category, limit = 20, skip = 0, sortBy = '-createdAt' } = options;
  
  const query = {
    isPublic: true,
    moderationStatus: 'approved'
  };
  
  if (category && category !== 'All') {
    query.category = category;
  }
  
  return this.find(query)
    .sort(sortBy)
    .limit(limit)
    .skip(skip)
    .lean();
};

StorySchema.statics.findUserStories = function(userId, options = {}) {
  const { category, limit = 50, skip = 0, sortBy = '-createdAt' } = options;
  
  const query = { userId };
  
  if (category && category !== 'All') {
    query.category = category;
  }
  
  return this.find(query)
    .sort(sortBy)
    .limit(limit)
    .skip(skip)
    .lean();
};

StorySchema.statics.getStoriesByCategory = function(category, isPublic = false) {
  const query = isPublic 
    ? { isPublic: true, moderationStatus: 'approved' }
    : {};
    
  if (category && category !== 'All') {
    query.category = category;
  }
  
  return this.find(query).sort('-createdAt').lean();
};

module.exports = mongoose.model('Story', StorySchema);