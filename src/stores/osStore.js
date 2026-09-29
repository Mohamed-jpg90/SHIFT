/**
 * src/stores/osStore.js
 *
 * The brain of LoopOS.
 *
 * Owns every open window's state: position, size, z-index, minimized/
 * maximized/focused status. Nothing about *what* an app renders lives
 * here — that's the job of the components under src/components/apps/.
 * This store only answers: which windows exist, where are they, what
 * order are they stacked in, and which one is active.
 *
 * ------------------------------------------------------------------
 * Window data structure
 * ------------------------------------------------------------------
 * {
 *   id: string,            // unique instance id, e.g. "whatsUpp-1"
 *   appId: string,         // key into desktopApps registry
 *   title: string,         // window title bar text
 *   icon: string,          // icon key from desktopApps registry
 *   position: { x, y },    // top-left corner in px, relative to desktop
 *   size: { width, height },
 *   prevBounds: { position, size } | null, // saved bounds for un-maximize
 *   zIndex: number,        // stacking order, higher = on top
 *   isMinimized: boolean,
 *   isMaximized: boolean,
 *   resizable: boolean,
 *   minSize: { width, height },
 *   props: object,         // arbitrary data passed to the app on open
 *                          // (e.g. { chatId: 'sahm' } for WhatsUpp)
 * }
 * ------------------------------------------------------------------
 */

import { create } from 'zustand';
import { getAppConfig } from '../data/desktopApps';

const BASE_Z_INDEX = 10;
const CASCADE_OFFSET = 32; // px shift applied to each newly opened window
const CASCADE_LIMIT = 8; // how many times to cascade before wrapping

let instanceCounter = 0;
const nextInstanceId = (appId) => `${appId}-${++instanceCounter}`;

let notificationCounter = 0;
const nextNotificationId = () => `notification-${++notificationCounter}`;

const DEFAULT_NOTIFICATION_DURATION = 5000; // ms

/**
 * Computes a cascading default position so new windows don't all stack
 * exactly on top of one another.
 */
const getCascadePosition = (openCount, size) => {
  const step = openCount % CASCADE_LIMIT;
  const viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : 800;

  const baseX = Math.max(0, (viewportWidth - size.width) / 2);
  const baseY = Math.max(0, (viewportHeight - size.height) / 2);

  const rawX = baseX + step * CASCADE_OFFSET - (CASCADE_LIMIT * CASCADE_OFFSET) / 2;
  const rawY = baseY + step * CASCADE_OFFSET - (CASCADE_LIMIT * CASCADE_OFFSET) / 2;

  return {
    x: Math.min(Math.max(rawX, 0), Math.max(0, viewportWidth - size.width)),
    y: Math.min(Math.max(rawY, 24), Math.max(24, viewportHeight - size.height)),
  };
};

