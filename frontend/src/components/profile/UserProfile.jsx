import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import followService from '../../services/followService';
import postService from '../../services/postService';
import FollowButton from './FollowButton';
import PostCard from '../posts/PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { asArray, sameId } from '../../utils/id';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const postsRes = await postService.getUserPosts(userId);
        setPosts(postsRes.data.data.posts);
        const followersRes = await followService.getFollowers(userId);
        setFollowers(followersRes.data.data.followers);
        const followingRes = await followService.getFollowing(userId);
        setFollowing(followingRes.data.data.following);
        setStats({ followersCount: followersRes.data.data.count, followingCount: followingRes.data.data.count });
        if (sameId(currentUser?._id || currentUser?.id, userId)) {
          setProfile(currentUser);
        } else if (asArray(postsRes.data.data.posts).length > 0) {
          setProfile(postsRes.data.data.posts[0].userId);
        }
      } catch (err) { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [userId, currentUser]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <p className="text-[#536471] font-medium">User not found</p>
      </div>
    );
  }

  const isOwnProfile = sameId(currentUser?._id || currentUser?.id, userId);

  const UserListItem = ({ u }) => (
    <Link
      to={`/profile/${u._id}`}
      className="card flex items-center gap-3 hover:bg-[#f7f9f9] transition-all duration-200"
    >
      {u.avatar ? (
        <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-full object-cover avatar-ring" />
      ) : (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center font-bold avatar-ring">
          {u.name?.charAt(0)}
        </div>
      )}
      <div>
        <p className="font-bold text-[#0f1419]">{u.name}</p>
        <p className="text-sm text-[#536471] mt-0.5">@{u.name?.toLowerCase().replace(/\s+/g, '')}</p>
      </div>
    </Link>
  );

  return (
    <div className="animate-fade-in">
      {/* Profile Header */}
      <div className="border-b border-[#eff3f4]">
        {/* Back button and name */}
        <div className="flex items-center gap-6 px-4 py-3 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#eff3f4] transition-colors"
          >
            <svg className="w-5 h-5 text-[#0f1419]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0f1419]">{profile.name}</h1>
            <p className="text-sm text-[#536471]">{posts.length} posts</p>
          </div>
        </div>

        {/* Cover / Banner */}
        <div className="h-32 bg-gradient-to-r from-[#1d9bf0]/20 via-[#1d9bf0]/10 to-[#1a8cd8]/20" />

        {/* Avatar + Actions */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="rounded-full ring-4 ring-white">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-[133px] h-[133px] rounded-full object-cover" />
              ) : (
                <div className="w-[133px] h-[133px] rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center text-5xl font-bold">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <button onClick={() => navigate('/edit-profile')} className="btn-outline-white text-sm font-bold py-2 px-4">
                  Edit profile
                </button>
              ) : (
                <FollowButton userId={userId} onFollowUpdate={(f, fc, fic) => setStats({ followersCount: fc, followingCount: fic })} />
              )}
            </div>
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-xl font-bold text-[#0f1419]">{profile.name}</h2>
            <p className="text-sm text-[#536471]">@{profile.name?.toLowerCase().replace(/\s+/g, '')}</p>
            <p className="text-[15px] text-[#0f1419] mt-3 leading-relaxed">{profile.bio || ''}</p>

            {/* Stats */}
            <div className="flex gap-5 mt-3">
              <Link to={`/profile/${userId}`} className="flex items-center gap-1 text-sm hover:underline">
                <span className="font-bold text-[#0f1419]">{following.length || stats.followingCount}</span>
                <span className="text-[#536471]">Following</span>
              </Link>
              <Link to={`/profile/${userId}`} className="flex items-center gap-1 text-sm hover:underline">
                <span className="font-bold text-[#0f1419]">{followers.length || stats.followersCount}</span>
                <span className="text-[#536471]">Followers</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#eff3f4]">
        {['posts', 'followers', 'following'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 tab-btn text-center capitalize ${activeTab === tab ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div>
            {asArray(posts).length === 0 ? (
              <p className="text-center text-[#536471] py-16">No posts yet</p>
            ) : (
              asArray(posts).map(post => <PostCard key={post._id || post.id} post={post} />)
            )}
          </div>
        )}
        {activeTab === 'followers' && (
          <div>
            {asArray(followers).length === 0 ? (
              <p className="text-center text-[#536471] py-16">No followers yet</p>
            ) : (
              <div className="divide-y divide-[#eff3f4]">
                {asArray(followers).map(f => <div key={f._id || f.id} className="p-4"><UserListItem u={f} /></div>)}
              </div>
            )}
          </div>
        )}
        {activeTab === 'following' && (
          <div>
            {asArray(following).length === 0 ? (
              <p className="text-center text-[#536471] py-16">Not following anyone yet</p>
            ) : (
              <div className="divide-y divide-[#eff3f4]">
                {asArray(following).map(f => <div key={f._id || f.id} className="p-4"><UserListItem u={f} /></div>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
