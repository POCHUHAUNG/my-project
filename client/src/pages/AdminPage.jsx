import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext.jsx';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function AdminPage() {
  const [password, setPassword] = useState(localStorage.getItem('adminPw') || '');
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  const { login: adminLogin, logout: adminLogout } = useAdmin();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Inline edit state: memberId → { name, email, isActivated }
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', isActivated: false });
  const [editError, setEditError] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // Create member form state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', company: '', lineId: '', password: '', sendEmail: false });
  const [createError, setCreateError] = useState(null);
  const [createSaving, setCreateSaving] = useState(false);

  function openCreate() {
    setCreateForm({ name: '', email: '', phone: '', company: '', lineId: '', password: '', sendEmail: false });
    setCreateError(null);
    setShowCreate(true);
  }

  function cancelCreate() {
    setShowCreate(false);
    setCreateError(null);
  }

  async function submitCreate(e) {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim()) {
      const missing = [];
      if (!createForm.name.trim()) missing.push('姓名');
      if (!createForm.email.trim()) missing.push('Email');
      setCreateError(`請填寫必填欄位：${missing.join('、')}`);
      return;
    }
    setCreateSaving(true);
    setCreateError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/members`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          name: createForm.name.trim(),
          email: createForm.email.trim(),
          phone: createForm.phone.trim() || undefined,
          company: createForm.company.trim() || undefined,
          lineId: createForm.lineId.trim() || undefined,
          password: createForm.password || undefined,
          sendEmail: createForm.sendEmail,
        }),
      });
      if (res.status === 409) {
        setCreateError('此 Email 已被使用');
        setCreateSaving(false);
        return;
      }
      if (res.status === 400) {
        const data = await res.json();
        setCreateError(data.error || '建立失敗，請稍後再試');
        setCreateSaving(false);
        return;
      }
      if (!res.ok) {
        setCreateError('建立失敗，請稍後再試');
        setCreateSaving(false);
        return;
      }
      const newMember = await res.json();
      setMembers((prev) => [newMember, ...prev]);
      setShowCreate(false);
    } catch (_) {
      setCreateError('建立失敗，請稍後再試');
    }
    setCreateSaving(false);
  }

  // CSV batch import state
  const [csvFile, setCsvFile] = useState(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const [csvSummary, setCsvSummary] = useState(null);

  async function importCsv() {
    if (!csvFile) return;
    setCsvError(null);
    setCsvSummary(null);
    const text = await csvFile.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lines.length < 2) { setCsvError('CSV 無資料列'); return; }
    const csvHeaders = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    if (!csvHeaders.includes('name') || !csvHeaders.includes('email')) {
      setCsvError('CSV 缺少必要欄位 name 或 email');
      return;
    }
    const nameIdx = csvHeaders.indexOf('name');
    const emailIdx = csvHeaders.indexOf('email');
    const phoneIdx = csvHeaders.indexOf('phone');
    const companyIdx = csvHeaders.indexOf('company');
    const lineIdIdx = csvHeaders.indexOf('lineId');
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      return {
        name: cols[nameIdx] || '',
        email: cols[emailIdx] || '',
        phone: phoneIdx >= 0 ? cols[phoneIdx] || '' : '',
        company: companyIdx >= 0 ? cols[companyIdx] || '' : '',
        lineId: lineIdIdx >= 0 ? cols[lineIdIdx] || '' : '',
      };
    }).filter((r) => r.name || r.email);

    setCsvImporting(true);
    let success = 0;
    let fail = 0;
    const created = [];
    for (const row of rows) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/members`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ ...row, sendEmail: false }),
        });
        if (res.ok) {
          created.push(await res.json());
          success++;
        } else {
          fail++;
        }
      } catch (_) {
        fail++;
      }
    }
    if (created.length > 0) setMembers((prev) => [...created.reverse(), ...prev]);
    setCsvSummary(`成功 ${success} 筆，失敗 ${fail} 筆`);
    setCsvFile(null);
    setCsvImporting(false);
  }

  function getMemberRows() {
    return members.map((m) => {
      const reg = m.registrations && m.registrations[0];
      return {
        編號: m.memberNumber,
        姓名: m.name,
        Email: m.email,
        公司單位: m.company || '',
        帳號狀態: m.isActivated ? '已啟用' : '未啟用',
        加入日期: m.createdAt ? new Date(m.createdAt).toLocaleDateString('zh-TW') : '',
        課程名稱: reg ? (reg.eventTitle || '').split('\n')[0] : '',
        上課日期: reg ? reg.eventDate || '' : '',
        出席狀態: reg ? reg.attended || '' : '',
      };
    });
  }

  function exportCsv() {
    const rows = getMemberRows();
    const headers = Object.keys(rows[0] || { 編號:'',姓名:'',Email:'',公司單位:'',帳號狀態:'',加入日期:'',課程名稱:'',上課日期:'',出席狀態:'' });
    const lines = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(getMemberRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '會員名單');
    XLSX.writeFile(wb, `members_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // Notification state
  const [notifType, setNotifType] = useState('update');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState(null);
  const [notifError, setNotifError] = useState(null);

  // 課前通知 state
  const [preNotifTitle, setPreNotifTitle] = useState('');
  const [preNotifMessage, setPreNotifMessage] = useState('');
  const [preNotifChannels, setPreNotifChannels] = useState({ email: true, line: true });
  const [preNotifSending, setPreNotifSending] = useState(false);
  const [preNotifResult, setPreNotifResult] = useState(null);
  const [preNotifError, setPreNotifError] = useState(null);

  function headers() {
    return { 'x-admin-password': password, 'Content-Type': 'application/json' };
  }

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(`${API_BASE}/api/admin/members`, { headers: headers(), signal: controller.signal });
      clearTimeout(timer);
      setLoading(false);
      if (res.ok) {
        adminLogin(password);
        setMembers(await res.json());
        setAuthed(true);
      } else {
        setError('密碼錯誤');
      }
    } catch (err) {
      setLoading(false);
      if (err.name === 'AbortError') {
        setError('伺服器回應逾時，請再試一次（伺服器可能正在喚醒）');
      } else {
        setError('連線失敗，請稍後再試');
      }
    }
  }

  async function loadMembers() {
    const res = await fetch(`${API_BASE}/api/admin/members`, { headers: headers() });
    if (res.ok) setMembers(await res.json());
  }

  async function deleteMember(memberId, name) {
    if (!window.confirm(`確定要刪除「${name}」的會員資料？`)) return;
    const res = await fetch(`${API_BASE}/api/admin/members/${memberId}`, {
      method: 'DELETE', headers: headers(),
    });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
  }

  async function clearAll() {
    const res = await fetch(`${API_BASE}/api/admin/members`, {
      method: 'DELETE', headers: headers(),
    });
    if (res.ok) { setMembers([]); setConfirmClear(false); }
  }

  function startEdit(m) {
    setEditingId(m.memberId);
    setEditForm({ name: m.name, email: m.email, isActivated: m.isActivated });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function saveEdit(memberId) {
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(editForm),
      });
      if (res.status === 409) {
        setEditError('此 Email 已被其他會員使用');
        setEditSaving(false);
        return;
      }
      if (!res.ok) {
        setEditError('儲存失敗，請稍後再試');
        setEditSaving(false);
        return;
      }
      const updated = await res.json();
      setMembers((prev) => prev.map((m) => m.memberId === memberId ? { ...m, ...updated } : m));
      setEditingId(null);
    } catch (_) {
      setEditError('網路錯誤，請稍後再試');
    }
    setEditSaving(false);
  }

  async function sendPreEventNotification() {
    const channels = Object.keys(preNotifChannels).filter((k) => preNotifChannels[k]);
    if (!preNotifTitle.trim() || !preNotifMessage.trim() || channels.length === 0) return;
    setPreNotifSending(true);
    setPreNotifResult(null);
    setPreNotifError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/notify-pre-event`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ title: preNotifTitle.trim(), message: preNotifMessage.trim(), channels }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreNotifResult(`已排入發送：Email ${data.queued.email} 封、LINE ${data.queued.line} 則`);
        setPreNotifTitle('');
        setPreNotifMessage('');
      } else {
        setPreNotifError('發送失敗，請稍後再試');
      }
    } catch (_) {
      setPreNotifError('網路錯誤，請稍後再試');
    }
    setPreNotifSending(false);
  }

  async function sendNotification() {
    if (!notifMessage.trim()) return;
    setNotifSending(true);
    setNotifResult(null);
    setNotifError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/notify-event-change`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ type: notifType, message: notifMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotifResult(`已發送通知給 ${data.queued} 位報名者`);
        setNotifMessage('');
      } else {
        setNotifError('發送失敗，請稍後再試');
      }
    } catch (_) {
      setNotifError('網路錯誤，請稍後再試');
    }
    setNotifSending(false);
  }

  if (!authed) {
    return (
      <div className="app">
        <section className="registration">
          <div className="reg-header">
            <span className="reg-header-tag">Admin</span>
            <h2>後台管理</h2>
          </div>
          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入管理員密碼"
              style={{ padding: '0.7rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '驗證中（最多等待 60 秒）...' : '進入後台'}
            </button>
            {loading && <p style={{ color: '#9ca3af', fontSize: '0.78rem', textAlign: 'center' }}>伺服器首次啟動可能需要 30～60 秒，請耐心等候</p>}
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app">
      <section className="registration">
        <div className="reg-header">
          <span className="reg-header-tag">Admin</span>
          <h2>會員管理</h2>
          <button
            onClick={() => navigate('/')}
            style={{ marginBottom: '0.5rem', padding: '0.4rem 0.9rem', border: '1.5px solid #a5b4fc', borderRadius: '6px', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
          >
            ← 前往主頁編輯
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>共 <strong>{members.length}</strong> 位會員</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={openCreate} style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #a5b4fc', borderRadius: '6px', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
              + 新增會員
            </button>
            <button onClick={exportCsv} disabled={members.length === 0} style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #d1fae5', borderRadius: '6px', background: '#f0fdf4', color: '#15803d', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
              匯出 CSV
            </button>
            <button onClick={exportExcel} disabled={members.length === 0} style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #bbf7d0', borderRadius: '6px', background: '#dcfce7', color: '#166534', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
              匯出 Excel
            </button>
            <button onClick={loadMembers} style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>
              重新整理
            </button>
            {!confirmClear ? (
              <button onClick={() => setConfirmClear(true)} style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #fca5a5', borderRadius: '6px', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
                清空所有會員
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>確定清空？</span>
                <button onClick={clearAll} style={{ padding: '0.4rem 0.7rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>確定</button>
                <button onClick={() => setConfirmClear(false)} style={{ padding: '0.4rem 0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>取消</button>
              </div>
            )}
          </div>
        </div>

        {/* 新增會員 inline 表單 */}
        {showCreate && (
          <form onSubmit={submitCreate} style={{ padding: '1rem', background: '#f5f3ff', borderRadius: '10px', border: '1.5px solid #c7d2fe', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#4f46e5' }}>新增會員</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="姓名 *"
                required
                style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email *"
                required
                style={{ flex: 2, minWidth: '160px', padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                value={createForm.phone}
                onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="電話（選填）"
                style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                value={createForm.company}
                onChange={(e) => setCreateForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="公司/單位（選填）"
                style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                value={createForm.lineId}
                onChange={(e) => setCreateForm((f) => ({ ...f, lineId: e.target.value }))}
                placeholder="LINE ID（選填）"
                style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value, sendEmail: e.target.value ? false : f.sendEmail }))}
              placeholder="密碼（選填，填寫後直接啟用帳號）"
              style={{ padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.83rem', color: createForm.password ? '#9ca3af' : '#374151', cursor: createForm.password ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={createForm.sendEmail}
                disabled={!!createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, sendEmail: e.target.checked }))}
              />
              寄送設定密碼信
            </label>
            {createError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>{createError}</p>}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="submit"
                disabled={createSaving}
                style={{ padding: '0.4rem 1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {createSaving ? '建立中...' : '建立'}
              </button>
              <button
                type="button"
                onClick={cancelCreate}
                style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                取消
              </button>
            </div>
          </form>
        )}

        {members.length === 0 ? (
          <p className="empty">目前沒有會員資料</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {members.map((m) => (
              <div key={m.memberId} style={{ padding: '0.85rem 1rem', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f5' }}>
                {editingId === m.memberId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="姓名"
                        style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="Email"
                        style={{ flex: 2, minWidth: '160px', padding: '0.4rem 0.7rem', border: '1.5px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.83rem', color: '#374151' }}>
                      <input
                        type="checkbox"
                        checked={editForm.isActivated}
                        onChange={(e) => setEditForm((f) => ({ ...f, isActivated: e.target.checked }))}
                      />
                      帳號已啟用
                    </label>
                    {editError && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>{editError}</p>}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => saveEdit(m.memberId)}
                        disabled={editSaving}
                        style={{ padding: '0.35rem 0.9rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                      >
                        {editSaving ? '儲存中...' : '儲存'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ padding: '0.35rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.78rem' }}>#{m.memberNumber}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</span>
                        <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.5rem', borderRadius: '999px', background: m.isActivated ? '#dcfce7' : '#fef9c3', color: m.isActivated ? '#15803d' : '#92400e', fontWeight: 700 }}>
                          {m.isActivated ? '已啟用' : '未啟用'}
                        </span>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>{m.email}</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.72rem', margin: '0.1rem 0 0' }}>
                        {m.company && <span style={{ marginRight: '0.6rem' }}>🏢 {m.company}</span>}
                        加入：{new Date(m.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                      {m.registrations && m.registrations.length > 0 && (
                        <div style={{ marginTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {m.registrations.map((r, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', borderRadius: '4px', padding: '0.1rem 0.45rem' }}>
                              📋 {r.eventTitle ? r.eventTitle.split('\n')[0].substring(0, 20) + (r.eventTitle.length > 20 ? '…' : '') : '活動'}{r.eventDate ? ` · ${r.eventDate}` : ''} · {r.attended}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(m)}
                        style={{ padding: '0.35rem 0.7rem', border: '1.5px solid #c7d2fe', borderRadius: '6px', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => deleteMember(m.memberId, m.name)}
                        style={{ padding: '0.35rem 0.7rem', border: '1.5px solid #fca5a5', borderRadius: '6px', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 批次匯入 CSV */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f5' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#374151' }}>批次匯入 CSV</h3>
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.78rem', color: '#9ca3af' }}>CSV 第一列為標題，欄位：name（必填）、email（必填）、phone、company、lineId（選填）</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => { setCsvFile(e.target.files[0] || null); setCsvError(null); setCsvSummary(null); }}
              style={{ fontSize: '0.83rem' }}
            />
            {csvFile && (
              <button
                onClick={importCsv}
                disabled={csvImporting}
                style={{ padding: '0.4rem 0.9rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 700 }}
              >
                {csvImporting ? '匯入中...' : '開始匯入'}
              </button>
            )}
          </div>
          {csvError && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0.4rem 0 0' }}>{csvError}</p>}
          {csvSummary && <p style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 700, margin: '0.4rem 0 0' }}>{csvSummary}</p>}
        </div>

        {/* 活動通知區塊 */}
        <div style={{ marginTop: '2rem', padding: '1.2rem', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f5' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#374151' }}>發送活動通知</h3>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="radio" name="notifType" value="update" checked={notifType === 'update'} onChange={() => setNotifType('update')} />
              資訊更改
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="radio" name="notifType" value="cancel" checked={notifType === 'cancel'} onChange={() => setNotifType('cancel')} />
              取消活動
            </label>
          </div>
          <textarea
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
            placeholder="請輸入通知內容…"
            rows={3}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
          />
          {notifError && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0.3rem 0 0' }}>{notifError}</p>}
          {notifResult && <p style={{ color: '#16a34a', fontSize: '0.82rem', margin: '0.3rem 0 0' }}>{notifResult}</p>}
          <button
            onClick={sendNotification}
            disabled={notifSending || !notifMessage.trim()}
            style={{ marginTop: '0.6rem', padding: '0.5rem 1.2rem', background: notifType === 'cancel' ? '#dc2626' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, opacity: notifSending || !notifMessage.trim() ? 0.6 : 1 }}
          >
            {notifSending ? '發送中…' : '發送通知'}
          </button>
        </div>

        {/* 課前通知區塊 */}
        <div style={{ marginTop: '2rem', padding: '1.2rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#15803d' }}>課前通知</h3>
          <input
            value={preNotifTitle}
            onChange={(e) => setPreNotifTitle(e.target.value)}
            placeholder="通知標題（例如：明天課程提醒）"
            style={{ width: '100%', padding: '0.5rem 0.8rem', border: '1.5px solid #d1fae5', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.5rem', boxSizing: 'border-box' }}
          />
          <textarea
            value={preNotifMessage}
            onChange={(e) => setPreNotifMessage(e.target.value)}
            placeholder="通知內容…"
            rows={3}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #d1fae5', borderRadius: '8px', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '1rem', margin: '0.6rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preNotifChannels.email}
                onChange={(e) => setPreNotifChannels((c) => ({ ...c, email: e.target.checked }))}
              />
              Email
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preNotifChannels.line}
                onChange={(e) => setPreNotifChannels((c) => ({ ...c, line: e.target.checked }))}
              />
              LINE
            </label>
          </div>
          {preNotifError && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0.3rem 0 0' }}>{preNotifError}</p>}
          {preNotifResult && <p style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 700, margin: '0.3rem 0 0' }}>{preNotifResult}</p>}
          <button
            onClick={sendPreEventNotification}
            disabled={preNotifSending || !preNotifTitle.trim() || !preNotifMessage.trim() || (!preNotifChannels.email && !preNotifChannels.line)}
            style={{ marginTop: '0.6rem', padding: '0.5rem 1.2rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, opacity: preNotifSending || !preNotifTitle.trim() || !preNotifMessage.trim() || (!preNotifChannels.email && !preNotifChannels.line) ? 0.6 : 1 }}
          >
            {preNotifSending ? '發送中…' : '發送通知'}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', border: '1.5px solid #c7d2fe', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}
        >
          ← 回報名頁
        </button>
        <button
          onClick={() => { adminLogout(); setAuthed(false); }}
          style={{ marginTop: '0.5rem', width: '100%', padding: '0.6rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontWeight: 600 }}
        >
          登出後台
        </button>
      </section>
    </div>
  );
}

export default AdminPage;
