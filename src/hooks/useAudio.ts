import { useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

// Drum sounds
const drumSounds = {
  kick: { note: 'C1', duration: '8n' },
  snare: { note: 'D1', duration: '8n' },
  hihat: { note: 'F#1', duration: '16n' },
  clap: { note: 'D#1', duration: '8n' },
  tom1: { note: 'G1', duration: '8n' },
  tom2: { note: 'A1', duration: '8n' },
  crash: { note: 'C#2', duration: '4n' },
  ride: { note: 'D#2', duration: '8n' },
};

// Piano notes with colors
export const pianoNotes = [
  { note: 'C4', color: 'drum', name: 'Do' },
  { note: 'D4', color: 'orange', name: 'Re' },
  { note: 'E4', color: 'bass', name: 'Mi' },
  { note: 'F4', color: 'melody', name: 'Fa' },
  { note: 'G4', color: 'cyan', name: 'Sol' },
  { note: 'A4', color: 'effects', name: 'La' },
  { note: 'B4', color: 'primary', name: 'Si' },
  { note: 'C5', color: 'pink', name: 'Do' },
];

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const drumRef = useRef<Tone.MembraneSynth | null>(null);
  const noiseRef = useRef<Tone.NoiseSynth | null>(null);
  const metalRef = useRef<Tone.MetalSynth | null>(null);
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const isInitialized = useRef(false);

  const initAudio = useCallback(async () => {
    if (isInitialized.current) return;
    
    await Tone.start();
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 },
    }).toDestination();
    synthRef.current.volume.value = -6;

    drumRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).toDestination();
    drumRef.current.volume.value = -3;

    noiseRef.current = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
    }).toDestination();
    noiseRef.current.volume.value = -10;

    metalRef.current = new Tone.MetalSynth().toDestination();
    metalRef.current.volume.value = -15;

    isInitialized.current = true;
  }, []);

  const playDrum = useCallback(async (type: keyof typeof drumSounds) => {
    await initAudio();
    
    if (type === 'kick' || type === 'tom1' || type === 'tom2') {
      drumRef.current?.triggerAttackRelease(drumSounds[type].note, drumSounds[type].duration);
    } else if (type === 'snare' || type === 'clap') {
      noiseRef.current?.triggerAttackRelease(drumSounds[type].duration);
    } else {
      metalRef.current?.triggerAttackRelease(drumSounds[type].note, drumSounds[type].duration);
    }
  }, [initAudio]);

  const playNote = useCallback(async (note: string) => {
    await initAudio();
    synthRef.current?.triggerAttackRelease(note, '8n');
  }, [initAudio]);

  const playBeat = useCallback(async (grid: boolean[][], tempo: number = 120) => {
    await initAudio();
    
    Tone.getTransport().bpm.value = tempo;
    
    if (sequencerRef.current) {
      sequencerRef.current.dispose();
    }

    const drumTypes = ['kick', 'snare', 'hihat', 'clap', 'tom1', 'tom2', 'crash', 'ride'] as const;
    
    sequencerRef.current = new Tone.Sequence(
      (time, col) => {
        grid.forEach((row, rowIndex) => {
          if (row[col]) {
            const type = drumTypes[rowIndex];
            if (type === 'kick' || type === 'tom1' || type === 'tom2') {
              drumRef.current?.triggerAttackRelease(drumSounds[type].note, drumSounds[type].duration, time);
            } else if (type === 'snare' || type === 'clap') {
              noiseRef.current?.triggerAttackRelease(drumSounds[type].duration, time);
            } else {
              metalRef.current?.triggerAttackRelease(drumSounds[type].note, drumSounds[type].duration, time);
            }
          }
        });
      },
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      '16n'
    );

    sequencerRef.current.start(0);
    Tone.getTransport().start();
  }, [initAudio]);

  const stopBeat = useCallback(() => {
    Tone.getTransport().stop();
    if (sequencerRef.current) {
      sequencerRef.current.stop();
    }
  }, []);

  const playMelody = useCallback(async (notes: string[], tempo: number = 120) => {
    await initAudio();
    
    Tone.getTransport().bpm.value = tempo;
    
    const now = Tone.now();
    notes.forEach((note, i) => {
      synthRef.current?.triggerAttackRelease(note, '8n', now + i * 0.3);
    });
  }, [initAudio]);

  useEffect(() => {
    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
      Tone.getTransport().stop();
    };
  }, []);

  return {
    initAudio,
    playDrum,
    playNote,
    playBeat,
    stopBeat,
    playMelody,
    pianoNotes,
  };
}
