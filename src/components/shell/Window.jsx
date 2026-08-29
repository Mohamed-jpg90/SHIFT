/**
 * src/components/shell/Window.jsx
 *
 * Renders the chrome (title bar + buttons + resize handle) for a
 * single window, and drives its drag/resize interactions straight
 * into osStore. Purely presentational otherwise — the actual app
 * content is passed in as `children` by WindowManager, which decides
 * what to render based on the window's appId.
 *
 * Minimized windows are still mounted (so app-internal state, like a
 * half-typed WhatsUpp message, survives being hidden) but rendered
 * with display:none via the `isMinimized` class.
 */

import { useRef, useCallback } from 'react';
import { useOsStore } from '../../stores/osStore';
import AppIcon from '../common/AppIcon';

export default function Window({ windowId, children }) {
  // Selecting the nested window object directly means this component
  // only re-renders when THIS window changes (other windows' updates
  // don't touch this object's reference).
  const win = useOsStore((s) => s.windows[windowId]);
  const isFocused = useOsStore((s) => s.focusedWindowId === windowId);

  const focusWindow = useOsStore((s) => s.focusWindow);
  const closeWindow = useOsStore((s) => s.closeWindow);
  const minimizeWindow = useOsStore((s) => s.minimizeWindow);
  const maximizeWindow = useOsStore((s) => s.maximizeWindow);
  const moveWindow = useOsStore((s) => s.moveWindow);
  const resizeWindow = useOsStore((s) => s.resizeWindow);

  const dragState = useRef(null);
  const resizeState = useRef(null);

  const handleTitleBarMouseDown = useCallback(
    (e) => {
      if (!win || win.isMaximized) return;
      // Ignore drags started on a title-bar button.
      if (e.target.closest('.window-controls')) return;

      focusWindow(windowId);

      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: win.position.x,
        originY: win.position.y,
      };

      const handleMouseMove = (moveEvent) => {
        if (!dragState.current) return;
        const dx = moveEvent.clientX - dragState.current.startX;
        const dy = moveEvent.clientY - dragState.current.startY;
        moveWindow(windowId, {
          x: dragState.current.originX + dx,
          y: Math.max(0, dragState.current.originY + dy),
        });
      };

      const handleMouseUp = () => {
        dragState.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [win, windowId, focusWindow, moveWindow]
  );

  const handleResizeMouseDown = useCallback(
    (e) => {
      if (!win || win.isMaximized || !win.resizable) return;
      e.stopPropagation();
      focusWindow(windowId);

      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originW: win.size.width,
        originH: win.size.height,
      };

      const handleMouseMove = (moveEvent) => {
        if (!resizeState.current) return;
        const dx = moveEvent.clientX - resizeState.current.startX;
        const dy = moveEvent.clientY - resizeState.current.startY;
        resizeWindow(windowId, {
          width: resizeState.current.originW + dx,
          height: resizeState.current.originH + dy,
        });
      };

      const handleMouseUp = () => {
        resizeState.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [win, windowId, focusWindow, resizeWindow]
  );

  if (!win) return null;

  return (
    <div
      className={[
        'os-window',
        isFocused ? 'os-window--focused' : '',
        win.isMinimized ? 'os-window--minimized' : '',
        win.isMaximized ? 'os-window--maximized' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      }}
      onMouseDown={() => focusWindow(windowId)}
    >
      <div className="window-titlebar" onMouseDown={handleTitleBarMouseDown}>
        <span className="window-titlebar__icon">
          <AppIcon icon={win.icon} size={15} />
        </span>
        <span className="window-titlebar__title">{win.title}</span>

        <div className="window-controls">
          <button
            type="button"
            className="window-control window-control--minimize"
            aria-label="Minimize"
            onClick={() => minimizeWindow(windowId)}
          />
          <button
            type="button"
            className="window-control window-control--maximize"
            aria-label={win.isMaximized ? 'Restore' : 'Maximize'}
            onClick={() => maximizeWindow(windowId)}
          />
          <button
            type="button"
            className="window-control window-control--close"
            aria-label="Close"
            onClick={() => closeWindow(windowId)}
          />
        </div>
      </div>

      <div className="window-content">{children}</div>

      {win.resizable && !win.isMaximized && (
        <div
          className="window-resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
}