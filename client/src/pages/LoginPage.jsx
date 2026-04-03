import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('memberToken', data.token);
        const redirect = searchParams.get('redirect') || '/member';
        navigate(redirect);
      } else if (res.status === 401) {
        setError('Email 或密碼不正確');
      } else if (res.status === 403) {
        setError('帳號尚未啟用，請檢查 Email 並設定密碼');
      } else {
        setError(data.error || '登入失敗，請稍後再試');
      }
    } catch {
      setError('無法連線至伺服器');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <section className="registration">
        <div className="reg-header">
          <span className="reg-header-tag">Member</span>
          <h2>會員登入</h2>
          <p className="reg-subtitle">登入後即可完成報名及查看個人資料</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="fields-grid">
            <div className={`field ${form.email ? 'has-value' : ''}`}>
              <label htmlFor="email"><span className="field-icon">✉️</span>Email</label>
              <input id="email" name="email" type="email" value={form.email} placeholder="name@example.com" onChange={handleChange} />
            </div>
            <div className={`field ${form.password ? 'has-value' : ''}`}>
              <label htmlFor="password"><span className="field-icon">🔒</span>密碼</label>
              <input id="password" name="password" type="password" value={form.password} placeholder="請輸入密碼" onChange={handleChange} />
            </div>
          </div>
          {error && <p className="error" style={{ marginTop: '0.75rem' }}>{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '登入中...' : '登入 →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
          尚未有帳號？完成活動報名後將自動建立帳號。
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '0.85rem' }}>忘記密碼？</Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
