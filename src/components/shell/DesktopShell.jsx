import '../../style/utilities.css';
import '../../style/animations.css';
import '../../style/tokens.css';
import { useAutoSave } from '../../hooks/useAutoSave';

import DesktopBackground from './DesktopBackground';
import DesktopIcons from './DesktopIcons';
import WindowManager from './WindowManager';
import Dock from './Dock';
import NotificationStack from './NotificationStack';
import StoryController from '../story/StoryController';
import VideoCallModal from '../special/VideoCallModal';
import ChoiceModal from '../story/ChoiceModal';

export default function DesktopShell() {
    useAutoSave();

  return (
    <div className="los-desktop">
      <DesktopBackground />
      <DesktopIcons />
      <WindowManager />
      <Dock />
      <NotificationStack />
      <StoryController />
      <VideoCallModal />
      <ChoiceModal />
    </div>
  );
}