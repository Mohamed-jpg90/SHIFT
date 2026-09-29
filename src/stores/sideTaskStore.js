import { create } from 'zustand';
import * as sideTaskApi from '../api/sideTaskApi';

const extractError = (err) => err?.response?.data?.description || err?.message || 'Request failed';

export const useSideTaskStore = create((set, get) => ({
  activeTask: null,   // shape unconfirmed — rendered defensively
  hints: null,        // shape unconfirmed — array, locked hint has hintText: null
  lastResult: null,   // last submit response — shape unconfirmed
  isLoading: false,
  error: null,
  hintsUsedCount: 0,  // tracked client-side for sahmHintsUsed on submit

  clearError: () => set({ error: null }),
  clearResult: () => set({ lastResult: null }),

  fetchActive: async (playerId) => {
    set({ isLoading: true, error: null });
    try {
      const activeTask = await sideTaskApi.getActiveSideTask(playerId);
      set({ activeTask: activeTask ?? null, isLoading: false, hintsUsedCount: 0, hints: null, lastResult: null });
    } catch (err) {
      set({ isLoading: false, error: extractError(err), activeTask: null });
    }
  },

  fetchHints: async (playerId, sideTaskId) => {
    set({ error: null });
    try {
      const hints = await sideTaskApi.getSideTaskHints(playerId, sideTaskId);
      set({ hints: Array.isArray(hints) ? hints : hints?.hints ?? [] });
    } catch (err) {
      set({ error: extractError(err) });
    }
  },

  unlockHint: async (playerId, sideTaskId, hintLevel) => {
    set({ isLoading: true, error: null });
    try {
      await sideTaskApi.unlockHint(playerId, { sideTaskId, hintLevel });
      set((s) => ({ hintsUsedCount: s.hintsUsedCount + 1, isLoading: false }));
      await get().fetchHints(playerId, sideTaskId);
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractError(err) });
      return false;
    }
  },

  submit: async (playerId, { sideTaskId, submittedCode, timeSpentSec }) => {
    set({ isLoading: true, error: null });
    try {
      const result = await sideTaskApi.submitSideTask(playerId, {
        sideTaskId, submittedCode, timeSpentSec, sahmHintsUsed: get().hintsUsedCount,
      });
      set({ lastResult: result, isLoading: false });
      return result;
    } catch (err) {
      set({ isLoading: false, error: extractError(err) });
      return null;
    }
  },

  abandon: async (playerId, sideTaskId) => {
    set({ isLoading: true, error: null });
    try {
      await sideTaskApi.abandonSideTask(playerId, sideTaskId);
      set({ activeTask: null, hints: null, lastResult: null, hintsUsedCount: 0, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: extractError(err) });
      return false;
    }
  },
}));