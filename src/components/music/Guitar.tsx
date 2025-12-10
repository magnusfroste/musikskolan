import { useCallback } from 'react';

interface GuitarString {
  id: number;
  name: string;
  color: string;
  note: string;
}

export const guitarStrings: GuitarString[] = [
  { id: 0, name: 'Bas', color: 'drum-red', note: 'C3' },
  { id: 1, name: 'Låg', color: 'bass-yellow', note: 'E3' },
  { id: 2, name: 'Mellan', color: 'melody-green', note: 'G3' },
  { id: 3, name: 'Hög', color: 'effects-blue', note: 'C4' },
];

interface GuitarProps {
  onStringPlay: (stringId: number, note: string) => void;
  activeStrings?: Set<number>;
}

export function Guitar({ onStringPlay, activeStrings = new Set() }: GuitarProps) {
  const handleStringClick = useCallback((string: GuitarString) => {
    onStringPlay(string.id, string.note);
  }, [onStringPlay]);

  return (
    <div className="relative mx-auto max-w-md">
      {/* Guitar body */}
      <div className="rounded-3xl bg-gradient-to-b from-amber-700 to-amber-900 p-6 shadow-2xl">
        {/* Sound hole */}
        <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-amber-950 to-black shadow-inner" />
        
        {/* Strings */}
        <div className="space-y-3">
          {guitarStrings.map((string) => (
            <button
              key={string.id}
              onClick={() => handleStringClick(string)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleStringClick(string);
              }}
              className={`relative w-full rounded-xl py-5 transition-all duration-150 ${
                activeStrings.has(string.id) 
                  ? 'scale-95 brightness-125' 
                  : 'hover:scale-102 hover:brightness-110'
              }`}
              style={{
                backgroundColor: `hsl(var(--${string.color}))`,
                boxShadow: activeStrings.has(string.id)
                  ? `0 0 30px hsl(var(--${string.color}) / 0.8)`
                  : `0 4px 15px hsl(var(--${string.color}) / 0.4)`,
              }}
            >
              {/* String line */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                <div 
                  className="h-1 w-full bg-white/40"
                  style={{
                    boxShadow: activeStrings.has(string.id)
                      ? '0 0 10px rgba(255,255,255,0.8)'
                      : 'none',
                  }}
                />
              </div>
              
              {/* Label */}
              <span className="relative font-fredoka text-lg font-bold text-white drop-shadow-md">
                {string.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Guitar neck decoration */}
      <div className="mx-auto -mt-2 h-8 w-24 rounded-b-lg bg-gradient-to-b from-amber-800 to-amber-950" />
    </div>
  );
}
