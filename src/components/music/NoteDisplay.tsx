import { pianoNotes } from '@/hooks/useAudio';

interface NoteDisplayProps {
  notes: string[];
  maxNotes?: number;
}

export function NoteDisplay({ notes, maxNotes = 16 }: NoteDisplayProps) {
  const displayNotes = notes.slice(-maxNotes);
  
  const getColorForNote = (note: string) => {
    const noteInfo = pianoNotes.find(n => n.note === note);
    return noteInfo?.color || 'primary';
  };

  return (
    <div className="rounded-2xl bg-card p-3 shadow-xl">
      <div className="mb-1 text-center font-fredoka text-base text-muted-foreground">
        🎵 Din melodi
      </div>
      
      {/* Staff lines */}
      <div className="relative h-16">
        {[0, 1, 2].map((line) => (
          <div
            key={line}
            className="absolute left-0 right-0 h-px bg-muted-foreground/20"
            style={{ top: `${25 + line * 25}%` }}
          />
        ))}
        
        {/* Notes */}
        <div className="absolute inset-0 flex items-center justify-start gap-1.5 overflow-x-auto px-2">
          {displayNotes.map((note, index) => {
            const noteIndex = pianoNotes.findIndex(n => n.note === note);
            // Position from 70% (low C4) down to 10% (high C5) - all within visible range
            const position = noteIndex >= 0 ? 70 - noteIndex * 8 : 40;
            
            return (
              <div
                key={index}
                className="relative flex-shrink-0 animate-bounce-in"
                style={{ marginTop: `${position - 40}%` }}
              >
                <div
                  className="h-5 w-5 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: `hsl(var(--${getColorForNote(note)}))`,
                    boxShadow: `0 3px 8px hsl(var(--${getColorForNote(note)}) / 0.5)`,
                  }}
                />
              </div>
            );
          })}
          
          {displayNotes.length === 0 && (
            <div className="w-full text-center text-sm text-muted-foreground">
              Tryck på tangenterna för att spela! 🎹
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
