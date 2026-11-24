import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { report } from '@/lib/skolappar';
import { useAudio } from '@/hooks/useAudio';
import { guitarStrings } from './Guitar';

interface RhythmNote {
  id: number;
  time: number;
  duration: number;
  lane: number;
}

interface FallingNote extends RhythmNote {
  hit: boolean;
  missed: boolean;
}

interface Song {
  name: string;
  emoji: string;
  notes: RhythmNote[];
}

// Simple songs for 4 lanes (converted from piano notes)
const guitarSongs: Song[] = [
  {
    name: 'Bä Bä Vita Lamm',
    emoji: '🐑',
    notes: [
      { id: 1, time: 0, duration: 400, lane: 0 },
      { id: 2, time: 500, duration: 400, lane: 0 },
      { id: 3, time: 1000, duration: 400, lane: 2 },
      { id: 4, time: 1500, duration: 400, lane: 2 },
      { id: 5, time: 2000, duration: 400, lane: 3 },
      { id: 6, time: 2500, duration: 400, lane: 3 },
      { id: 7, time: 3000, duration: 800, lane: 2 },
      { id: 8, time: 4000, duration: 400, lane: 1 },
      { id: 9, time: 4500, duration: 400, lane: 1 },
      { id: 10, time: 5000, duration: 400, lane: 0 },
      { id: 11, time: 5500, duration: 400, lane: 0 },
      { id: 12, time: 6000, duration: 800, lane: 0 },
    ],
  },
  {
    name: 'Enkel Skala',
    emoji: '🎵',
    notes: [
      { id: 1, time: 0, duration: 500, lane: 0 },
      { id: 2, time: 600, duration: 500, lane: 1 },
      { id: 3, time: 1200, duration: 500, lane: 2 },
      { id: 4, time: 1800, duration: 800, lane: 3 },
      { id: 5, time: 2800, duration: 500, lane: 2 },
      { id: 6, time: 3400, duration: 500, lane: 1 },
      { id: 7, time: 4000, duration: 800, lane: 0 },
    ],
  },
  {
    name: 'Hopp Hopp',
    emoji: '🐸',
    notes: [
      { id: 1, time: 0, duration: 400, lane: 0 },
      { id: 2, time: 600, duration: 400, lane: 2 },
      { id: 3, time: 1200, duration: 400, lane: 0 },
      { id: 4, time: 1800, duration: 400, lane: 2 },
      { id: 5, time: 2400, duration: 400, lane: 3 },
      { id: 6, time: 3000, duration: 400, lane: 3 },
      { id: 7, time: 3600, duration: 800, lane: 2 },
      { id: 8, time: 4600, duration: 400, lane: 1 },
      { id: 9, time: 5200, duration: 800, lane: 0 },
    ],
  },
];

const FALL_DURATION = 2000;
const HIT_ZONE_TOLERANCE = 200; // More forgiving
const GOOD_TOLERANCE = 400;

const KEYBOARD_KEYS = ['A', 'S', 'D', 'F'];

interface GuitarRhythmGameProps {
  onExit: () => void;
  onStarsEarned: (stars: number) => void;
}

