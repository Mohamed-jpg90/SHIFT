import { useStoryStore } from '../../stores/storyStore';

const THEME_CLASS = {
  default: 'desktop-background--default',
  night: 'desktop-background--night',
  glitch: 'desktop-background--glitch',
};

export default function DesktopBackground() {
  const theme = useStoryStore((s) => s.backgroundTheme);
  const themeClass = THEME_CLASS[theme] ?? THEME_CLASS.default;

  return <div className={`desktop-background ${themeClass}`} aria-hidden="true" />;
}