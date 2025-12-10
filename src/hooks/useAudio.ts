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

// Mixer loop patterns
const drumPatterns = {
  beat1: ['kick', null, 'hihat', null, 'snare', null, 'hihat', null, 'kick', 'kick', 'hihat', null, 'snare', null, 'hihat', 'hihat'],
  beat2: ['kick', 'hihat', 'kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'kick', 'hihat', 'kick', 'hihat', 'snare', 'hihat', 'clap', 'hihat'],
  beat3: ['kick', null, null, 'hihat', null, null, 'snare', null, null, null, 'kick', null, null, 'hihat', 'snare', null],
};

const bassPatterns = {
  bass1: ['C2', null, 'C2', null, 'E2', null, 'G2', null, 'C2', null, 'E2', null, 'G2', null, 'B1', null],
  bass2: ['C2', null, null, null, 'G2', null, null, null, 'C2', null, null, null, 'G2', null, null, null],
  bass3: ['C2', 'C2', null, 'C2', 'E2', 'E2', null, 'E2', 'G2', 'G2', null, 'G2', 'B1', 'B1', null, 'B1'],
};

const melodyPatterns = {
  melody1: ['E4', null, 'G4', null, 'A4', null, 'G4', null, 'E4', null, 'D4', null, 'C4', null, null, null],
  melody2: ['E4', null, null, 'D#4', null, null, 'E4', null, null, 'B3', null, null, 'D4', null, 'C4', null],
  melody3: ['C4', null, 'E4', null, 'G4', null, 'C5', null, 'B4', null, 'G4', null, 'E4', null, 'C4', null],
};

const effectPatterns = {
  fx1: [null, null, null, null, 'star', null, null, null, null, null, null, null, 'star', null, null, null],
  fx2: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'clap'],
  fx3: ['bell', null, null, null, null, null, null, null, 'bell', null, null, null, null, null, null, null],
};

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const bassSynthRef = useRef<Tone.MonoSynth | null>(null);
  const drumRef = useRef<Tone.MembraneSynth | null>(null);
  const noiseRef = useRef<Tone.NoiseSynth | null>(null);
  const metalRef = useRef<Tone.MetalSynth | null>(null);
  const bellRef = useRef<Tone.PolySynth | null>(null);
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const mixerSequencersRef = useRef<Tone.Sequence[]>([]);
  const mixerGainsRef = useRef<Record<string, Tone.Gain>>({});
  const isInitialized = useRef(false);

  const initAudio = useCallback(async () => {
    if (isInitialized.current) return;
    
    await Tone.start();
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 },
    }).toDestination();
    synthRef.current.volume.value = -6;

    bassSynthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.2, baseFrequency: 200, octaves: 2 },
    }).toDestination();
    bassSynthRef.current.volume.value = -8;

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

    bellRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.5 },
    }).toDestination();
    bellRef.current.volume.value = -10;

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

  const playMixerLoops = useCallback(async (
    selectedLoops: Record<string, string | null>, 
    tempo: number = 110,
    volumes: Record<string, number> = { drums: 80, bass: 80, melody: 80, effects: 80 },
    muted: Record<string, boolean> = { drums: false, bass: false, melody: false, effects: false }
  ) => {
    await initAudio();
    
    // Stop and dispose existing mixer sequencers
    mixerSequencersRef.current.forEach(seq => seq.dispose());
    mixerSequencersRef.current = [];
    Object.values(mixerGainsRef.current).forEach(gain => gain.dispose());
    mixerGainsRef.current = {};
    Tone.getTransport().stop();
    
    Tone.getTransport().bpm.value = tempo;

    // Create gain nodes for each track
    const drumsGain = new Tone.Gain(muted.drums ? 0 : volumes.drums / 100).toDestination();
    const bassGain = new Tone.Gain(muted.bass ? 0 : volumes.bass / 100).toDestination();
    const melodyGain = new Tone.Gain(muted.melody ? 0 : volumes.melody / 100).toDestination();
    const effectsGain = new Tone.Gain(muted.effects ? 0 : volumes.effects / 100).toDestination();
    
    mixerGainsRef.current = { drums: drumsGain, bass: bassGain, melody: melodyGain, effects: effectsGain };

    // Create dedicated synths for mixer
    const mixerDrum = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).connect(drumsGain);

    const mixerNoise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
    }).connect(drumsGain);

    const mixerMetal = new Tone.MetalSynth().connect(drumsGain);
    mixerMetal.volume.value = -10;

    const mixerBass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.2, baseFrequency: 200, octaves: 2 },
    }).connect(bassGain);

    const mixerMelody = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 },
    }).connect(melodyGain);

    const mixerBell = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.5 },
    }).connect(effectsGain);

    const mixerFxNoise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
    }).connect(effectsGain);

    // Drums
    if (selectedLoops.drums && drumPatterns[selectedLoops.drums as keyof typeof drumPatterns]) {
      const pattern = drumPatterns[selectedLoops.drums as keyof typeof drumPatterns];
      const drumSeq = new Tone.Sequence(
        (time, sound) => {
          if (sound === 'kick') {
            mixerDrum.triggerAttackRelease('C1', '8n', time);
          } else if (sound === 'snare') {
            mixerNoise.triggerAttackRelease('8n', time);
          } else if (sound === 'hihat') {
            mixerMetal.triggerAttackRelease('F#1', '32n', time);
          } else if (sound === 'clap') {
            mixerNoise.triggerAttackRelease('16n', time);
          }
        },
        pattern,
        '16n'
      );
      drumSeq.start(0);
      mixerSequencersRef.current.push(drumSeq);
    }

    // Bass
    if (selectedLoops.bass && bassPatterns[selectedLoops.bass as keyof typeof bassPatterns]) {
      const pattern = bassPatterns[selectedLoops.bass as keyof typeof bassPatterns];
      const bassSeq = new Tone.Sequence(
        (time, note) => {
          if (note) {
            mixerBass.triggerAttackRelease(note, '16n', time);
          }
        },
        pattern,
        '16n'
      );
      bassSeq.start(0);
      mixerSequencersRef.current.push(bassSeq);
    }

    // Melody
    if (selectedLoops.melody && melodyPatterns[selectedLoops.melody as keyof typeof melodyPatterns]) {
      const pattern = melodyPatterns[selectedLoops.melody as keyof typeof melodyPatterns];
      const melodySeq = new Tone.Sequence(
        (time, note) => {
          if (note) {
            mixerMelody.triggerAttackRelease(note, '8n', time);
          }
        },
        pattern,
        '16n'
      );
      melodySeq.start(0);
      mixerSequencersRef.current.push(melodySeq);
    }

    // Effects
    if (selectedLoops.effects && effectPatterns[selectedLoops.effects as keyof typeof effectPatterns]) {
      const pattern = effectPatterns[selectedLoops.effects as keyof typeof effectPatterns];
      const fxSeq = new Tone.Sequence(
        (time, fx) => {
          if (fx === 'star') {
            mixerBell.triggerAttackRelease(['C6', 'E6', 'G6'], '16n', time);
          } else if (fx === 'clap') {
            mixerFxNoise.triggerAttackRelease('8n', time);
          } else if (fx === 'bell') {
            mixerBell.triggerAttackRelease('C5', '4n', time);
          }
        },
        pattern,
        '16n'
      );
      fxSeq.start(0);
      mixerSequencersRef.current.push(fxSeq);
    }

    Tone.getTransport().start();
  }, [initAudio]);

  const setMixerVolumes = useCallback((
    volumes: Record<string, number>,
    muted: Record<string, boolean>
  ) => {
    Object.entries(mixerGainsRef.current).forEach(([track, gain]) => {
      gain.gain.value = muted[track] ? 0 : volumes[track] / 100;
    });
  }, []);

  const stopMixerLoops = useCallback(() => {
    Tone.getTransport().stop();
    mixerSequencersRef.current.forEach(seq => seq.stop());
  }, []);

  useEffect(() => {
    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
      mixerSequencersRef.current.forEach(seq => seq.dispose());
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
    playMixerLoops,
    stopMixerLoops,
    setMixerVolumes,
    pianoNotes,
  };
}
