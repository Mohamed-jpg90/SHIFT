import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiChevronRight, FiCode, FiFilePlus, FiPlus, FiRefreshCw, FiSave, FiSearch } from 'react-icons/fi';
import * as practiceApi from '../../api/practiceAdminApi';
import { useAdminStore } from '../../stores/adminStore';

const CONCEPTS = ['Basics', 'Variables', 'Conditionals', 'Loops', 'Functions', 'Arrays', 'Pointers', 'Strings', 'Structures', 'FileIO'];
const DIFFICULTIES = ['Standard', 'Challenge', 'SpacedRetrieval'];

const emptyTask = () => ({
  shiftId: '', taskOrder: 1, title: '', description: '',
  starterCode: '#include <stdio.h>\n\nint main() {\n  \n  return 0;\n}',
  conceptTag: 'Basics', difficulty: 'Standard', maxAttempts: 5, egpReward: 0, testCases: [],
});

const emptyTestCase = () => ({ testInput: '', expectedOutput: '', isHidden: false, description: '' });
const errorMessage = (error) => error?.response?.data?.description || error?.response?.data?.title || error?.message || 'Request failed.';

function TestCaseEditor({ testCase, onChange, onSave, saving, isNew }) {
  return (
    <div className="practice-test-case">
      <div className="practice-test-case__header">
        <span>{isNew ? 'New test case' : `Test case #${testCase.testCaseId}`}</span>
        <label className="admin-checkbox"><input type="checkbox" checked={testCase.isHidden} onChange={(event) => onChange({ ...testCase, isHidden: event.target.checked })} /> Hidden from students</label>
      </div>
      <div className="admin-field-row">
        <div className="admin-field"><label>Input</label><textarea value={testCase.testInput} onChange={(event) => onChange({ ...testCase, testInput: event.target.value })} placeholder="stdin, blank is allowed" /></div>
        <div className="admin-field"><label>Expected output</label><textarea value={testCase.expectedOutput} onChange={(event) => onChange({ ...testCase, expectedOutput: event.target.value })} required /></div>
      </div>
      <div className="practice-test-case__footer">
        <input value={testCase.description} onChange={(event) => onChange({ ...testCase, description: event.target.value })} placeholder="Description for Super Admins" />
        {!isNew && <button type="button" className="admin-btn admin-btn--ghost" onClick={onSave} disabled={saving}><FiSave /> {saving ? 'Saving…' : 'Save case'}</button>}
      </div>
    </div>
  );
}

