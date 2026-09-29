import axiosClient from './axiosClient';

export const startShift = (playerId, shiftId) =>
  axiosClient.post(`/narrative/${playerId}/shifts/${shiftId}/start`).then((r) => r.data);

export const submitChoice = (playerId, choiceId) =>
  axiosClient.post(`/narrative/${playerId}/choices/${choiceId}/submit`).then((r) => r.data);

export const endShift = (playerId, shiftId) =>
  axiosClient.post(`/narrative/${playerId}/shifts/${shiftId}/end`).then((r) => r.data);

// Confirmed shape: POST /narrative/{playerId}/shifts/{shiftId}/{slot}/save
// Response mirrors StartShift (shiftId, shift, beats) — not just an ack.
export const saveProgress = (playerId, shiftId, slotNumber = 1, desktopState) =>
  axiosClient
    .post(`/narrative/${playerId}/shifts/${shiftId}/${slotNumber}/save`, { desktopState })
    .then((r) => r.data);