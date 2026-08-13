import api from './api';

const authService = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data, onUploadProgress) => {
    if (data instanceof FormData) {
      return api.put('/auth/profile', data, { onUploadProgress });
    }
    return api.put('/auth/profile', data);
  },
};

export default authService;
