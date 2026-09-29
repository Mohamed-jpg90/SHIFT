import axiosClient from './axiosClient';

// These endpoints are taken directly from LoopGame_Postman_Collection.
// Do not set Content-Type manually for uploads: Axios adds the multipart boundary.
export const uploadConceptSheet = ({ file, concept }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('concept', concept);
  return axiosClient.post('/admin/sheets/upload', formData).then((response) => response.data);
};

export const listConceptSheets = (concept) =>
  axiosClient.get(`/admin/sheets/list/${encodeURIComponent(concept)}`).then((response) => response.data);

export const deleteConceptSheet = (fileId) =>
  axiosClient.delete(`/admin/sheets/delete/${encodeURIComponent(fileId)}`).then((response) => response.data);

export const getShiftStudentsProgress = (shiftId) =>
  axiosClient.get(`/admin/shifts/${encodeURIComponent(shiftId)}/students`).then((response) => response.data);

export const getStudentOverallProgress = (playerId) =>
  axiosClient.get(`/admin/students/${encodeURIComponent(playerId)}`).then((response) => response.data);
