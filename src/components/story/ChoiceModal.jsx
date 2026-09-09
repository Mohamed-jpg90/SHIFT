import { useEffect, useState } from 'react';
import { useStoryStore } from '../../stores/storyStore';

export default function ChoiceModal() {
  const choice = useStoryStore((s) => s.activeChoice);
  const selectChoice = useStoryStore((s) => s.selectChoice);
  const [highlighted, setHighlighted] = useState(0);

  useEffect(() => {
    if (!choice) return undefined;
    setHighlighted(0);

    const handleKey = (e) => {
      if (e.key === 'ArrowDown') {
        setHighlighted((h) => Math.min(h + 1, choice.options.length - 1));
      } else if (e.key === 'ArrowUp') {
        setHighlighted((h) => Math.max(h - 1, 0));
      } else if (e.key === 'Enter') {
        selectChoice(choice.options[highlighted].id);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [choice, highlighted, selectChoice]);

  if (!choice) return null;

  return (
    <div className="choice-overlay">
      <div className="choice-modal">
        {choice.portrait && (
          <img className="choice-modal__portrait" src={choice.portrait} alt="" />
        )}
        {choice.prompt && <p className="choice-modal__prompt">{choice.prompt}</p>}
        <div className="choice-modal__options">
          {choice.options.map((o, i) => (
            <button
              key={o.id}
              type="button"
              className={`choice-card${i === highlighted ? ' choice-card--highlighted' : ''}`}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => selectChoice(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}