import type { Stage, StageNode } from '../lib/radar';

export function RadarMap({
  stage,
  selectedId,
  onSelect,
}: {
  stage: Stage;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="radar-map" data-nodes={stage.nodes.length} data-overflow={stage.overflow}>
      <svg className="rings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="50" cy="50" r="16" />
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="44" />
        <line className="cross" x1="50" y1="8" x2="50" y2="92" />
        <line className="cross" x1="8" y1="50" x2="92" y2="50" />
        {stage.bridge && (
          <line
            className="gold-bridge"
            data-bridge="1"
            x1={stage.bridge.x1}
            y1={stage.bridge.y1}
            x2={stage.bridge.x2}
            y2={stage.bridge.y2}
          />
        )}
      </svg>
      {stage.nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          className={`node st-${node.status} ${node.child ? 'child' : ''} ${node.status === 'step' ? 'breath' : ''} ${node.id === selectedId ? 'on' : ''}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          data-node={node.id}
          data-status={node.status}
          onClick={() => onSelect(node.id)}
        >
          <span className="node-label">{node.label}</span>
          {node.bots.length > 1 && <span className="node-bots">{node.bots.map((bot) => bot.name).join(' · ')}</span>}
        </button>
      ))}
      {stage.nodes.length === 0 && <p className="quiet">quiet</p>}
      {stage.overflow > 0 && <span className="overflow">+{stage.overflow}</span>}
    </div>
  );
}

export function RadarGlyph({ stage }: { stage: Stage }) {
  return (
    <svg className="glyph" viewBox="0 0 100 100" aria-hidden="true">
      <circle className="glyph-ring" cx="50" cy="50" r="34" />
      <circle className="glyph-ring" cx="50" cy="50" r="18" />
      {stage.bridge && (
        <line className="gold-bridge" x1={stage.bridge.x1} y1={stage.bridge.y1} x2={stage.bridge.x2} y2={stage.bridge.y2} />
      )}
      {stage.nodes.map((node) => (
        <circle key={node.id} className={`dot ${dotClass(node)}`} cx={node.x} cy={node.y} r={node.child ? 2.2 : 3.2} />
      ))}
    </svg>
  );
}

function dotClass(node: StageNode): string {
  if (node.status === 'blocked') return 'tone-coral';
  if (node.status === 'collab') return 'tone-gold';
  if (node.status === 'step' || node.status === 'accepted') return 'tone-emerald';
  return 'tone-gray';
}
