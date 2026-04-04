import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function FacebookCallbackPage() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      setError('Facebook 授權失敗，請重新嘗試。');
      return;
    }
    const redirectUri = `${window.location.origin}/facebook-callback`;
    fetch(`${API_BASE}/api/auth/facebook/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Facebook authorization failed');
        return res.json();
      })
      .then(({ facebookId, displayName }) => {
        sessionStorage.setItem('facebookId', facebookId);
        sessionStorage.setItem('authDisplayName', displayName || '');
        window.location.href = '/';
      })
      .catch(() => setError('Facebook 授權失敗，請關閉此頁並重新嘗試。'));
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
      <p style={{ color: '#6b7280' }}>正在完成 Facebook 授權...</p>
    </div>
  );
}

export default FacebookCallbackPage;
