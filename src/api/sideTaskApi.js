import axiosClient from './axiosClient';

// NOTE: response shapes are NOT documented in the Postman collection
// (all responses are empty). Field names below are request-side only —
// confirmed. Consumers must treat response payloads defensively.

export const getActiveSideTask = (playerId) =>
  axiosClient.get(`/sidetask/${playerId}/active`).then((r) => r.data);

export const submitSideTask = (playerId, { sideTaskId, submittedCode, timeSpentSec, sahmHintsUsed }) =>
  axiosClient
    .post(`/sidetask/${playerId}/submit`, { sideTaskId, submittedCode, timeSpentSec, sahmHintsUsed })
    .then((r) => r.data);

export const abandonSideTask = (playerId, sideTaskId) =>
  axiosClient.post(`/sidetask/${playerId}/${sideTaskId}/abandon`).then((r) => r.data);

export const getSideTaskHints = (playerId, sideTaskId) =>
  axiosClient.get(`/sidetask/${playerId}/${sideTaskId}/hints`).then((r) => r.data);

export const unlockHint = (playerId, { sideTaskId, hintLevel }) =>
  axiosClient.post(`/sidetask/${playerId}/hints/unlock`, { sideTaskId, hintLevel }).then((r) => r.data);

// Admin-only — requires adminToken bearer, not the player's.
export const assignSideTask = (playerId) =>
  axiosClient.post(`/sidetask/${playerId}/assign`).then((r) => r.data);