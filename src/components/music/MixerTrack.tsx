import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface MixerTrackProps {
  name: string;
  emoji: string;
  color: string;
  loops: { id: string; name: string }[];
  selectedLoop: string | null;
  onSelectLoop: (loopId: string | null) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
}

export function MixerTrack({ 
  name, 
  emoji, 
  color, 
  loops, 
  selectedLoop, 
  onSelectLoop,
  volume,
  onVolumeChange,
  muted,
  onMutedChange,
}: MixerTrackProps) {
  return (
    <div 
      className="rounded-2xl p-4 shadow-lg transition-all"
      style={{ backgroundColor: `hsl(var(--${color}) / 0.2)` }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="font-fredoka font-bold" style={{ color: `hsl(var(--${color}))` }}>
            {name}
          </span>
        </div>
        
        {/* Volume control */}
        <div className="flex flex-1 items-center gap-2 max-w-[180px]">
          <button
            onClick={() => onMutedChange(!muted)}
            className="rounded-full p-2 transition-colors hover:bg-white/20"
          >
            {muted ? (
              <VolumeX size={20} className="text-muted-foreground" />
            ) : (
              <Volume2 size={20} style={{ color: `hsl(var(--${color}))` }} />
            )}
          </button>
          <Slider
            value={[muted ? 0 : volume]}
            onValueChange={(v) => {
              if (muted && v[0] > 0) onMutedChange(false);
              onVolumeChange(v[0]);
            }}
            min={0}
            max={100}
            step={5}
            className="flex-1"
            style={{ 
              '--slider-color': `hsl(var(--${color}))` 
            } as React.CSSProperties}
          />
        </div>
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
