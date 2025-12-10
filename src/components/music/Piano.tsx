import { useState } from 'react';
import { pianoNotes } from '@/hooks/useAudio';

interface PianoProps {
  onPlayNote: (note: string) => void;
  onNoteRecorded?: (note: string) => void;
}

export function Piano({ onPlayNote, onNoteRecorded }: PianoProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleKeyPress = (note: string) => {
    setActiveKey(note);
    onPlayNote(note);
    onNoteRecorded?.(note);
    setTimeout(() => setActiveKey(null), 200);
  };

  return (
    <div className="flex justify-center gap-1 md:gap-2">
      {pianoNotes.map((key) => (
        <button
          key={key.note}
          onMouseDown={() => handleKeyPress(key.note)}
          onTouchStart={(e) => {
            e.preventDefault();
            handleKeyPress(key.note);
          }}
          className={`
            relative flex flex-col items-center justify-end
            rounded-b-2xl pb-3 transition-all duration-100
            ${activeKey === key.note ? 'translate-y-1' : 'hover:-translate-y-1'}
            bounce-click
          `}
          style={{
            width: 'clamp(40px, 10vw, 70px)',
            height: 'clamp(120px, 25vw, 180px)',
            backgroundColor: `hsl(var(--${key.color}))`,
            boxShadow: activeKey === key.note
              ? `0 2px 10px hsl(var(--${key.color}) / 0.8), inset 0 -5px 20px rgba(0,0,0,0.2)`
              : `0 8px 20px hsl(var(--${key.color}) / 0.4), inset 0 -10px 30px rgba(0,0,0,0.1)`,
          }}
        >
          <span className="font-fredoka text-lg font-bold text-white drop-shadow-md">
            {key.name}
          </span>
          {activeKey === key.note && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div 
                className="h-6 w-6 rounded-full animate-bounce-in"
                style={{ backgroundColor: `hsl(var(--${key.color}))` }}
              />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
