const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [200, 'Comment cannot exceed 200 characters'],
      trim: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId',
});

// Indexes
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
