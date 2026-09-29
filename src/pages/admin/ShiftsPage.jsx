import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';

const CONCEPTS = ['Basics','Variables','Conditionals','Loops','Functions','Arrays','Pointers','Strings','Structures','FileIO'];
const emptyForm = { shiftNumber: '', chapterNumber: '', title: '', description: '', conceptTag: 'Basics', numberOfTasks: 1, isCapstone: false };

export default function ShiftsPage() {
  const { shifts, isLoading, error, createShift, deleteShift, clearError } = useAdminStore();
  const [form, setForm] = useState(emptyForm);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => { clearError(); setForm(emptyForm); setDrawerOpen(true); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      shiftNumber: Number(form.shiftNumber),
      chapterNumber: Number(form.chapterNumber),
      numberOfTasks: Number(form.numberOfTasks),
      unlockCondition: null,
    };
    if (await createShift(payload)) setDrawerOpen(false);
  };

  const handleDelete = async (shiftId) => {
    if (window.confirm('Delete this shift? Fails if it has beats or player progress.')) await deleteShift(shiftId);
  };

  return (
    <>
      <header className="admin-topbar">
        <div>
          <p className="admin-topbar__crumbs">Super admin / Narrative studio</p>
          <h1 className="admin-topbar__title">Narrative shifts</h1>
        </div>
        <div className="admin-topbar__actions">
          <span className="admin-topbar__count">{shifts.length} {shifts.length === 1 ? 'shift' : 'shifts'}</span>
          <button className="admin-btn admin-btn--primary" onClick={openDrawer}>+ New Shift</button>
        </div>
      </header>

      <div className="admin-content">
        {error && !drawerOpen && <div className="admin-banner-error">{error}</div>}

        {shifts.length === 0 && !isLoading ? (
          <div className="admin-empty">
            <p className="admin-empty__title">No shifts yet</p>
            <p>Create the first shift to start building the narrative.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Ch</th><th>#</th><th>Title</th><th>Concept</th><th></th><th></th></tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.shiftId}>
                  <td className="admin-mono">{s.chapterNumber}</td>
                  <td className="admin-mono">{s.shiftNumber}</td>
                  <td>
                    <Link to={`/super-admin/shifts/${s.shiftId}`} className="admin-table__link">{s.title}</Link>
                    {s.isCapstone && <span className="admin-pill admin-pill--capstone" style={{ marginLeft: 8 }}>Capstone</span>}
                  </td>
                  <td><span className="admin-pill admin-pill--narrative">{s.conceptTag}</span></td>
                  <td></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(s.shiftId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {drawerOpen && (
        <>
          <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="admin-drawer">
            <div className="admin-drawer__header">
              <h3>New Shift</h3>
              <button className="admin-drawer__close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <form id="new-shift-form" onSubmit={handleCreate} className="admin-drawer__body">
              {error && <div className="admin-banner-error">{error}</div>}
              <div className="admin-field">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="admin-field">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Chapter #</label>
                  <input name="chapterNumber" type="number" value={form.chapterNumber} onChange={handleChange} required />
                </div>
                <div className="admin-field">
                  <label>Shift #</label>
                  <input name="shiftNumber" type="number" value={form.shiftNumber} onChange={handleChange} required />
                </div>
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Concept</label>
                  <select name="conceptTag" value={form.conceptTag} onChange={handleChange}>
                    {CONCEPTS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Number of tasks</label>
                  <input name="numberOfTasks" type="number" min="1" value={form.numberOfTasks} onChange={handleChange} required />
                </div>
              </div>
              <label className="admin-checkbox">
                <input type="checkbox" name="isCapstone" checked={form.isCapstone} onChange={handleChange} />
                Capstone shift
              </label>
            </form>
            <div className="admin-drawer__footer">
              <button type="submit" form="new-shift-form" className="admin-btn admin-btn--primary" disabled={isLoading}>
                {isLoading ? 'Creating…' : 'Create Shift'}
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDrawerOpen(false)}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
