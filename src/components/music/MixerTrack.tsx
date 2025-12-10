import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

interface MixerTrackProps {
  name: string;
  emoji: string;
  color: string;
  loops: { id: string; name: string }[];
  selectedLoop: string | null;
  onSelectLoop: (loopId: string | null) => void;
}

export function MixerTrack({ name, emoji, color, loops, selectedLoop, onSelectLoop }: MixerTrackProps) {
  const [muted, setMuted] = useState(false);

  return (
    <div 
      className="rounded-2xl p-4 shadow-lg transition-all"
      style={{ backgroundColor: `hsl(var(--${color}) / 0.2)` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="font-fredoka font-bold" style={{ color: `hsl(var(--${color}))` }}>
            {name}
          </span>
        </div>
        <button
          onClick={() => setMuted(!muted)}
          className="rounded-full p-2 transition-colors hover:bg-white/20"
        >
          {muted ? (
            <VolumeX size={20} className="text-muted-foreground" />
          ) : (
            <Volume2 size={20} style={{ color: `hsl(var(--${color}))` }} />
          )}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {loops.map((loop) => (
          <button
            key={loop.id}
            onClick={() => onSelectLoop(selectedLoop === loop.id ? null : loop.id)}
            className={`
              rounded-xl px-3 py-2 text-sm font-semibold transition-all
              ${selectedLoop === loop.id 
                ? 'scale-105 text-white shadow-lg' 
                : 'bg-white/50 text-foreground hover:bg-white/80'
              }
            `}
            style={selectedLoop === loop.id ? { 
              backgroundColor: `hsl(var(--${color}))`,
              boxShadow: `0 4px 15px hsl(var(--${color}) / 0.5)`,
            } : {}}
          >
            {loop.name}
          </button>
        ))}
      </div>
    </div>
  );
}
