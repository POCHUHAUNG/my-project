import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (form.newPassword.length < 8 || !/[A-Z]/.test(form.newPassword) || !/[a-z]/.test(form.newPassword) || !/[0-9]/.test(form.newPassword))
      errs.newPassword = '密碼需 8 碼以上，且包含大寫英文、小寫英文及數字';
    if (form.newPassword !== form.confirm) errs.confirm = '兩次輸入的密碼不符';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setServerError(data.error || '設定失敗，請稍後再試');
      }
    } catch {
      setServerError('無法連線至伺服器');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="app">
        <section className="registration">
          <div className="reg-success">
            <div className="reg-success-icon">🎉</div>
            <h3>密碼設定成功！</h3>
            <p>您的帳號已啟用，請登入查看個人資料。</p>
            <Link to="/login" className="submit-btn" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none', textAlign: 'center' }}>
              前往登入 →
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app">
      <section className="registration">
        <div className="reg-header">
          <span className="reg-header-tag">Member</span>
          <h2>設定密碼</h2>
          <p className="reg-subtitle">請設定您的會員登入密碼（至少 8 個字元）</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="fields-grid">
            <div className={`field ${errors.newPassword ? 'has-error' : form.newPassword ? 'has-value' : ''}`}>
              <label htmlFor="newPassword"><span className="field-icon">🔒</span>新密碼</label>
              <input id="newPassword" name="newPassword" type="password" value={form.newPassword} placeholder="至少 8 個字元" onChange={handleChange} />
              {errors.newPassword && <span className="field-error">⚠ {errors.newPassword}</span>}
            </div>
            <div className={`field ${errors.confirm ? 'has-error' : form.confirm ? 'has-value' : ''}`}>
              <label htmlFor="confirm"><span className="field-icon">🔒</span>確認密碼</label>
              <input id="confirm" name="confirm" type="password" value={form.confirm} placeholder="再次輸入密碼" onChange={handleChange} />
              {errors.confirm && <span className="field-error">⚠ {errors.confirm}</span>}
            </div>
          </div>
          {serverError && <p className="error" style={{ marginTop: '0.75rem' }}>{serverError}</p>}
          <button type="submit" className="submit-btn" disabled={loading || !token}>
            {loading ? '設定中...' : '確認設定密碼 →'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default SetPasswordPage;
