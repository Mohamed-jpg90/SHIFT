import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useStoryStore } from '../../stores/storyStore';
import { useNarrativeStore } from '../../stores/narrativeStore';
import { submitChoice } from '../../api/gameApi';

export default function ChoiceModal() {
  const choice = useStoryStore((s) => s.activeChoice);
  const selectChoice = useStoryStore((s) => s.selectChoice);
  const playerId = useNarrativeStore((s) => s.playerId);
  const [highlighted, setHighlighted] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!choice) return undefined;
    setHighlighted(0);
    setSubmitting(false);
    const handleKey = (e) => {
      if (submitting) return;
      if (e.key === 'ArrowDown') setHighlighted((h) => Math.min(h + 1, choice.options.length - 1));
      else if (e.key === 'ArrowUp') setHighlighted((h) => Math.max(h - 1, 0));
      else if (e.key === 'Enter') handlePick(choice.options[highlighted].id);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [choice, highlighted, submitting]);

  if (!choice) return null;

  const handlePick = async (choiceId) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await submitChoice(playerId, choiceId);
      if (result?.immediateFeedback) toast(result.immediateFeedback);
    } catch {
      toast.error('Failed to submit choice');
    } finally {
      selectChoice(choiceId);
    }
  };

  return (
    <div className="choice-overlay">
      <div className="choice-modal">
        {choice.portrait && <img className="choice-modal__portrait" src={choice.portrait} alt="" />}
        {choice.prompt && <p className="choice-modal__prompt">{choice.prompt}</p>}
        <div className="choice-modal__options">
          {choice.options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              className={`choice-card${i === highlighted ? ' choice-card--highlighted' : ''}`}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => handlePick(o.id)}
              disabled={submitting}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}