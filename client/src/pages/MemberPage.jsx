import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEventId } from '../hooks/useEventId';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const PW_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/;

function MemberPage() {
  const eventId = useEventId();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('memberToken');
    if (!token) { navigate('/login'); return; }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/member/me`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/api/member/registrations?eventId=${eventId}`, { headers }).then((r) => r.json()),
    ])
      .then(([me, regs]) => {
        if (me.error) { navigate('/login'); return; }
        setMember(me);
        setRegistrations(Array.isArray(regs) ? regs : []);
      })
      .catch(() => setError('無法載入資料，請稍後再試'))
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('memberToken');
    navigate('/login');
  }

  if (loading) return <div className="app"><section className="registration"><p>載入中...</p></section></div>;
  if (error) return <div className="app"><section className="registration"><p className="error">{error}</p></section></div>;

  return (
    <div className="app">
      <section className="registration">
        <div className="reg-header">
          <span className="reg-header-tag">Member</span>
          <h2>會員個人頁面</h2>
        </div>

        {/* Profile */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f5f3ff', borderRadius: '10px' }}>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1e1b4b' }}>{member?.name}</p>
          <p style={{ color: '#6366f1', fontSize: '0.85rem' }}>{member?.email}</p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            加入日期：{member?.createdAt ? new Date(member.createdAt).toLocaleDateString('zh-TW') : '—'}
          </p>
        </div>

        {/* Member-only content */}
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#ede9fe', borderRadius: '12px', borderLeft: '4px solid #4f46e5' }}>
          <p style={{ fontWeight: 800, color: '#4f46e5', marginBottom: '0.5rem' }}>🎁 會員專屬內容</p>
          <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.6 }}>
            感謝您參與本次活動！以下為會員專屬資料，請妥善保存：
          </p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
            <li>活動簡報下載連結（活動後提供）</li>
            <li>講師聯絡資訊（活動後提供）</li>
            <li>下次活動早鳥優先通知</li>
          </ul>
        </div>

        {/* Registration history */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#111' }}>報名紀錄</p>
          {registrations.length === 0 ? (
            <p className="empty">尚無報名紀錄</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {registrations.map((r, i) => {
                const attendedColor = r.attended === '已出席' ? '#15803d' : r.attended === '未出席' ? '#dc2626' : '#92400e';
                const attendedBg = r.attended === '已出席' ? '#dcfce7' : r.attended === '未出席' ? '#fee2e2' : '#fef9c3';
                const attendedIcon = r.attended === '已出席' ? '✅' : r.attended === '未出席' ? '❌' : '⏳';
                return (
                  <div key={i} style={{ padding: '0.9rem 1rem', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f5' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      {r.checkinToken && (
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <img
                            src={`${API_BASE}/api/checkin/qr?token=${r.checkinToken}`}
                            alt="報到 QR Code"
                            style={{ width: '90px', height: '90px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: '#9ca3af' }}>掃碼報到</p>
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e1b4b' }}>{r.title || '—'}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.65rem', borderRadius: '999px', background: attendedBg, fontSize: '0.75rem', fontWeight: 700, color: attendedColor }}>
                            {attendedIcon} {r.attended || '待確認'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>
                          {r.date && <span>📅 {r.date}</span>}
                          {r.location && <span>📍 {r.location}</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                          報名時間：{r.submittedAt || '—'}
                          {r.company && <span style={{ marginLeft: '0.75rem' }}>· {r.company}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Change password */}
        <details style={{ marginBottom: '1.5rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#374151', fontSize: '0.9rem', padding: '0.5rem 0' }}>
            🔑 更改密碼
          </summary>
          {pwSuccess ? (
            <p style={{ color: '#166534', marginTop: '0.75rem', fontWeight: 600 }}>✓ 密碼已更新！</p>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const errs = {};
              if (!pwForm.current) errs.current = '請輸入目前密碼';
              if (!PW_REGEX.test(pwForm.next)) errs.next = '新密碼需 8 碼以上，含大小寫英文及數字';
              if (pwForm.next !== pwForm.confirm) errs.confirm = '兩次密碼不符';
              if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
              setPwSubmitting(true);
              const token = localStorage.getItem('memberToken');
              const res = await fetch(`${API_BASE}/api/member/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
              });
              const data = await res.json();
              setPwSubmitting(false);
              if (res.ok) { setPwSuccess(true); setPwForm({ current: '', next: '', confirm: '' }); }
              else setPwErrors({ server: data.error || '更新失敗' });
            }} style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { key: 'current', label: '目前密碼', ph: '目前密碼' },
                { key: 'next', label: '新密碼', ph: '8碼以上，含大小寫英文及數字' },
                { key: 'confirm', label: '確認新密碼', ph: '再次輸入新密碼' },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.2rem' }}>{label}</label>
                  <input type="password" value={pwForm[key]} placeholder={ph}
                    onChange={(e) => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwErrors(p => ({ ...p, [key]: undefined })); }}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: `1.5px solid ${pwErrors[key] ? '#f87171' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  {pwErrors[key] && <p style={{ color: '#dc2626', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{pwErrors[key]}</p>}
                </div>
              ))}
              {pwErrors.server && <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>{pwErrors.server}</p>}
              <button type="submit" disabled={pwSubmitting} className="submit-btn" style={{ marginTop: '0.25rem' }}>
                {pwSubmitting ? '更新中...' : '確認更改密碼'}
              </button>
            </form>
          )}
        </details>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/" style={{ flex: 1, textAlign: 'center', padding: '0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', color: '#6b7280', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
            回到活動頁
          </Link>
          <button onClick={handleLogout} style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
            登出
          </button>
        </div>
      </section>
    </div>
  );
}

export default MemberPage;
