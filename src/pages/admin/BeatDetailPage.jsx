import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import * as adminApi from '../../api/adminNarrativeApi';

const APPS = ['WhatsUpp','MailLoop','LoopCode','System','VideoCall','Notification'];
const TIERS = ['Ideal','Acceptable','Debt','Mistake'];
const tierPillClass = { Ideal: 'ideal', Acceptable: 'acceptable', Debt: 'debt', Mistake: 'mistake' };

export default function BeatDetailPage() {
  const { beatId } = useParams();
  const navigate = useNavigate();
  const { updateBeat, deleteBeat, createChoices, updateChoice, error, clearError } = useAdminStore();
  const [beat, setBeat] = useState(null);
  const [form, setForm] = useState(null);
  const [choiceForm, setChoiceForm] = useState({ choiceIndex: 1, choiceText: '', tier: 'Ideal', isEvaluateable: true, immediateFeedback: '' });

  const loadBeat = async () => {
    const data = await adminApi.getBeat(beatId);
    setBeat(data);
    setForm({
      shiftId: data.shiftId, beatType: data.beatType, sequenceOrder: data.sequenceOrder ?? '',
      app: data.app, senderName: data.senderName ?? '', text: data.contentJson?.text ?? '',
      delaySeconds: data.delaySeconds ?? 0, hasChoices: data.hasChoices, injectPosition: data.injectPosition ?? 'start',
    });
  };

  useEffect(() => { loadBeat(); }, [beatId]);

  if (!beat || !form) return <div className="admin-content"><p>Loading…</p></div>;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateBeat(beatId, {
      shiftId: form.shiftId, beatType: form.beatType,
      sequenceOrder: form.beatType === 'Narrative' ? Number(form.sequenceOrder) : null,
      app: form.app, senderName: form.senderName,
      contentJson: { text: form.text, avatar: null, sound_effect: null, choices: null },
      desktopEvent: null, delaySeconds: Number(form.delaySeconds), hasChoices: form.hasChoices,
      injectPosition: form.beatType === 'Consequence' ? form.injectPosition : null, reorderSiblings: false,
    });
    await loadBeat();
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this beat?') && (await deleteBeat(beatId))) navigate(`/super-admin/shifts/${form.shiftId}`);
  };

  const handleChoiceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChoiceForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddChoice = async (e) => {
    e.preventDefault();
    clearError();
    const payload = [{
      beatId: Number(beatId), choiceIndex: Number(choiceForm.choiceIndex), choiceText: choiceForm.choiceText,
      tier: choiceForm.tier, isEvaluateable: choiceForm.isEvaluateable, consequenceId: null,
      immediateFeedback: choiceForm.immediateFeedback || null,
    }];
    if (await createChoices(payload)) {
      setChoiceForm((f) => ({ ...f, choiceText: '', choiceIndex: Math.min(f.choiceIndex + 1, 4) }));
      await loadBeat();
    }
  };

  const handleEditChoiceText = async (choice) => {
    const newText = window.prompt('Choice text', choice.choiceText);
    if (newText === null) return;
    await updateChoice(choice.choiceId, {
      choiceText: newText, tier: choice.tier, consequenceId: choice.consequenceId,
      immediateFeedback: choice.immediateFeedback, isEvaluateable: true,
    });
    await loadBeat();
  };

  return (
    <>
      <header className="admin-topbar">
        <div>
          <p className="admin-topbar__crumbs">
            <a href={`/super-admin/shifts/${form.shiftId}`}>Shift {form.shiftId}</a> / Beat
          </p>
          <h1 className="admin-topbar__title">{beat.beatKey}</h1>
        </div>
        <span className={`admin-pill admin-pill--${form.beatType === 'Narrative' ? 'narrative' : 'consequence'}`}>{form.beatType}</span>
      </header>

      <div className="admin-content">
        {error && <div className="admin-banner-error">{error}</div>}

        <div className="admin-card">
          <div className="admin-card__header"><h3>Content</h3></div>
          <form onSubmit={handleSave}>
            <div className="admin-field-row">
              <div className="admin-field">
                <label>App</label>
                <select name="app" value={form.app} onChange={handleChange}>
                  {APPS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Sender name</label>
                <input name="senderName" value={form.senderName} onChange={handleChange} />
              </div>
            </div>
            <div className="admin-field">
              <label>Content text</label>
              <textarea name="text" value={form.text} onChange={handleChange} />
            </div>
            <div className="admin-field-row">
              {form.beatType === 'Narrative' ? (
                <div className="admin-field">
                  <label>Sequence order</label>
                  <input name="sequenceOrder" type="number" value={form.sequenceOrder} onChange={handleChange} />
                </div>
              ) : (
                <div className="admin-field">
                  <label>Inject position</label>
                  <select name="injectPosition" value={form.injectPosition} onChange={handleChange}>
                    <option value="start">start</option>
                    <option value="end">end</option>
                  </select>
                </div>
              )}
              <div className="admin-field">
                <label>Delay (seconds)</label>
                <input name="delaySeconds" type="number" step="0.1" value={form.delaySeconds} onChange={handleChange} />
              </div>
            </div>
            <label className="admin-checkbox">
              <input type="checkbox" name="hasChoices" checked={form.hasChoices} onChange={handleChange} />
              Has choices
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="admin-btn admin-btn--primary">Save changes</button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete}>Delete beat</button>
            </div>
          </form>
        </div>

        {form.hasChoices && (
          <div className="admin-card">
            <div className="admin-card__header"><h3>Choices ({beat.choices?.length ?? 0}/4)</h3></div>

            {(beat.choices?.length ?? 0) === 0 && (
              <div className="admin-empty" style={{ marginBottom: 16 }}>
                <p className="admin-empty__title">No choices yet</p>
                <p>Add up to 4 options for this beat.</p>
              </div>
            )}

            {beat.choices?.map((c) => (
              <div className="admin-choice" key={c.choiceId}>
                <div>
                  <span className="admin-choice__index">#{c.choiceIndex}</span>
                  <span className={`admin-pill admin-pill--${tierPillClass[c.tier]}`} style={{ marginLeft: 8 }}>{c.tier}</span>
                  <p className="admin-choice__text">{c.choiceText}</p>
                  {c.immediateFeedback && <p className="admin-choice__feedback">→ {c.immediateFeedback}</p>}
                </div>
                <button className="admin-btn admin-btn--ghost" onClick={() => handleEditChoiceText(c)}>Edit</button>
              </div>
            ))}

            {(beat.choices?.length ?? 0) < 4 && (
              <form onSubmit={handleAddChoice} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--los-border)' }}>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Index (1-4)</label>
                    <input name="choiceIndex" type="number" min="1" max="4" value={choiceForm.choiceIndex} onChange={handleChoiceChange} />
                  </div>
                  <div className="admin-field">
                    <label>Tier</label>
                    <select name="tier" value={choiceForm.tier} onChange={handleChoiceChange}>
                      {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-field">
                  <label>Choice text</label>
                  <input name="choiceText" value={choiceForm.choiceText} onChange={handleChoiceChange} required />
                </div>
                <div className="admin-field">
                  <label>Immediate feedback</label>
                  <input name="immediateFeedback" value={choiceForm.immediateFeedback} onChange={handleChoiceChange} />
                </div>
                <label className="admin-checkbox">
                  <input type="checkbox" name="isEvaluateable" checked={choiceForm.isEvaluateable} onChange={handleChoiceChange} />
                  Evaluateable (feeds assessment telemetry)
                </label>
                <button type="submit" className="admin-btn admin-btn--primary">Add choice</button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
