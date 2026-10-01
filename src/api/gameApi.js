import axiosClient from './axiosClient';

export const startShift = (playerId) =>
  axiosClient.post(`/narrative/${playerId}/shifts/start`).then((r) => r.data);

export const submitChoice = (playerId, choiceId) =>
  axiosClient.post(`/narrative/${playerId}/choices/${choiceId}/submit`).then((r) => r.data);

export const endShift = (playerId) =>
  axiosClient.post(`/narrative/${playerId}/shifts/end`).then((r) => r.data);

// The backend saves the current player's current shift at the supplied beat.
export const saveProgress = (playerId, beatId) =>
  axiosClient.post(`/narrative/${playerId}/shifts/${beatId}/save`).then((r) => r.data);
