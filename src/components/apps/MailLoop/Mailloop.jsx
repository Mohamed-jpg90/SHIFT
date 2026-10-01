import { useMailStore } from '../../../stores/mailStore';

export default function MailLoop() {
  const emails = useMailStore((state) => state.emails);
  const selectedId = useMailStore((state) => state.selectedId);
  const selectEmail = useMailStore((state) => state.selectEmail);
  const selected = emails.find((email) => email.id === selectedId);

  return (
    <div className="mailloop">
      <div className="mailloop__list">
        <p className="app-header">&gt; inbox</p>
        {emails.map((email) => (
          <button
            key={email.id}
            type="button"
            className={`mailloop__item${email.id === selectedId ? ' mailloop__item--active' : ''}`}
            onClick={() => selectEmail(email.id)}
          >
            <span className="mailloop__from">{email.from}</span>
            <span className="mailloop__subject">{email.subject}</span>
            <span className="mailloop__preview">{email.preview}</span>
          </button>
        ))}
        {!emails.length && <p className="app-placeholder">your inbox is clear</p>}
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
