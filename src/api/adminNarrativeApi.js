import axiosClient from './axiosClient';

// Shifts
export const getShifts = () => axiosClient.get('/admin/shifts').then((r) => r.data);
export const getShift = (shiftId) => axiosClient.get(`/admin/shifts/${shiftId}`).then((r) => r.data);
export const createShift = (payload) => axiosClient.post('/admin/shifts', payload).then((r) => r.data);
export const updateShift = (shiftId, payload) => axiosClient.put(`/admin/shifts/${shiftId}`, payload).then((r) => r.data);
export const deleteShift = (shiftId) => axiosClient.delete(`/admin/shifts/${shiftId}`).then((r) => r.data);

// Beats
export const getBeat = (beatId) => axiosClient.get(`/admin/beats/${beatId}`).then((r) => r.data);
export const createBeat = (payload) => axiosClient.post('/admin/beats', payload).then((r) => r.data);
export const updateBeat = (beatId, payload) => axiosClient.put(`/admin/beats/${beatId}`, payload).then((r) => r.data);
export const assignBeatToShift = (beatId, shiftId) =>
  axiosClient.put(`/admin/beats/${beatId}/assign-shift/${shiftId}`).then((r) => r.data);
export const deleteBeat = (beatId) => axiosClient.delete(`/admin/beats/${beatId}`).then((r) => r.data);

// Choices
export const createChoices = (payload) => axiosClient.post('/admin/choices', payload).then((r) => r.data); // array
export const updateChoice = (choiceId, payload) => axiosClient.put(`/admin/choices/${choiceId}`, payload).then((r) => r.data);