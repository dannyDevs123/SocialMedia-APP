import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import followService from '../../services/followService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { getId } from '../../utils/id';

const FollowButton = ({ userId, onFollowUpdate }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const normalizedUserId = getId(userId);
    if (!user || !normalizedUserId) { setInitialLoading(false); return; }
    const checkStatus = async () => {
      try {
        const res = await followService.getFollowStatus(normalizedUserId);
        setFollowing(res.data.data.following);
      } catch (err) { console.error(err); }
      finally { setInitialLoading(false); }
    };
    checkStatus();
  }, [userId, user]);

  const handleToggle = async () => {
    const normalizedUserId = getId(userId);
    if (!normalizedUserId) {
      toast.error('Missing user ID');
      return;
    }
    if (!user) { toast.info('Please log in to follow'); return; }
    setLoading(true);
    try {
      const res = await followService.toggleFollow(normalizedUserId);
      setFollowing(res.data.data.following);
      onFollowUpdate?.(res.data.data.following, res.data.data.followersCount, res.data.data.followingCount);
      toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setLoading(false); }
  };

  if (initialLoading) {
    return <div className="w-24 h-9 bg-[#eff3f4] rounded-full animate-pulse" />;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-60 ${
        following
          ? 'bg-white text-[#0f1419] border border-[#cfd9de] hover:bg-[#f4212e]/5 hover:text-[#f4212e] hover:border-[#f4212e]/30'
          : 'bg-[#0f1419] text-white hover:bg-[#272c30]'
      }`}
    >
      {loading ? <LoadingSpinner size="sm" light={following ? false : true} /> : following ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
