import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  // Include httpOnly cookies (refresh token) on cross-origin requests.
  withCredentials: true,
});

// Attach the Bearer token to every outgoing request when one is present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh-token');
    const isLogoutCall = originalRequest?.url?.includes('/auth/logout');

    console.log('[api interceptor] 401 detected:', {
      url: originalRequest?.url,
      status: error.response?.status,
      isRefreshCall,
      isLogoutCall,
      _retry: originalRequest?._retry,
    });

    if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshCall) {
      originalRequest._retry = true;
      console.log('[api interceptor] Attempting token refresh...');
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;
        console.log('[api interceptor] Token refresh SUCCESS — re-setting accessToken in localStorage');
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('[api interceptor] Token refresh FAILED — clearing localStorage + hard redirect');
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
