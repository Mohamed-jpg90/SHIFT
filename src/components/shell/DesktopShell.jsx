/**
 * src/components/shell/DesktopShell.jsx
 *
 * Root of LoopOS. Mount this once (e.g. from the Game page) and
 * everything else — icons, open windows, the dock — wires itself up
 * through osStore.
 */

import '../../style/utilities.css';
import '../../style/animations.css';

import DesktopIcons from './DesktopIcons';
import WindowManager from './WindowManager';
import Dock from './Dock';
import NotificationStack from './NotificationStack';

export default function DesktopShell() {
  return (
    <div className="los-desktop">
      <DesktopIcons />
      <WindowManager />
      <Dock />
      <NotificationStack />
    </div>
  );
}