export const useOsStore = create((set, get) => ({
  // ---------------------------------------------------------------
  // State
  // ---------------------------------------------------------------
  windows: {}, // { [windowId]: WindowState }
  windowOrder: [], // array of windowIds, back-to-front stacking reference
  focusedWindowId: null,
  nextZIndex: BASE_Z_INDEX,

  // In-game / in-OS notifications (NOT react-hot-toast). Rendered by
  // NotificationStack. See addNotification below for the shape.
  notifications: [],

  // ---------------------------------------------------------------
  // Selectors (plain functions, call with getState() or inside components
  // via useOsStore(s => s.getWindow(id)) style usage)
  // ---------------------------------------------------------------
  getWindow: (windowId) => get().windows[windowId],

  getWindowsByApp: (appId) =>
    Object.values(get().windows).filter((w) => w.appId === appId),

  getOpenWindows: () =>
    get().windowOrder
      .map((id) => get().windows[id])
      .filter(Boolean),

  isAppOpen: (appId) =>
    Object.values(get().windows).some((w) => w.appId === appId),

  // ---------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------

  /**
   * Opens a new window for the given app.
   * - If the app is a singleton and already has an open window, that
   *   window is restored (if minimized) and focused instead of a
   *   duplicate being created.
   * - `overrides` can set custom title/position/size/props, useful for
   *   narrative-triggered windows (e.g. a specific WhatsUpp chat).
   *
   * Returns the windowId of the (new or existing) window.
   */
  openWindow: (appId, overrides = {}) => {
    const config = getAppConfig(appId);
    if (!config) {
      console.warn(`[osStore] openWindow: unknown appId "${appId}"`);
      return null;
    }

    const state = get();

    // Singleton apps: focus/restore the existing instance instead of
    // spawning a new one.
    if (config.singleton) {
      const existing = Object.values(state.windows).find(
        (w) => w.appId === appId
      );
      if (existing) {
        if (existing.isMinimized) {
          get().restoreWindow(existing.id);
        } else {
          get().focusWindow(existing.id);
        }
        return existing.id;
      }
    }

    const windowId = nextInstanceId(appId);
    const size = overrides.size ?? config.defaultSize;
    const position =
      overrides.position ??
      (config.defaultPosition === 'center'
        ? getCascadePosition(state.windowOrder.length, size)
        : config.defaultPosition);

    const zIndex = state.nextZIndex;

    const newWindow = {
      id: windowId,
      appId,
      title: overrides.title ?? config.title,
      icon: overrides.icon ?? config.icon,
      position,
      size,
      prevBounds: null,
      zIndex,
      isMinimized: false,
      isMaximized: false,
      resizable: config.resizable ?? true,
      minSize: config.minSize ?? { width: 320, height: 240 },
      props: overrides.props ?? {},
    };

    set((s) => ({
      windows: { ...s.windows, [windowId]: newWindow },
      windowOrder: [...s.windowOrder, windowId],
      focusedWindowId: windowId,
      nextZIndex: s.nextZIndex + 1,
    }));

    return windowId;
  },

  /**
   * Closes and fully removes a window from state.
   */
  closeWindow: (windowId) => {
    set((s) => {
      if (!s.windows[windowId]) return s;

      const { [windowId]: _removed, ...remainingWindows } = s.windows;
      const remainingOrder = s.windowOrder.filter((id) => id !== windowId);

      // If we closed the focused window, focus whichever remaining
      // window is on top of the stack (highest zIndex), else null.
      let nextFocused = s.focusedWindowId;
      if (s.focusedWindowId === windowId) {
        nextFocused =
          remainingOrder.length > 0
            ? remainingOrder.reduce((topId, id) =>
                remainingWindows[id].zIndex > remainingWindows[topId].zIndex
                  ? id
                  : topId
              )
            : null;
      }

      return {
        windows: remainingWindows,
        windowOrder: remainingOrder,
        focusedWindowId: nextFocused,
      };
    });
  },

  /**
   * Brings a window to the front and marks it as focused.
   * No-ops gracefully if the window doesn't exist or is minimized
   * (callers should use restoreWindow first for minimized windows).
   */
  focusWindow: (windowId) => {
    const state = get();
    const win = state.windows[windowId];
    if (!win) return;

    // Already on top and focused: nothing to do.
    if (state.focusedWindowId === windowId && win.zIndex === state.nextZIndex - 1) {
      return;
    }

    set((s) => ({
      windows: {
        ...s.windows,
        [windowId]: { ...win, zIndex: s.nextZIndex },
      },
      focusedWindowId: windowId,
      nextZIndex: s.nextZIndex + 1,
    }));
  },

  /**
   * Minimizes a window (hides it, e.g. to the dock) without closing it.
   * If the minimized window was focused, focus drops to the next
   * highest window still visible, or null.
   */
  minimizeWindow: (windowId) => {
    set((s) => {
      const win = s.windows[windowId];
      if (!win || win.isMinimized) return s;

      const updatedWindows = {
        ...s.windows,
        [windowId]: { ...win, isMinimized: true },
      };

      let nextFocused = s.focusedWindowId;
      if (s.focusedWindowId === windowId) {
        const visibleIds = s.windowOrder.filter(
          (id) => id !== windowId && !updatedWindows[id].isMinimized
        );
        nextFocused =
          visibleIds.length > 0
            ? visibleIds.reduce((topId, id) =>
                updatedWindows[id].zIndex > updatedWindows[topId].zIndex
                  ? id
                  : topId
              )
            : null;
      }

      return { windows: updatedWindows, focusedWindowId: nextFocused };
    });
  },

  /**
   * Un-minimizes a window and brings it to the front.
   */
  restoreWindow: (windowId) => {
    const win = get().windows[windowId];
    if (!win) return;

    set((s) => ({
      windows: {
        ...s.windows,
        [windowId]: { ...s.windows[windowId], isMinimized: false },
      },
    }));

    get().focusWindow(windowId);
  },

  /**
   * Toggles a window between maximized (fills the desktop) and its
   * previous bounds. Saves/restores position+size via `prevBounds`.
   */
  maximizeWindow: (windowId) => {
    set((s) => {
      const win = s.windows[windowId];
      if (!win) return s;

      if (win.isMaximized) {
        // Restore previous bounds.
        const restored = win.prevBounds ?? {
          position: win.position,
          size: win.size,
        };
        return {
          windows: {
            ...s.windows,
            [windowId]: {
              ...win,
              isMaximized: false,
              position: restored.position,
              size: restored.size,
              prevBounds: null,
            },
          },
        };
      }

      // Save current bounds, then fill the desktop.
      const viewportWidth =
        typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewportHeight =
        typeof window !== 'undefined' ? window.innerHeight : 800;

      return {
        windows: {
          ...s.windows,
          [windowId]: {
            ...win,
            isMaximized: true,
            prevBounds: { position: win.position, size: win.size },
            position: { x: 0, y: 0 },
            size: { width: viewportWidth, height: viewportHeight },
          },
        },
      };
    });

    get().focusWindow(windowId);
  },

  /**
   * Updates a window's position, e.g. while dragging.
   */
  moveWindow: (windowId, position) => {
    set((s) => {
      const win = s.windows[windowId];
      if (!win || win.isMaximized) return s;
      return {
        windows: { ...s.windows, [windowId]: { ...win, position } },
      };
    });
  },

  /**
   * Updates a window's size, e.g. while resizing. Clamps to the app's
   * configured minSize.
   */
  resizeWindow: (windowId, size) => {
    set((s) => {
      const win = s.windows[windowId];
      if (!win || win.isMaximized || !win.resizable) return s;

      const clamped = {
        width: Math.max(size.width, win.minSize.width),
        height: Math.max(size.height, win.minSize.height),
      };

      return {
        windows: { ...s.windows, [windowId]: { ...win, size: clamped } },
      };
    });
  },

  /**
   * Closes every open window. Useful for logout / narrative resets.
   */
  closeAllWindows: () => {
    set({ windows: {}, windowOrder: [], focusedWindowId: null });
  },

  // ---------------------------------------------------------------
  // Notifications (LoopOS in-game system, distinct from react-hot-toast)
  // ---------------------------------------------------------------
  //
  // Shape:
  // {
  //   id, appId, title, message, icon, type,
  //   createdAt: number (Date.now()),
  //   duration: number (ms) | null  // null/0 = stays until dismissed
  // }

  /**
   * Adds a notification. Returns its id.
   * `duration` defaults to 5000ms; pass 0 or null for a persistent
   * notification the player must dismiss manually.
   */
  addNotification: (notification) => {
    const id = notification.id ?? nextNotificationId();
    const entry = {
      id,
      appId: notification.appId ?? null,
      title: notification.title ?? '',
      message: notification.message ?? '',
      icon: notification.icon ?? notification.appId ?? null,
      type: notification.type ?? 'info',
      createdAt: Date.now(),
      duration:
        notification.duration === undefined
          ? DEFAULT_NOTIFICATION_DURATION
          : notification.duration,
    };

    set((s) => ({ notifications: [...s.notifications, entry] }));
    return id;
  },

  /**
   * Removes a notification by id (e.g. after its timer expires).
   */
  removeNotification: (id) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  },

  /**
   * Same as removeNotification, semantically for a user-initiated
   * close (clicking the notification's dismiss button/tapping it away).
   */
  dismissNotification: (id) => {
    get().removeNotification(id);
  },

  /**
   * Clears every notification currently on screen.
   */
  clearNotifications: () => {
    set({ notifications: [] });
  },

    getSerializableState: () => {
    const { windows, windowOrder, focusedWindowId } = get();
    return {
      open_windows: windowOrder.map((id) => windows[id]?.appId).filter(Boolean),
      active_window: focusedWindowId ? windows[focusedWindowId]?.appId : null,
      window_positions: Object.fromEntries(
        windowOrder.map((id) => [
          windows[id].appId,
          { x: windows[id].position.x, y: windows[id].position.y, width: windows[id].size.width, height: windows[id].size.height },
        ])
      ),
    };
  },

  restoreState: (desktopState) => {
    if (!desktopState?.open_windows) return;
    get().closeAllWindows();
    desktopState.open_windows.forEach((appId) => {
      const windowId = get().openWindow(appId);
      const pos = desktopState.window_positions?.[appId];
      if (windowId && pos) {
        get().moveWindow(windowId, { x: pos.x, y: pos.y });
        get().resizeWindow(windowId, { width: pos.width, height: pos.height });
      }
    });
  },

  
}));