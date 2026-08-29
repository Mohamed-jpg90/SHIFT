/**
 * src/components/common/AppIcon.jsx
 *
 * Resolves the `icon` key stored on each app in desktopApps.js to an
 * actual glyph. Centralizing this means swapping the whole OS's icon
 * set later (e.g. for custom SVGs) only touches this one file.
 */

import {
  FiGlobe,
  FiCalendar,
  FiFolder,
  FiCode,
  FiMail,
  FiMessageCircle,
  FiSettings,
  FiTerminal,
  FiGrid,
} from 'react-icons/fi';

const ICON_MAP = {
  browser: FiGlobe,
  calendar: FiCalendar,
  files: FiFolder,
  loopCode: FiCode,
  mailLoop: FiMail,
  whatsUpp: FiMessageCircle,
  settings: FiSettings,
  terminal: FiTerminal,
};

export default function AppIcon({ icon, size = 22, className = '' }) {
  const Glyph = ICON_MAP[icon] ?? FiGrid;
  return <Glyph size={size} className={`app-icon ${className}`} aria-hidden="true" />;
}