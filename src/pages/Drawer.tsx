import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pip } from '../components/Pip';
import { replayPractice, useDesk } from '../lib/state';

export function Drawer() {
  const { view } = useDesk();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  if (!view) return <main className="field field-grid" />;
  const door = view.drawer.find((item) => item.id === openId) ?? null;

  if (openId === 'how') {
    return (
      <main className="field field-grid">
        <section className="panel">
          <p className="panel-name">HOW</p>
          <p className="how-line">double-click START-DESK</p>
          <p className="how-line">look at colors</p>
          <p className="how-line">tap coral only</p>
          <button type="button" className="back-word" onClick={() => setOpenId(null)}>
            BACK
          </button>
        </section>
      </main>
    );
  }

  if (door) {
    const sleeping = door.status !== 'open';
    return (
      <main className="field field-grid">
        <section className="panel">
          <p className="panel-name">{door.name}</p>
          <p className="verdict">{lineFor(door.status)}</p>
          <div className="marks">
            <span className={`mark-word ${door.status === 'open' ? 'lit' : ''}`}>OPEN</span>
            <span className={`mark-word ${sleeping ? 'lit' : ''}`}>SLEEP</span>
          </div>
          <button type="button" className="back-word" onClick={() => setOpenId(null)}>
            BACK
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="field field-grid">
      <button type="button" className="back" aria-label="home" onClick={() => navigate({ pathname: '/', search })}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M11.5 3.5 L5.5 9 L11.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>
      {view.drawer.length === 0 ? (
        <p className="quiet">quiet</p>
      ) : (
        <div className="doors">
          {view.drawer.map((item) => (
            <button key={item.id} type="button" className="door" onClick={() => setOpenId(item.id)}>
              <DoorIcon id={item.id} />
              <span className="door-foot">
                <span className="door-name">{item.name}</span>
                <Pip tone="gray" />
              </span>
            </button>
          ))}
          <button type="button" className="door" onClick={() => setOpenId('how')}>
            <DoorIcon id="how" />
            <span className="door-foot">
              <span className="door-name">HOW</span>
              <Pip tone="gray" />
            </span>
          </button>
        </div>
      )}
      <button
        type="button"
        className="practice-link"
        onClick={() => {
          replayPractice();
          navigate({ pathname: '/', search });
        }}
      >
        PRACTICE
      </button>
    </main>
  );
}

function lineFor(status: string): string {
  if (status === 'sleeping') return 'this room is still sleeping';
  if (status === 'open') return 'this room is open';
  return 'quiet';
}

function DoorIcon({ id }: { id: string }) {
  const pen = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {id === 'world' && (
        <>
          <circle cx="12" cy="12" r="8" {...pen} />
          <path d="M12 4 v16 M4.5 12 h15 M7 8.2 h10 M7 15.8 h10" {...pen} />
        </>
      )}
      {id === 'foundry' && <path d="M4 16 h16 l-2 4 H6 Z M6 16 V10 h4 l2-4 2 4 h4 v6" {...pen} />}
      {id === 'voice' && <path d="M5 12 h2 l2-5 3 10 2-5 h5" {...pen} />}
      {id === 'xcard' && <rect x="4" y="6" width="16" height="12" rx="2" {...pen} />}
      {id === 'physics' && (
        <>
          <circle cx="12" cy="12" r="2" {...pen} />
          <ellipse cx="12" cy="12" rx="9" ry="4" {...pen} />
          <ellipse cx="12" cy="12" rx="4" ry="9" {...pen} />
        </>
      )}
      {id === 'film' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="1.5" {...pen} />
          <path d="M8 5 v14 M16 5 v14" {...pen} />
        </>
      )}
      {id === 'economy' && <path d="M5 17 V11 M10 17 V7 M15 17 V13 M20 17 V9" {...pen} />}
      {id === 'how' && <path d="M5 8 h14 M5 12 h10 M5 16 h12" {...pen} />}
    </svg>
  );
}
