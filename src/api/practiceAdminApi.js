import axiosClient from './axiosClient';

// Exact routes and request shapes from LoopGame-APIs.postman_collection.json.
export const getAllPracticeTasks = () =>
  axiosClient.get('/admin/practice/tasks').then((response) => response.data);

export const createPracticeTask = (payload) =>
  axiosClient.post('/admin/practice/tasks', payload).then((response) => response.data);

// The API accepts a partial task payload, for example: { maxAttempts: 10 }.
export const updatePracticeTask = (taskId, payload) =>
  axiosClient.put(`/admin/practice/tasks/${taskId}`, payload).then((response) => response.data);

export const addPracticeTestCases = (testCases) =>
  axiosClient.post('/admin/practice/testcases', testCases).then((response) => response.data);

// The API accepts a partial test-case payload, for example: { testInput: '' }.
export const updatePracticeTestCase = (testCaseId, payload) =>
  axiosClient.put(`/admin/practice/testcases/${testCaseId}`, payload).then((response) => response.data);
