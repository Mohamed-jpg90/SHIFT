import { useEffect, useMemo, useRef, useState } from 'react';
import { useStoryStore } from '../../../stores/storyStore';
import { useAuthStore } from '../../../stores/authStore';
import { useNarrativeStore } from '../../../stores/narrativeStore';
import { playSound } from '../../../audio/soundManager';
import { useLoopCodeStore } from '../../../stores/loopCodeStore';
import * as practiceApi from '../../../api/practiceApi';

const getErrorMessage = (error) => error?.response?.data?.description || error?.response?.data?.title || error?.message || 'Code submission failed.';
const parseTestResults = (value) => { if (Array.isArray(value)) return value; try { return typeof value === 'string' ? JSON.parse(value) : []; } catch { return []; } };
const isPassingTier = (tier) => ['ideal', 'acceptable'].includes(String(tier ?? '').toLowerCase());

export default function LoopCode() {
  const challenge = useStoryStore((s) => s.activeCodeChallenge);
  const submitCodeChallenge = useStoryStore((s) => s.submitCodeChallenge);
  const viewContent = useLoopCodeStore((s) => s.viewContent);
  const playerId = useAuthStore((s) => s.userId);
  const loadNextPracticeTask = useNarrativeStore((s) => s.loadNextPracticeTask);
  const setGateCleared = useNarrativeStore((s) => s.setGateCleared);
  const [task, setTask] = useState(null); const [code, setCode] = useState(''); const [result, setResult] = useState(null); const [error, setError] = useState(''); const [checking, setChecking] = useState(false); const [attempts, setAttempts] = useState(0); const [maxAttemptsReached, setMaxAttemptsReached] = useState(false); const [taskCompleted, setTaskCompleted] = useState(false); const [assembleMode, setAssembleMode] = useState(false); const [lines, setLines] = useState([]);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!challenge) return undefined;
    let active = true;
    const loadTask = async () => {
      setChecking(true); setError(''); setResult(null); setAttempts(0); setMaxAttemptsReached(false); setTaskCompleted(false); setGateCleared(false); startedAt.current = Date.now();
      const nextTask = challenge.taskId ? await loadNextPracticeTask() : challenge.task;
      if (!active) return;
      if (!nextTask) { setError('Practice task is unavailable. Please return to the shift and try again.'); setChecking(false); return; }
      const starterCode = nextTask.starterCode ?? nextTask.starter_code ?? '';
      setTask(nextTask); setCode(starterCode); setLines(starterCode.split('\n')); setChecking(false);
    };
    loadTask(); return () => { active = false; };
  }, [challenge, loadNextPracticeTask, setGateCleared]);

  const lineCount = useMemo(() => code.split('\n').length || 1, [code]);
  const testResults = useMemo(() => parseTestResults(result?.testResults ?? result?.test_results), [result]);
  const taskId = task?.taskId ?? task?.task_id;
  const maxAttempts = Number(task?.maxAttempts ?? task?.max_attempts ?? 0);
  const canSubmit = Boolean(taskId && code.trim()) && !checking && !maxAttemptsReached && !taskCompleted;
  const syncAssembledCode = (nextLines) => { setLines(nextLines); setCode(nextLines.join('\n')); };
  const moveLine = (index, direction) => { const destination = index + direction; if (destination < 0 || destination >= lines.length) return; const nextLines = [...lines]; [nextLines[index], nextLines[destination]] = [nextLines[destination], nextLines[index]]; syncAssembledCode(nextLines); };
  const loadFollowingTask = async () => { setChecking(true); const nextTask = await loadNextPracticeTask(); if (!nextTask) { setChecking(false); return; } const starterCode = nextTask.starterCode ?? nextTask.starter_code ?? ''; setTask(nextTask); setCode(starterCode); setLines(starterCode.split('\n')); setAttempts(0); setResult(null); setTaskCompleted(false); setMaxAttemptsReached(false); startedAt.current = Date.now(); setChecking(false); };
  const handleRun = async () => {
    if (!canSubmit) return;
    setChecking(true); setError('');
    try {
      const response = await practiceApi.submitPracticeCode(playerId, { taskId, submittedCode: code, timeSpentSec: Math.max(1, Math.floor((Date.now() - startedAt.current) / 1000)), hintUsed: false });
      setResult(response); setAttempts((count) => count + 1);
      if (response?.gateCleared ?? response?.gate_cleared) { setGateCleared(true); playSound('success'); submitCodeChallenge(true); return; }
      if (isPassingTier(response?.tier)) { setTaskCompleted(true); playSound('success'); } else playSound('error');
    } catch (requestError) {
      const message = getErrorMessage(requestError); setError(message); setAttempts((count) => count + 1);
      if (/max.?attempt|attempt limit/i.test(message) || requestError?.response?.data?.code === 'Practice.MaxAttemptsReached') setMaxAttemptsReached(true);
      playSound('error');
    } finally { setChecking(false); }
  };

  if (!challenge && viewContent) return <div className="loopcode"><p className="app-header">&gt; {viewContent.sender ?? 'system'}</p><pre className="loopcode__textarea" style={{ whiteSpace: 'pre-wrap' }}>{viewContent.text}</pre></div>;
  if (!challenge) return <div className="app-placeholder">no active challenge</div>;
  return <div className="loopcode"><div className="loopcode__header"><p className="app-header">&gt; {task?.conceptTag ?? task?.concept_tag ?? 'practice'} · {task?.difficulty ?? 'Standard'}</p><p className="loopcode__task">{task?.title ?? 'Loading practice task…'}</p><p className="loopcode__context">{task?.description ?? ''}</p>{task && <p className="loopcode__meta">Attempt {attempts + 1}{maxAttempts > 0 ? ` of ${maxAttempts}` : ' · unlimited attempts'}</p>}</div><div className="loopcode__toolbar"><button type="button" onClick={() => setAssembleMode((value) => !value)} disabled={checking}>{assembleMode ? 'Use editor' : 'Assemble code'}</button><span>Evaluation includes hidden tests.</span></div>{assembleMode ? <ol className="loopcode__assemble" aria-label="Assemble code lines">{lines.map((line, index) => <li key={`${index}-${line}`} draggable={!checking} onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(from) && from !== index) { const next = [...lines]; const [moved] = next.splice(from, 1); next.splice(index, 0, moved); syncAssembledCode(next); } }}><code>{line || ' '}</code><span><button type="button" onClick={() => moveLine(index, -1)} disabled={checking || index === 0}>↑</button><button type="button" onClick={() => moveLine(index, 1)} disabled={checking || index === lines.length - 1}>↓</button></span></li>)}</ol> : <div className="loopcode__editor"><div className="loopcode__gutter">{Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}</div><textarea className="loopcode__textarea" spellCheck={false} value={code} onChange={(event) => { setCode(event.target.value); setLines(event.target.value.split('\n')); }} disabled={checking || maxAttemptsReached || taskCompleted} /></div>}{error && <p className="loopcode-status loopcode-status--error">{error}</p>}{maxAttemptsReached && <p className="loopcode-status loopcode-status--error">Maximum attempts reached for this task.</p>}{(result?.struggleDetected ?? result?.struggle_detected) && <p className="loopcode-status loopcode-status--warning">Struggle detected — review the prompt before trying again.</p>}{result && <div className="loopcode__results"><p className={`loopcode-status ${isPassingTier(result.tier) ? 'loopcode-status--success' : 'loopcode-status--error'}`}>Result: {result.tier ?? 'evaluated'}</p>{testResults.map((test, index) => <div className={`loopcode__test ${test.passed ? 'loopcode__test--pass' : 'loopcode__test--fail'}`} key={test.test_case_id ?? test.testCaseId ?? index}><b>{test.passed ? 'PASS' : 'FAIL'}</b><span>Test {test.test_case_id ?? test.testCaseId ?? index + 1}</span>{test.actual_output != null && <code>Output: {test.actual_output}</code>}</div>)}</div>}{taskCompleted && <button type="button" className="loopcode__run" onClick={loadFollowingTask} disabled={checking}>Next practice task</button>}<button type="button" className="loopcode__run" onClick={handleRun} disabled={!canSubmit}>{checking ? 'running tests…' : maxAttemptsReached ? 'attempt limit reached' : taskCompleted ? 'task completed' : 'run tests'}</button></div>;
}
