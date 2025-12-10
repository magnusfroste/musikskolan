import { useState, useEffect } from 'react';
import { Play, Square, Save } from 'lucide-react';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { MixerTrack } from '@/components/music/MixerTrack';
import { SaveDialog } from '@/components/music/SaveDialog';
import { useAudio } from '@/hooks/useAudio';
import { useGameProgress } from '@/hooks/useGameProgress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const tracks = [
  {
    id: 'drums',
    name: 'Trummor',
    emoji: '🥁',
    color: 'drum-red',
    loops: [
      { id: 'beat1', name: 'Rockbeat' },
      { id: 'beat2', name: 'Diskobeat' },
      { id: 'beat3', name: 'Lugnt beat' },
    ],
  },
  {
    id: 'bass',
    name: 'Bas',
    emoji: '🎸',
    color: 'bass-yellow',
    loops: [
      { id: 'bass1', name: 'Funk bas' },
      { id: 'bass2', name: 'Enkel bas' },
      { id: 'bass3', name: 'Disko bas' },
    ],
  },
  {
    id: 'melody',
    name: 'Melodi',
    emoji: '🎹',
    color: 'melody-green',
    loops: [
      { id: 'melody1', name: 'Glad melodi' },
      { id: 'melody2', name: 'Mystisk' },
      { id: 'melody3', name: 'Äventyr' },
    ],
  },
  {
    id: 'effects',
    name: 'Effekter',
    emoji: '✨',
    color: 'effects-blue',
    loops: [
      { id: 'fx1', name: 'Stjärnor' },
      { id: 'fx2', name: 'Applåder' },
      { id: 'fx3', name: 'Klockor' },
    ],
  },
];

const MixerStudio = () => {
  const [selectedLoops, setSelectedLoops] = useState<Record<string, string | null>>({
    drums: null,
    bass: null,
    melody: null,
    effects: null,
  });
  const [volumes, setVolumes] = useState<Record<string, number>>({
    drums: 80,
    bass: 80,
    melody: 80,
    effects: 80,
  });
  const [muted, setMuted] = useState<Record<string, boolean>>({
    drums: false,
    bass: false,
    melody: false,
    effects: false,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [tempo, setTempo] = useState(110);
  
  const { initAudio, playMixerLoops, stopMixerLoops, setMixerVolumes } = useAudio();
  const { progress, saveSong } = useGameProgress();

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  useEffect(() => {
    if (isPlaying) {
      playMixerLoops(selectedLoops, tempo, volumes, muted);
    } else {
      stopMixerLoops();
    }
  }, [isPlaying, selectedLoops, tempo, playMixerLoops, stopMixerLoops]);

  // Update volumes in real-time while playing
  useEffect(() => {
    if (isPlaying) {
      setMixerVolumes(volumes, muted);
    }
  }, [volumes, muted, isPlaying, setMixerVolumes]);

  useEffect(() => {
    return () => {
      stopMixerLoops();
    };
  }, [stopMixerLoops]);

  const handleSelectLoop = (trackId: string, loopId: string | null) => {
    setSelectedLoops(prev => ({ ...prev, [trackId]: loopId }));
  };

  const handleVolumeChange = (trackId: string, volume: number) => {
    setVolumes(prev => ({ ...prev, [trackId]: volume }));
  };

  const handleMutedChange = (trackId: string, isMuted: boolean) => {
    setMuted(prev => ({ ...prev, [trackId]: isMuted }));
  };

  const handleSave = (name: string) => {
    saveSong({
      name,
      type: 'mix',
      data: { selectedLoops },
    });
    setShowSaveDialog(false);
  };

  const hasSelection = Object.values(selectedLoops).some(v => v !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-effects/10 px-4 py-6">
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎧</span>
          <h1 className="font-fredoka text-2xl font-bold text-foreground">Mixerstudion</h1>
        </div>
        <StarCounter count={progress.stars} size="sm" />
      </header>

      <main className="mx-auto mt-6 max-w-4xl space-y-4">
        <p className="text-center font-fredoka text-lg text-muted-foreground">
          Välj ljud från varje spår och mixa din egen låt! 🎵
        </p>

        {/* Mixer Tracks */}
        <section className="space-y-3">
          {tracks.map((track) => (
            <MixerTrack
              key={track.id}
              name={track.name}
              emoji={track.emoji}
              color={track.color}
              loops={track.loops}
              selectedLoop={selectedLoops[track.id]}
              onSelectLoop={(loopId) => handleSelectLoop(track.id, loopId)}
              volume={volumes[track.id]}
              onVolumeChange={(v) => handleVolumeChange(track.id, v)}
              muted={muted[track.id]}
              onMutedChange={(m) => handleMutedChange(track.id, m)}
            />
          ))}
        </section>

        {/* Visual Timeline */}
        <section className="rounded-2xl bg-card p-4 shadow-lg">
          <h2 className="mb-3 font-fredoka font-bold text-foreground">Din mix 🎬</h2>
          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center gap-2">
                <span className="w-8 text-center text-lg">{track.emoji}</span>
                <div 
                  className="h-8 flex-1 rounded-lg transition-all"
                  style={{
                    backgroundColor: selectedLoops[track.id] 
                      ? `hsl(var(--${track.color}))` 
                      : 'hsl(var(--muted))',
                    opacity: selectedLoops[track.id] ? 1 : 0.3,
                  }}
                >
                  {selectedLoops[track.id] && (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-fredoka text-sm font-semibold text-white drop-shadow">
                        {track.loops.find(l => l.id === selectedLoops[track.id])?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tempo Control */}
        <section className="rounded-2xl bg-card p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🎚️</span>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-fredoka font-semibold text-foreground">Tempo</span>
                <span className="font-fredoka text-lg font-bold text-primary">{tempo} BPM</span>
              </div>
              <Slider
                value={[tempo]}
                onValueChange={(value) => setTempo(value[0])}
                min={60}
                max={180}
                step={5}
                className="w-full"
              />
              <div className="mt-1 flex justify-between font-fredoka text-xs text-muted-foreground">
                <span>🐢 Långsamt</span>
                <span>🐇 Snabbt</span>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!hasSelection}
            className={`gap-2 rounded-xl px-8 py-6 font-fredoka text-lg shadow-lg transition-all ${
              isPlaying
                ? 'bg-drum hover:bg-drum/90 animate-pulse'
                : 'bg-effects hover:bg-effects/90'
            }`}
          >
            {isPlaying ? <Square size={28} /> : <Play size={28} />}
            {isPlaying ? 'Stoppa' : 'Spela Mix'}
          </Button>

          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={!hasSelection}
            className="gap-2 rounded-xl bg-secondary px-6 py-6 font-fredoka text-lg text-secondary-foreground hover:bg-secondary/90"
          >
            <Save size={24} />
            Spara Mix
          </Button>
        </section>

        {/* Tips */}
        <section className="rounded-2xl bg-primary/10 p-4 text-center">
          <p className="font-fredoka text-foreground">
            💡 <strong>Tips:</strong> Prova olika kombinationer för att hitta din favoritmix!
          </p>
        </section>
      </main>

      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        type="mix"
      />
    </div>
  );
};

export default MixerStudio;
