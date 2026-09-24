import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Inspector } from '../components/Inspector';
import { RadarMap } from '../components/RadarMap';
import { deriveStage } from '../lib/radar';
import { useDesk } from '../lib/state';

export function Radar() {
  const { view } = useDesk();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const stage = useMemo(() => (view ? deriveStage(view.events, view.radar.roster) : null), [view]);
  if (!view || !stage) return <main className="field field-rings" />;
  const current =
    stage.nodes.find((node) => node.id === selected) ??
    stage.nodes.find((node) => node.status === 'blocked') ??
    stage.nodes[0] ??
    null;

  return (
    <main className="field field-rings">
      <button type="button" className="back" aria-label="home" onClick={() => navigate({ pathname: '/', search })}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M11.5 3.5 L5.5 9 L11.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>
      <div className="radar-layout">
        <RadarMap stage={stage} selectedId={current?.id ?? null} onSelect={setSelected} />
        <Inspector node={current} />
      </div>
    </main>
  );
}
