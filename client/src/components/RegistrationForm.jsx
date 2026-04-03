import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventId } from '../hooks/useEventId';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL = { name: '', email: '', phone: '', company: '', lineId: '' };

const FIELDS = [
  { id: 'name',    label: '姓名',    type: 'text',  icon: '👤', placeholder: '您的全名' },
  { id: 'email',   label: 'Email',   type: 'email', icon: '✉️', placeholder: 'name@example.com' },
  { id: 'phone',   label: '電話',    type: 'tel',   icon: '📱', placeholder: '0912-345-678' },
  { id: 'company', label: '公司',    type: 'text',  icon: '🏢', placeholder: '公司或單位名稱' },
  { id: 'lineId',  label: 'LINE ID', type: 'text',  icon: '💬', placeholder: '@yourlineid' },
];

function RegistrationForm() {
  const eventId = useEventId();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Restore pending registration data after login redirect
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingRegistration');
    if (pending) {
      try {
        const saved = JSON.parse(pending);
        setForm((p) => ({ ...p, ...saved }));
      } catch {}
      sessionStorage.removeItem('pendingRegistration');
    }
  }, []);

  function validate() {
    const e = {};
    if (!form.name) e.name = '請填寫姓名';
    if (!form.email) e.email = '請填寫 Email';
    else if (!EMAIL_REGEX.test(form.email)) e.email = 'Email 格式不正確';
    if (!form.phone) e.phone = '請填寫電話';
    if (!form.company) e.company = '請填寫公司';
    if (!form.lineId) e.lineId = '請填寫 LINE ID';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // 自動捲到第一個錯誤欄位
      const firstErrId = FIELDS.find((f) => errs[f.id])?.id;
      if (firstErrId) document.getElementById(firstErrId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const token = localStorage.getItem('memberToken');
      const res = await fetch(`${API_BASE}/api/register?eventId=${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (res.status === 201) {
        const data = await res.json();
        setTempPassword(data.tempPassword || null);
        setSubmitted(true);
      }
      else { setServerError('報名失敗，請稍後再試。'); }
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
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting
            ? <span className="btn-loading">送出中<span className="dots">...</span></span>
            : <span>立即確認報名 →</span>}
        </button>
      </form>
    </section>
  );
}

export default RegistrationForm;
