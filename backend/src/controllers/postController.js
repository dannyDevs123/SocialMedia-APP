const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const User = require('../models/User');
const { toIdString } = require('../utils/id');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { content, imageUrl } = req.body;
    const normalizedContent = typeof content === 'string' ? content.trim() : '';

    const post = await Post.create({
      userId: req.user._id,
      content: normalizedContent,
      imageUrl: imageUrl || '',
    });

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (global feed)
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    const total = await Post.countDocuments();

    // Check if current user liked each post
    let likedPostIds = new Set();
    if (req.user) {
      const likes = await Like.find({
        userId: req.user._id,
        postId: { $in: posts.map((p) => p._id) },
      });
      likedPostIds = new Set(likes.map((l) => l.postId.toString()));
    }

    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followed users' posts
// @route   GET /api/posts/feed
// @access  Private
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get list of users the current user follows
    const follows = await Follow.find({ followerId: req.user._id });
    const followingIds = follows.map((f) => f.followingId.toString());
    followingIds.push(req.user._id.toString()); // Include own posts

    const posts = await Post.find({
      userId: { $in: followingIds },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    const total = await Post.countDocuments({
      userId: { $in: followingIds },
    });

    // Check liked status
    const likes = await Like.find({
      userId: req.user._id,
      postId: { $in: posts.map((p) => p._id) },
    });
    const likedPostIds = new Set(likes.map((l) => l.postId.toString()));

    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({
        postId: post._id,
        userId: req.user._id,
      });
      isLiked = !!like;
    }

    res.status(200).json({
      success: true,
      data: {
        post: { ...post.toObject(), isLiked },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (toIdString(post.userId) !== toIdString(req.user?._id || req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    // Check 5-minute edit window
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (post.createdAt < fiveMinutesAgo) {
      return res.status(403).json({
        success: false,
        message: 'Post can only be edited within 5 minutes of creation',
      });
    }

    const { content, imageUrl } = req.body;
    if (typeof content === 'string' && content.trim()) {
      post.content = content.trim();
    }
    post.imageUrl = imageUrl !== undefined ? imageUrl : post.imageUrl;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (toIdString(post.userId) !== toIdString(req.user?._id || req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    // Delete post and related data
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    await Like.deleteMany({ postId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    const total = await Post.countDocuments({ userId: req.params.userId });

    let likedPostIds = new Set();
    if (req.user) {
      const likes = await Like.find({
        userId: req.user._id,
        postId: { $in: posts.map((p) => p._id) },
      });
      likedPostIds = new Set(likes.map((l) => l.postId.toString()));
    }

    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
