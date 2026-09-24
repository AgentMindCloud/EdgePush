import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pip } from '../components/Pip';
import { RadarGlyph } from '../components/RadarMap';
import { Sparkline } from '../components/Sparkline';
import { Tile } from '../components/Tile';
import { deriveStage, radarAccent } from '../lib/radar';
import { isDegraded, labTone, useDesk, warTone } from '../lib/state';

export function Home() {
  const { view } = useDesk();
  const { search } = useLocation();
  const tz = view?.clock_tz ?? 'Asia/Ho_Chi_Minh';
  const clock = useClock(tz);
  const stage = useMemo(() => (view ? deriveStage(view.events, view.radar.roster) : null), [view]);
  const degraded = view ? isDegraded(view) : false;

  return (
    <main className="field field-grid">
      <header className="topbar">
        <span className="brand">DESK</span>
        <time className="clock">{clock}</time>
        <span className="live">
          <Pip tone="emerald" breath />
          LIVE
        </span>
      </header>
      {view && stage && (
        <div className="tiles">
          <Tile to={`/war${search}`} label="WAR" accent={degraded ? 'gray' : warTone(view.war.pip)} dim={degraded}>
            {degraded ? <span className="quiet">quiet</span> : (
              <>
                <Sparkline points={view.war.sparkline} />
                <span className="micro-pips">
                  <Pip tone="coral" dim={view.war.pip !== 'red'} />
                  <Pip tone="gold" dim={view.war.pip !== 'amber'} />
                  <Pip tone="emerald" dim={view.war.pip !== 'green'} />
                </span>
              </>
            )}
          </Tile>
          <Tile to={`/lab${search}`} label="LAB" accent={degraded ? 'gray' : labTone(view.lab.stamp)} dim={degraded}>
            {degraded ? <span className="quiet">quiet</span> : <VialMark stamp={view.lab.stamp} />}
          </Tile>
          <Tile to={`/radar${search}`} label="RADAR" accent={degraded ? 'gray' : radarAccent(view.events)} dim={degraded}>
            {degraded || stage.nodes.length === 0 ? <span className="quiet">quiet</span> : <RadarGlyph stage={stage} />}
          </Tile>
        </div>
      )}
      {view && (
        <Link className="drawer-link" to={`/drawer${search}`}>
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
            <path d="M1 1.5 L9 8.5 L17 1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          DRAWER
        </Link>
      )}
    </main>
  );
}

function VialMark({ stamp }: { stamp: 'live' | 'kill' | 'none' }) {
  return (
    <span className="mark-wrap">
      <svg className="vial-icon" viewBox="0 0 36 64" aria-hidden="true">
        <rect x="14" y="2" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M15 10 L10 22 V48 a8 8 0 0 0 16 0 V22 L21 10" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11.2 38 h13.6 V48 a6.8 6.8 0 0 1 -13.6 0 Z" fill="currentColor" />
      </svg>
      {stamp === 'live' && (
        <svg className="mark-icon mark-live" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
      {stamp === 'kill' && (
        <svg className="mark-icon mark-kill" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7 L17 17 M17 7 L7 17" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
    </span>
  );
}

function useClock(timeZone: string): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return formatClock(now, timeZone);
}

function formatClock(date: Date, timeZone: string): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  try {
    return new Intl.DateTimeFormat('en-GB', { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(date);
  }
}
