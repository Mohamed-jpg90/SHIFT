/**
 * src/components/shell/Dock.jsx
 *
 * Bottom dock: pinned apps always show; any open non-pinned app is
 * appended with a running dot. Click behavior (per app, not per
 * window):
 *   - not open        -> openWindow
 *   - open + focused   -> minimize the focused window (toggle away)
 *   - open + unfocused -> restore (if minimized) / focus the topmost window
 */

import { desktopApps, pinnedApps } from '../../data/desktopApps';
import { useOsStore } from '../../stores/osStore';
import AppIcon from '../common/AppIcon';

export default function Dock() {
  const windows = useOsStore((s) => s.windows);
  const focusedWindowId = useOsStore((s) => s.focusedWindowId);
  const openWindow = useOsStore((s) => s.openWindow);
  const focusWindow = useOsStore((s) => s.focusWindow);
  const restoreWindow = useOsStore((s) => s.restoreWindow);
  const minimizeWindow = useOsStore((s) => s.minimizeWindow);

  const allWindows = Object.values(windows);
  const openAppIds = [...new Set(allWindows.map((w) => w.appId))];
  const pinnedIds = pinnedApps.map((a) => a.id);
  const dockAppIds = [...new Set([...pinnedIds, ...openAppIds])];

  const handleClick = (appId) => {
    const appWindows = allWindows.filter((w) => w.appId === appId);

    if (appWindows.length === 0) {
      openWindow(appId);
      return;
    }

    const focusedIsThisApp = appWindows.some((w) => w.id === focusedWindowId);
    if (focusedIsThisApp) {
      minimizeWindow(focusedWindowId);
      return;
    }

    const topWindow = appWindows.reduce((top, w) =>
      w.zIndex > top.zIndex ? w : top
    );
    if (topWindow.isMinimized) {
      restoreWindow(topWindow.id);
    } else {
      focusWindow(topWindow.id);
    }
  };

  return (
    <div className="dock">
      {dockAppIds.map((appId) => {
        const app = desktopApps[appId];
        if (!app) return null;
        const isOpen = allWindows.some((w) => w.appId === appId);
        return (
          <button
            key={appId}
            type="button"
            className="dock-item"
            onClick={() => handleClick(appId)}
            aria-label={app.title}
          >
            <AppIcon icon={app.icon} size={26} />
            {isOpen && <span className="dock-item__dot" />}
          </button>
        );
      })}
    </div>
  );
}