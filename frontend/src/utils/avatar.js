const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Server root without the /api suffix — used for /uploads/* paths stored by the backend.
export const getServerBaseUrl = () => API_BASE.replace(/\/api\/?$/, '');

export const resolveAvatarUrl = (avatar) => {
  if (!avatar) {
    return '';
  }

  if (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('blob:') ||
    avatar.startsWith('data:')
  ) {
    return avatar;
  }

  if (avatar.startsWith('/')) {
    return `${getServerBaseUrl()}${avatar}`;
  }

  return avatar;
};
