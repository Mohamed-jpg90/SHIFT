/**
 * src/components/shell/WindowManager.jsx
 *
 * Subscribes to osStore and renders a <Window> per open window
 * instance, in windowOrder. Content per appId is resolved via
 * APP_COMPONENTS below — swap a placeholder for the real app
 * component as each one gets built (e.g. WhatsUpp: WhatsUppApp).
 */

import { useOsStore } from '../../stores/osStore';
import Window from './Window';
import AppIcon from '../common/AppIcon';

// appId -> component rendering that app's content inside a Window.
// Add real entries here as apps get built; anything missing falls
// back to AppPlaceholder.
const APP_COMPONENTS = {
  // whatsUpp: WhatsUppApp,
  // mailLoop: MailLoopApp,
  // loopCode: LoopCodeApp,
};

function AppPlaceholder({ win }) {
  return (
    <div className="app-placeholder">
      <AppIcon icon={win.icon} size={40} />
      <p>{win.title} — coming soon</p>
    </div>
  );
}

export default function WindowManager() {
  const windows = useOsStore((s) => s.windows);
  const windowOrder = useOsStore((s) => s.windowOrder);

  return (
    <>
      {windowOrder.map((windowId) => {
        const win = windows[windowId];
        if (!win) return null;
        const AppContent = APP_COMPONENTS[win.appId];
        return (
          <Window key={windowId} windowId={windowId}>
            {AppContent ? (
              <AppContent windowId={windowId} props={win.props} />
            ) : (
              <AppPlaceholder win={win} />
            )}
          </Window>
        );
      })}
    </>
  );
}