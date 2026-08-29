/**
 * src/components/shell/DesktopIcons.jsx
 *
 * Renders the grid of icons on the desktop surface itself (as opposed
 * to the Dock, which shows pinned/running apps). Owns which icon is
 * currently "selected" (single click) as local UI state — selection
 * doesn't need to live in the global store.
 *
 * `appIds` defaults to every registered app. Once game progress exists,
 * pass a filtered list here (e.g. only apps unlocked so far in the
 * story) instead of changing this component.
 */

import { useState } from 'react';
import { desktopApps } from '../../data/desktopApps';
import { useOsStore } from '../../stores/osStore';
import DesktopIcon from './DesktopIcon';

export default function DesktopIcons({ appIds }) {
  const [selectedId, setSelectedId] = useState(null);
  const openWindow = useOsStore((s) => s.openWindow);

  const ids = appIds ?? Object.keys(desktopApps);
  const apps = ids.map((id) => desktopApps[id]).filter(Boolean);

  return (
    <div
      className="desktop-icons"
      // Clicking empty desktop space clears selection.
      onClick={() => setSelectedId(null)}
    >
      {apps.map((app) => (
        <DesktopIcon
          key={app.id}
          app={app}
          isSelected={selectedId === app.id}
          onSelect={setSelectedId}
          onOpen={openWindow}
        />
      ))}
    </div>
  );
}