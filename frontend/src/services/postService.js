import api from './api';

const postService = {
  createPost: (data) => api.post('/posts', data),
  getAllPosts: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  getFeed: (page = 1, limit = 10) => api.get(`/posts/feed?page=${page}&limit=${limit}`),
  getPost: (id) => api.get(`/posts/${id}`),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getUserPosts: (userId, page = 1, limit = 10) => api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
};

export default postService;
