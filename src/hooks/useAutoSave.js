import { useEffect, useRef } from 'react';
import { useOsStore } from '../stores/osStore';
import { useAuthStore } from '../stores/authStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { saveProgress } from '../api/gameApi';

const AUTO_SAVE_INTERVAL_MS = 30000;

export function useAutoSave() {
  const userId = useAuthStore((s) => s.userId);
  const timerRef = useRef(null);

  const doSave = () => {
    const { shiftId } = useNarrativeStore.getState();
    if (!userId || !shiftId) return;
    const desktopState = useOsStore.getState().getSerializableState();
    saveProgress(userId, shiftId, 1, desktopState).catch(() => {});
  };

  useEffect(() => {
    timerRef.current = setInterval(doSave, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [userId]);

  return { saveNow: doSave };
}