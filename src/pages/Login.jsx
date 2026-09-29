import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const BOOT_LINE = 'initializing secure access…';

export default function Login() {
  const navigate = useNavigate();
  const logIn = useAuthStore((s) => s.logIn);
  const signUp = useAuthStore((s) => s.signUp);
  const error = useAuthStore((s) => s.error);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);

  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [bootText, setBootText] = useState('');
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      i += 1;
      setBootText(BOOT_LINE.slice(0, i));
      if (i >= BOOT_LINE.length) {
        clearInterval(typing);
        setTimeout(() => setFormReady(true), 200);
      }
    }, 28);
    return () => clearInterval(typing);
  }, []);

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode);
    clearError();
    setLocalError('');
    setUsername('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (mode === 'signup') {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{10,}$/;

      if (!passwordRegex.test(password)) {
        setLocalError(
          'Password must be at least 10 characters, contain one uppercase letter and one special character'
        );
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('passwords do not match');
        return;
      }
      const ok = await signUp({ userName: username, name, email, password, confirmPassword });
      if (ok) navigate('/game', { replace: true });
      return;
    }

    const ok = await logIn(username, password);
    if (ok) navigate('/game', { replace: true });
  };

  const displayError = localError || error;

  return (
    <div className="term-page">
      <div className="term-grid" aria-hidden="true" />

      <div className="term-window">
        <div className="term-titlebar">
          <span className="term-dot term-dot--danger" />
          <span className="term-dot term-dot--warning" />
          <span className="term-dot term-dot--success" />
          <span className="term-titlebar__label">access.term</span>
        </div>

        <div className="term-body">
          <p className="term-brand">LOOP OS</p>
          <p className="term-boot-line">
            &gt; {bootText}
            <span className="term-cursor" aria-hidden="true">_</span>
          </p>

          {formReady && (
            <div className="term-form-wrap">
              <div className="term-tabs">
                <button
                  type="button"
                  className={`term-tab${mode === 'login' ? ' term-tab--active' : ''}`}
                  onClick={() => handleSwitchMode('login')}
                >
                  log in
                </button>
                <button
                  type="button"
                  className={`term-tab${mode === 'signup' ? ' term-tab--active' : ''}`}
                  onClick={() => handleSwitchMode('signup')}
                >
                  sign up
                </button>
              </div>

              <form className="term-form" onSubmit={handleSubmit}>
                <label className="term-field">
                  <span className="term-prompt">&gt; username</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </label>

                {mode === 'signup' && (
                  <>
                    <label className="term-field">
                      <span className="term-prompt">&gt; full name</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="term-field">
                      <span className="term-prompt">&gt; email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </label>
                  </>
                )}

                <label className="term-field">
                  <span className="term-prompt">&gt; password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={mode === 'signup' ? 10 : undefined}
                    required
                  />
                </label>

                {mode === 'signup' && (
                  <label className="term-field">
                    <span className="term-prompt">&gt; confirm password</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                )}

                {displayError && <p className="term-error">ERR: {displayError}</p>}

                <button type="submit" className="term-submit" disabled={isLoading}>
                  {isLoading ? 'connecting…' : mode === 'login' ? 'authenticate' : 'create account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
