import axiosClient from './axiosClient';

export const getNextPracticeTask = (playerId, shiftId) =>
  axiosClient.get(`/practice/${encodeURIComponent(playerId)}/task/${encodeURIComponent(shiftId)}`).then((response) => response.data);

export const submitPracticeCode = (playerId, payload) =>
  axiosClient.post(`/practice/${encodeURIComponent(playerId)}/submit`, payload).then((response) => response.data);
