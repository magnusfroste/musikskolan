import { useState, useEffect, useRef } from 'react';
import { Play, Square, Save, RotateCcw } from 'lucide-react';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { DrumPad } from '@/components/music/DrumPad';
import { BeatGrid } from '@/components/music/BeatGrid';
import { SaveDialog } from '@/components/music/SaveDialog';
import { useAudio } from '@/hooks/useAudio';
import { useGameProgress } from '@/hooks/useGameProgress';
import { Button } from '@/components/ui/button';

const drumPads = [
  { id: 'kick', label: 'Kick', emoji: '🥁', color: 'drum-red' },
  { id: 'snare', label: 'Snare', emoji: '🪘', color: 'orange-accent' },
  { id: 'hihat', label: 'Hi-Hat', emoji: '🎩', color: 'bass-yellow' },
  { id: 'clap', label: 'Klapp', emoji: '👏', color: 'melody-green' },
  { id: 'tom1', label: 'Tom 1', emoji: '🔴', color: 'cyan-accent' },
  { id: 'tom2', label: 'Tom 2', emoji: '🟡', color: 'effects-blue' },
  { id: 'crash', label: 'Crash', emoji: '💥', color: 'primary' },
  { id: 'ride', label: 'Ride', emoji: '🔔', color: 'pink-accent' },
] as const;

const tempoLevels = [
  { label: '🐢 Lugn', bpm: 80 },
  { label: '🚶 Normal', bpm: 110 },
  { label: '🏃 Snabb', bpm: 140 },
];

const DrumRoom = () => {
  const [grid, setGrid] = useState<boolean[][]>(
    Array(8).fill(null).map(() => Array(16).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [tempo, setTempo] = useState(1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const { playDrum, playBeat, stopBeat, initAudio } = useAudio();
  const { progress, saveSong } = useGameProgress();
  const stepRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  useEffect(() => {
    if (isPlaying) {
      const bpm = tempoLevels[tempo].bpm;
      const stepTime = (60 / bpm / 4) * 1000;
      
      playBeat(grid, bpm);
      
      intervalRef.current = setInterval(() => {
        stepRef.current = (stepRef.current + 1) % 16;
        setCurrentStep(stepRef.current);
      }, stepTime);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopBeat();
      setCurrentStep(-1);
      stepRef.current = 0;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, tempo, grid, playBeat, stopBeat]);

  const toggleCell = (row: number, col: number) => {
    const newGrid = grid.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? !c : c))
    );
    setGrid(newGrid);
  };

  const clearGrid = () => {
    setGrid(Array(8).fill(null).map(() => Array(16).fill(false)));
  };

  const handleSave = (name: string) => {
    saveSong({
      name,
      type: 'beat',
      data: { grid, tempo: tempoLevels[tempo].bpm },
    });
    setShowSaveDialog(false);
  };

  const hasNotes = grid.some(row => row.some(cell => cell));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-drum/10 px-4 py-6">
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥁</span>
          <h1 className="font-fredoka text-2xl font-bold text-foreground">Trumrummet</h1>
        </div>
        <StarCounter count={progress.stars} size="sm" />
      </header>

      <main className="mx-auto mt-6 max-w-4xl space-y-6">
        {/* Drum Pads */}
        <section>
          <h2 className="mb-3 text-center font-fredoka text-lg text-muted-foreground">
            Tryck för att spela! 👇
          </h2>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {drumPads.map((pad) => (
              <DrumPad
                key={pad.id}
                label={pad.label}
                emoji={pad.emoji}
                color={pad.color}
                onPlay={() => playDrum(pad.id)}
              />
            ))}
          </div>
        </section>

        {/* Beat Grid */}
        <section>
          <h2 className="mb-3 text-center font-fredoka text-lg text-muted-foreground">
            Skapa ett mönster! 🎵
          </h2>
          <BeatGrid
            grid={grid}
            onToggle={toggleCell}
            currentStep={currentStep}
            isPlaying={isPlaying}
          />
        </section>

        {/* Controls */}
        <section className="flex flex-wrap items-center justify-center gap-3">
          {/* Tempo */}
          <div className="flex rounded-xl bg-card p-1 shadow-lg">
            {tempoLevels.map((level, i) => (
              <button
                key={i}
                onClick={() => setTempo(i)}
                className={`rounded-lg px-4 py-2 font-fredoka font-semibold transition-all ${
                  tempo === i
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>

          {/* Play/Stop */}
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`gap-2 rounded-xl px-6 py-6 font-fredoka text-lg shadow-lg transition-all ${
              isPlaying
                ? 'bg-drum hover:bg-drum/90'
                : 'bg-melody hover:bg-melody/90'
            }`}
          >
            {isPlaying ? <Square size={24} /> : <Play size={24} />}
            {isPlaying ? 'Stoppa' : 'Spela'}
          </Button>

          {/* Clear */}
          <Button
            onClick={clearGrid}
            variant="outline"
            className="gap-2 rounded-xl border-2 px-4 py-6 font-fredoka"
          >
            <RotateCcw size={20} />
            Rensa
          </Button>

          {/* Save */}
          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={!hasNotes}
            className="gap-2 rounded-xl bg-secondary px-4 py-6 font-fredoka text-secondary-foreground hover:bg-secondary/90"
          >
            <Save size={20} />
            Spara
          </Button>
        </section>
      </main>

      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        type="beat"
      />
    </div>
  );
};

export default DrumRoom;
