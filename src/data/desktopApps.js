/**
 * src/data/desktopApps.js
 *
 * Central registry of every app that can appear on the LoopOS desktop,
 * dock, or be opened as a window. This is the single source of truth
 * osStore reads from when it needs to know an app's default window
 * size, icon, title, etc.
 *
 * To add a new app to the OS: add an entry here, then create the
 * matching component under src/components/apps/<AppName>/.
 */

export const APP_IDS = {
  BROWSER: 'browser',
  CALENDAR: 'calendar',
  FILES: 'files',
  LOOP_CODE: 'loopCode',
  MAIL_LOOP: 'mailLoop',
  WHATS_UPP: 'whatsUpp',
  SETTINGS: 'settings',
  TERMINAL: 'terminal',
};

/**
 * @typedef {Object} DesktopApp
 * @property {string} id            - unique app id (matches APP_IDS)
 * @property {string} title         - display name shown in title bar / dock tooltip
 * @property {string} icon          - icon key (resolved by AppIcon component)
 * @property {boolean} pinned       - whether it shows in the dock by default
 * @property {boolean} singleton    - if true, only one window of this app can be open at once
 * @property {{ width: number, height: number }} defaultSize
 * @property {{ x: number, y: number } | 'center'} defaultPosition
 * @property {boolean} resizable
 * @property {{ width: number, height: number }} minSize
 */

export const desktopApps = {
  [APP_IDS.BROWSER]: {
    id: APP_IDS.BROWSER,
    title: 'Browser',
    icon: 'browser',
    pinned: true,
    singleton: false,
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 420, height: 320 },
    defaultPosition: 'center',
    resizable: true,
  },
  [APP_IDS.CALENDAR]: {
    id: APP_IDS.CALENDAR,
    title: 'Calendar',
    icon: 'calendar',
    pinned: true,
    singleton: true,
    defaultSize: { width: 640, height: 520 },
    minSize: { width: 400, height: 360 },
    defaultPosition: 'center',
    resizable: true,
  },
  [APP_IDS.FILES]: {
    id: APP_IDS.FILES,
    title: 'Files',
    icon: 'files',
    pinned: true,
    singleton: false,
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 420, height: 320 },
    defaultPosition: 'center',
    resizable: true,
  },
  [APP_IDS.LOOP_CODE]: {
    id: APP_IDS.LOOP_CODE,
    title: 'LoopCode',
    icon: 'loopCode',
    pinned: true,
    singleton: true,
    defaultSize: { width: 860, height: 600 },
    minSize: { width: 480, height: 360 },
    defaultPosition: 'center',
    resizable: true,
  },
  [APP_IDS.MAIL_LOOP]: {
    id: APP_IDS.MAIL_LOOP,
    title: 'MailLoop',
    icon: 'mailLoop',
    pinned: true,
    singleton: true,
    defaultSize: { width: 780, height: 560 },
    minSize: { width: 420, height: 360 },
    defaultPosition: 'center',
    resizable: true,
  },
  [APP_IDS.WHATS_UPP]: {
    id: APP_IDS.WHATS_UPP,
    title: 'WhatsUpp',
    icon: 'whatsUpp',
    pinned: true,
    singleton: true,
    defaultSize: { width: 720, height: 560 },
    minSize: { width: 380, height: 360 },
    defaultPosition: 'center',
    resizable: true,
  },
  [APP_IDS.SETTINGS]: {
    id: APP_IDS.SETTINGS,
    title: 'Settings',
    icon: 'settings',
    pinned: false,
    singleton: true,
    defaultSize: { width: 620, height: 480 },
    minSize: { width: 420, height: 360 },
    defaultPosition: 'center',
    resizable: true,
  },
  [APP_IDS.TERMINAL]: {
    id: APP_IDS.TERMINAL,
    title: 'Terminal',
    icon: 'terminal',
    pinned: false,
    singleton: false,
    defaultSize: { width: 680, height: 440 },
    minSize: { width: 360, height: 260 },
    defaultPosition: 'center',
    resizable: true,
  },
};

export const getAppConfig = (appId) => desktopApps[appId] ?? null;

export const pinnedApps = Object.values(desktopApps).filter((a) => a.pinned);