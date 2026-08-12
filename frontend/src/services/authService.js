import api from './api';

const authService = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export default authService;
