export function Sparkline({ points, stroke = 'var(--teal)' }: { points: number[]; stroke?: string }) {
  const data = points.slice(-12);
  const width = 100;
  const height = 36;
  if (data.length < 2) {
    return <svg className="spark" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const line = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" points={line} />
    </svg>
  );
}
