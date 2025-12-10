import { useState, useCallback } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { Guitar, guitarStrings } from '@/components/music/Guitar';
import { GuitarRhythmGame } from '@/components/music/GuitarRhythmGame';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useAudio } from '@/hooks/useAudio';

const GuitarGlade = () => {
  const [showRhythmGame, setShowRhythmGame] = useState(false);
  const [activeStrings, setActiveStrings] = useState<Set<number>>(new Set());
  const { progress, addStars } = useGameProgress();
  const { playNote, initAudio } = useAudio();

  const handleStringPlay = useCallback(async (stringId: number, note: string) => {
    await initAudio();
    playNote(note);
    
    setActiveStrings(prev => new Set(prev).add(stringId));
    setTimeout(() => {
      setActiveStrings(prev => {
        const next = new Set(prev);
        next.delete(stringId);
        return next;
      });
    }, 200);
  }, [initAudio, playNote]);

  const handleStarsEarned = (stars: number) => {
    if (stars > 0) {
      addStars(stars);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-bass-yellow/10 to-background px-4 py-6">
      {/* Header */}
      <header className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="font-fredoka text-2xl font-bold text-foreground">Gitarrgläntan</h1>
              <p className="text-sm text-muted-foreground">Enkelt och roligt! 🎸</p>
            </div>
          </div>
          <StarCounter count={progress.stars} />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto mt-6 max-w-2xl">
        {showRhythmGame ? (
          <GuitarRhythmGame
            onExit={() => setShowRhythmGame(false)}
            onStarsEarned={handleStarsEarned}
          />
        ) : (
          <div className="space-y-6">
            {/* Free play guitar */}
            <div className="rounded-3xl bg-card p-6 shadow-xl">
              <h2 className="mb-4 text-center font-fredoka text-xl font-bold text-foreground">
                🎸 Spela på gitarren!
              </h2>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Tryck på strängarna för att spela
              </p>
              
              <Guitar 
                onStringPlay={handleStringPlay} 
                activeStrings={activeStrings}
              />
              
              {/* String legend */}
              <div className="mt-6 flex justify-center gap-2">
                {guitarStrings.map((string) => (
                  <div 
                    key={string.id}
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: `hsl(var(--${string.color}))` }}
                  >
                    {string.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Rhythm game button */}
            <Button
              onClick={async () => {
                await initAudio();
                setShowRhythmGame(true);
              }}
              className="w-full gap-3 rounded-2xl bg-gradient-to-r from-bass-yellow to-melody-green py-8 font-fredoka text-xl font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl"
            >
              <Gamepad2 size={32} />
              Spela Gitarr Hero! 🎮
            </Button>

            {/* Tips */}
            <div className="rounded-2xl bg-card/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tips:</strong> I Gitarr Hero kan du använda tangentbord (A, S, D, F) för snabbare spel!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Decorative elements */}
      <div className="fixed -bottom-20 -left-20 h-40 w-40 rounded-full bg-bass-yellow/20 blur-3xl" />
      <div className="fixed -bottom-20 -right-20 h-40 w-40 rounded-full bg-melody-green/20 blur-3xl" />
    </div>
  );
};

export default GuitarGlade;
