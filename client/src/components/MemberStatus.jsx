import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function MemberStatus() {
  const [state, setState] = useState('loading');
  const [member, setMember] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('memberToken');
    if (!token) { setState('guest'); return; }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/member/me`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/api/member/registrations`, { headers }).then((r) => r.json()),
    ])
      .then(([me, regs]) => {
        if (me.error) { localStorage.removeItem('memberToken'); setState('guest'); return; }
        setMember(me);
        setRegistrations(Array.isArray(regs) ? regs : []);
        setState('member');
      })
      .catch(() => setState('guest'));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (!e.target.closest('#member-status-root')) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function handleLogout() {
    localStorage.removeItem('memberToken');
    setState('guest');
    setMember(null);
    setRegistrations([]);
    setOpen(false);
  }

  if (state === 'loading') return null;

  const hasRegistered = registrations.length > 0;

  return (
    <div id="member-status-root" style={{ position: 'fixed', top: '12px', right: '16px', zIndex: 1000 }}>

      {/* ── Guest ── */}
      {state === 'guest' && (
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: '#4f46e5', color: '#fff',
          padding: '0.45rem 1rem', borderRadius: '999px',
          textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
          boxShadow: '0 2px 10px rgba(79,70,229,0.35)',
        }}>
          👤 會員登入
        </Link>
      )}

      {/* ── Member trigger button ── */}
      {state === 'member' && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#16a34a', color: '#fff',
              padding: '0.45rem 1rem', borderRadius: '999px', border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              boxShadow: '0 2px 10px rgba(22,163,74,0.35)',
            }}
          >
            <span style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 900,
            }}>
              {member?.name?.[0] || '?'}
            </span>
            {member?.name}
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{open ? '▲' : '▼'}</span>
          </button>

          {/* Dropdown panel */}
          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: '280px',
              background: '#fff', borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
            }}>
              {/* Header */}
              <div style={{ background: '#16a34a', padding: '0.85rem 1rem' }}>
                <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{member?.name}</p>
                <p style={{ margin: '0.15rem 0 0', color: '#bbf7d0', fontSize: '0.75rem' }}>{member?.email}</p>
              </div>

              {/* Registration status */}
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #f0f0f5' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.3rem 0.75rem', borderRadius: '999px',
                  background: hasRegistered ? '#dcfce7' : '#fef9c3',
                  border: `1px solid ${hasRegistered ? '#86efac' : '#fde047'}`,
                }}>
                  <span>{hasRegistered ? '✅' : '⏳'}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: hasRegistered ? '#15803d' : '#92400e' }}>
                    {hasRegistered ? '已完成報名' : '尚未報名此活動'}
                  </span>
                </div>

                {hasRegistered && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>報名紀錄</p>
                    {registrations.map((r, i) => {
                      const attendedColor = r.attended === '已出席' ? '#15803d' : r.attended === '未出席' ? '#dc2626' : '#92400e';
                      const attendedBg = r.attended === '已出席' ? '#dcfce7' : r.attended === '未出席' ? '#fee2e2' : '#fef9c3';
                      const attendedIcon = r.attended === '已出席' ? '✅' : r.attended === '未出席' ? '❌' : '⏳';
                      return (
                        <div key={i} style={{ padding: '0.55rem 0.75rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e1b4b' }}>{r.title || '—'}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: attendedColor, background: attendedBg, padding: '0.15rem 0.5rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                              {attendedIcon} {r.attended || '待確認'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {r.date && <span>📅 {r.date}</span>}
                            {r.location && <span>📍 {r.location}</span>}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>{r.submittedAt}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: '0.65rem 1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to="/member" onClick={() => setOpen(false)} style={{
                  flex: 1, textAlign: 'center', padding: '0.5rem',
                  background: '#4f46e5', color: '#fff', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem',
                }}>
                  個人頁面
                </Link>
                <button onClick={handleLogout} style={{
                  flex: 1, padding: '0.5rem',
                  background: 'transparent', border: '1.5px solid #e5e7eb',
                  color: '#6b7280', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                }}>
                  登出
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MemberStatus;
