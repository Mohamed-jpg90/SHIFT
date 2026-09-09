/**
 * src/components/story/StoryController.jsx
 *
 * The bridge between React and storyEngine. Mount this once (e.g.
 * alongside DesktopShell in the Game page). For now it just exposes a
 * way to kick a scenario off — real auto-start-on-login logic comes
 * once more scenarios exist.
 */

import { useStoryStore } from '../../stores/storyStore';
import { runScenario } from '../../engine/storyEngine';

export default function StoryController() {
  const isPlaying = useStoryStore((s) => s.isPlaying);
  const currentChapter = useStoryStore((s) => s.currentChapter);
  const currentScenario = useStoryStore((s) => s.currentScenario);
  const currentEventIndex = useStoryStore((s) => s.currentEventIndex);

  // Dev-only trigger until there's a real "start chapter" entry point
  // (e.g. from Login success or a chapter-select screen).
  const handleStart = () => {
    if (isPlaying) return;
    runScenario(1, 1);
  };

  return (
    <div className="story-controller">
      {!isPlaying && (
        <button type="button" onClick={handleStart}>
          Start Scenario 1
        </button>
      )}
      {isPlaying && (
        <p className="story-controller__status">
          Chapter {currentChapter} · Scenario {currentScenario} · Event{' '}
          {currentEventIndex}
        </p>
      )}
    </div>
  );
}