import { useEffect, useMemo, useRef, useState } from 'react';
import { useSideTaskStore } from '../../../stores/sideTaskStore';
import { useAuthStore } from '../../../stores/authStore';

const HINT_LEVELS = [
  { level: 1, label: 'Conceptual Nudge' },
  { level: 2, label: 'Structural Guidance' },
  { level: 3, label: 'Code Snippet' },
];

export default function SideTask() {
  const playerId = useAuthStore((s) => s.userId);
  const {
    activeTask, hints, lastResult, isLoading, error,
    fetchActive, fetchHints, unlockHint, submit, abandon, clearResult,
  } = useSideTaskStore();

  const [code, setCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const startedAtRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (playerId) fetchActive(playerId);
  }, [playerId, fetchActive]);

  useEffect(() => {
    if (activeTask) {
      startedAtRef.current = Date.now();
      setCode(activeTask.starterCode ?? activeTask.starter_code ?? '');
      setElapsed(0);
    }
  }, [activeTask]);

  useEffect(() => {
    if (!activeTask) return undefined;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [activeTask]);

  const taskId = activeTask?.sideTaskId ?? activeTask?.taskId ?? activeTask?.id;

  const handleToggleHints = async () => {
    if (!showHints && taskId) await fetchHints(playerId, taskId);
    setShowHints((v) => !v);
  };

  const handleUnlockHint = async (level) => {
    if (!taskId) return;
    await unlockHint(playerId, taskId, level);
  };

  const handleSubmit = async () => {
    if (!taskId) return;
    clearResult();
    const timeSpentSec = Math.floor((Date.now() - startedAtRef.current) / 1000);
    await submit(playerId, { sideTaskId: taskId, submittedCode: code, timeSpentSec });
  };

  const handleAbandon = async () => {
    if (!taskId) return;
    if (window.confirm('Abandon this side task? This applies a -100 EGP penalty.')) {
      await abandon(playerId, taskId);
    }
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const knownFields = useMemo(() => {
    if (!lastResult) return null;
    const { tier, egpEarned, newBalance, ...rest } = lastResult;
    return { tier, egpEarned, newBalance, rest };
  }, [lastResult]);

  if (isLoading && !activeTask) return <div className="app-placeholder">loading side task…</div>;

  if (!activeTask) {
    return (
      <div className="app-placeholder">
        <p>No active side task right now.</p>
        {error && <p className="loopcode-status loopcode-status--error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="loopcode">
      <div className="loopcode__header">
        <p className="app-header">&gt; side quest — {activeTask.conceptTag ?? activeTask.concept_tag ?? 'unknown concept'}</p>
        <p className="loopcode__task" style={{ fontWeight: 600 }}>
          {activeTask.title ?? 'Untitled task'}
        </p>
        <p className="loopcode__context">{activeTask.description ?? ''}</p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: 'var(--los-text-muted)', margin: '6px 0' }}>
          <span>⏱ {mm}:{ss}</span>
          {(activeTask.egpReward ?? activeTask.egp_reward) != null && (
            <span>reward: {activeTask.egpReward ?? activeTask.egp_reward} EGP</span>
          )}
          {activeTask.difficulty && <span>{activeTask.difficulty}</span>}
        </div>
      </div>

      <div className="loopcode__editor">
        <textarea
          className="loopcode__textarea"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {error && <p className="loopcode-status loopcode-status--error">{error}</p>}

      {lastResult && (
        <div className="loopcode-status" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {knownFields?.tier && <span>tier: {knownFields.tier}</span>}
          {knownFields?.egpEarned != null && <span>egp earned: {knownFields.egpEarned}</span>}
          {knownFields?.newBalance != null && <span>new balance: {knownFields.newBalance}</span>}
          {!knownFields?.tier && (
            <pre style={{ fontSize: 11.5, whiteSpace: 'pre-wrap' }}>{JSON.stringify(lastResult, null, 2)}</pre>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="loopcode__run" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'submitting…' : 'submit'}
        </button>
        <button type="button" className="loopcode__run" style={{ background: 'transparent', border: '1px solid var(--los-border)', color: 'var(--los-text)' }} onClick={handleToggleHints}>
          {showHints ? 'hide hints' : 'hints'}
        </button>
        <button type="button" className="loopcode__run" style={{ background: 'var(--los-danger)' }} onClick={handleAbandon} disabled={isLoading}>
          abandon
        </button>
      </div>

      {showHints && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {HINT_LEVELS.map(({ level, label }) => {
            const entry = hints?.find((h) => (h.hintLevel ?? h.level) === level);
            const text = entry?.hintText ?? entry?.text ?? null;
            const unlocked = text != null;
            return (
              <div key={level} style={{ border: '1px solid var(--los-border)', borderRadius: 8, padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--los-text-muted)' }}>{label}</span>
                  {!unlocked && (
                    <button type="button" className="loopcode__run" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleUnlockHint(level)}>
                      unlock
                    </button>
                  )}
                </div>
                {unlocked && <p style={{ fontSize: 13, margin: '6px 0 0' }}>{text}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}