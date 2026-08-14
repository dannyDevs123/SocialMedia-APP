const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const User = require('../models/User');
const { toIdString } = require('../utils/id');
const {
  uploadBufferToCloudinary,
  MAX_IMAGE_SIZE,
} = require('../middleware/upload');

const MAX_PAGE_SIZE = 10;

const normalizePage = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const normalizeLimit = (value) => {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return MAX_PAGE_SIZE;
  }

  return Math.min(parsed, MAX_PAGE_SIZE);
};

const toObjectId = (value) => new mongoose.Types.ObjectId(toIdString(value));

const normalizePostMedia = (post) => ({
  ...post,
  imageUrl: post.imageUrl || post.mediaUrl || '',
  mediaUrl: post.mediaUrl || post.imageUrl || '',
  mediaType: post.mediaType || (post.mediaUrl || post.imageUrl ? 'image' : ''),
});

const uploadPostMedia = async (file, userId) => {
  if (!file) {
    return {
      mediaUrl: '',
      mediaType: '',
      mediaPublicId: '',
    };
  }

  if (file.mimetype?.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
    const error = new Error('Image uploads must be 5MB or smaller');
    error.statusCode = 400;
    throw error;
  }

  const uploadedMedia = await uploadBufferToCloudinary(file, {
    folder: 'social-app/posts',
    publicId: `post-${userId}-${Date.now()}`,
    resourceType: 'auto',
  });

  return {
    mediaUrl: uploadedMedia.secure_url,
    mediaType: uploadedMedia.resource_type === 'video' ? 'video' : 'image',
    mediaPublicId: uploadedMedia.public_id,
  };
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { content, imageUrl, mediaUrl, mediaType } = req.body;
    const normalizedContent = typeof content === 'string' ? content.trim() : '';

    const uploadedMedia = await uploadPostMedia(req.file, req.user._id);

    const fallbackMediaUrl =
      typeof mediaUrl === 'string'
        ? mediaUrl.trim()
        : typeof imageUrl === 'string'
          ? imageUrl.trim()
          : '';

    const resolvedMediaUrl = uploadedMedia.mediaUrl || fallbackMediaUrl;
    const resolvedMediaType =
      uploadedMedia.mediaType ||
      (typeof mediaType === 'string' ? mediaType.trim() : '') ||
      (resolvedMediaUrl ? 'image' : '');

    const post = await Post.create({
      userId: req.user._id,
      content: normalizedContent,
      imageUrl: resolvedMediaUrl,
      mediaUrl: resolvedMediaUrl,
      mediaType: resolvedMediaType,
      mediaPublicId: uploadedMedia.mediaPublicId || '',
    });

    await post.populate([
      { path: 'userId', select: 'name email avatar' },
      { path: 'likesCount' },
      { path: 'commentsCount' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post: normalizePostMedia(post.toObject()),
      },
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
    const page = normalizePage(req.query.page);
    const limit = normalizeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    const total = await Post.countDocuments();

    let likedPostIds = new Set();
    if (req.user) {
      const likes = await Like.find({
        userId: req.user._id,
        postId: { $in: posts.map((p) => p._id) },
      });
      likedPostIds = new Set(likes.map((l) => l.postId.toString()));
    }

    const postsWithLikeStatus = posts.map((post) => ({
      ...normalizePostMedia(post.toObject()),
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
    const page = normalizePage(req.query.page);
    const limit = normalizeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

    const followingIds = await Follow.distinct('followingId', {
      followerId: req.user._id,
    });

    const authorIds = [...new Set([req.user._id, ...followingIds].map((id) => toIdString(id)))]
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(id));

    const [feedResult] = await Post.aggregate([
      {
        $match: {
          userId: { $in: authorIds },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: User.collection.name,
                let: { authorId: '$userId' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$_id', '$$authorId'] },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      email: 1,
                      avatar: 1,
                      bio: 1,
                      createdAt: 1,
                    },
                  },
                ],
                as: 'userId',
              },
            },
            {
              $unwind: {
                path: '$userId',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: Like.collection.name,
                let: {
                  postId: '$_id',
                  viewerId: req.user._id,
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$postId', '$$postId'] },
                          { $eq: ['$userId', '$$viewerId'] },
                        ],
                      },
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: 'viewerLike',
              },
            },
            {
              $lookup: {
                from: Like.collection.name,
                localField: '_id',
                foreignField: 'postId',
                as: 'likes',
              },
            },
            {
              $lookup: {
                from: Comment.collection.name,
                localField: '_id',
                foreignField: 'postId',
                as: 'comments',
              },
            },
            {
              $addFields: {
                likesCount: { $size: '$likes' },
                commentsCount: { $size: '$comments' },
                isLiked: { $gt: [{ $size: '$viewerLike' }, 0] },
              },
            },
            {
              $project: {
                likes: 0,
                comments: 0,
                viewerLike: 0,
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    const posts = (feedResult?.data || []).map((post) =>
      normalizePostMedia({
        ...post,
        isLiked: Boolean(post.isLiked),
      })
    );

    const total = feedResult?.totalCount?.[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        posts,
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
        post: {
          ...normalizePostMedia(post.toObject()),
          isLiked,
        },
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

    const { content, imageUrl, mediaUrl, mediaType } = req.body;
    if (typeof content === 'string' && content.trim()) {
      post.content = content.trim();
    }

    const nextMediaUrl =
      typeof mediaUrl === 'string'
        ? mediaUrl.trim()
        : typeof imageUrl === 'string'
          ? imageUrl.trim()
          : undefined;

    if (nextMediaUrl !== undefined) {
      post.imageUrl = nextMediaUrl;
      post.mediaUrl = nextMediaUrl;
    }

    if (typeof mediaType === 'string' && mediaType.trim()) {
      post.mediaType = mediaType.trim();
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('userId', 'name email avatar')
      .populate('likesCount')
      .populate('commentsCount');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: normalizePostMedia(updatedPost.toObject()) },
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
    const page = normalizePage(req.query.page);
    const limit = normalizeLimit(req.query.limit);
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
      ...normalizePostMedia(post.toObject()),
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
