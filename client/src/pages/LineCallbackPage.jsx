import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function LineCallbackPage() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      setError('LINE 授權失敗，請重新嘗試。');
      return;
    }
    const redirectUri = `${window.location.origin}/line-callback`;
    fetch(`${API_BASE}/api/auth/line/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('LINE authorization failed');
        return res.json();
      })
      .then(({ lineUserId, displayName }) => {
        sessionStorage.setItem('lineUserId', lineUserId);
        sessionStorage.setItem('lineDisplayName', displayName || '');
        window.location.href = '/';
      })
      .catch(() => setError('LINE 授權失敗，請關閉此頁並重新嘗試。'));
  }, []);

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: '#6b7280' }}>正在完成 LINE 授權...</p>
    </div>
  );
}

export default LineCallbackPage;
