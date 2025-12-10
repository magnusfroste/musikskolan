import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio, pianoNotes } from '@/hooks/useAudio';

interface RhythmNote {
  id: number;
  note: string;
  time: number; // ms from start
  duration: number; // ms
  lane: number;
}

interface FallingNote extends RhythmNote {
  hit: boolean;
  missed: boolean;
  holdProgress: number;
}

interface Song {
  name: string;
  emoji: string;
  tempo: number;
  notes: RhythmNote[];
}

// Convert piano notes to rhythm game songs
const rhythmSongs: Song[] = [
  {
    name: 'Blinka Lilla Stjärna',
    emoji: '⭐',
    tempo: 100,
    notes: [
      // C C G G A A G
      { id: 1, note: 'C4', time: 0, duration: 400, lane: 0 },
      { id: 2, note: 'C4', time: 500, duration: 400, lane: 0 },
      { id: 3, note: 'G4', time: 1000, duration: 400, lane: 4 },
      { id: 4, note: 'G4', time: 1500, duration: 400, lane: 4 },
      { id: 5, note: 'A4', time: 2000, duration: 400, lane: 5 },
      { id: 6, note: 'A4', time: 2500, duration: 400, lane: 5 },
      { id: 7, note: 'G4', time: 3000, duration: 800, lane: 4 }, // long
      // F F E E D D C
      { id: 8, note: 'F4', time: 4000, duration: 400, lane: 3 },
      { id: 9, note: 'F4', time: 4500, duration: 400, lane: 3 },
      { id: 10, note: 'E4', time: 5000, duration: 400, lane: 2 },
      { id: 11, note: 'E4', time: 5500, duration: 400, lane: 2 },
      { id: 12, note: 'D4', time: 6000, duration: 400, lane: 1 },
      { id: 13, note: 'D4', time: 6500, duration: 400, lane: 1 },
      { id: 14, note: 'C4', time: 7000, duration: 800, lane: 0 }, // long
    ],
  },
  {
    name: 'Glad Skala',
    emoji: '🎵',
    tempo: 120,
    notes: [
      { id: 1, note: 'C4', time: 0, duration: 300, lane: 0 },
      { id: 2, note: 'D4', time: 400, duration: 300, lane: 1 },
      { id: 3, note: 'E4', time: 800, duration: 300, lane: 2 },
      { id: 4, note: 'F4', time: 1200, duration: 300, lane: 3 },
      { id: 5, note: 'G4', time: 1600, duration: 300, lane: 4 },
      { id: 6, note: 'A4', time: 2000, duration: 300, lane: 5 },
      { id: 7, note: 'B4', time: 2400, duration: 300, lane: 6 },
      { id: 8, note: 'C5', time: 2800, duration: 600, lane: 7 },
      // And back down
      { id: 9, note: 'B4', time: 3600, duration: 300, lane: 6 },
      { id: 10, note: 'A4', time: 4000, duration: 300, lane: 5 },
      { id: 11, note: 'G4', time: 4400, duration: 300, lane: 4 },
      { id: 12, note: 'F4', time: 4800, duration: 300, lane: 3 },
      { id: 13, note: 'E4', time: 5200, duration: 300, lane: 2 },
      { id: 14, note: 'D4', time: 5600, duration: 300, lane: 1 },
      { id: 15, note: 'C4', time: 6000, duration: 600, lane: 0 },
    ],
  },
  {
    name: 'Hopp Melodi',
    emoji: '🐸',
    tempo: 110,
    notes: [
      { id: 1, note: 'C4', time: 0, duration: 300, lane: 0 },
      { id: 2, note: 'E4', time: 400, duration: 300, lane: 2 },
      { id: 3, note: 'G4', time: 800, duration: 600, lane: 4 },
      { id: 4, note: 'E4', time: 1600, duration: 300, lane: 2 },
      { id: 5, note: 'C4', time: 2000, duration: 300, lane: 0 },
      { id: 6, note: 'G4', time: 2400, duration: 300, lane: 4 },
      { id: 7, note: 'C5', time: 2800, duration: 800, lane: 7 },
      { id: 8, note: 'G4', time: 3800, duration: 300, lane: 4 },
      { id: 9, note: 'E4', time: 4200, duration: 300, lane: 2 },
      { id: 10, note: 'C4', time: 4600, duration: 800, lane: 0 },
    ],
  },
];

