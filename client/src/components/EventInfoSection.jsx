import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';
import { useEventId } from '../hooks/useEventId';

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
        </div>
      </section>

      {event.dmUrl && (
        <section className="dm-section">
          <h2 className="dm-title">課程 DM</h2>
          <img src={event.dmUrl} alt="課程 DM" className="dm-image" />
        </section>
      )}
    </>
  );
}

export default EventInfoSection;
