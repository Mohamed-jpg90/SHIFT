import { create } from 'zustand';

export const useSettingsStore = create((set) => ({
  masterVolume: 1,
  sfxVolume: 1,
  musicVolume: 1,
  muted: false,
  wallpaper: 'default',

  setMasterVolume: (v) => set({ masterVolume: v }),
  setSfxVolume: (v) => set({ sfxVolume: v }),
  setMusicVolume: (v) => set({ musicVolume: v }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setWallpaper: (w) => set({ wallpaper: w }),
}));