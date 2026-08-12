import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import commentService from '../../services/commentService';
import CommentItem from './CommentItem';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { asArray, sameId } from '../../utils/id';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const commentTree = asArray(comments);

  const removeCommentFromTree = (items, commentId) =>
    asArray(items).reduce((acc, item) => {
      const itemId = item?._id || item?.id;
      if (sameId(itemId, commentId)) {
        return acc;
      }

      acc.push({
        ...item,
        replies: removeCommentFromTree(item?.replies, commentId),
      });
      return acc;
    }, []);

  const updateCommentInTree = (items, commentId, updatedComment) =>
    asArray(items).map((item) => {
      const itemId = item?._id || item?.id;
      if (sameId(itemId, commentId)) {
        return updatedComment;
      }

      return {
        ...item,
        replies: updateCommentInTree(item?.replies, commentId, updatedComment),
      };
    });

  const fetchComments = useCallback(async () => {
    try {
      const res = await commentService.getComments(postId);
      setComments(asArray(res.data.data.comments));
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postId) {
      toast.error('Missing post ID');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await commentService.addComment(postId, newComment);
      setComments((prev) => [res.data.data.comment, ...asArray(prev)]);
      setNewComment('');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!postId || !commentId) {
      toast.error('Missing comment ID');
      return;
    }

    try {
      await commentService.deleteComment(postId, commentId);
      setComments((prev) => removeCommentFromTree(prev, commentId));
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleUpdate = async (commentId, content) => {
    if (!postId || !commentId) {
      toast.error('Missing comment ID');
      return;
    }

    try {
      const res = await commentService.updateComment(postId, commentId, content);
      setComments((prev) => updateCommentInTree(prev, commentId, res.data.data.comment));
    } catch (err) {
      toast.error('Failed to update comment');
    }
  };

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover avatar-ring shrink-0 mt-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center text-xs font-bold avatar-ring shrink-0 mt-0.5">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 flex gap-2 items-center bg-[#f7f9f9] rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#1d9bf0]/30 transition-all duration-200">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={200}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Post your reply"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-[#536471] text-[#0f1419]"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50 shrink-0"
            >
              Reply
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#f7f9f9] rounded-2xl px-4 py-3 text-sm text-[#536471]">
          <Link to="/login" className="text-[#1d9bf0] font-semibold hover:underline">
            Log in
          </Link>{' '}
          to join the conversation
        </div>
      )}
      <div className="space-y-3">
        {commentTree.map((comment) => (
          <CommentItem
            key={comment._id || comment.id}
            comment={comment}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            postId={postId}
            onReply={fetchComments}
          />
        ))}
        {commentTree.length === 0 && (
          <p className="text-[#536471] text-sm text-center py-4">No replies yet â€” start the conversation</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
