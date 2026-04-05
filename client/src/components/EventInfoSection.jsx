import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';
import { useEventId } from '../hooks/useEventId';
import { useAdmin } from '../AdminContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function ImageUploadPersist({ label, currentUrl, onUploaded }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
      {currentUrl && (
        <img
          src={currentUrl}
          alt="預覽"
          style={{ width: '80px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #e5e7eb' }}
        />
      )}
      <ImageUpload label={label} onUploaded={onUploaded} />
    </div>
  );
}

function extractYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId = null;
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1);
    } else if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
      videoId = u.searchParams.get('v');
    }
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

function YouTubeListEditor({ videos, onSave }) {
  const [list, setList] = useState(videos || []);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  async function persist(nextList) {
    setSaving(true);
    await onSave(nextList);
    setSaving(false);
  }

  function move(index, dir) {
    const next = [...list];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setList(next);
    persist(next);
  }

  function remove(index) {
    const next = list.filter((_, i) => i !== index);
    setList(next);
    persist(next);
  }

  function add() {
    const url = newUrl.trim();
    if (!url || list.length >= 10) return;
    const next = [...list, { url, title: newTitle.trim() }];
    setList(next);
    setNewUrl('');
    setNewTitle('');
    persist(next);
  }

  const atLimit = list.length >= 10;

  return (
    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f5f3ff', borderRadius: '10px' }}>
      <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 600 }}>
        YouTube 影片清單（最多 10 支）
      </div>
      {list.length === 0 && (
        <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.5rem' }}>尚未新增任何影片</div>
      )}
      {list.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: '120px', fontSize: '0.8rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title ? <strong>{item.title}</strong> : <em style={{ color: '#9ca3af' }}>無標題</em>}
            <span style={{ color: '#9ca3af', marginLeft: '0.3rem' }}>{item.url}</span>
          </span>
          <button onClick={() => move(i, -1)} disabled={i === 0 || saving} style={btnStyle}>↑</button>
          <button onClick={() => move(i, 1)} disabled={i === list.length - 1 || saving} style={btnStyle}>↓</button>
          <button onClick={() => remove(i)} disabled={saving} style={{ ...btnStyle, color: '#ef4444' }}>🗑</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem', alignItems: 'center' }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="標題（選填）"
          disabled={atLimit}
          style={{ width: '120px', padding: '0.4rem 0.6rem', border: '1.5px solid #c4b5fd', borderRadius: '6px', fontSize: '0.82rem' }}
        />
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="YouTube 網址"
          disabled={atLimit}
          style={{ flex: 1, minWidth: '160px', padding: '0.4rem 0.6rem', border: '1.5px solid #c4b5fd', borderRadius: '6px', fontSize: '0.82rem' }}
        />
        <button
          onClick={add}
          disabled={atLimit || saving || !newUrl.trim()}
          style={{ padding: '0.4rem 0.9rem', background: atLimit ? '#e5e7eb' : '#6366f1', color: atLimit ? '#9ca3af' : '#fff', border: 'none', borderRadius: '6px', cursor: atLimit ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
        >
          新增
        </button>
        {atLimit && <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>已達上限 10 支</span>}
      </div>
    </div>
  );
}

const btnStyle = { padding: '0.2rem 0.45rem', background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#6366f1' };

function AgendaLabelEditor({ tagEn, tagZh, onSave }) {
  const [open, setOpen] = useState(false);
  const [en, setEn] = useState(tagEn);
  const [zh, setZh] = useState(tagZh);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(en, zh);
    setSaving(false);
    setOpen(false);
  }

  return (
    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f5f3ff', borderRadius: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
          議程標題：<strong style={{ color: '#4f46e5' }}>{tagEn}</strong> ／ <strong style={{ color: '#4f46e5' }}>{tagZh}</strong>
        </span>
        <button
          onClick={() => { setEn(tagEn); setZh(tagZh); setOpen((v) => !v); }}
          style={{ fontSize: '0.78rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '6px' }}
        >
          {open ? '取消' : '✏️ 修改'}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={en}
            onChange={(e) => setEn(e.target.value)}
            placeholder="英文標籤（如 Schedule）"
            style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.6rem', border: '1.5px solid #c4b5fd', borderRadius: '6px', fontSize: '0.85rem' }}
          />
          <input
            value={zh}
            onChange={(e) => setZh(e.target.value)}
            placeholder="中文標題（如 活動議程）"
            style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.6rem', border: '1.5px solid #c4b5fd', borderRadius: '6px', fontSize: '0.85rem' }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '0.4rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
        </div>
      )}
    </div>
  );
}

function EventInfoSection() {
  const eventId = useEventId();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    fetch(`${API_BASE}/api/event?eventId=${eventId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setEvent(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <section className="event-info"><div className="event-info-body"><p>載入中...</p></div></section>;
  if (error) return <section className="event-info"><div className="event-info-body"><p className="error">無法載入活動資訊：{error}</p></div></section>;

  return (
    <>
      <section className="event-info">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="event-hero" />
        )}
        <div className="event-info-body">
          <h1>{event.title}</h1>
          <div className="event-meta">
            {event.date && <span>📅 {event.date}</span>}
            {event.location && <span>📍 {event.location}</span>}
          </div>
          {event.description && (
            <p className="event-description">{event.description}</p>
          )}
          {isAdmin && (
            <div className="upload-row">
              <ImageUploadPersist
                label={event.imageUrl ? '更新主視覺圖片' : '上傳主視覺圖片'}
                currentUrl={event.imageUrl}
                onUploaded={async (url) => {
                  setEvent((p) => ({ ...p, imageUrl: url }));
                  await fetch(`${API_BASE}/api/event?eventId=${eventId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: url }),
                  });
                }}
              />
              <ImageUploadPersist
                label={event.dmUrl ? '更新課程 DM' : '上傳課程 DM'}
                currentUrl={event.dmUrl}
                onUploaded={async (url) => {
                  setEvent((p) => ({ ...p, dmUrl: url }));
                  await fetch(`${API_BASE}/api/event?eventId=${eventId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dmUrl: url }),
                  });
                }}
              />
            </div>
          )}

          {isAdmin && (
            <AgendaLabelEditor
              tagEn={event.agendaTagEn || 'Schedule'}
              tagZh={event.agendaTagZh || '活動議程'}
              onSave={async (agendaTagEn, agendaTagZh) => {
                setEvent((p) => ({ ...p, agendaTagEn, agendaTagZh }));
                await fetch(`${API_BASE}/api/event?eventId=${eventId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ agendaTagEn, agendaTagZh }),
                });
              }}
            />
          )}
        </div>
      </section>

      {event.dmUrl && (
        <section className="dm-section">
          <h2 className="dm-title">課程 DM</h2>
          <img src={event.dmUrl} alt="課程 DM" className="dm-image" />
        </section>
      )}

      {isAdmin && (
        <section className="dm-section">
          <YouTubeListEditor
            videos={event.youtubeVideos || []}
            onSave={async (youtubeVideos) => {
              setEvent((p) => ({ ...p, youtubeVideos }));
              await fetch(`${API_BASE}/api/event?eventId=${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ youtubeVideos }),
              });
            }}
          />
        </section>
      )}

      {(event.youtubeVideos || []).map((item, i) => {
        const embedUrl = extractYouTubeEmbedUrl(item.url);
        if (!embedUrl) return null;
        return (
          <section key={i} className="dm-section">
            {item.title && <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: '#374151' }}>{item.title}</h3>}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src={embedUrl}
                title={item.title || `YouTube 影片 ${i + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}

export default EventInfoSection;
