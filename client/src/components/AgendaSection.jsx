import { useEffect, useState } from 'react';
import { useEventId } from '../hooks/useEventId';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function AgendaCard({ item, index }) {
  return (
    <div className="agenda-card" style={{ '--i': index }}>
      <div className="agenda-card-inner">
        <div className="agenda-index">{String(index + 1).padStart(2, '0')}</div>
        <div className="agenda-card-content">
          <div className="agenda-card-time">{item.time}</div>
          <p className="agenda-topic">{item.topic}</p>
          {item.speaker && <p className="agenda-speaker">講師 {item.speaker}</p>}
          {item.description && <p className="agenda-desc">{item.description}</p>}
        </div>
      </div>
    </div>
  );
}

function AgendaSection() {
  const eventId = useEventId();
  const [agenda, setAgenda] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/agenda?eventId=${eventId}`).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch(`${API_BASE}/api/event?eventId=${eventId}`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([agendaData, info]) => {
        setAgenda(agendaData);
        setEventInfo(info);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <section className="agenda"><p>載入中...</p></section>;
  if (error) return <section className="agenda"><p className="error">無法載入議程：{error}</p></section>;

  const tagEn = eventInfo?.agendaTagEn || 'Schedule';
  const tagZh = eventInfo?.agendaTagZh || '活動議程';

  // Group by session label; preserve insertion order of session names.
  // Items with no session value inherit the previous row's session.
  // Only fall back to '全天' if no prior session has been seen at all.
  const sessionOrder = [];
  const sessionMap = {};
  let lastSession = null;
  agenda.forEach((item) => {
    const raw = (item.session || '').trim();
    const key = raw !== '' ? raw : (lastSession || '全天');
    if (raw !== '') lastSession = raw;
    if (!sessionMap[key]) {
      sessionMap[key] = [];
      sessionOrder.push(key);
    }
    sessionMap[key].push(item);
  });

  const SESSION_STYLE = {
    '上午場': { cls: 'morning',   icon: '☀️' },
    '早上':   { cls: 'morning',   icon: '☀️' },
    '下午場': { cls: 'afternoon', icon: '🌆' },
    '下午':   { cls: 'afternoon', icon: '🌆' },
    '晚上場': { cls: 'evening',   icon: '🌙' },
    '晚上':   { cls: 'evening',   icon: '🌙' },
    '全天':   { cls: 'fullday',   icon: '📅' },
  };
  // Day1/Day2/... pattern (case-insensitive)
  const DAY_STYLES = ['day1', 'day2', 'day3', 'day4', 'morning', 'afternoon', 'evening'];
  const DAY_ICONS  = ['📗', '📘', '📙', '📕', '☀️', '🌆', '🌙'];

  function getSessionStyle(name, idx) {
    if (SESSION_STYLE[name]) return SESSION_STYLE[name];
    // Match Day1 / Day 1 / 第一天 / day1 etc.
    const dayMatch = name.match(/(\d+)/);
    if (dayMatch) {
      const n = (parseInt(dayMatch[1], 10) - 1) % DAY_STYLES.length;
      return { cls: DAY_STYLES[n], icon: DAY_ICONS[n] };
    }
    // Fallback: cycle by insertion order
    const n = idx % DAY_STYLES.length;
    return { cls: DAY_STYLES[n], icon: DAY_ICONS[n] };
  }

  return (
    <section className="agenda">
      <div className="agenda-header">
        <span className="agenda-header-tag">{tagEn}</span>
        <h2>{tagZh}</h2>
      </div>
      {agenda.length === 0 ? (
        <p className="empty">尚無議程資訊</p>
      ) : sessionOrder.length === 1 ? (
        // Single session — show as a single column without session label
        <div className="agenda-list" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {sessionMap[sessionOrder[0]].map((item, i) => (
            <AgendaCard key={i} item={item} index={i} />
          ))}
        </div>
      ) : (() => {
        const colCount = Math.min(sessionOrder.length, 3);
        const maxRows = Math.max(...sessionOrder.map((s) => sessionMap[s].length));
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            gap: '0.6rem 1.25rem',
            alignItems: 'stretch',
          }}>
            {/* Column headers */}
            {sessionOrder.slice(0, colCount).map((sessionName, colIdx) => {
              const { cls, icon } = getSessionStyle(sessionName, colIdx);
              return (
                <div key={`hdr-${sessionName}`} className={`agenda-col-label ${cls}`}>
                  <span className="col-icon">{icon}</span>
                  <span>{sessionName}</span>
                </div>
              );
            })}
            {/* Cards row-by-row so same-row cards share height */}
            {Array.from({ length: maxRows }).flatMap((_, rowIdx) =>
              sessionOrder.slice(0, colCount).map((sessionName, colIdx) => {
                const items = sessionMap[sessionName];
                const item = items[rowIdx];
                if (!item) return <div key={`empty-${colIdx}-${rowIdx}`} />;
                const globalIdx = agenda.indexOf(item);
                return <AgendaCard key={`${colIdx}-${rowIdx}`} item={item} index={globalIdx} />;
              })
            )}
          </div>
        );
      })()}
    </section>
  );
}

export default AgendaSection;
