import { useAuthStore } from '../../stores/authStore';
import { useStoryStore } from '../../stores/storyStore';
import { runShift } from '../../engine/storyEngine';

export default function StoryController() {
  const isPlaying = useStoryStore((s) => s.isPlaying);
  const currentChapter = useStoryStore((s) => s.currentChapter);
  const currentScenario = useStoryStore((s) => s.currentScenario);
  const currentEventIndex = useStoryStore((s) => s.currentEventIndex);
  const userId = useAuthStore((s) => s.userId);

  const handleStart = () => {
    if (isPlaying) return;
    runShift(userId, 1); // TODO: confirm real playerId source
  };

  return (
    <div className="story-controller">
      {!isPlaying && <button type="button" onClick={handleStart}>Start Shift 1</button>}
      {isPlaying && (
        <p className="story-controller__status">
          Chapter {currentChapter} · Scenario {currentScenario} · Event {currentEventIndex}
        </p>
      )}
    </div>
  );
}