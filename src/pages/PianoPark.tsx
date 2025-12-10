import { useState, useEffect } from 'react';
import { Play, Save, Trash2, Music } from 'lucide-react';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { Piano } from '@/components/music/Piano';
import { NoteDisplay } from '@/components/music/NoteDisplay';
import { SaveDialog } from '@/components/music/SaveDialog';
import { useAudio } from '@/hooks/useAudio';
import { useGameProgress } from '@/hooks/useGameProgress';
import { Button } from '@/components/ui/button';

type MelodyNote = string | { note: string; duration?: string };

const sampleMelodies: Array<{ name: string; emoji: string; notes: MelodyNote[] }> = [
  { 
    name: 'Blinka Lilla Stjärna', 
    emoji: '⭐',
    // Blin-ka lil-la stjär-na där, hur jag und-rar vad du är
    notes: [
      { note: 'C4', duration: '4n' }, { note: 'C4', duration: '4n' },
      { note: 'G4', duration: '4n' }, { note: 'G4', duration: '4n' },
      { note: 'A4', duration: '4n' }, { note: 'A4', duration: '4n' },
      { note: 'G4', duration: '2n' },
      { note: 'F4', duration: '4n' }, { note: 'F4', duration: '4n' },
      { note: 'E4', duration: '4n' }, { note: 'E4', duration: '4n' },
      { note: 'D4', duration: '4n' }, { note: 'D4', duration: '4n' },
      { note: 'C4', duration: '2n' },
    ]
  },
  { 
    name: 'Bä Bä Vita Lamm', 
    emoji: '🐑',
    // Bä bä vi-ta lamm, har du nå-gon ull?
    notes: [
      { note: 'C4', duration: '4n' }, { note: 'C4', duration: '4n' },
      { note: 'G4', duration: '4n' }, { note: 'G4', duration: '4n' },
      { note: 'A4', duration: '8n' }, { note: 'A4', duration: '8n' }, { note: 'A4', duration: '4n' },
      { note: 'G4', duration: '2n' },
    ]
  },
  { 
    name: 'Glad Melodi', 
    emoji: '😊',
    notes: [
      { note: 'C4', duration: '4n' }, { note: 'E4', duration: '4n' },
      { note: 'G4', duration: '4n' }, { note: 'E4', duration: '4n' },
      { note: 'C4', duration: '4n' }, { note: 'E4', duration: '4n' },
      { note: 'G4', duration: '4n' }, { note: 'C5', duration: '2n' },
    ]
  },
];

const PianoPark = () => {
  const [recordedNotes, setRecordedNotes] = useState<string[]>([]);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const { playNote, playMelody, initAudio } = useAudio();
  const { progress, saveSong } = useGameProgress();

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  const handleNoteRecorded = (note: string) => {
    setRecordedNotes(prev => [...prev, note]);
  };

  const handlePlayRecorded = async () => {
    if (recordedNotes.length === 0) return;
    setIsPlayingMelody(true);
    await playMelody(recordedNotes, 120);
    setTimeout(() => setIsPlayingMelody(false), recordedNotes.length * 300 + 500);
  };

  const handlePlaySample = async (notes: MelodyNote[]) => {
    setIsPlayingMelody(true);
    await playMelody(notes, 100);
    // Calculate total duration based on note lengths
    const totalBeats = notes.reduce((acc, note) => {
      const duration = typeof note === 'string' ? '4n' : (note.duration || '4n');
      if (duration === '2n') return acc + 2;
      if (duration === '8n') return acc + 0.5;
      return acc + 1;
    }, 0);
    const beatDuration = 60 / 100; // tempo 100
    setTimeout(() => setIsPlayingMelody(false), totalBeats * beatDuration * 1000 + 500);
  };

  const handleSave = (name: string) => {
    saveSong({
      name,
      type: 'melody',
      data: { notes: recordedNotes },
    });
    setShowSaveDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-melody/10 px-4 py-6">
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎹</span>
          <h1 className="font-fredoka text-2xl font-bold text-foreground">Pianoparken</h1>
        </div>
        <StarCounter count={progress.stars} size="sm" />
      </header>

      <main className="mx-auto mt-6 max-w-4xl space-y-6">
        {/* Piano */}
        <section className="rounded-3xl bg-card p-6 shadow-xl">
          <h2 className="mb-4 text-center font-fredoka text-lg text-muted-foreground">
            Spela på tangenterna! 🎵
          </h2>
          <Piano 
            onPlayNote={playNote} 
            onNoteRecorded={handleNoteRecorded}
          />
        </section>

        {/* Note Display */}
        <NoteDisplay notes={recordedNotes} />

        {/* Controls */}
        <section className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handlePlayRecorded}
            disabled={recordedNotes.length === 0 || isPlayingMelody}
            className={`gap-2 rounded-xl px-6 py-6 font-fredoka text-lg ${
              isPlayingMelody ? 'animate-pulse' : ''
            }`}
            style={{ backgroundColor: 'hsl(var(--melody-green))' }}
          >
            <Play size={24} />
            {isPlayingMelody ? 'Spelar...' : 'Spela upp'}
          </Button>

          <Button
            onClick={() => setRecordedNotes([])}
            variant="outline"
            className="gap-2 rounded-xl border-2 px-4 py-6 font-fredoka"
          >
            <Trash2 size={20} />
            Rensa
          </Button>

          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={recordedNotes.length === 0}
            className="gap-2 rounded-xl bg-secondary px-4 py-6 font-fredoka text-secondary-foreground hover:bg-secondary/90"
          >
            <Save size={20} />
            Spara
          </Button>
        </section>

        {/* Sample Melodies */}
        <section className="rounded-2xl bg-card p-4 shadow-lg">
          <h2 className="mb-4 flex items-center justify-center gap-2 font-fredoka text-lg font-bold text-foreground">
            <Music size={20} />
            Prova en melodi!
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {sampleMelodies.map((melody) => (
              <button
                key={melody.name}
                onClick={() => handlePlaySample(melody.notes)}
                disabled={isPlayingMelody}
                className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-fredoka font-semibold text-foreground transition-all hover:scale-105 hover:bg-primary/20"
              >
                <span className="text-2xl">{melody.emoji}</span>
                {melody.name}
              </button>
            ))}
          </div>
        </section>

        {/* Note legend */}
        <section className="rounded-2xl bg-card p-4 shadow-lg">
          <h2 className="mb-3 text-center font-fredoka text-lg font-bold text-foreground">
            📚 Lär dig noterna!
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do'].map((note, i) => {
              const colors = ['drum-red', 'orange-accent', 'bass-yellow', 'melody-green', 'cyan-accent', 'effects-blue', 'primary', 'pink-accent'];
              return (
                <div 
                  key={i}
                  className="flex flex-col items-center gap-1 rounded-xl p-2"
                  style={{ backgroundColor: `hsl(var(--${colors[i]}) / 0.2)` }}
                >
                  <div 
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: `hsl(var(--${colors[i]}))` }}
                  />
                  <span className="font-fredoka font-bold text-foreground">{note}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        type="melody"
      />
    </div>
  );
};

export default PianoPark;
