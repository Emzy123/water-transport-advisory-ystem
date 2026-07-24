import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

function clearAuth() {
  ['token', 'refreshToken', 'role', 'fullName', 'userId'].forEach((k) =>
    localStorage.removeItem(k)
  );
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh');

    if (err.response?.status === 401 && !isAuthRoute && !original._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearAuth();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`,
          { refreshToken }
        );
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        processQueue(null, data.token);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuth();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
