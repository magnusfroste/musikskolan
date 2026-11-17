const LETTERS = 'CDEFGAB';
const stepOf = (note: string) => LETTERS.indexOf(note[0]) + 7 * Number(note.slice(-1));
const E4 = stepOf('E4');

export function Staff({ note, color = 'primary' }: { note: string; color?: string }) {
  const y = 60 - (stepOf(note) - E4) * 5;
  const ledger = [] as number[];
  for (let ly = 70; ly <= y; ly += 10) ledger.push(ly);
  for (let ly = 10; ly >= y; ly -= 10) ledger.push(ly);
  const stemUp = y > 40;
  return (
    <svg viewBox="0 0 200 85" className="mx-auto w-full max-w-sm" role="img" aria-label={`Not ${note}`}>
      {[20, 30, 40, 50, 60].map(l => <line key={l} x1="10" x2="190" y1={l} y2={l} stroke="hsl(var(--foreground))" strokeWidth="1.2" />)}
      <text x="14" y="62" fontSize="52" fill="hsl(var(--foreground))">𝄞</text>
      {ledger.map(l => <line key={l} x1="102" x2="138" y1={l} y2={l} stroke="hsl(var(--foreground))" strokeWidth="1.2" />)}
      <ellipse cx="120" cy={y} rx="7" ry="5" transform={`rotate(-20 120 ${y})`} fill={`hsl(var(--${color}))`} stroke="hsl(var(--foreground))" />
      <line x1={stemUp ? 126.5 : 113.5} x2={stemUp ? 126.5 : 113.5} y1={y} y2={stemUp ? y - 30 : y + 30} stroke="hsl(var(--foreground))" strokeWidth="1.5" />
    </svg>
  );
}
