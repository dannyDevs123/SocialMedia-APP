import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import commentService from '../../services/commentService';
import { toast } from 'react-toastify';
import { asArray, getId, sameId } from '../../utils/id';
import { displayText } from '../../utils/text';

const CommentItem = ({ comment, onDelete, onUpdate, postId, onReply }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState(asArray(comment.replies));
  const commentId = comment._id || comment.id;

  const isOwner = sameId(user?._id || user?.id, comment.userId?._id || comment.userId?.id || comment.userId);

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    onUpdate(commentId, editContent);
    setIsEditing(false);
  };

  const handleReply = async () => {
    if (!postId || !commentId) {
      toast.error('Missing comment ID');
      return;
    }

    if (!replyContent.trim()) return;
    try {
      const res = await commentService.addComment(postId, replyContent, commentId);
      setReplies((prev) => [...asArray(prev), res.data.data.comment]);
      setReplyContent('');
      setShowReply(false);
      onReply?.();
      toast.success('Reply posted');
    } catch (err) {
      toast.error('Failed to reply');
    }
  };

  const Avatar = ({ userData, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs';
    if (userData?.avatar) {
      return <img src={userData.avatar} alt={userData.name} className={`${sizeClass} rounded-full object-cover avatar-ring`} />;
    }
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#536471] to-[#3f4a54] text-white flex items-center justify-center font-bold avatar-ring`}>
        {userData?.name?.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-2.5">
        <Link to={`/profile/${comment.userId?._id || comment.userId?.id || comment.userId}`} className="shrink-0 mt-0.5">
          <Avatar userData={comment.userId} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <Link to={`/profile/${comment.userId?._id || comment.userId?.id || comment.userId}`} className="font-bold text-sm text-[#0f1419] hover:underline">
              {comment.userId?.name}
            </Link>
            <span className="text-sm text-[#536471]">@{comment.userId?.name?.toLowerCase().replace(/\s+/g, '')}</span>
          </div>
          {isEditing ? (
            <div className="mt-1.5 flex gap-2">
              <input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 text-sm px-3 py-1.5 bg-white border border-[#cfd9de] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]/30 focus:border-[#1d9bf0]"
              />
              <button onClick={handleUpdate} className="text-sm text-[#1d9bf0] font-semibold hover:underline px-2">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-sm text-[#536471] hover:underline px-2">Cancel</button>
            </div>
          ) : (
            <p className="text-sm text-[#0f1419] mt-0.5 leading-relaxed">{displayText(comment.content)}</p>
          )}
          <div className="flex items-center gap-4 mt-1.5">
            {user && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-xs text-[#536471] hover:text-[#1d9bf0] font-medium transition-colors"
              >
                Reply
              </button>
            )}
            {isOwner && (
              <>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-[#536471] hover:text-[#1d9bf0] transition-colors">Edit</button>
                <button onClick={() => onDelete(commentId)} className="text-xs text-[#536471] hover:text-[#f4212e] transition-colors">Delete</button>
              </>
            )}
          </div>
        </div>
      </div>

      {showReply && (
        <div className="ml-10 flex gap-2 animate-slide-up">
          <input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            maxLength={200}
            placeholder="Write a reply..."
            className="flex-1 text-sm px-3 py-1.5 bg-white border border-[#cfd9de] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]/30 focus:border-[#1d9bf0] placeholder:text-[#536471]"
          />
          <button onClick={handleReply} className="btn-primary text-xs px-4 py-1.5 shrink-0">Reply</button>
        </div>
      )}

      {asArray(replies).length > 0 && (
        <div className="ml-10 space-y-2 mt-2 pl-3 border-l-2 border-[#eff3f4]">
          {asArray(replies).map((reply) => (
            <div key={reply._id || reply.id || `${getId(reply.userId)}-${reply.createdAt}`} className="flex gap-2">
              <Link to={`/profile/${reply.userId?._id || reply.userId?.id || reply.userId}`}>
                <Avatar userData={reply.userId} size="sm" />
              </Link>
              <div>
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="font-bold text-xs text-[#0f1419]">{reply.userId?.name}</p>
                  <span className="text-xs text-[#536471]">@{reply.userId?.name?.toLowerCase().replace(/\s+/g, '')}</span>
                </div>
                <p className="text-xs text-[#0f1419] mt-0.5 leading-relaxed">{displayText(reply.content)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
