import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiCircle,
  FiFileText,
  FiLayers,
  FiPlayCircle,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUploadCloud,
  FiUser,
} from 'react-icons/fi';
import * as adminApi from '../api/adminApi';
import '../style/admin.css';

const CONCEPTS = ['Basics', 'Variables', 'Conditionals', 'Loops', 'Functions', 'Arrays', 'Pointers', 'Strings', 'Structures', 'FileIO'];

const getErrorMessage = (error) =>
  error?.response?.data?.description
  || error?.response?.data?.title
  || error?.message
  || 'The request could not be completed.';

const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.files)) return value.files;
  if (Array.isArray(value?.students)) return value.students;
  return [];
};

function ResultPanel({ title, result }) {
  if (!result) return null;
  const rows = asList(result);
  const hasObjectRows = rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null;

  return (
    <section className="admin-card admin-result" aria-live="polite">
      <div className="admin-card__header admin-result__header">
        <div>
          <span className="admin-card__eyebrow">Retrieved data</span>
          <h2>{title}</h2>
        </div>
        {hasObjectRows && <span className="admin-result__count">{rows.length} {rows.length === 1 ? 'record' : 'records'}</span>}
      </div>
      {hasObjectRows ? (
        <div className="admin-result__table-wrap">
          <table className="admin-table">
            <thead>
              <tr>{Object.keys(rows[0]).map((key) => <th key={key}>{key}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.fileId ?? row.id ?? row.playerId ?? index}>
                  {Object.keys(rows[0]).map((key) => (
                    <td key={key}>{typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre className="admin-result__json">{JSON.stringify(result, null, 2)}</pre>
      )}
    </section>
  );
}

const getValue = (record, camelName, snakeName) => record?.[camelName] ?? record?.[snakeName];

const progressForStatus = (status) => {
  const normalized = String(status ?? '').replaceAll(' ', '').toLowerCase();
  if (normalized === 'completed') return 100;
  if (normalized === 'inprogress') return 55;
  return 0;
};

function StudentProgressPanel({ progress }) {
  if (!progress) return null;

  const playerName = getValue(progress, 'playerName', 'player_name') ?? 'Student';
  const currentShiftName = getValue(progress, 'currentShiftName', 'current_shift_name');
  const completedShifts = Number(getValue(progress, 'completedShifts', 'completed_shifts') ?? 0);
  const totalShifts = Number(getValue(progress, 'totalShifts', 'total_shifts') ?? 0);
  const overallProgress = Math.max(0, Math.min(100, Number(getValue(progress, 'overallProgress', 'overall_progress') ?? 0)));
  const shifts = asList(progress.shifts ?? progress.shiftProgress ?? progress.shift_progress);
  const progressLabel = Number.isFinite(overallProgress) ? Math.round(overallProgress) : 0;

  return (
    <section className="student-progress" aria-live="polite">
      <div className="student-progress__hero">
        <div className="student-progress__identity">
          <span className="student-progress__avatar" aria-hidden="true">{playerName.charAt(0).toUpperCase()}</span>
          <div>
            <span className="admin-card__eyebrow">Student learning record</span>
            <h2>{playerName}</h2>
            <p>{currentShiftName ? <>Currently learning <b>{currentShiftName}</b></> : 'No active shift'}</p>
          </div>
        </div>
        <div className="student-progress__score" aria-label={`${progressLabel}% overall progress`}>
          <strong>{progressLabel}%</strong>
          <span>overall progress</span>
        </div>
      </div>

      <div className="student-progress__bar" role="progressbar" aria-label="Overall course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressLabel}>
        <span style={{ width: `${progressLabel}%` }} />
      </div>
      <div className="student-progress__summary">
        <span><b>{completedShifts}</b> of <b>{totalShifts}</b> shifts completed</span>
        <span>{totalShifts - completedShifts > 0 ? `${totalShifts - completedShifts} remaining` : 'Course complete'}</span>
      </div>

      <div className="student-progress__section-heading">
        <div><span className="admin-card__eyebrow">Shift journey</span><h3>Progress by shift</h3></div>
        <span>{shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'} recorded</span>
      </div>
      {shifts.length ? (
        <ol className="student-progress__shifts">
          {shifts.map((shift, index) => {
            const status = getValue(shift, 'status', 'status') ?? 'Not started';
            const shiftName = getValue(shift, 'shiftName', 'shift_name') ?? `Shift ${getValue(shift, 'shiftId', 'shift_id') ?? index + 1}`;
            const completion = progressForStatus(status);
            const normalizedStatus = String(status).replaceAll(' ', '').toLowerCase();
            const Icon = normalizedStatus === 'completed' ? FiCheckCircle : normalizedStatus === 'inprogress' ? FiPlayCircle : FiCircle;
            return (
              <li key={getValue(shift, 'shiftId', 'shift_id') ?? `${shiftName}-${index}`} className={`student-progress__shift student-progress__shift--${normalizedStatus || 'not-started'}`}>
                <span className="student-progress__shift-icon"><Icon aria-hidden="true" /></span>
                <div className="student-progress__shift-content">
                  <div><b>{shiftName}</b><span>{status}</span></div>
                  <div className="student-progress__shift-bar" aria-label={`${shiftName}: ${status}`}><i style={{ width: `${completion}%` }} /></div>
                </div>
                <strong>{completion}%</strong>
              </li>
            );
          })}
        </ol>
      ) : <p className="student-progress__empty">No shift activity has been recorded for this student yet.</p>}
    </section>
  );
}

export default function Admin() {
  const [concept, setConcept] = useState('Loops');
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState(null);
  const [shiftId, setShiftId] = useState('');
  const [shiftProgress, setShiftProgress] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [studentProgress, setStudentProgress] = useState(null);
  const [isLoading, setIsLoading] = useState('');
  const [error, setError] = useState('');

  const run = async (action, request) => {
    setError('');
    setIsLoading(action);
    try {
      return await request();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return null;
    } finally {
      setIsLoading('');
    }
  };

  const loadSheets = async () => {
    const result = await run('list-sheets', () => adminApi.listConceptSheets(concept));
    if (result !== null) setSheets(result);
  };

  const uploadSheet = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Choose a PDF or DOCX concept sheet first.');
      return;
    }
    const result = await run('upload-sheet', () => adminApi.uploadConceptSheet({ file, concept }));
    if (result !== null) {
      setFile(null);
      event.currentTarget.reset();
      await loadSheets();
    }
  };

  const removeSheet = async (fileId) => {
    if (!window.confirm('Delete this uploaded concept sheet?')) return;
    const result = await run(`delete-${fileId}`, () => adminApi.deleteConceptSheet(fileId));
    if (result !== null) await loadSheets();
  };

  const loadShiftProgress = async (event) => {
    event.preventDefault();
    if (!shiftId.trim()) return setError('Enter a shift ID.');
    const result = await run('shift-progress', () => adminApi.getShiftStudentsProgress(shiftId.trim()));
    if (result !== null) setShiftProgress(result);
  };

  const loadStudentProgress = async (event) => {
    event.preventDefault();
    if (!playerId.trim()) return setError('Enter a player ID.');
    const result = await run('student-progress', () => adminApi.getStudentOverallProgress(playerId.trim()));
    if (result !== null) setStudentProgress(result);
  };

  const sheetRows = asList(sheets);

  return (
    <main className="admin-dashboard">
      <nav className="admin-nav" aria-label="Admin navigation">
        <div className="admin-nav__brand">
          <span className="admin-nav__mark"><FiShield aria-hidden="true" /></span>
          <span>SHIFT <b>Admin</b></span>
        </div>
        <Link className="admin-nav__link" to="/super-admin">Open content studio <FiArrowRight aria-hidden="true" /></Link>
      </nav>

      <header className="admin-dashboard__hero">
        <div className="admin-dashboard__hero-copy">
          <p className="admin-topbar__crumbs">Instructor workspace</p>
          <h1 className="admin-dashboard__title">Guide learning,<br /><em>see progress clearly.</em></h1>
          <p className="admin-dashboard__intro">A focused workspace for course materials and student learning progress—built around your teaching workflow.</p>
        </div>
        <div className="admin-hero-status">
          <span className="admin-hero-status__dot" />
          Secure admin session
          <small>Connected through the SHIFT API</small>
        </div>
      </header>

      {error && <div className="admin-banner-error" role="alert">{error}</div>}

      <section className="admin-card admin-materials-card">
        <div className="admin-card__header">
          <div className="admin-card__heading">
            <span className="admin-card__icon admin-card__icon--blue"><FiBookOpen aria-hidden="true" /></span>
            <div><span className="admin-card__eyebrow">Course library</span><h2>Concept sheets</h2></div>
          </div>
          <button className="admin-text-button" onClick={loadSheets} disabled={isLoading === 'list-sheets'}>
            <FiRefreshCw className={isLoading === 'list-sheets' ? 'admin-spin' : ''} aria-hidden="true" /> {isLoading === 'list-sheets' ? 'Refreshing' : 'Refresh list'}
          </button>
        </div>
        <p className="admin-card__hint">Attach a PDF or DOCX reference sheet to a curriculum concept. Students can use these materials alongside practice.</p>
        <div className="admin-materials-card__body">
          <div className="admin-field">
            <label htmlFor="concept">Concept</label>
            <select id="concept" value={concept} onChange={(event) => setConcept(event.target.value)}>
              {CONCEPTS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <form onSubmit={uploadSheet}>
            <label className={`admin-upload-dropzone${file ? ' admin-upload-dropzone--ready' : ''}`}>
              <FiUploadCloud aria-hidden="true" />
              <span><b>{file ? file.name : 'Choose a concept sheet'}</b><small>{file ? `${Math.ceil(file.size / 1024)} KB selected` : 'PDF or DOCX · click to browse'}</small></span>
              <input aria-label="Concept sheet file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </label>
            <button className="admin-btn admin-btn--primary admin-upload-button" disabled={isLoading === 'upload-sheet'}>
              <FiUploadCloud aria-hidden="true" /> {isLoading === 'upload-sheet' ? 'Uploading…' : 'Upload to library'}
            </button>
          </form>
        </div>

        {sheets && (
          <div className="admin-sheet-list">
            <div className="admin-sheet-list__header"><span>{concept} library</span><span>{sheetRows.length} {sheetRows.length === 1 ? 'sheet' : 'sheets'}</span></div>
            {sheetRows.length === 0 ? <p className="admin-card__hint">No sheets have been uploaded for this concept yet.</p> : sheetRows.map((sheet, index) => {
              const fileId = sheet.fileId ?? sheet.id;
              const name = sheet.fileName ?? sheet.name ?? sheet.originalFileName ?? `Sheet ${index + 1}`;
              return (
                <div className="admin-sheet-row" key={fileId ?? index}>
                  <span className="admin-sheet-row__file"><FiFileText aria-hidden="true" />{name}</span>
                  {fileId != null && <button aria-label={`Delete ${name}`} className="admin-icon-button admin-icon-button--danger" onClick={() => removeSheet(fileId)} disabled={isLoading === `delete-${fileId}`}><FiTrash2 aria-hidden="true" /></button>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="admin-dashboard__grid">
        <section className="admin-card">
          <div className="admin-card__header"><div className="admin-card__heading"><span className="admin-card__icon admin-card__icon--purple"><FiLayers aria-hidden="true" /></span><div><span className="admin-card__eyebrow">Class view</span><h2>Shift progress</h2></div></div></div>
          <p className="admin-card__hint">See every student enrolled in a particular shift and how far they have progressed.</p>
          <form onSubmit={loadShiftProgress} className="admin-lookup-form">
            <label htmlFor="shift-id">Shift ID</label>
            <div><input id="shift-id" value={shiftId} onChange={(event) => setShiftId(event.target.value)} placeholder="e.g. 1" /><button aria-label="View shift progress" className="admin-btn admin-btn--primary" disabled={isLoading === 'shift-progress'}>{isLoading === 'shift-progress' ? <FiRefreshCw className="admin-spin" /> : <FiSearch />}</button></div>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card__header"><div className="admin-card__heading"><span className="admin-card__icon admin-card__icon--green"><FiUser aria-hidden="true" /></span><div><span className="admin-card__eyebrow">Individual view</span><h2>Student progress</h2></div></div></div>
          <p className="admin-card__hint">Open a complete learning record for one student using their player ID.</p>
          <form onSubmit={loadStudentProgress} className="admin-lookup-form">
            <label htmlFor="player-id">Player ID</label>
            <div><input id="player-id" value={playerId} onChange={(event) => setPlayerId(event.target.value)} placeholder="e.g. 42" /><button aria-label="View student progress" className="admin-btn admin-btn--primary" disabled={isLoading === 'student-progress'}>{isLoading === 'student-progress' ? <FiRefreshCw className="admin-spin" /> : <FiSearch />}</button></div>
          </form>
        </section>
      </div>

      <ResultPanel title="Shift students progress" result={shiftProgress} />
      <StudentProgressPanel progress={studentProgress} />
    </main>
  );
}
