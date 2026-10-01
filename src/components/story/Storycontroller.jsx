import { useAuthStore } from '../../stores/authStore';
import { useStoryStore } from '../../stores/storyStore';
import { useNarrativeStore } from '../../stores/narrativeStore';
import { runShift } from '../../engine/storyEngine';

export default function StoryController() {
  const isPlaying = useStoryStore((s) => s.isPlaying);
  const currentChapter = useStoryStore((s) => s.currentChapter);
  const currentScenario = useStoryStore((s) => s.currentScenario);
  const currentEventIndex = useStoryStore((s) => s.currentEventIndex);
  const userId = useAuthStore((s) => s.userId);
  const shift = useNarrativeStore((s) => s.shift);
  const gateCleared = useNarrativeStore((s) => s.gateCleared);
  const isLoading = useNarrativeStore((s) => s.isLoading);
  const error = useNarrativeStore((s) => s.error);
  const endCurrentShift = useNarrativeStore((s) => s.endCurrentShift);

  const handleStart = () => {
    if (isPlaying) return;
    runShift(userId);
  };

  const handleEnd = async () => {
    const ended = await endCurrentShift();
    if (ended) runShift(userId);
  };

  return (
    <div className="story-controller">
      {!isPlaying && !gateCleared && <button type="button" onClick={handleStart} disabled={!userId || isLoading}>{isLoading ? 'Loading shift…' : shift ? `Resume ${shift.title}` : 'Start current shift'}</button>}
      {gateCleared && <button type="button" onClick={handleEnd} disabled={isLoading}>{isLoading ? 'Ending shift…' : 'End Shift'}</button>}
      {isPlaying && (
        <p className="story-controller__status">
          Chapter {currentChapter} · Scenario {currentScenario} · Event {currentEventIndex}
        </p>
      )}
      {error && <p className="story-controller__status">{error}</p>}
    </div>
  );
}
