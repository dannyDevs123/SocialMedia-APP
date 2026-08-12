import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import followService from '../../services/followService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { asArray, getId } from '../../utils/id';

const RightWidgets = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await followService.getSuggestions(1, 3);
        setSuggestions(asArray(res.data.data?.users));
      } catch {
        // Silently fail for suggestions
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [user]);

  return (
    <aside className="flex flex-col gap-4 py-2">
      <div className="sticky top-2 z-10 bg-white pb-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#536471]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pl-12"
            placeholder="Search ZiZU"
          />
        </div>
      </div>

      {user && (
        <div className="follow-card">
          <h2 className="text-xl font-bold text-[#0f1419] mb-4">Who to follow</h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-[#cfd9de]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-[#cfd9de] rounded w-24" />
                    <div className="h-3 bg-[#cfd9de] rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : asArray(suggestions).length > 0 ? (
            <div className="space-y-4">
              {asArray(suggestions).map((suggestedUser) => {
                const suggestedUserId = getId(suggestedUser);

                return (
                  <div key={suggestedUserId || suggestedUser?.email} className="flex items-center gap-3">
                    <Link to={`/profile/${suggestedUserId}`}>
                      {suggestedUser.avatar ? (
                        <img
                          src={suggestedUser.avatar}
                          alt={suggestedUser.name}
                          className="w-10 h-10 rounded-full object-cover avatar-ring hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity">
                          {suggestedUser.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${suggestedUserId}`}
                        className="text-sm font-bold text-[#0f1419] hover:underline block truncate"
                      >
                        {suggestedUser.name}
                      </Link>
                      <p className="text-sm text-[#536471] truncate">
                        @{suggestedUser.name?.toLowerCase().replace(/\s+/g, '')}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await followService.followUser(suggestedUserId);
                          setSuggestions((prev) => prev.filter((u) => getId(u) !== suggestedUserId));
                          toast.success(`Followed @${suggestedUser.name?.toLowerCase().replace(/\s+/g, '')}`);
                        } catch {
                          toast.error('Failed to follow');
                        }
                      }}
                      className="btn-outline-white text-sm py-1 px-4 flex-shrink-0"
                    >
                      Follow
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#536471] py-4 text-center">
              No suggestions right now
            </p>
          )}

          {asArray(suggestions).length > 0 && (
            <Link
              to="/"
              className="block mt-4 text-sm text-[#1d9bf0] hover:underline"
            >
              Show more
            </Link>
          )}
        </div>
      )}

      <div className="px-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#536471]">
          <span>Â© {new Date().getFullYear()} ZiZU</span>
        </div>
      </div>
    </aside>
  );
};

export default RightWidgets;
