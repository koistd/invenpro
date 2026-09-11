const TOKEN_KEY = 'inventory_token';
const REFRESH_KEY = 'inventory_refresh';
const USER_KEY = 'inventory_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const saveAuth = ({ access, refresh, user }) => {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

export const displayName = (user) => {
  if (!user) return 'User';
  const full = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return full || user.email || 'User';
};

export const initials = (user) => {
  const name = displayName(user);
  return name.slice(0, 2).toUpperCase();
};