export function GuitarRhythmGame({ onExit, onStarsEarned }: GuitarRhythmGameProps) {
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

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  // Keyboard support
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const laneIndex = KEYBOARD_KEYS.indexOf(key);
      if (laneIndex !== -1 && !e.repeat) {
        handleLanePress(laneIndex);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const laneIndex = KEYBOARD_KEYS.indexOf(key);
      if (laneIndex !== -1) {
        handleLaneRelease(laneIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

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
  // A song ends: report the share of notes hit
  useEffect(() => {
    if (gameState !== 'results' || !selectedSong) return;
    report('round_done', Math.round(((perfectHits + goodHits) / (selectedSong.notes.length || 1)) * 100));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'countdown') return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('playing');
      report('round_start');
      gameStartTime.current = performance.now();
      if (selectedSong) {
        setFallingNotes(selectedSong.notes.map(n => ({
          ...n,
          hit: false,
          missed: false,
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
          
          const hitZoneTime = note.time + FALL_DURATION;
          
          if (currentTime > hitZoneTime + GOOD_TOLERANCE && !note.hit) {
            setMisses(m => m + 1);
            setCombo(0);
            return { ...note, missed: true };
          }
          
          return note;
        });
        
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
      
      // Play corresponding guitar note
      playNote(guitarStrings[lane].note);
      
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
  }, []);

  const getNotePosition = (note: FallingNote, currentTime: number) => {
    const progress = (currentTime - note.time) / FALL_DURATION;
    return Math.min(100, progress * 100);
  };

  const currentTime = gameState === 'playing' ? performance.now() - gameStartTime.current : 0;

  // Song selection
  if (gameState === 'select') {
    return (
      <div className="rounded-3xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full">
            <ArrowLeft size={24} />
          </Button>
          <h2 className="font-fredoka text-xl font-bold text-foreground">
            🎸 Gitarr Hero - Välj en låt!
          </h2>
        </div>
        
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Använd tangenter <span className="font-bold">A S D F</span> eller klicka/tryck!
        </p>
        
        <div className="grid gap-3">
          {guitarSongs.map((song) => (
            <button
              key={song.name}
              onClick={() => startGame(song)}
              className="flex items-center gap-4 rounded-2xl bg-primary/10 p-4 text-left transition-all hover:scale-102 hover:bg-primary/20"
            >
              <span className="text-4xl">{song.emoji}</span>
              <div>
                <h3 className="font-fredoka text-lg font-bold text-foreground">{song.name}</h3>
                <p className="text-sm text-muted-foreground">{song.notes.length} noter • Enkel</p>
              </div>
              <Play className="ml-auto text-primary" size={28} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Countdown
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

  // Results
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

  // Playing
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-background to-card shadow-xl" style={{ height: '450px' }}>
      {/* Score */}
      <div className="absolute left-4 top-4 z-10">
        <p className="font-fredoka text-2xl font-bold text-primary">{Math.round(score)}</p>
        <p className="text-sm text-muted-foreground">Combo: {combo}x</p>
      </div>
      
      {/* 4 Lanes */}
      <div className="absolute inset-0 flex">
        {guitarStrings.map((string, lane) => (
          <div
            key={lane}
            className="relative flex-1 border-r border-border/30"
            style={{ backgroundColor: `hsl(var(--${string.color}) / 0.08)` }}
          >
            {/* Lane label */}
            <div 
              className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-bold text-white"
              style={{ backgroundColor: `hsl(var(--${string.color}) / 0.7)` }}
            >
              {string.name}
            </div>
            
            {/* Keyboard hint */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">
              [{KEYBOARD_KEYS[lane]}]
            </div>
            
            {/* Falling notes */}
            {fallingNotes
              .filter(n => n.lane === lane && !n.hit && !n.missed)
              .map(note => {
                const position = getNotePosition(note, currentTime);
                
                return (
                  <div
                    key={note.id}
                    className="absolute left-1/2 -translate-x-1/2 rounded-xl transition-opacity"
                    style={{
                      top: `${position - 8}%`,
                      width: '75%',
                      height: '50px',
                      backgroundColor: `hsl(var(--${string.color}))`,
                      boxShadow: `0 6px 25px hsl(var(--${string.color}) / 0.6)`,
                      opacity: position > 100 ? 0 : 1,
                    }}
                  />
                );
              })}
            
            {/* Hit effect */}
            {hitEffects.filter(e => e.lane === lane).map((effect, i) => (
              <div
                key={i}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-ping font-fredoka text-xl font-bold"
                style={{ color: effect.type === 'perfect' ? 'hsl(var(--melody-green))' : 'hsl(var(--bass-yellow))' }}
              >
                {effect.type === 'perfect' ? '✨' : '👍'}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Hit zone */}
      <div className="absolute bottom-0 left-0 right-0 h-24 border-t-4 border-primary/60 bg-gradient-to-t from-primary/30 to-transparent">
        <div className="flex h-full">
          {guitarStrings.map((string, lane) => (
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
              className={`flex flex-1 items-center justify-center border-r border-border/40 font-fredoka text-2xl font-bold text-white transition-all ${
                activeKeys.has(lane) ? 'brightness-150 scale-95' : ''
              }`}
              style={{
                backgroundColor: activeKeys.has(lane) 
                  ? `hsl(var(--${string.color}))` 
                  : `hsl(var(--${string.color}) / 0.5)`,
              }}
            >
              {KEYBOARD_KEYS[lane]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
