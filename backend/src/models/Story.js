const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
});

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },
  content: {
    type: String,
    required: true,
    maxLength: 50000, // 50KB limit for story content
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Adventure',
      'Mystery', 
      'Sci-Fi',
      'Fantasy',
      'Romance',
      'Horror',
      'Comedy',
      'Drama',
      'Thriller',
      'Historical',
      'Biography',
      'Self-Help',
      'Other'
    ],
    default: 'Adventure',
  },
  duration: {
    type: String,
    required: true,
    default: 'Short (5-10 min)',
  },
  description: {
    type: String,
    required: true,
    maxLength: 500,
  },
  chapters: [chapterSchema],
  author: {
    type: String,
    required: true,
    default: 'Echo AI',
  },
  userId: {
    type: String,
    required: true,
    index: true, // Index for faster queries by user
  },
  
  // Moderation and visibility
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  
  // Analytics
  playCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Generation metadata
  generationParams: {
    genre: String,
    length: String,
    tone: String,
    audience: String,
    creativityLevel: Number,
    prompt: String,
  },
  
  // Additional metadata
  tags: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  images: [{
    type: String,
  }],
  
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
});

// Indexes for performance
storySchema.index({ userId: 1, createdAt: -1 }); // User stories sorted by date
storySchema.index({ moderationStatus: 1, createdAt: -1 }); // Admin moderation queue
storySchema.index({ category: 1, isPublic: 1, moderationStatus: 1 }); // Public stories by category
storySchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual for formatted creation date
storySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Instance methods
storySchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

storySchema.methods.approve = function() {
  this.moderationStatus = 'approved';
  return this.save();
};

storySchema.methods.reject = function(reason) {
  this.moderationStatus = 'rejected';
  this.rejectionReason = reason;
  return this.save();
};

// Static methods
storySchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

storySchema.statics.findPublicStories = function(limit = 20, skip = 0) {
  return this.find({ 
    isPublic: true, 
    moderationStatus: 'approved' 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

storySchema.statics.findPendingModeration = function() {
  return this.find({ moderationStatus: 'pending' })
    .sort({ createdAt: 1 }); // Oldest first for moderation queue
};

storySchema.statics.getAnalytics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalStories: { $sum: 1 },
        publicStories: {
          $sum: {
            $cond: [{ $eq: ['$isPublic', true] }, 1, 0]
          }
        },
        pendingModeration: {
          $sum: {
            $cond: [{ $eq: ['$moderationStatus', 'pending'] }, 1, 0]
          }
        },
        privateStories: {
          $sum: {
            $cond: [{ $eq: ['$isPublic', false] }, 1, 0]
          }
        },
        totalPlays: { $sum: '$playCount' },
        avgRating: { $avg: '$rating' },
      }
    }
  ]);
};

storySchema.statics.getCategoryStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalPlays: { $sum: '$playCount' },
      }
    },
    { $sort: { count: -1 } }
  ]);
};

storySchema.statics.getTopAuthors = function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$userId',
        count: { $sum: 1 },
        totalPlays: { $sum: '$playCount' },
        avgRating: { $avg: '$rating' },
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Story', storySchema);