import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkline } from '../components/Sparkline';
import { eightWords, setLabStamp, useDesk } from '../lib/state';

export function Lab() {
  const { view } = useDesk();
  const navigate = useNavigate();
  const { search } = useLocation();
  if (!view) return <main className="field field-grid" />;
  const { hypothesis, stamp, plot } = view.lab;
  const tone = stamp === 'kill' ? 'coral' : stamp === 'none' ? 'gold' : 'emerald';
  const level = levelOf(plot);

  return (
    <main className="field field-grid">
      <button type="button" className="back" aria-label="home" onClick={() => navigate({ pathname: '/', search })}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M11.5 3.5 L5.5 9 L11.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>
      <section className="room">
        <div className={`vial-card tone-${tone}`}>
          <div className="tube" aria-hidden="true">
            <span className="liquid" style={{ height: `${level}%` }} />
            <Sparkline points={plot} />
          </div>
          {stamp === 'live' && <Stamp kind="live" />}
          {stamp === 'kill' && <Stamp kind="kill" />}
        </div>
        <p className="verdict">{eightWords(hypothesis)}</p>
        {stamp === 'none' && (
          <div className="choices">
            <button type="button" className="choice keep" onClick={() => setLabStamp('live')}>
              LIVE
            </button>
            <button type="button" className="choice kill" onClick={() => setLabStamp('kill')}>
              KILL
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Stamp({ kind }: { kind: 'live' | 'kill' }) {
  return (
    <div className={`stamp ${kind === 'live' ? 'mark-live' : 'mark-kill'}`}>
      {kind === 'live' ? (
        <svg className="mark-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ) : (
        <svg className="mark-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7 L17 17 M17 7 L7 17" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
      <span>{kind === 'live' ? 'LIVE' : 'KILL'}</span>
    </div>
  );
}

function levelOf(plot: number[]): number {
  if (plot.length === 0) return 18;
  const max = Math.max(...plot, 0.001);
  const last = plot[plot.length - 1] ?? 0;
  return Math.max(12, Math.min(86, (last / max) * 78));
}
