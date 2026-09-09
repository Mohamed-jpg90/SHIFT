// /**
//  * src/pages/Game.jsx
//  * LoopOS shell + the story controller that drives it.
//  */
// import DesktopShell from '../components/shell/DesktopShell';
// import StoryController from '../components/story/StoryController';

// export default function Game() {
//   return (
//     <>
//       <DesktopShell />
//       <StoryController />
//     </>
//   );
// }

/**
 * src/pages/Game.jsx
 * LoopOS shell — it mounts the story controller internally now.
 */
import DesktopShell from '../components/shell/DesktopShell';

export default function Game() {
  return <DesktopShell />;
}