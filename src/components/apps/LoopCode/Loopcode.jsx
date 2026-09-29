import { useMemo, useState } from 'react';
import { useStoryStore } from '../../../stores/storyStore';
import { playSound } from '../../../audio/soundManager';
import { useLoopCodeStore } from '../../../stores/loopCodeStore';

const norm = (s) => s.replace(/\s+/g, '').replace(/;/g, '');

export default function LoopCode() {
  const challenge = useStoryStore((s) => s.activeCodeChallenge);
  const submitCodeChallenge = useStoryStore((s) => s.submitCodeChallenge);
  const viewContent = useLoopCodeStore((s) => s.viewContent);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const lineCount = useMemo(() => code.split('\n').length || 1, [code]);

  if (!challenge && viewContent) {
    return (
      <div className="loopcode">
        <p className="app-header">&gt; {viewContent.sender ?? 'system'}</p>
        <pre className="loopcode__textarea" style={{ whiteSpace: 'pre-wrap' }}>{viewContent.text}</pre>
      </div>
    );
  }
    if (!challenge) return <div className="app-placeholder">no active challenge</div>;

  const handleRun = () => {
    setChecking(true);
    const correct = norm(code) === norm(challenge.referenceSolution);
    setTimeout(() => {
      if (correct) {
        setStatus('success');
        playSound('success');
        submitCodeChallenge(true);
      } else {
        setStatus('error');
        playSound('error');
      }
      setChecking(false);
    }, 250);
  };

  return (
    <div className="loopcode">
      <div className="loopcode__header">
        <p className="app-header">&gt; context</p>
        <p className="loopcode__context">{challenge.context}</p>
        <p className="app-header">&gt; task</p>
        <p className="loopcode__task">{challenge.task}</p>
      </div>

      <div className="loopcode__editor">
        <div className="loopcode__gutter">
          {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          className="loopcode__textarea"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={checking}
        />
      </div>

      {status === 'error' && <p className="loopcode-status loopcode-status--error">not quite — try again</p>}
      {status === 'success' && <p className="loopcode-status loopcode-status--success">correct</p>}

      <button type="button" className="loopcode__run" onClick={handleRun} disabled={checking}>
        {checking ? 'checking…' : 'run'}
      </button>
    </div>
  );
}