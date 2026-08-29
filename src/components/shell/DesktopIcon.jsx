/**
 * src/components/shell/DesktopIcon.jsx
 *
 * A single icon sitting on the desktop surface (not the dock).
 * Single click selects it (visual highlight), double click opens the
 * app. This mirrors familiar desktop-OS behavior so it doesn't need
 * any explanation in-game.
 */

import AppIcon from '../common/AppIcon';

export default function DesktopIcon({ app, isSelected, onSelect, onOpen }) {
  return (
    <button
      type="button"
      className={`desktop-icon${isSelected ? ' desktop-icon--selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(app.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen(app.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(app.id);
      }}
    >
      <span className="desktop-icon__glyph">
        <AppIcon icon={app.icon} size={28} />
      </span>
      <span className="desktop-icon__label">{app.title}</span>
    </button>
  );
}