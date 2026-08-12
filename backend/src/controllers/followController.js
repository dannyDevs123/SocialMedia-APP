const Follow = require('../models/Follow');
const User = require('../models/User');
const { toIdString } = require('../utils/id');

// @desc    Follow/Unfollow a user
// @route   POST /api/users/:userId/follow
// @access  Private
exports.toggleFollow = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent self-follow
    if (toIdString(userId) === toIdString(req.user?._id || req.user?.id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: req.user._id,
      followingId: userId,
    });

    if (existingFollow) {
      // Unfollow
      await Follow.findByIdAndDelete(existingFollow._id);
      const followersCount = await Follow.countDocuments({ followingId: userId });
      const followingCount = await Follow.countDocuments({ followerId: req.user._id });

      return res.status(200).json({
        success: true,
        message: 'Unfollowed successfully',
        data: {
          following: false,
          followersCount,
          followingCount,
        },
      });
    }

    // Follow
    await Follow.create({
      followerId: req.user._id,
      followingId: userId,
    });

    const followersCount = await Follow.countDocuments({ followingId: userId });
    const followingCount = await Follow.countDocuments({ followerId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Followed successfully',
      data: {
        following: true,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:userId/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const follows = await Follow.find({ followingId: userId })
      .sort({ createdAt: -1 })
      .populate('followerId', 'name email avatar bio');

    const followers = follows.map((f) => f.followerId);

    res.status(200).json({
      success: true,
      data: { followers, count: followers.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's following
// @route   GET /api/users/:userId/following
// @access  Public
exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const follows = await Follow.find({ followerId: userId })
      .sort({ createdAt: -1 })
      .populate('followingId', 'name email avatar bio');

    const following = follows.map((f) => f.followingId);

    res.status(200).json({
      success: true,
      data: { following, count: following.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if current user follows a user
// @route   GET /api/users/:userId/follow-status
// @access  Private
exports.getFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOne({
      followerId: req.user._id,
      followingId: userId,
    });

    const followersCount = await Follow.countDocuments({ followingId: userId });
    const followingCount = await Follow.countDocuments({ followerId: userId });

    res.status(200).json({
      success: true,
      data: {
        following: !!follow,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
