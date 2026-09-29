import { create } from 'zustand';
import * as adminApi from '../api/adminNarrativeApi';

const extractError = (err) => err?.response?.data?.description || err?.message || 'Request failed';
const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.shifts)) return value.shifts;
  return [];
};

export const useAdminStore = create((set, get) => ({
  shifts: [],
  currentShift: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchShifts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.getShifts();
      set({ shifts: asList(response), isLoading: false });
    } catch (err) { set({ isLoading: false, error: extractError(err) }); }
  },

  fetchShift: async (shiftId) => {
    set({ isLoading: true, error: null });
    try {
      set({ currentShift: await adminApi.getShift(shiftId), isLoading: false });
    } catch (err) { set({ isLoading: false, error: extractError(err) }); }
  },

  createShift: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const shift = await adminApi.createShift(payload);
      set((s) => ({ shifts: [...s.shifts, shift], isLoading: false }));
      return shift;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return null; }
  },

  updateShift: async (shiftId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const shift = await adminApi.updateShift(shiftId, payload);
      set((s) => ({
        shifts: s.shifts.map((sh) => (sh.shiftId === Number(shiftId) ? shift : sh)),
        currentShift: shift, isLoading: false,
      }));
      return shift;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return null; }
  },

  deleteShift: async (shiftId) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.deleteShift(shiftId);
      set((s) => ({ shifts: s.shifts.filter((sh) => sh.shiftId !== Number(shiftId)), isLoading: false }));
      return true;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return false; }
  },

  createBeat: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const beat = await adminApi.createBeat(payload);
      await get().fetchShift(payload.shiftId);
      return beat;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return null; }
  },

  updateBeat: async (beatId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const beat = await adminApi.updateBeat(beatId, payload);
      if (get().currentShift) await get().fetchShift(get().currentShift.shiftId);
      else set({ isLoading: false });
      return beat;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return null; }
  },

  deleteBeat: async (beatId) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.deleteBeat(beatId);
      if (get().currentShift) await get().fetchShift(get().currentShift.shiftId);
      else set({ isLoading: false });
      return true;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return false; }
  },

  createChoices: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const choices = await adminApi.createChoices(payload);
      set({ isLoading: false });
      return choices;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return null; }
  },

  updateChoice: async (choiceId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const choice = await adminApi.updateChoice(choiceId, payload);
      set({ isLoading: false });
      return choice;
    } catch (err) { set({ isLoading: false, error: extractError(err) }); return null; }
  },
}));
