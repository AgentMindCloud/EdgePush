import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pip } from '../components/Pip';
import { Sparkline } from '../components/Sparkline';
import { setWarPip } from '../lib/ingest';
import { eightWords, finishPractice, setWarVerdict, useDesk } from '../lib/state';

const PIPS = [
  ['red', 'coral', 'RED'],
  ['amber', 'gold', 'AMBER'],
  ['green', 'emerald', 'GREEN'],
] as const;

export function War() {
  const { view, practice } = useDesk();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [sheet, setSheet] = useState(false);
  if (!view) return <main className="field field-grid" />;

  function choose(action: 'keep' | 'kill') {
    if (practice === 'coral') {
      finishPractice();
      setSheet(false);
      navigate({ pathname: '/', search });
      return;
    }
    if (action === 'keep') {
      setWarPip('green');
      setWarVerdict('kept the open claims');
    } else {
      setWarPip('amber');
      setWarVerdict('killed the open claims');
    }
    setSheet(false);
  }

  return (
    <main className="field field-grid">
      <button type="button" className="back" aria-label="home" onClick={() => navigate({ pathname: '/', search })}>
        <BackIcon />
      </button>
      <section className="room">
        <div className="war-spark">
          <Sparkline points={view.war.sparkline} />
        </div>
        <p className="verdict">{eightWords(view.war.verdict)}</p>
        <div className="fat-row">
          {PIPS.map(([pip, tone, label]) => (
            <div key={pip} className={`fat-pip ${view.war.pip === pip ? 'lit' : ''}`}>
              <Pip tone={tone} fat dim={view.war.pip !== pip} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        {view.war.pip === 'red' && (
          <button type="button" className="decide" onClick={() => setSheet(true)}>
            DECIDE
          </button>
        )}
      </section>
      {sheet && (
        <div className="sheet-backdrop" onClick={() => setSheet(false)}>
          <div className="sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="DECIDE">
            <button type="button" className="choice keep" onClick={() => choose('keep')}>
              KEEP
            </button>
            <button type="button" className="choice kill" onClick={() => choose('kill')}>
              KILL
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M11.5 3.5 L5.5 9 L11.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
