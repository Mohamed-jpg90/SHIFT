import { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import '../../style/admin.css';

export default function AdminLayout() {
  const { shifts, fetchShifts } = useAdminStore();
  const location = useLocation();
  const [openChapters, setOpenChapters] = useState({});

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const chapters = shifts.reduce((acc, s) => {
    (acc[s.chapterNumber] ??= []).push(s);
    return acc;
  }, {});

  const toggleChapter = (ch) => setOpenChapters((o) => ({ ...o, [ch]: !o[ch] }));

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-mark" aria-hidden="true">S</span>
          <div>
            <p className="admin-sidebar__brand-title">SHIFT <b>Studio</b></p>
            <p className="admin-sidebar__brand-sub">super-admin content console</p>
          </div>
        </div>

        <nav className="admin-sidebar__tree">
          <p className="admin-sidebar__section-label">Narrative map</p>
          <NavLink to="/super-admin/practice" className={({ isActive }) => `admin-studio-link${isActive ? ' admin-studio-link--active' : ''}`}>Practice tasks</NavLink>
          {Object.keys(chapters).sort((a, b) => a - b).map((ch) => {
            const isOpen = openChapters[ch] ?? true;
            return (
              <div className="admin-chapter" key={ch}>
                <button type="button" className="admin-chapter__label" onClick={() => toggleChapter(ch)}>
                  <span className={`admin-chapter__caret${isOpen ? ' admin-chapter__caret--open' : ''}`}>▸</span>
                  Chapter {ch}
                </button>
                {isOpen && chapters[ch]
                  .sort((a, b) => a.shiftNumber - b.shiftNumber)
                  .map((s) => (
                    <NavLink
                      key={s.shiftId}
                      to={`/super-admin/shifts/${s.shiftId}`}
                      className={({ isActive }) => `admin-shift-link${isActive ? ' admin-shift-link--active' : ''}`}
                    >
                      <span className="admin-shift-link__num">{s.shiftNumber}</span>{s.title}
                    </NavLink>
                  ))}
              </div>
            );
          })}
          {shifts.length === 0 && (
            <p style={{ padding: '0 18px', fontSize: 12.5, color: 'var(--los-text-muted)' }}>No shifts yet</p>
          )}
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/super-admin" className="admin-sidebar__footer-link">All shifts</Link>
          <Link to="/admin" className="admin-sidebar__footer-link admin-sidebar__footer-link--muted">← Instructor workspace</Link>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet context={{ pathname: location.pathname }} />
      </div>
    </div>
  );
}
