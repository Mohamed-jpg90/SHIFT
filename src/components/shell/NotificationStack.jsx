/**
 * src/components/shell/NotificationStack.jsx
 *
 * Renders every active notification from osStore, stacked top-right.
 * Mounted once inside DesktopShell.
 */

import { useOsStore } from '../../stores/osStore';
import Notification from './Notification';

export default function NotificationStack() {
  const notifications = useOsStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="notification-stack">
      {notifications.map((n) => (
        <Notification key={n.id} notification={n} />
      ))}
    </div>
  );
}