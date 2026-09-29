import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const BASE_URL = 'http://localhost:5195/api';

const axiosClient = axios.create({ baseURL: BASE_URL });

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
const isAuthCall = (url = '') => AUTH_PATHS.some((p) => url.startsWith(p));

axiosClient.interceptors.request.use((config) => {
  if (!isAuthCall(config.url)) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (error, token) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || isAuthCall(originalRequest?.url) || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, setSession, clearSession } = useAuthStore.getState();
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      setSession(data);
      resolveQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;