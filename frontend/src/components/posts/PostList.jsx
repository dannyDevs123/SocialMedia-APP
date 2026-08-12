import React from 'react';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { asArray } from '../../utils/id';

const PostList = ({ posts, hasMore, loading, onLoadMore, onPostDeleted, onPostUpdated }) => {
  const lastPostRef = useInfiniteScroll(onLoadMore, hasMore, loading);
  const safePosts = asArray(posts);

  if (safePosts.length === 0 && !loading) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f7f9f9] mb-4">
          <svg className="w-8 h-8 text-[#cfd9de]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-[#0f1419]">No posts yet</p>
        <p className="text-sm text-[#536471] mt-1">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div>
      {safePosts.map((post, index) => (
        <div key={post._id || post.id} ref={index === safePosts.length - 1 ? lastPostRef : null}>
          <PostCard post={post} onDelete={onPostDeleted} onUpdate={onPostUpdated} />
        </div>
      ))}
      {loading && (
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}
      {!hasMore && safePosts.length > 0 && (
        <p className="text-center text-[#536471] text-sm py-6">You're all caught up</p>
      )}
    </div>
  );
};

export default PostList;
