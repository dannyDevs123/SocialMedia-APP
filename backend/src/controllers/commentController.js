const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { toIdString } = require('../utils/id');

const deleteCommentTree = async (rootCommentId) => {
  const idsToDelete = [rootCommentId];
  let frontier = [rootCommentId];

  while (frontier.length > 0) {
    const children = await Comment.find({ parentCommentId: { $in: frontier } }).select('_id').lean();
    const childIds = children.map((child) => child._id);
    if (childIds.length === 0) break;

    idsToDelete.push(...childIds);
    frontier = childIds;
  }

  await Comment.deleteMany({ _id: { $in: idsToDelete } });
};

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { content, parentCommentId } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
      }
    }

    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      content,
      parentCommentId: parentCommentId || null,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: populatedComment },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comments = await Comment.find({ postId, parentCommentId: null })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'userId',
          select: 'name email avatar',
        },
        options: { sort: { createdAt: 1 } },
      });

    res.status(200).json({
      success: true,
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (toIdString(comment.userId) !== toIdString(req.user?._id || req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
      });
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'userId',
          select: 'name email avatar',
        },
      });

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment: updatedComment },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (toIdString(comment.userId) !== toIdString(req.user?._id || req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await deleteCommentTree(comment._id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
