import { create } from 'zustand';

export const useLoopCodeStore = create((set) => ({
  viewContent: null, // { text, sender } | null — set when a narrative beat displays text in LoopCode

  showView: (text, sender) => set({ viewContent: { text, sender } }),
  clearView: () => set({ viewContent: null }),
}));