import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError('請輸入 Email'); return; }
    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError('無法連線至伺服器，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="app">
        <section className="registration">
          <div className="reg-success">
            <div className="reg-success-icon">📧</div>
            <h3>確認信已送出</h3>
            <p>若此 Email 已註冊，您將收到一封密碼重設信件，請於 24 小時內點擊連結完成設定。</p>
            <Link to="/login" className="submit-btn" style={{ display: 'block', marginTop: '1rem', textDecoration: 'none', textAlign: 'center' }}>
              返回登入 →
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
          <h2>忘記密碼</h2>
          <p className="reg-subtitle">輸入您的 Email，我們將寄送密碼重設連結</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="fields-grid">
            <div className={`field ${email ? 'has-value' : ''}`}>
              <label htmlFor="email"><span className="field-icon">✉️</span>Email</label>
              <input
                id="email" name="email" type="email"
                value={email} placeholder="name@example.com"
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
              />
              {error && <span className="field-error">⚠ {error}</span>}
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '送出中...' : '送出重設連結 →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" style={{ color: '#6366f1', fontSize: '0.85rem' }}>← 返回登入</Link>
        </p>
      </section>
    </div>
  );
}

export default ForgotPasswordPage;
