import { clip, type StageNode } from '../lib/radar';

export function Inspector({ node }: { node: StageNode | null }) {
  if (!node) return null;
  const fourthLabel = node.waitReason ? 'wait' : 'artifact';
  const fourth = node.waitReason ? clip(node.waitReason) : node.artifactUrl ? clip(node.artifactUrl) : 'none';
  return (
    <dl className="inspector">
      <div>
        <dt>status</dt>
        <dd className={node.status === 'blocked' ? 'coral' : undefined}>{node.status}</dd>
      </div>
      <div>
        <dt>step</dt>
        <dd>{clip(node.step)}</dd>
      </div>
      <div>
        <dt>intent</dt>
        <dd>{node.intent.trim() ? clip(node.intent) : '—'}</dd>
      </div>
      <div>
        <dt>{fourthLabel}</dt>
        <dd className={node.waitReason ? 'coral' : undefined}>{fourth}</dd>
      </div>
    </dl>
  );
}
