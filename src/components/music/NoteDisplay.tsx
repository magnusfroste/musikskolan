import { pianoNotes } from '@/hooks/useAudio';

interface NoteDisplayProps {
  notes: string[];
  maxNotes?: number;
}

const noteNames: Record<string, string> = {
  'C4': 'Do',
  'D4': 'Re',
  'E4': 'Mi',
  'F4': 'Fa',
  'G4': 'Sol',
  'A4': 'La',
  'B4': 'Si',
  'C5': 'Do',
};

// Vertical position for each note (pixels from top of 80px container)
const notePositions: Record<string, number> = {
  'C5': 4,
  'B4': 14,
  'A4': 24,
  'G4': 34,
  'F4': 44,
  'E4': 54,
  'D4': 64,
  'C4': 74,
};

const NOTES_PER_ROW = 10;

export function NoteDisplay({ notes, maxNotes = 40 }: NoteDisplayProps) {
  const displayNotes = notes.slice(-maxNotes);
  
  const getColorForNote = (note: string) => {
    const noteInfo = pianoNotes.find(n => n.note === note);
    return noteInfo?.color || 'primary';
  };

  // Split notes into rows
  const rows: string[][] = [];
  for (let i = 0; i < displayNotes.length; i += NOTES_PER_ROW) {
    rows.push(displayNotes.slice(i, i + NOTES_PER_ROW));
  }

  return (
    <div className="rounded-2xl bg-card p-4 shadow-xl">
      <div className="mb-2 text-center font-fredoka text-base text-muted-foreground">
        🎵 Din melodi ({displayNotes.length} noter)
      </div>
      
      <div className="space-y-3 bg-muted/20 rounded-xl p-3">
        {rows.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Tryck på tangenterna för att spela! 🎹
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative h-20 bg-card/50 rounded-lg overflow-hidden">
              {/* Staff lines */}
              {[16, 28, 40, 52, 64].map((pos) => (
                <div
                  key={pos}
                  className="absolute left-0 right-0 h-px bg-muted-foreground/25"
                  style={{ top: `${pos}px` }}
                />
              ))}
              
              {/* Notes container */}
              <div className="absolute inset-0 flex">
                {row.map((note, index) => {
                  const topPos = notePositions[note] ?? 40;
                  const globalIndex = rowIndex * NOTES_PER_ROW + index;
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 relative"
                    >
                      <div
                        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce-in"
                        style={{ top: `${topPos}px` }}
                      >
                        <div
                          className="h-5 w-5 rounded-full shadow-md flex items-center justify-center border border-white/40"
                          style={{ 
                            backgroundColor: `hsl(var(--${getColorForNote(note)}))`,
                          }}
                        >
                          <span className="text-[8px] font-bold text-white">
                            {globalIndex + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
