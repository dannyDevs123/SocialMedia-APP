const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower ID is required'],
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
