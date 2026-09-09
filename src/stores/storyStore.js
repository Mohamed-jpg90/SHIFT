/**
 * src/stores/storyStore.js
 *
 * Tracks WHERE the player is in the story. Distinct from osStore,
 * which only knows about windows/notifications and has no idea a
 * story exists. storyEngine.js is the only thing that should call
 * the mutating actions here — components read from this store, they
 * don't drive it directly.
 */

import { create } from 'zustand';

const scenarioKey = (chapterId, scenarioId) => `${chapterId}-${scenarioId}`;

export const useStoryStore = create((set, get) => ({
  currentChapter: null,
  currentScenario: null,
  currentEventIndex: 0,
  isPlaying: false,
  completedScenarios: [], // array of "chapterId-scenarioId" keys

  activeVideoCall: null,   // { character, mode, message, resolve }
  activeChoice: null,      // { prompt, options, resolve }
  activeCodeChallenge: null, // { challengeId, storyText, context, task, referenceSolution, resolve }
  lastChoice: null,

  /** Begins a scenario at event 0. */
  startScenario: (chapterId, scenarioId) => {
    set({
      currentChapter: chapterId,
      currentScenario: scenarioId,
      currentEventIndex: 0,
      isPlaying: true,
    });
  },

  /** Jumps to a specific event index within the running scenario. */
  setEventIndex: (index) => set({ currentEventIndex: index }),

  /** Advances to the next event index. */
  nextEvent: () =>
    set((s) => ({ currentEventIndex: s.currentEventIndex + 1 })),

  /** Marks the current scenario finished and stops playback. */
  completeCurrentScenario: () => {
    const { currentChapter, currentScenario, completedScenarios } = get();
    const key = scenarioKey(currentChapter, currentScenario);
    set({
      isPlaying: false,
      completedScenarios: completedScenarios.includes(key)
        ? completedScenarios
        : [...completedScenarios, key],
    });
  },




  startVideoCall: (data) => new Promise((resolve) => {
    set({ activeVideoCall: { ...data, resolve } });
  }),
  continueVideoCall: () => {
    get().activeVideoCall?.resolve();
    set({ activeVideoCall: null });
  },

  startChoice: (data) => new Promise((resolve) => {
    set({ activeChoice: { ...data, resolve } });
  }),
  selectChoice: (optionId) => {
    get().activeChoice?.resolve(optionId);
    set({ activeChoice: null, lastChoice: optionId });
  },

  startCodeChallenge: (data) => new Promise((resolve) => {
    set({ activeCodeChallenge: { ...data, resolve } });
  }),
  submitCodeChallenge: (isCorrect) => {
    const c = get().activeCodeChallenge;
    if (!c || !isCorrect) return;
    c.resolve();
    set({ activeCodeChallenge: null });
  },




  isScenarioCompleted: (chapterId, scenarioId) =>
    get().completedScenarios.includes(scenarioKey(chapterId, scenarioId)),

  /** Full reset, e.g. for a new game / dev testing. */
  reset: () =>
    set({
      currentChapter: null,
      currentScenario: null,
      currentEventIndex: 0,
      isPlaying: false,
      completedScenarios: [],
      activeVideoCall: null,
      activeChoice: null,
      activeCodeChallenge: null,
      lastChoice: null,
    }),
}));