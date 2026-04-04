import { useState, useEffect } from 'react';
import { useEventId } from '../hooks/useEventId';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const LINE_CLIENT_ID = import.meta.env.VITE_LINE_LOGIN_CLIENT_ID || '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL = { name: '', email: '', phone: '', company: '' };

const FIELDS = [
  { id: 'name',    label: '姓名',  type: 'text',  icon: '👤', placeholder: '您的全名' },
  { id: 'email',   label: 'Email', type: 'email', icon: '✉️', placeholder: 'name@example.com' },
  { id: 'phone',   label: '電話',  type: 'tel',   icon: '📱', placeholder: '0912-345-678' },
  { id: 'company', label: '公司',  type: 'text',  icon: '🏢', placeholder: '公司或單位名稱' },
];

function RegistrationForm() {
  const eventId = useEventId();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [authId, setAuthId] = useState('');
  const [authProvider, setAuthProvider] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Restore auth state and pending registration data after redirect
  useEffect(() => {
    const lineId = sessionStorage.getItem('lineUserId') || '';
    const googleId = sessionStorage.getItem('googleId') || '';
    const facebookId = sessionStorage.getItem('facebookId') || '';
    const storedName = sessionStorage.getItem('lineDisplayName') || sessionStorage.getItem('authDisplayName') || '';
    if (lineId) { setAuthId(lineId); setAuthProvider('line'); setAuthDisplayName(storedName); }
    else if (googleId) { setAuthId(googleId); setAuthProvider('google'); setAuthDisplayName(storedName); }
    else if (facebookId) { setAuthId(facebookId); setAuthProvider('facebook'); setAuthDisplayName(storedName); }
    const pending = sessionStorage.getItem('pendingRegistration');
    if (pending) {
      try {
        const saved = JSON.parse(pending);
        setForm((p) => ({ ...p, ...saved }));
      } catch {}
      sessionStorage.removeItem('pendingRegistration');
    }
  }, []);

  // Load Google GSI script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  // Render Google button once script loaded (and no auth yet)
  useEffect(() => {
    if (!googleLoaded || authId) return;
    const container = document.getElementById('google-btn-container');
    if (!container || !window.google) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', locale: 'zh_TW', text: 'signin_with' });
    } catch (e) {
      console.error('Google GSI init error:', e);
    }
  }, [googleLoaded, authId]);


  function handleLineLogin() {
    sessionStorage.setItem('pendingRegistration', JSON.stringify(form));
    const state = Math.random().toString(36).slice(2);
    const redirectUri = `${window.location.origin}/line-callback`;
    const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${encodeURIComponent(LINE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile`;
    window.location.href = url;
  }

  async function handleGoogleCredential({ credential }) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      if (!res.ok) { setServerError('Google 登入失敗，請稍後再試'); return; }
      const { googleId, displayName } = await res.json();
      sessionStorage.setItem('googleId', googleId);
      sessionStorage.setItem('authDisplayName', displayName || '');
      setAuthId(googleId);
      setAuthProvider('google');
      setAuthDisplayName(displayName || '');
      setServerError(null);
    } catch {
      setServerError('Google 登入失敗，請稍後再試');
    }
  }

  function handleFacebookLogin() {
    sessionStorage.setItem('pendingRegistration', JSON.stringify(form));
    const state = Math.random().toString(36).slice(2);
    const redirectUri = `${window.location.origin}/facebook-callback`;
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(FACEBOOK_APP_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=public_profile`;
    window.location.href = url;
  }

  function clearAuth() {
    ['lineUserId', 'lineDisplayName', 'googleId', 'facebookId', 'authDisplayName'].forEach(k => sessionStorage.removeItem(k));
    setAuthId(''); setAuthProvider(''); setAuthDisplayName('');
  }

  function validate() {
    const e = {};
    if (!form.name) e.name = '請填寫姓名';
    if (!form.email) e.email = '請填寫 Email';
    else if (!EMAIL_REGEX.test(form.email)) e.email = 'Email 格式不正確';
    if (!form.phone) e.phone = '請填寫電話';
    if (!form.company) e.company = '請填寫公司';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!authId) {
      setServerError('請先完成身份驗證');
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrId = FIELDS.find((f) => errs[f.id])?.id;
      if (firstErrId) document.getElementById(firstErrId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const token = localStorage.getItem('memberToken');
      const body = {
        ...form,
        lineUserId: authProvider === 'line' ? authId : '',
        googleId: authProvider === 'google' ? authId : '',
        facebookId: authProvider === 'facebook' ? authId : '',
      };
      const res = await fetch(`${API_BASE}/api/register?eventId=${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.status === 201) {
        const data = await res.json();
        ['lineUserId', 'lineDisplayName', 'googleId', 'facebookId', 'authDisplayName'].forEach(k => sessionStorage.removeItem(k));
        setTempPassword(data.tempPassword || null);
        setSubmitted(true);
      } else {
        setServerError('報名失敗，請稍後再試。');
      }
    } catch {
      setServerError('無法連線至伺服器，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="registration">
        <div className="reg-header">
          <span className="reg-header-tag">Register</span>
          <h2>立即報名</h2>
        </div>
        <div className="reg-success">
          <div className="reg-success-icon">🎉</div>
          <h3>報名成功！</h3>
          <p>感謝您的報名，同時已為您自動建立會員帳號。</p>
          {tempPassword && (
            <div style={{ margin: '1.25rem 0', padding: '1rem 1.25rem', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#166534', marginBottom: '0.4rem' }}>🔑 您的臨時密碼</p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 900, color: '#15803d', letterSpacing: '0.1em', margin: '0.25rem 0' }}>{tempPassword}</p>
              <p style={{ fontSize: '0.78rem', color: '#4b7a5e', marginTop: '0.4rem' }}>請妥善記錄此密碼，登入後可在會員頁面更改密碼。<br/>密碼規則：8 碼以上、含大小寫英文與數字。</p>
            </div>
          )}
          <a href="/login" className="submit-btn" style={{ display: 'block', marginTop: '0.75rem', textDecoration: 'none', textAlign: 'center' }}>
            前往登入 →
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="registration">
      <div className="reg-header">
        <span className="reg-header-tag">Register</span>
        <h2>立即報名</h2>
        <p className="reg-subtitle">填寫以下資料，即刻確保您的席位</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        {/* 身份驗證 */}
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: authId ? '#f0fdf4' : '#f9fafb', borderRadius: '10px', border: `1.5px solid ${authId ? '#86efac' : '#d1d5db'}` }}>
          <p style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '0.6rem', fontWeight: 600 }}>
            身份驗證 <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>*</span>
            <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: '0.4rem' }}>（擇一登入）</span>
          </p>
          {authId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <p style={{ color: '#15803d', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                ✓ 已授權：{authDisplayName}
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400, marginLeft: '0.4rem' }}>
                  ({authProvider === 'line' ? 'LINE' : authProvider === 'google' ? 'Google' : 'Facebook'})
                </span>
              </p>
              <button type="button" onClick={clearAuth} style={{ fontSize: '0.75rem', color: '#6b7280', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>
                重新選擇
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleLineLogin}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#06C755', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >
                <span>💬</span> LINE
              </button>
              {GOOGLE_CLIENT_ID && <div id="google-btn-container" style={{ overflow: 'hidden', maxWidth: '220px' }} />}
              {FACEBOOK_APP_ID && (
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#1877F2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  <span>f</span> Facebook
                </button>
              )}
            </div>
          )}
        </div>

        {Object.keys(errors).length > 0 && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fff5f5', border: '1.5px solid #fca5a5', borderRadius: '10px' }}>
            <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>⚠ 請填寫以下必填欄位：</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {FIELDS.filter((f) => errors[f.id]).map((f) => (
                <li key={f.id} style={{ color: '#dc2626', fontSize: '0.82rem' }}>{f.label}　{errors[f.id]}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="fields-grid">
          {FIELDS.map(({ id, label, type, icon, placeholder }) => (
            <div className={`field ${errors[id] ? 'has-error' : form[id] ? 'has-value' : ''}`} key={id}>
              <label htmlFor={id}>
                <span className="field-icon">{icon}</span>{label}
                <span style={{ color: '#ef4444', marginLeft: '2px', fontSize: '0.8rem' }}>*</span>
              </label>
              <input
                id={id} name={id} type={type}
                value={form[id]}
                placeholder={placeholder}
                onChange={handleChange}
              />
              {errors[id] && <span className="field-error">⚠ {errors[id]}</span>}
            </div>
          ))}
        </div>

        {serverError && <p className="error" style={{ marginTop: '0.75rem' }}>{serverError}</p>}
        <button type="submit" className="submit-btn" disabled={submitting || !authId}>
          {submitting
            ? <span className="btn-loading">送出中<span className="dots">...</span></span>
            : !authId
              ? <span>請先完成身份驗證</span>
              : <span>立即確認報名 →</span>}
        </button>
      </form>
    </section>
  );
}

export default RegistrationForm;
