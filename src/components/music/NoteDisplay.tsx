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

export function NoteDisplay({ notes, maxNotes = 32 }: NoteDisplayProps) {
  const displayNotes = notes.slice(-maxNotes);
  
  const getColorForNote = (note: string) => {
    const noteInfo = pianoNotes.find(n => n.note === note);
    return noteInfo?.color || 'primary';
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-xl w-full overflow-hidden">
      <div className="mb-2 text-center font-fredoka text-base text-muted-foreground">
        🎵 Din melodi ({displayNotes.length} noter)
      </div>
      
      <div 
        className="min-h-24 p-2 bg-muted/30 rounded-xl"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
          gap: '8px',
          alignContent: 'start',
        }}
      >
        {displayNotes.map((note, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-1 animate-bounce-in"
          >
            <div
              className="h-8 w-8 rounded-full shadow-lg flex items-center justify-center"
              style={{ 
                backgroundColor: `hsl(var(--${getColorForNote(note)}))`,
                boxShadow: `0 3px 8px hsl(var(--${getColorForNote(note)}) / 0.5)`,
              }}
            >
              <span className="text-xs font-bold text-white drop-shadow">
                {index + 1}
              </span>
            </div>
            <span className="text-xs font-fredoka text-muted-foreground">
              {noteNames[note] || note}
            </span>
          </div>
        ))}
        
        {displayNotes.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-4">
            Tryck på tangenterna för att spela! 🎹
          </div>
        )}
      </div>
    </div>
  );
}
