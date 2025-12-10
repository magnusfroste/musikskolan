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

// Vertical position for each note (percentage from top)
const notePositions: Record<string, number> = {
  'C5': 10,
  'B4': 20,
  'A4': 30,
  'G4': 40,
  'F4': 50,
  'E4': 60,
  'D4': 70,
  'C4': 80,
};

const NOTES_PER_ROW = 12;

export function NoteDisplay({ notes, maxNotes = 48 }: NoteDisplayProps) {
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
      
      <div className="space-y-2 bg-muted/20 rounded-xl p-3">
        {rows.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            Tryck på tangenterna för att spela! 🎹
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative h-24 bg-card/50 rounded-lg">
              {/* Staff lines */}
              {[20, 35, 50, 65, 80].map((pos) => (
                <div
                  key={pos}
                  className="absolute left-2 right-2 h-px bg-muted-foreground/30"
                  style={{ top: `${pos}%` }}
                />
              ))}
              
              {/* Notes */}
              <div className="absolute inset-0 flex items-start px-3">
                {row.map((note, index) => {
                  const position = notePositions[note] || 50;
                  const globalIndex = rowIndex * NOTES_PER_ROW + index;
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center animate-bounce-in"
                      style={{ paddingTop: `${position - 8}%` }}
                    >
                      <div
                        className="h-6 w-6 rounded-full shadow-lg flex items-center justify-center border-2 border-white/50"
                        style={{ 
                          backgroundColor: `hsl(var(--${getColorForNote(note)}))`,
                          boxShadow: `0 2px 8px hsl(var(--${getColorForNote(note)}) / 0.6)`,
                        }}
                      >
                        <span className="text-[9px] font-bold text-white drop-shadow">
                          {globalIndex + 1}
                        </span>
                      </div>
                      <span className="text-[9px] font-fredoka text-muted-foreground mt-0.5">
                        {noteNames[note] || note}
                      </span>
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
