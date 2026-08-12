import api from './api';

const followService = {
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
  getFollowStatus: (userId) => api.get(`/users/${userId}/follow-status`),
  getSuggestions: (page = 1, limit = 5) => api.get(`/users/suggestions?page=${page}&limit=${limit}`),
};

export default followService;
