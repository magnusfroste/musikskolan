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
    <div className="rounded-2xl bg-card p-4 shadow-xl">
      <div className="mb-2 text-center font-fredoka text-lg text-muted-foreground">
        🎵 Din melodi
      </div>
      
      {/* Staff lines */}
      <div className="relative h-32">
        {[0, 1, 2, 3, 4].map((line) => (
          <div
            key={line}
            className="absolute left-0 right-0 h-px bg-muted-foreground/30"
            style={{ top: `${20 + line * 20}%` }}
          />
        ))}
        
        {/* Notes */}
        <div className="absolute inset-0 flex items-center justify-start gap-2 overflow-x-auto px-2">
          {displayNotes.map((note, index) => {
            const noteIndex = pianoNotes.findIndex(n => n.note === note);
            const position = noteIndex >= 0 ? 80 - noteIndex * 10 : 50;
            
            return (
              <div
                key={index}
                className="relative flex-shrink-0 animate-bounce-in"
                style={{ marginTop: `${position - 50}%` }}
              >
                <div
                  className="h-6 w-6 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: `hsl(var(--${getColorForNote(note)}))`,
                    boxShadow: `0 4px 12px hsl(var(--${getColorForNote(note)}) / 0.5)`,
                  }}
                />
              </div>
            );
          })}
          
          {displayNotes.length === 0 && (
            <div className="w-full text-center text-muted-foreground">
              Tryck på tangenterna för att spela! 🎹
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
