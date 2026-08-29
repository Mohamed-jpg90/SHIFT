/**
 * src/components/shell/Notification.jsx
 *
 * A single LoopOS notification card (NOT react-hot-toast — that's
 * still used elsewhere for quick UI feedback like "Settings saved").
 * This is in-fiction: "New message from Nadine", "LoopCode unlocked",
 * etc.
 *
 * Auto-dismisses itself after `duration` ms. duration = 0 or null
 * means it stays until the player clicks it away.
 */

import { useEffect } from 'react';
import { useOsStore } from '../../stores/osStore';
import AppIcon from '../common/AppIcon';

export default function Notification({ notification }) {
  const dismissNotification = useOsStore((s) => s.dismissNotification);

  useEffect(() => {
    if (!notification.duration) return undefined;
    const timer = setTimeout(() => {
      dismissNotification(notification.id);
    }, notification.duration);
    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, dismissNotification]);

  return (
    <div
      className={`os-notification os-notification--${notification.type}`}
      onClick={() => dismissNotification(notification.id)}
      role="button"
      tabIndex={0}
    >
      <div className="os-notification__icon">
        <AppIcon icon={notification.icon} size={20} />
      </div>
      <div className="os-notification__body">
        <p className="os-notification__title">{notification.title}</p>
        {notification.message && (
          <p className="os-notification__message">{notification.message}</p>
        )}
      </div>
    </div>
  );
}