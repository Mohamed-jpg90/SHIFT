import { useEffect, useState } from 'react';
import { useStoryStore } from '../../stores/storyStore';
import {
  playSound,
  stopSound,
} from '../../audio/soundManager';


const characterImages = {
  nadine: '/assets/characters/nadine.jpg',
  salma: '/assets/characters/salma.jpg',
  tante_layla: '/assets/characters/tante-layla.jpg',
  tarek: '/assets/characters/tarek.jpg',
  yousef: '/assets/characters/yousef.jpg',
  default: '/assets/characters/default.jpg',
};

export default function VideoCallModal() {
  const call = useStoryStore((s) => s.activeVideoCall);
  const continueVideoCall = useStoryStore((s) => s.continueVideoCall);

  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!call) {
      stopSound('callIncoming');

      setConnected(false);
      setSeconds(0);

      return undefined;
    }
    console.log(call);


    if (call.mode === 'incoming') {
      playSound('callIncoming');
    }

    if (call.mode !== 'incoming') {
      setConnected(true);
    }

    return () => {
      stopSound('callIncoming');
    };
  }, [call]);

  useEffect(() => {
    if (!connected) return undefined;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [connected]);

  if (!call) return null;

  const handleAnswer = () => {
    playSound('callConnected');
    setConnected(true);
    stopSound('callIncoming')
  };

  const handleContinue = () => {
    playSound('windowClose');
    continueVideoCall();
    stopSound('callConnected')
    setConnected(false)
  };

  // const imageSrc =
  // characterImages[call.avatar] ?? characterImages.default;

  const imageSrc =
    call.portrait ?? characterImages.default;

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="video-call-overlay">
      <div className="video-call-modal">
        <img
          className="video-call-modal__portrait"
          src={imageSrc}
          alt={call.character}
        />

        <p className="video-call-modal__name">
          {call.character}
        </p>

        <p className="video-call-modal__status">
          {connected ? `${mm}:${ss}` : 'Incoming video call'}
        </p>

        {connected && (
          <p className="video-call-modal__message">
            {call.message}
          </p>
        )}
        <div className="video-call-modal__actions">
          {!connected && call.mode === 'incoming' ? (
            <>
              <button
                type="button"
                className="video-call-btn video-call-btn--decline"
                onClick={handleContinue}
              >
                Decline
              </button>

              <button
                type="button"
                className="video-call-btn video-call-btn--answer"
                onClick={handleAnswer}
              >
                Answer
              </button>
            </>
          ) : (
            <button
              type="button"
              className="video-call-btn video-call-btn--answer"
              onClick={handleContinue}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}