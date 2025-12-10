import { pianoNotes } from '@/hooks/useAudio';

interface NoteDisplayProps {
  notes: string[];
  maxNotes?: number;
}

// Vertical position for each note (pixels from top of 80px container)
const notePositions: Record<string, number> = {
  'C5': 4,
  'B4': 14,
  'A4': 24,
  'G4': 34,
  'F4': 44,
  'E4': 54,
  'D4': 70,
  'C4': 80,
};

const MAX_VISIBLE = 16;

export function NoteDisplay({ notes }: NoteDisplayProps) {
  // Only show the last MAX_VISIBLE notes
  const displayNotes = notes.slice(-MAX_VISIBLE);
  
  const getColorForNote = (note: string) => {
    const noteInfo = pianoNotes.find(n => n.note === note);
    return noteInfo?.color || 'primary';
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-xl">
      <div className="mb-2 text-center font-fredoka text-base text-muted-foreground">
        🎵 Din melodi ({notes.length} noter)
      </div>
      
      <div className="relative h-24 bg-muted/20 rounded-xl overflow-hidden">
        {/* Staff lines - 5 lines */}
        {[20, 35, 50, 65, 80].map((pos) => (
          <div
            key={pos}
            className="absolute left-0 right-0 h-px bg-muted-foreground/20"
            style={{ top: `${pos}%` }}
          />
        ))}
        
        {displayNotes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Tryck på tangenterna för att spela! 🎹
          </div>
        ) : (
          <div className="absolute inset-0 flex px-2">
            {displayNotes.map((note, index) => {
              const topPos = notePositions[note] ?? 44;
              const globalIndex = notes.length - MAX_VISIBLE + index;
              
              return (
                <div key={index} className="flex-1 relative">
                  <div
                    className="absolute left-1/2 -translate-x-1/2 animate-bounce-in"
                    style={{ top: `${topPos}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div
                      className="h-6 w-6 rounded-full shadow-md flex items-center justify-center border border-white/30"
                      style={{ 
                        backgroundColor: `hsl(var(--${getColorForNote(note)}))`,
                      }}
                    >
                      <span className="text-[9px] font-bold text-white">
                        {globalIndex + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
