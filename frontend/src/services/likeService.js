import api from './api';

const likeService = {
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  getLikes: (postId) => api.get(`/posts/${postId}/like`),
};

export default likeService;
