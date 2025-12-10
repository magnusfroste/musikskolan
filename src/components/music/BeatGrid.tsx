interface BeatGridProps {
  grid: boolean[][];
  onToggle: (row: number, col: number) => void;
  currentStep?: number;
  isPlaying?: boolean;
}

const rowColors = [
  'drum-red',
  'orange-accent',
  'bass-yellow',
  'melody-green',
  'cyan-accent',
  'effects-blue',
  'primary',
  'pink-accent',
];

const rowLabels = ['🥁', '👏', '🎩', '✋', '🔴', '🟡', '💥', '🔔'];

export function BeatGrid({ grid, onToggle, currentStep = -1, isPlaying = false }: BeatGridProps) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-xl">
      <div className="grid gap-1">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-1">
            <span className="w-8 text-center text-lg">{rowLabels[rowIndex]}</span>
            {row.map((active, colIndex) => (
              <button
                key={colIndex}
                onClick={() => onToggle(rowIndex, colIndex)}
                className={`
                  h-10 w-10 rounded-lg transition-all duration-100
                  ${colIndex % 4 === 0 ? 'border-l-2 border-l-muted' : ''}
                  ${currentStep === colIndex && isPlaying ? 'ring-2 ring-white ring-offset-2 ring-offset-card' : ''}
                `}
                style={{
                  backgroundColor: active 
                    ? `hsl(var(--${rowColors[rowIndex]}))` 
                    : 'hsl(var(--muted))',
                  boxShadow: active 
                    ? `0 4px 12px hsl(var(--${rowColors[rowIndex]}) / 0.5)` 
                    : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
