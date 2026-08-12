import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PostForm from './PostForm';
import PostList from './PostList';
import postService from '../../services/postService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { asArray } from '../../utils/id';

const SEED_POSTS = [
  {
    _id: 'seed-1',
    userId: { _id: 'seed-user-1', name: 'Sarah Connor', avatar: '' },
    content: 'Just deployed my new React app using ZiZU! Loving the clean interface 🚀',
    imageUrl: '',
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isSeed: true,
  },
  {
    _id: 'seed-2',
    userId: { _id: 'seed-user-2', name: 'Tech Weekly', avatar: '' },
    content: 'Breaking: Open source AI models are advancing faster than ever. What are your thoughts?',
    imageUrl: '',
    likesCount: 2,
    commentsCount: 1,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isSeed: true,
  },
  {
    _id: 'seed-3',
    userId: { _id: 'seed-user-3', name: 'Alex Rivera', avatar: '' },
    content: 'Morning coffee and code review. Ready to conquer the day ☕💻',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    likesCount: 1,
    commentsCount: 0,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    isSeed: true,
  },
  {
    _id: 'seed-4',
    userId: { _id: 'seed-user-4', name: 'Design Hub', avatar: '' },
    content: "Minimalist UI design isn't just about white space; it's about intentional hierarchy.",
    imageUrl: '',
    likesCount: 3,
    commentsCount: 0,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isSeed: true,
  },
  {
    _id: 'seed-5',
    userId: { _id: 'seed-user-5', name: 'Dev Community', avatar: '' },
    content: "What's your go-to CSS trick for center-aligning complex layouts in 2026?",
    imageUrl: '',
    likesCount: 2,
    commentsCount: 2,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    isSeed: true,
  },
];

const Feed = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const service = activeTab === 'following' && user ? postService.getFeed : postService.getAllPosts;
      const res = await service(pageNum, 10);
      const { posts: newPosts, pagination } = res.data.data;
      const normalizedPosts = asArray(newPosts);
      const resolved = normalizedPosts.length === 0 && pageNum === 1 ? SEED_POSTS : normalizedPosts;
      setPosts((prev) => (append ? [...prev, ...resolved] : resolved));
      setHasMore(resolved.length > 0 ? pagination?.hasMore ?? false : false);
      setPage(pageNum);
    } catch (err) {
      if (pageNum === 1) {
        setPosts(SEED_POSTS);
        setHasMore(false);
      } else {
        toast.error('Failed to load posts');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [activeTab, user, loading]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setInitialLoading(true);
    fetchPosts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadMore = () => {
    if (!loading && hasMore) fetchPosts(page + 1, true);
  };

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#eff3f4]">
        <div className="px-4 pt-3 pb-1">
          <h1 className="text-xl font-bold text-[#0f1419]">Home</h1>
        </div>

        <div className="flex">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`flex-1 tab-btn text-center ${activeTab === 'for-you' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            For You
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 tab-btn text-center ${activeTab === 'following' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              Following
            </button>
          )}
        </div>
      </div>

      {user && <PostForm onPostCreated={(p) => setPosts((prev) => [p, ...prev])} />}

      <div className="h-2.5 bg-[#eff3f4]" />

      {initialLoading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <PostList
          posts={posts}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={loadMore}
          onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id && p.id !== id))}
          onPostUpdated={(up) => setPosts((prev) => prev.map((p) => ((p._id === up._id || p.id === up.id) ? up : p)))}
        />
      )}
    </div>
  );
};

export default Feed;
