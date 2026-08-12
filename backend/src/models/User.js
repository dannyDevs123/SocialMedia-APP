const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    avatar: {
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

// Virtual for followers count
userSchema.virtual('followersCount', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'followingId',
  count: true,
});

// Virtual for following count
userSchema.virtual('followingCount', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'followerId',
  count: true,
});

userSchema.index({ name: 'text' });

module.exports = mongoose.model('User', userSchema);
