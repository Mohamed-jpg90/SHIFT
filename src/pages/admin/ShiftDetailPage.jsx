import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';

const APPS = ['WhatsUpp','MailLoop','LoopCode','System','VideoCall','Notification'];
const CONCEPTS = ['Basics','Variables','Conditionals','Loops','Functions','Arrays','Pointers','Strings','Structures','FileIO'];

export default function ShiftDetailPage() {
  const { shiftId } = useParams();
  const navigate = useNavigate();
  const { currentShift, isLoading, error, fetchShift, updateShift, deleteShift, createBeat, clearError } = useAdminStore();
  const [editForm, setEditForm] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [beatForm, setBeatForm] = useState({
    beatKey: '', beatType: 'Narrative', sequenceOrder: 1, app: 'WhatsUpp',
    senderName: '', text: '', delaySeconds: 0, hasChoices: false, injectPosition: 'start',
  });

  useEffect(() => { fetchShift(shiftId); }, [shiftId, fetchShift]);

  useEffect(() => {
    if (currentShift) {
      setEditForm({
        shiftNumber: currentShift.shiftNumber, chapterNumber: currentShift.chapterNumber,
        title: currentShift.title, description: currentShift.description ?? '',
        conceptTag: currentShift.conceptTag, numberOfTasks: currentShift.numberOfTasks ?? 1,
        isCapstone: currentShift.isCapstone,
      });
    }
  }, [currentShift]);

  if (!currentShift || !editForm) return <div className="admin-content"><p>Loading…</p></div>;

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateShift(shiftId, {
      ...editForm, shiftNumber: Number(editForm.shiftNumber), chapterNumber: Number(editForm.chapterNumber),
      numberOfTasks: Number(editForm.numberOfTasks), unlockCondition: null, clearUnlockCondition: false,
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this shift?') && (await deleteShift(shiftId))) navigate('/super-admin');
  };

  const openDrawer = () => {
    clearError();
    setBeatForm({ beatKey: '', beatType: 'Narrative', sequenceOrder: (currentShift.narrativeBeats?.length ?? 0) + 1, app: 'WhatsUpp', senderName: '', text: '', delaySeconds: 0, hasChoices: false, injectPosition: 'start' });
    setDrawerOpen(true);
  };

  const handleBeatChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBeatForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreateBeat = async (e) => {
    e.preventDefault();
    const payload = {
      shiftId: Number(shiftId), beatKey: beatForm.beatKey, beatType: beatForm.beatType,
      sequenceOrder: beatForm.beatType === 'Narrative' ? Number(beatForm.sequenceOrder) : null,
      app: beatForm.app, senderName: beatForm.senderName,
      contentJson: { text: beatForm.text, avatar: null, sound_effect: null, choices: null },
      desktopEvent: null, delaySeconds: Number(beatForm.delaySeconds), hasChoices: beatForm.hasChoices,
      injectPosition: beatForm.beatType === 'Consequence' ? beatForm.injectPosition : null,
    };
    if (await createBeat(payload)) setDrawerOpen(false);
  };

  const allBeats = [...(currentShift.narrativeBeats ?? []), ...(currentShift.consequenceBeats ?? [])];

  return (
    <>
      <header className="admin-topbar">
        <div>
          <p className="admin-topbar__crumbs"><a href="/super-admin">Shifts</a> / Chapter {currentShift.chapterNumber}</p>
          <h1 className="admin-topbar__title">{currentShift.title}</h1>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openDrawer}>+ New Beat</button>
      </header>

      <div className="admin-content">
        {error && !drawerOpen && <div className="admin-banner-error">{error}</div>}

        <div className="admin-card">
          <div className="admin-card__header"><h3>Shift details</h3></div>
          <form onSubmit={handleSave}>
            <div className="admin-field">
              <label>Title</label>
              <input name="title" value={editForm.title} onChange={handleEditChange} />
            </div>
            <div className="admin-field">
              <label>Description</label>
              <textarea name="description" value={editForm.description} onChange={handleEditChange} />
            </div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label>Chapter #</label>
                <input name="chapterNumber" type="number" value={editForm.chapterNumber} onChange={handleEditChange} />
              </div>
              <div className="admin-field">
                <label>Shift #</label>
                <input name="shiftNumber" type="number" value={editForm.shiftNumber} onChange={handleEditChange} />
              </div>
            </div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label>Concept</label>
                <select name="conceptTag" value={editForm.conceptTag} onChange={handleEditChange}>
                  {CONCEPTS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Number of tasks</label>
                <input name="numberOfTasks" type="number" min="1" value={editForm.numberOfTasks} onChange={handleEditChange} />
              </div>
            </div>
            <label className="admin-checkbox">
              <input type="checkbox" name="isCapstone" checked={editForm.isCapstone} onChange={handleEditChange} />
              Capstone shift
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={isLoading}>Save changes</button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete}>Delete shift</button>
            </div>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card__header"><h3>Beats</h3></div>
          {allBeats.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty__title">No beats yet</p>
              <p>Add the first narrative beat to start this shift.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Type</th><th>App</th><th>Key</th><th>Preview</th></tr></thead>
              <tbody>
                {allBeats
                  .sort((a, b) => (a.sequenceOrder ?? 999) - (b.sequenceOrder ?? 999))
                  .map((b) => (
                    <tr key={b.beatId}>
                      <td className="admin-mono">{b.sequenceOrder ?? '—'}</td>
                      <td>
                        <span className={`admin-pill admin-pill--${b.beatType === 'Narrative' ? 'narrative' : 'consequence'}`}>
                          {b.beatType}
                        </span>
                      </td>
                      <td className="admin-mono">{b.app}</td>
                      <td><a href={`/super-admin/beats/${b.beatId}`} className="admin-table__link">{b.beatKey}</a></td>
                      <td style={{ color: 'var(--los-text-muted)' }}>{b.contentJson?.text?.slice(0, 50)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="admin-drawer">
            <div className="admin-drawer__header">
              <h3>New Beat</h3>
              <button className="admin-drawer__close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <form id="new-beat-form" onSubmit={handleCreateBeat} className="admin-drawer__body">
              {error && <div className="admin-banner-error">{error}</div>}
              <div className="admin-field">
                <label>Beat key (unique)</label>
                <input name="beatKey" value={beatForm.beatKey} onChange={handleBeatChange} required />
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Type</label>
                  <select name="beatType" value={beatForm.beatType} onChange={handleBeatChange}>
                    <option value="Narrative">Narrative</option>
                    <option value="Consequence">Consequence</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>App</label>
                  <select name="app" value={beatForm.app} onChange={handleBeatChange}>
                    {APPS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-field">
                <label>Sender name</label>
                <input name="senderName" value={beatForm.senderName} onChange={handleBeatChange} />
              </div>
              <div className="admin-field">
                <label>Content text</label>
                <textarea name="text" value={beatForm.text} onChange={handleBeatChange} required />
              </div>
              {beatForm.beatType === 'Narrative' ? (
                <div className="admin-field">
                  <label>Sequence order</label>
                  <input name="sequenceOrder" type="number" value={beatForm.sequenceOrder} onChange={handleBeatChange} required />
                </div>
              ) : (
                <div className="admin-field">
                  <label>Inject position</label>
                  <select name="injectPosition" value={beatForm.injectPosition} onChange={handleBeatChange}>
                    <option value="start">start</option>
                    <option value="end">end</option>
                  </select>
                </div>
              )}
              <div className="admin-field">
                <label>Delay (seconds)</label>
                <input name="delaySeconds" type="number" step="0.1" value={beatForm.delaySeconds} onChange={handleBeatChange} />
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="hasChoices" checked={beatForm.hasChoices} onChange={handleBeatChange} />
                Has choices
              </label>
            </form>
            <div className="admin-drawer__footer">
              <button type="submit" form="new-beat-form" className="admin-btn admin-btn--primary" disabled={isLoading}>
                {isLoading ? 'Creating…' : 'Create Beat'}
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDrawerOpen(false)}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