export default function PracticeTasksPage() {
  const shifts = useAdminStore((state) => state.shifts);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [newTestCase, setNewTestCase] = useState(emptyTestCase);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await practiceApi.getAllPracticeTasks();
      setTasks(Array.isArray(response) ? response : response?.items ?? response?.data ?? []);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const selectedTask = useMemo(() => tasks.find((task) => task.taskId === selectedTaskId) ?? null, [tasks, selectedTaskId]);
  const filteredTasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? tasks.filter((task) => `${task.title} ${task.conceptTag} ${task.shiftNumber}`.toLowerCase().includes(needle)) : tasks;
  }, [query, tasks]);

  const openTask = (task) => {
    setIsCreating(false);
    setSelectedTaskId(task.taskId);
    setForm({ ...task, testCases: task.testCases ?? [] });
    setNewTestCase(emptyTestCase());
    setError('');
  };

  const openNewTask = () => {
    setIsCreating(true);
    setSelectedTaskId(null);
    setForm(emptyTask());
    setNewTestCase(emptyTestCase());
    setError('');
  };

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const saveTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        shiftId: Number(form.shiftId), taskOrder: Number(form.taskOrder), title: form.title.trim(), description: form.description.trim(),
        starterCode: form.starterCode, conceptTag: form.conceptTag, difficulty: form.difficulty,
        maxAttempts: Number(form.maxAttempts), egpReward: Number(form.egpReward), testCases: form.testCases,
      };
      const task = isCreating
        ? await practiceApi.createPracticeTask(payload)
        : await practiceApi.updatePracticeTask(selectedTaskId, payload);
      await loadTasks();
      setIsCreating(false);
      setSelectedTaskId(task.taskId);
      setForm({ ...task, testCases: task.testCases ?? [] });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const saveExistingTestCase = async (testCase) => {
    setSaving(true);
    setError('');
    try {
      await practiceApi.updatePracticeTestCase(testCase.testCaseId, {
        testInput: testCase.testInput, expectedOutput: testCase.expectedOutput,
        isHidden: testCase.isHidden, description: testCase.description,
      });
      await loadTasks();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const addTestCase = async () => {
    if (!selectedTask || !newTestCase.expectedOutput.trim()) {
      setError('Expected output is required before adding a test case.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await practiceApi.addPracticeTestCases([{ ...newTestCase, taskId: selectedTask.taskId, sideTaskId: null }]);
      setNewTestCase(emptyTestCase());
      await loadTasks();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const updateLocalTestCase = (nextTestCase) => {
    updateForm('testCases', form.testCases.map((item) => item.testCaseId === nextTestCase.testCaseId ? nextTestCase : item));
  };

  return (
    <>
      <header className="admin-topbar">
        <div>
          <p className="admin-topbar__crumbs">Super admin / Practice studio</p>
          <h1 className="admin-topbar__title">Practice tasks</h1>
        </div>
        <div className="admin-topbar__actions">
          <span className="admin-topbar__count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          <button type="button" className="admin-btn admin-btn--primary" onClick={openNewTask}><FiPlus /> New task</button>
        </div>
      </header>

      <div className="admin-content practice-admin-content">
        {error && <div className="admin-banner-error" role="alert">{error}</div>}
        <div className="practice-admin-layout">
          <aside className="practice-task-list">
            <div className="practice-task-list__header">
              <div className="practice-task-list__search"><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" /></div>
              <button type="button" className="admin-icon-button" aria-label="Refresh tasks" onClick={loadTasks} disabled={loading}><FiRefreshCw className={loading ? 'admin-spin' : ''} /></button>
            </div>
            {loading ? <p className="practice-task-list__empty">Loading practice tasks…</p> : filteredTasks.length === 0 ? <p className="practice-task-list__empty">No tasks found.</p> : filteredTasks.map((task) => (
              <button key={task.taskId} type="button" className={`practice-task-list__item${task.taskId === selectedTaskId ? ' practice-task-list__item--active' : ''}`} onClick={() => openTask(task)}>
                <span className="practice-task-list__order">{task.taskOrder}</span><span><b>{task.title}</b><small>Shift {task.shiftNumber ?? task.shiftId} · {task.conceptTag}</small></span><FiChevronRight />
              </button>
            ))}
          </aside>

          <section className="practice-editor">
            {!isCreating && !selectedTask ? (
              <div className="practice-editor__empty"><FiCode /><h2>Choose a practice task</h2><p>Select a task to edit it, or create a new one for a shift.</p><button type="button" className="admin-btn admin-btn--primary" onClick={openNewTask}><FiFilePlus /> Create task</button></div>
            ) : (
              <form onSubmit={saveTask}>
                <div className="practice-editor__header"><div><span className="admin-card__eyebrow">{isCreating ? 'New exercise' : `Task #${selectedTaskId}`}</span><h2>{isCreating ? 'Create practice task' : form.title || 'Untitled task'}</h2></div><button className="admin-btn admin-btn--primary" disabled={saving}><FiSave /> {saving ? 'Saving…' : isCreating ? 'Create task' : 'Save task'}</button></div>
                <div className="practice-editor__card">
                  <div className="admin-field"><label>Title</label><input value={form.title} onChange={(event) => updateForm('title', event.target.value)} required /></div>
                  <div className="admin-field"><label>Student instructions</label><textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} required /></div>
                  <div className="practice-editor__grid">
                    <div className="admin-field"><label>Shift</label><select value={form.shiftId} onChange={(event) => updateForm('shiftId', event.target.value)} required><option value="">Choose shift</option>{shifts.map((shift) => <option key={shift.shiftId} value={shift.shiftId}>Shift {shift.shiftNumber} · {shift.title}</option>)}</select></div>
                    <div className="admin-field"><label>Task order</label><input type="number" min="1" max="255" value={form.taskOrder} onChange={(event) => updateForm('taskOrder', event.target.value)} required /></div>
                    <div className="admin-field"><label>Concept</label><select value={form.conceptTag} onChange={(event) => updateForm('conceptTag', event.target.value)}>{CONCEPTS.map((concept) => <option key={concept}>{concept}</option>)}</select></div>
                    <div className="admin-field"><label>Difficulty</label><select value={form.difficulty} onChange={(event) => updateForm('difficulty', event.target.value)}>{DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></div>
                    <div className="admin-field"><label>Max attempts <small>(0 = unlimited)</small></label><input type="number" min="0" max="32767" value={form.maxAttempts} onChange={(event) => updateForm('maxAttempts', event.target.value)} /></div>
                    <div className="admin-field"><label>EGP reward</label><input type="number" min="0" value={form.egpReward} onChange={(event) => updateForm('egpReward', event.target.value)} /></div>
                  </div>
                  <div className="admin-field"><label>C starter code</label><textarea className="practice-code-field" spellCheck="false" value={form.starterCode} onChange={(event) => updateForm('starterCode', event.target.value)} /></div>
                </div>

                {!isCreating && <section className="practice-test-section"><div className="practice-test-section__header"><div><span className="admin-card__eyebrow">Evaluation</span><h3>Test cases</h3></div><span className="practice-test-section__note"><FiCheck /> Hidden tests remain private</span></div>{form.testCases.map((testCase) => <TestCaseEditor key={testCase.testCaseId} testCase={testCase} onChange={updateLocalTestCase} onSave={() => saveExistingTestCase(testCase)} saving={saving} />)}<TestCaseEditor testCase={newTestCase} onChange={setNewTestCase} isNew /><button type="button" className="admin-btn admin-btn--ghost" onClick={addTestCase} disabled={saving}><FiPlus /> Add test case</button></section>}
              </form>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
