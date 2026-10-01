import axiosClient from './axiosClient';

export const register = (payload) =>
  axiosClient.post('/auth/register', payload).then((r) => r.data);

export const login = (payload) =>
  axiosClient.post('/auth/login', payload).then((r) => r.data);

export const refresh = (refreshToken) =>
  axiosClient.post('/auth/refresh', { refreshToken }).then((r) => r.data);

export const logout = (refreshToken) =>
  axiosClient.post('/auth/logout', { refreshToken }).then((r) => r.data);

export const forgotPassword = (email) =>
  axiosClient.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = ({ email, otp, newPassword, confirmPassword }) =>
  axiosClient.post('/auth/reset-password', { email, otp, newPassword, confirmPassword }).then((r) => r.data);
