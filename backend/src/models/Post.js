const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [500, 'Post content cannot exceed 500 characters'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
});

// Virtual for likes count
postSchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'postId',
  count: true,
});

// Virtual for comments count
postSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
  count: true,
});

// Indexes
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
