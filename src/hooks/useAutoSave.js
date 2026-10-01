import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { saveProgress } from '../api/gameApi';

const AUTO_SAVE_INTERVAL_MS = 30000;

export function useAutoSave() {
  const userId = useAuthStore((s) => s.userId);
  const timerRef = useRef(null);

  const doSave = () => {
    const { currentBeatId } = useNarrativeStore.getState();
    if (!userId || !currentBeatId) return;
    saveProgress(userId, currentBeatId).catch(() => {});
  };

  useEffect(() => {
    timerRef.current = setInterval(doSave, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [userId]);

  return { saveNow: doSave };
}
