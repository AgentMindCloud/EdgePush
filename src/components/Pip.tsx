type Tone = 'coral' | 'gold' | 'emerald' | 'gray';

export function Pip({
  tone,
  breath = false,
  fat = false,
  dim = false,
}: {
  tone: Tone;
  breath?: boolean;
  fat?: boolean;
  dim?: boolean;
}) {
  const live = breath && tone === 'emerald' && !dim;
  return <span className={`pip tone-${tone} ${fat ? 'fat' : ''} ${dim ? 'dim' : ''} ${live ? 'breath' : ''}`} />;
}
