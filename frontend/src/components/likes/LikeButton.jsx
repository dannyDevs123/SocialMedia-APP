import React, { useState } from 'react';
import likeService from '../../services/likeService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { getId } from '../../utils/id';

const LikeButton = ({ postId, initialLiked, initialCount, onLikeUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount || 0);
  const [showLikes, setShowLikes] = useState(false);
  const [likeUsers, setLikeUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleToggle = async () => {
    const normalizedPostId = getId(postId);
    if (!normalizedPostId) {
      toast.error('Missing post ID');
      return;
    }
    if (!user) {
      toast.info('Please log in to like ZiZU posts');
      return;
    }
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
    try {
      const res = await likeService.toggleLike(normalizedPostId);
      setLiked(res.data.data.liked);
      setCount(res.data.data.likesCount);
      onLikeUpdate?.(res.data.data.liked, res.data.data.likesCount);
    } catch (err) { toast.error('Failed to like post'); }
  };

  const fetchLikes = async () => {
    const normalizedPostId = getId(postId);
    if (!normalizedPostId) {
      toast.error('Missing post ID');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await likeService.getLikes(normalizedPostId);
      setLikeUsers(Array.isArray(res.data.data.users) ? res.data.data.users : []);
      setShowLikes(true);
    } catch (err) { toast.error('Failed to load likes'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleToggle}
        className={`group flex items-center gap-1.5 rounded-full p-2 transition-colors ${
          liked ? 'text-[#f91880] hover:bg-pink-50' : 'text-gray-500 hover:bg-pink-50 hover:text-[#f91880]'
        }`}
      >
        <svg
          className={`w-[18px] h-[18px] transition-transform duration-200 ${animating ? 'animate-heart-pop' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span
          onClick={(e) => { e.stopPropagation(); if (count > 0) fetchLikes(); }}
          className="text-sm hover:underline"
        >
          {count}
        </span>
      </button>

      {/* Likes Modal */}
      {showLikes && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowLikes(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full max-h-96 overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.2)] border border-[#eff3f4] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#eff3f4] sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-lg text-[#0f1419]">Liked by</h3>
              <button
                onClick={() => setShowLikes(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#536471] hover:text-[#0f1419] hover:bg-[#eff3f4] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              {likeUsers.length === 0 ? (
                <p className="text-[#536471] text-center py-8 text-sm">No likes yet</p>
              ) : (
                <div className="space-y-1">
                  {likeUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f7f9f9] transition-colors">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover avatar-ring" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center text-sm font-bold avatar-ring">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-sm text-[#0f1419]">{u.name}</span>
                        <p className="text-sm text-[#536471]">@{u.name?.toLowerCase().replace(/\s+/g, '')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikeButton;
