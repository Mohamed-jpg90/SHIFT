/**
 * src/components/shell/WindowManager.jsx
 *
 * Subscribes to osStore and renders a <Window> per open window
 * instance, in windowOrder. Content is resolved by AppRenderer based
 * on each window's appId — this file doesn't know about specific apps.
 */

import { useOsStore } from '../../stores/osStore';
import Window from './Window';
import AppRenderer from '../common/Apprenderer';

export default function WindowManager() {
  const windows = useOsStore((s) => s.windows);
  const windowOrder = useOsStore((s) => s.windowOrder);

  return (
    <>
      {windowOrder.map((windowId) => {
        const win = windows[windowId];
        if (!win) return null;
        return (
          <Window key={windowId} windowId={windowId}>
            <AppRenderer win={win} />
          </Window>
        );
      })}
    </>
  );
}