const FALL_DURATION = 2500; // Time for note to fall from top to hit zone (ms)
const HIT_ZONE_TOLERANCE = 150; // Perfect timing window (ms)
const GOOD_TOLERANCE = 300; // Good timing window (ms)

interface RhythmGameProps {
  onExit: () => void;
  onStarsEarned: (stars: number) => void;
}

export function RhythmGame({ onExit, onStarsEarned }: RhythmGameProps) {
  const [gameState, setGameState] = useState<'select' | 'countdown' | 'playing' | 'results'>('select');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectHits, setPerfectHits] = useState(0);
  const [goodHits, setGoodHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [hitEffects, setHitEffects] = useState<{ lane: number; type: 'perfect' | 'good' }[]>([]);
  
  const { playNote, initAudio } = useAudio();
  const gameStartTime = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const holdingLanes = useRef<Set<number>>(new Set());

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  const startGame = (song: Song) => {
    setSelectedSong(song);
    setGameState('countdown');
    setCountdown(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectHits(0);
    setGoodHits(0);
    setMisses(0);
    setFallingNotes([]);
  };

  // Countdown effect
  useEffect(() => {
    if (gameState !== 'countdown') return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('playing');
      gameStartTime.current = performance.now();
      if (selectedSong) {
        setFallingNotes(selectedSong.notes.map(n => ({
          ...n,
          hit: false,
          missed: false,
          holdProgress: 0,
        })));
      }
    }
  }, [gameState, countdown, selectedSong]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !selectedSong) return;

    const gameLoop = () => {
      const currentTime = performance.now() - gameStartTime.current;
      
      setFallingNotes(prev => {
        const updated = prev.map(note => {
          if (note.hit || note.missed) return note;
          
          const noteEndTime = note.time + note.duration;
          const hitZoneTime = note.time + FALL_DURATION;
          
          // Check if note was missed (past the hit zone)
          if (currentTime > hitZoneTime + GOOD_TOLERANCE && !note.hit) {
            setMisses(m => m + 1);
            setCombo(0);
            return { ...note, missed: true };
          }
          
          // Update hold progress for long notes being held
          if (holdingLanes.current.has(note.lane) && note.duration > 400) {
            const holdStart = Math.max(hitZoneTime - HIT_ZONE_TOLERANCE, note.time + FALL_DURATION - HIT_ZONE_TOLERANCE);
            if (currentTime >= holdStart && currentTime <= hitZoneTime + note.duration) {
              const progress = Math.min(1, (currentTime - holdStart) / note.duration);
              return { ...note, holdProgress: progress };
            }
          }
          
          return note;
        });
        
        // Check if game is over
        const allProcessed = updated.every(n => n.hit || n.missed);
        const lastNoteTime = Math.max(...selectedSong.notes.map(n => n.time + n.duration + FALL_DURATION));
        if (allProcessed || currentTime > lastNoteTime + 1000) {
          setTimeout(() => {
            setGameState('results');
            const totalNotes = selectedSong.notes.length;
            const accuracy = ((perfectHits + goodHits) / totalNotes) * 100;
            const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
            onStarsEarned(stars);
          }, 500);
        }
        
        return updated;
      });
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, selectedSong, perfectHits, goodHits, onStarsEarned]);

  const handleLanePress = useCallback((lane: number) => {
    if (gameState !== 'playing') return;
    
    setActiveKeys(prev => new Set(prev).add(lane));
    holdingLanes.current.add(lane);
    
    const currentTime = performance.now() - gameStartTime.current;
    
    setFallingNotes(prev => {
      const noteIndex = prev.findIndex(n => 
        n.lane === lane && 
        !n.hit && 
        !n.missed &&
        Math.abs((n.time + FALL_DURATION) - currentTime) < GOOD_TOLERANCE
      );
      
      if (noteIndex === -1) return prev;
      
      const note = prev[noteIndex];
      const timeDiff = Math.abs((note.time + FALL_DURATION) - currentTime);
      
      playNote(note.note);
      
      const isPerfect = timeDiff < HIT_ZONE_TOLERANCE;
      const points = isPerfect ? 100 : 50;
      
      setScore(s => s + points * (1 + combo * 0.1));
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(m => Math.max(m, newCombo));
        return newCombo;
      });
      
      if (isPerfect) {
        setPerfectHits(p => p + 1);
        setHitEffects(e => [...e, { lane, type: 'perfect' }]);
      } else {
        setGoodHits(g => g + 1);
        setHitEffects(e => [...e, { lane, type: 'good' }]);
      }
      
      setTimeout(() => {
        setHitEffects(e => e.slice(1));
      }, 300);
      
      const updated = [...prev];
      updated[noteIndex] = { ...note, hit: true };
      return updated;
    });
  }, [gameState, playNote, combo]);

  const handleLaneRelease = useCallback((lane: number) => {
    setActiveKeys(prev => {
      const next = new Set(prev);
      next.delete(lane);
      return next;
    });
    holdingLanes.current.delete(lane);
  }, []);

  const getNotePosition = (note: FallingNote, currentTime: number) => {
    const targetTime = note.time + FALL_DURATION;
    const progress = (currentTime - note.time) / FALL_DURATION;
    return Math.min(100, progress * 100);
  };

  const currentTime = gameState === 'playing' ? performance.now() - gameStartTime.current : 0;

  // Song selection screen
  if (gameState === 'select') {
    return (
      <div className="rounded-3xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full">
            <ArrowLeft size={24} />
          </Button>
          <h2 className="font-fredoka text-xl font-bold text-foreground">
            🎸 Rytm Hero - Välj en låt!
          </h2>
        </div>
        
        <div className="grid gap-3">
          {rhythmSongs.map((song) => (
            <button
              key={song.name}
              onClick={() => startGame(song)}
              className="flex items-center gap-4 rounded-2xl bg-primary/10 p-4 text-left transition-all hover:scale-102 hover:bg-primary/20"
            >
              <span className="text-4xl">{song.emoji}</span>
              <div>
                <h3 className="font-fredoka text-lg font-bold text-foreground">{song.name}</h3>
                <p className="text-sm text-muted-foreground">{song.notes.length} noter</p>
              </div>
              <Play className="ml-auto text-primary" size={28} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Countdown screen
  if (gameState === 'countdown') {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-card shadow-xl">
        <div className="text-center">
          <span className="text-6xl">{selectedSong?.emoji}</span>
          <h2 className="mt-2 font-fredoka text-2xl font-bold text-foreground">{selectedSong?.name}</h2>
          <div className="mt-6 text-8xl font-bold text-primary animate-pulse">
            {countdown || 'GO!'}
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'results') {
    const totalNotes = selectedSong?.notes.length || 1;
    const accuracy = Math.round(((perfectHits + goodHits) / totalNotes) * 100);
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-card p-6 shadow-xl">
        <Trophy className="mb-4 text-bass-yellow" size={64} />
        <h2 className="mb-2 font-fredoka text-2xl font-bold text-foreground">Bra spelat!</h2>
        
        <div className="mb-4 flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-4xl ${s <= stars ? '' : 'opacity-30'}`}>⭐</span>
          ))}
        </div>
        
        <div className="mb-6 space-y-2 text-center">
          <p className="font-fredoka text-3xl font-bold text-primary">{Math.round(score)} poäng</p>
          <p className="text-muted-foreground">Träffsäkerhet: {accuracy}%</p>
          <p className="text-muted-foreground">Max combo: {maxCombo}x</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-melody-green">Perfekt: {perfectHits}</span>
            <span className="text-bass-yellow">Bra: {goodHits}</span>
            <span className="text-drum-red">Miss: {misses}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => startGame(selectedSong!)} className="gap-2 rounded-xl font-fredoka">
            <RotateCcw size={20} />
            Spela igen
          </Button>
          <Button variant="outline" onClick={() => setGameState('select')} className="rounded-xl font-fredoka">
            Välj annan låt
          </Button>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-background to-card shadow-xl" style={{ height: '500px' }}>
      {/* Score display */}
      <div className="absolute left-4 top-4 z-10">
        <p className="font-fredoka text-2xl font-bold text-primary">{Math.round(score)}</p>
        <p className="text-sm text-muted-foreground">Combo: {combo}x</p>
      </div>
      
      {/* Lanes */}
      <div className="absolute inset-0 flex">
        {pianoNotes.map((key, lane) => (
          <div
            key={lane}
            className="relative flex-1 border-r border-border/20"
            style={{ backgroundColor: `hsl(var(--${key.color}) / 0.05)` }}
          >
            {/* Lane label at top */}
            <div 
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: `hsl(var(--${key.color}) / 0.6)` }}
            >
              {key.name}
            </div>
            
            {/* Falling notes */}
            {fallingNotes
              .filter(n => n.lane === lane && !n.hit && !n.missed)
              .map(note => {
                const position = getNotePosition(note, currentTime);
                const isLong = note.duration > 400;
                const heightPercent = (note.duration / FALL_DURATION) * 100;
                
                return (
                  <div
                    key={note.id}
                    className="absolute left-1/2 -translate-x-1/2 rounded-lg transition-opacity"
                    style={{
                      top: `${position - heightPercent}%`,
                      width: '80%',
                      height: isLong ? `${heightPercent}%` : '40px',
                      minHeight: '40px',
                      backgroundColor: `hsl(var(--${key.color}))`,
                      boxShadow: `0 4px 20px hsl(var(--${key.color}) / 0.5)`,
                      opacity: position > 100 ? 0 : 1,
                    }}
                  >
                    {isLong && note.holdProgress > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-white/30"
                        style={{ height: `${note.holdProgress * 100}%` }}
                      />
                    )}
                  </div>
                );
              })}
            
            {/* Hit effect */}
            {hitEffects.filter(e => e.lane === lane).map((effect, i) => (
              <div
                key={i}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-ping font-fredoka text-lg font-bold"
                style={{ color: effect.type === 'perfect' ? 'hsl(var(--melody-green))' : 'hsl(var(--bass-yellow))' }}
              >
                {effect.type === 'perfect' ? 'Perfekt!' : 'Bra!'}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Hit zone */}
      <div className="absolute bottom-0 left-0 right-0 h-20 border-t-4 border-primary/50 bg-gradient-to-t from-primary/20 to-transparent">
        <div className="flex h-full">
          {pianoNotes.map((key, lane) => (
            <button
              key={lane}
              onMouseDown={() => handleLanePress(lane)}
              onMouseUp={() => handleLaneRelease(lane)}
              onMouseLeave={() => handleLaneRelease(lane)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleLanePress(lane);
              }}
              onTouchEnd={() => handleLaneRelease(lane)}
              className={`flex-1 border-r border-border/30 transition-all ${
                activeKeys.has(lane) ? 'brightness-150 scale-95' : ''
              }`}
              style={{
                backgroundColor: activeKeys.has(lane) 
                  ? `hsl(var(--${key.color}) / 0.8)` 
                  : `hsl(var(--${key.color}) / 0.3)`,
              }}
            >
              <span className="font-fredoka text-lg font-bold text-white drop-shadow-md">
                {key.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
