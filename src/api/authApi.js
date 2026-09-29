import axiosClient from './axiosClient';

export const register = (payload) =>
  axiosClient.post('/auth/register', payload).then((r) => r.data);

export const login = (payload) =>
  axiosClient.post('/auth/login', payload).then((r) => r.data);

export const refresh = (refreshToken) =>
  axiosClient.post('/auth/refresh', { refreshToken }).then((r) => r.data);

export const logout = (refreshToken) =>
  axiosClient.post('/auth/logout', { refreshToken }).then((r) => r.data);