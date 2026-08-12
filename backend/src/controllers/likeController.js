const Like = require('../models/Like');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Like/Unlike a post
// @route   POST /api/posts/:postId/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      postId,
      userId: req.user._id,
    });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      const likesCount = await Like.countDocuments({ postId });

      return res.status(200).json({
        success: true,
        message: 'Post unliked',
        data: { liked: false, likesCount },
      });
    }

    // Like
    await Like.create({
      postId,
      userId: req.user._id,
    });

    const likesCount = await Like.countDocuments({ postId });

    res.status(200).json({
      success: true,
      message: 'Post liked',
      data: { liked: true, likesCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users who liked a post
// @route   GET /api/posts/:postId/likes
// @access  Public
exports.getLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const likes = await Like.find({ postId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email avatar');

    const users = likes.map((like) => like.userId);

    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
