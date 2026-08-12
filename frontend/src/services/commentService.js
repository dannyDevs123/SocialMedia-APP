import api from './api';

const commentService = {
  addComment: (postId, content, parentCommentId = null) => api.post(`/posts/${postId}/comments`, { content, parentCommentId }),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  updateComment: (postId, commentId, content) => api.put(`/posts/${postId}/comments/${commentId}`, { content }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

export default commentService;
