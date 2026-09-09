import { useSettingsStore } from '../../../stores/settingsStore';
import { useStoryStore } from '../../../stores/storyStore';

const WALLPAPERS = ['default', 'night', 'glitch'];

export default function Settings() {
  const { masterVolume, sfxVolume, musicVolume, muted, wallpaper } = useSettingsStore();
  const setMasterVolume = useSettingsStore((s) => s.setMasterVolume);
  const setSfxVolume = useSettingsStore((s) => s.setSfxVolume);
  const setMusicVolume = useSettingsStore((s) => s.setMusicVolume);
  const toggleMute = useSettingsStore((s) => s.toggleMute);
  const setWallpaperSetting = useSettingsStore((s) => s.setWallpaper);
  const setBackgroundTheme = useStoryStore((s) => s.setBackgroundTheme);

  const handleWallpaper = (w) => {
    setWallpaperSetting(w);
    setBackgroundTheme(w);
  };

  return (
    <div className="settings">
      <h3>Audio</h3>
      <label>
        Master Volume
        <input type="range" min="0" max="1" step="0.05" value={masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))} />
      </label>
      <label>
        Sound Effects
        <input type="range" min="0" max="1" step="0.05" value={sfxVolume}
          onChange={(e) => setSfxVolume(Number(e.target.value))} />
      </label>
      <label>
        Music
        <input type="range" min="0" max="1" step="0.05" value={musicVolume}
          onChange={(e) => setMusicVolume(Number(e.target.value))} />
      </label>
      <button type="button" onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>

      <h3>Wallpaper</h3>
      <div className="settings__wallpapers">
        {WALLPAPERS.map((w) => (
          <button
            key={w}
            type="button"
            className={`settings__wallpaper-btn${wallpaper === w ? ' settings__wallpaper-btn--active' : ''}`}
            onClick={() => handleWallpaper(w)}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}