import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import postService from '../../services/postService';
import { toast } from 'react-toastify';
import LikeButton from '../likes/LikeButton';
import CommentSection from '../comments/CommentSection';
import LoadingSpinner from '../common/LoadingSpinner';
import { sameId } from '../../utils/id';
import { displayText } from '../../utils/text';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner = sameId(user?._id || user?.id, currentPost.userId?._id || currentPost.userId?.id || currentPost.userId);
  const canEdit = isOwner && new Date(currentPost.createdAt) > new Date(Date.now() - 5 * 60 * 1000);
  const mediaSrc = currentPost.mediaUrl || currentPost.imageUrl || '';
  const isVideoMedia =
    currentPost.mediaType === 'video' || /\.(mp4|webm|mov)(\?.*)?$/i.test(mediaSrc);

  const handleDelete = async () => {
    if (!currentPost?._id) {
      toast.error('Missing post ID');
      return;
    }
    if (!window.confirm('Delete this post?')) return;
    try {
      await postService.deletePost(currentPost._id);
      onDelete?.(currentPost._id);
      toast.success('Post deleted');
    } catch (err) { toast.error('Failed to delete post'); }
  };

  const handleUpdate = async () => {
    if (!currentPost?._id) {
      toast.error('Missing post ID');
      return;
    }
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const res = await postService.updatePost(currentPost._id, { content: editContent });
      setCurrentPost(res.data.data.post);
      onUpdate?.(res.data.data.post);
      setIsEditing(false);
      setMenuOpen(false);
      toast.success('Post updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const handleLikeUpdate = (liked, likesCount) => setCurrentPost(prev => ({ ...prev, isLiked: liked, likesCount }));

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const username = currentPost.userId?.name?.toLowerCase().replace(/\s+/g, '') || 'user';

  return (
    <article className="card border-b border-[#eff3f4] rounded-none hover:bg-[#f7f9f9]/50 p-4 transition-colors duration-200">
      <div className="flex gap-3">
        {/* Avatar Column */}
        <div className="flex-shrink-0">
          <Link to={`/profile/${currentPost.userId?._id || currentPost.userId?.id || currentPost.userId}`}>
            {currentPost.userId?.avatar ? (
              <img
                src={currentPost.userId.avatar}
                alt={currentPost.userId.name}
                className="w-10 h-10 rounded-full object-cover avatar-ring hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity">
                {currentPost.userId?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header: Name, Username, Time, Menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap min-w-0">
              <Link
                to={`/profile/${currentPost.userId?._id || currentPost.userId?.id || currentPost.userId}`}
                className="font-bold text-[15px] text-[#0f1419] hover:underline truncate"
              >
                {currentPost.userId?.name}
              </Link>
              <span className="text-[15px] text-[#536471] truncate">@{username}</span>
              <span className="text-[15px] text-[#536471]">·</span>
              <span className="text-[15px] text-[#536471] whitespace-nowrap">{timeAgo(currentPost.createdAt)}</span>
            </div>

            {/* Three-dot menu */}
            {isOwner && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[#536471] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-[#eff3f4] py-2 animate-scale-in z-20">
                      {canEdit && !isEditing && (
                        <button
                          onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] transition-colors text-left"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => { handleDelete(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#f4212e] hover:bg-[#f4212e]/5 transition-colors text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white border border-[#cfd9de] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]/30 focus:border-[#1d9bf0] resize-none text-[#0f1419] leading-relaxed"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="btn-outline-white text-sm py-1.5 px-4">Cancel</button>
                <button onClick={handleUpdate} disabled={loading} className="btn-primary text-sm py-1.5 px-4">
                  {loading ? <LoadingSpinner size="sm" light /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-[15px] text-[#0f1419] whitespace-pre-wrap leading-relaxed">{displayText(currentPost.content)}</p>
              {mediaSrc && isVideoMedia ? (
                <video
                  src={mediaSrc}
                  controls
                  className="mt-3 rounded-2xl w-full object-contain border border-[#eff3f4] bg-black"
                  style={{ maxHeight: '512px' }}
                />
              ) : mediaSrc ? (
                <img
                  src={mediaSrc}
                  alt="Post media"
                  className="mt-3 rounded-2xl w-full object-cover border border-[#eff3f4]"
                  style={{ maxHeight: '512px' }}
                />
              ) : null}
            </div>
          )}

          {/* ── Twitter-Style Action Bar ── */}
          {!isEditing && (
            <div className="flex items-center justify-between mt-3 max-w-md text-gray-500">
              {/* Reply / Comment */}
              <button
                onClick={() => setShowComments(!showComments)}
                className={`group flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-500 rounded-full p-2 transition-colors ${showComments ? 'text-blue-500' : ''}`}
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                <span className="text-sm">{currentPost.commentsCount || 0}</span>
              </button>

              {/* Repost */}
              <button
                onClick={() => toast.info('Repost coming soon')}
                className="group flex items-center gap-1.5 hover:bg-green-50 hover:text-green-500 rounded-full p-2 transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
                <span className="text-sm">{currentPost.repostCount || 0}</span>
              </button>

              {/* Like */}
              <LikeButton
                postId={currentPost._id}
                initialLiked={currentPost.isLiked}
                initialCount={currentPost.likesCount}
                onLikeUpdate={handleLikeUpdate}
              />

              {/* Share */}
              <button
                onClick={() => {
                  if (currentPost._id) {
                    navigator.clipboard?.writeText(`${window.location.origin}/post/${currentPost._id}`);
                  }
                  toast.info('Link copied to clipboard');
                }}
                className="group flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-500 rounded-full p-2 transition-colors"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </button>
            </div>
          )}

          {/* Comments Section */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-[#eff3f4] animate-slide-up">
              <CommentSection postId={currentPost._id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
