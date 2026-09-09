import { useState } from 'react';

const EMAILS = [
  { id: 1, from: 'Tante Layla', subject: 'Espresso machine broke again', preview: 'Byte, can you check...', body: 'Byte, can you check the machine before Salma gets here? It keeps resetting the price.' },
  { id: 2, from: 'HR @ Loop', subject: 'Welcome to Loop', preview: 'Your onboarding checklist...', body: 'Welcome to Loop! Here is your onboarding checklist for the first week.' },
];

export default function MailLoop() {
  const [selectedId, setSelectedId] = useState(EMAILS[0]?.id ?? null);
  const selected = EMAILS.find((e) => e.id === selectedId);

  return (
    <div className="mailloop">
      <div className="mailloop__list">
        <p className="app-header">&gt; inbox</p>
        {EMAILS.map((email) => (
          <button
            key={email.id}
            type="button"
            className={`mailloop__item${email.id === selectedId ? ' mailloop__item--active' : ''}`}
            onClick={() => setSelectedId(email.id)}
          >
            <span className="mailloop__from">{email.from}</span>
            <span className="mailloop__subject">{email.subject}</span>
            <span className="mailloop__preview">{email.preview}</span>
          </button>
        ))}
      </div>
      <div className="mailloop__reading">
        {selected ? (
          <>
            <p className="mailloop__reading-subject">{selected.subject}</p>
            <p className="mailloop__reading-from">from {selected.from}</p>
            <p className="mailloop__reading-body">{selected.body}</p>
          </>
        ) : (
          <div className="app-placeholder">no email selected</div>
        )}
      </div>
    </div>
  );
}