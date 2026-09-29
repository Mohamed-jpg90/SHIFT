import { SOUNDS } from './sounds';
import { useSettingsStore } from '../stores/settingsStore';

const audioCache = new Map();

function getAudio(src) {
  if (!audioCache.has(src)) {
    audioCache.set(src, new Audio(src));
  }

  return audioCache.get(src);
}

export function playSound(name, options = {}) {
  const src = SOUNDS[name];

  if (!src) {
    console.warn(`[soundManager] Unknown sound: ${name}`);
    return;
  }

  const { muted, masterVolume, sfxVolume } =
    useSettingsStore.getState();

  if (muted) return;

  const audio = getAudio(src);

  audio.pause();
  audio.currentTime = 0;

  audio.volume =
    (options.volume ?? 1) *
    masterVolume *
    sfxVolume;

  audio.play().catch(() => {});
}

export function stopSound(name) {
  const src = SOUNDS[name];

  if (!src) {
    console.warn(`[soundManager] Unknown sound: ${name}`);
    return;
  }

  const audio = audioCache.get(src);

  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}

export function stopAllSounds() {
  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}