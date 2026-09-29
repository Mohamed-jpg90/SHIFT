/**
 * src/components/common/AppRenderer.jsx
 *
 * The single source of truth for: appId -> React component.
 * Window/WindowManager know nothing about specific apps; they just
 * ask AppRenderer to render one. Add an app here once its component
 * exists — nothing else needs to change.
 */
import Browser from '../apps/Browser/Browser';
import Calendar from '../apps/Calendar/Calendar';
import Files from '../apps/Files/Files';
import LoopCode from '../apps/LoopCode/LoopCode';
import MailLoop from '../apps/MailLoop/MailLoop';
import WhatsUpp from '../apps/WhatsUpp/WhatsUpp';
import Settings from '../apps/Settings/Settings';
import Terminal from '../apps/Terminal/Terminal';
import SideTask from '../apps/SideTask/SideTask';
import { APP_IDS } from '../../data/desktopApps';
import AppIcon from './AppIcon';

const APP_COMPONENTS = {
  [APP_IDS.BROWSER]: Browser,
  [APP_IDS.CALENDAR]: Calendar,
  [APP_IDS.FILES]: Files,
  [APP_IDS.LOOP_CODE]: LoopCode,
  [APP_IDS.MAIL_LOOP]: MailLoop,
  [APP_IDS.WHATS_UPP]: WhatsUpp,
  [APP_IDS.SETTINGS]: Settings,
  [APP_IDS.TERMINAL]: Terminal,
  [APP_IDS.SIDE_TASK]: SideTask,
};

function UnknownApp({ win }) {
  return (
    <div className="app-placeholder">
      <AppIcon icon={win.icon} size={40} />
      <p>{win.title} — not available</p>
    </div>
  );
}

/**
 * Renders the app for a given window. `win` is the full window object
 * from osStore (has appId, title, icon, props).
 */
export default function AppRenderer({ win }) {
  const Component = APP_COMPONENTS[win.appId];
  if (!Component) return <UnknownApp win={win} />;
  return <Component windowId={win.id} props={win.props} />;
}
