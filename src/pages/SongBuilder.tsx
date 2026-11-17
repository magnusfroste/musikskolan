import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Play, Square, Trash2, Save } from 'lucide-react';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useToast } from '@/hooks/use-toast';

type PartId = 'intro' | 'vers' | 'refrang' | 'brygga' | 'slut';
const PARTS: Record<PartId, { label: string; emoji: string; color: string; chords: string[][]; melody: (string | null)[]; drums: 'soft' | 'full' | 'none' }> = {
  intro:   { label: 'Intro', emoji: '🌅', color: 'cyan-accent', drums: 'none', chords: [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']], melody: ['G5', null, 'E5', null, 'C5', null, null, null] },
  vers:    { label: 'Vers', emoji: '📖', color: 'effects-blue', drums: 'soft', chords: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']], melody: ['E5', 'D5', 'C5', 'D5', 'E5', 'E5', 'D5', null] },
  refrang: { label: 'Refräng', emoji: '🎤', color: 'drum-red', drums: 'full', chords: [['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['A3', 'C4', 'E4']], melody: ['C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5'] },
  brygga:  { label: 'Brygga', emoji: '🌉', color: 'melody-green', drums: 'soft', chords: [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['D4', 'F4', 'A4'], ['G3', 'B3', 'D4']], melody: ['A4', null, 'C5', null, 'D5', null, 'B4', null] },
  slut:    { label: 'Slut', emoji: '🏁', color: 'pink-accent', drums: 'none', chords: [['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['C4', 'E4', 'G4']], melody: ['E5', 'D5', 'C5', null, null, null, null, null] },
};
const MAX = 10;

const SongBuilder = () => {
  const { progress, saveSong } = useGameProgress();
  const { toast } = useToast();
  const [song, setSong] = useState<PartId[]>(['intro', 'vers', 'refrang', 'slut']);
  const [tempo, setTempo] = useState(100);
  const [playing, setPlaying] = useState<number | null>(null);
  const nodes = useRef<{ dispose: () => void }[]>([]);
  const timers = useRef<number[]>([]);

  const stop = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    nodes.current.forEach(n => { try { n.dispose(); } catch { /* ignore */ } }); nodes.current = [];
    setPlaying(null);
  };
  useEffect(() => stop, []);

  const play = async () => {
    stop();
    await Tone.start();
    const chord = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.05, release: 0.6 } }).toDestination();
    chord.volume.value = -14;
    const lead = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3 } }).toDestination();
    lead.volume.value = -18;
    const kick = new Tone.MembraneSynth().toDestination(); kick.volume.value = -6;
    const snare = new Tone.NoiseSynth({ envelope: { attack: 0.005, decay: 0.12, sustain: 0 } }).toDestination(); snare.volume.value = -16;
    const hat = new Tone.MetalSynth({ envelope: { decay: 0.05 } }).toDestination(); hat.volume.value = -28;
    nodes.current = [chord, lead, kick, snare, hat];

    const safe = (name: string, f: () => void) => { try { f(); } catch (e) { void name; void e; } };
    const beat = 60 / tempo;
    const t0 = Tone.now() + 0.1;
    song.forEach((id, s) => {
      const p = PARTS[id];
      const start = t0 + s * 8 * beat;
      p.chords.forEach((c, k) => safe('chord', () => chord.triggerAttackRelease(c, beat * 1.9, start + k * 2 * beat)));
      p.melody.forEach((n, k) => n && safe('lead', () => lead.triggerAttackRelease(n, beat * 0.8, start + k * beat)));
      for (let b = 0; b < 8; b++) {
        const t = start + b * beat;
        if (p.drums === 'none') continue;
        if (b % 2 === 0) safe('kick', () => kick.triggerAttackRelease('C1', '8n', t));
        if (b % 2 === 1) safe('snare', () => snare.triggerAttackRelease('8n', t));
        if (p.drums === 'full') { safe('hat', () => hat.triggerAttackRelease('32n', t)); safe('hat', () => hat.triggerAttackRelease('32n', t + beat / 2)); }
      }
      timers.current.push(window.setTimeout(() => setPlaying(s), (start - Tone.now()) * 1000));
    });
    timers.current.push(window.setTimeout(stop, (song.length * 8 * beat + 0.8) * 1000));
  };

  const save = () => {
    const name = prompt('Vad ska din låt heta?', 'Min låt');
    if (!name) return;
    const { newBadges } = saveSong({ name, type: 'mix', data: { song, tempo } });
    toast({ title: 'Låten är sparad! 🎉', description: newBadges.length ? 'Du fick ett nytt märke!' : 'Hitta den i Mitt Rum.' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-cyan/10 px-4 py-6">
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <BackButton />
        <h1 className="font-fredoka text-2xl font-bold text-foreground">🧩 Låtbyggaren</h1>
        <StarCounter count={progress.stars} size="sm" />
      </header>
      <main className="mx-auto mt-6 max-w-3xl space-y-6">
        <p className="text-center text-muted-foreground">Riktiga låtar har delar: intro, vers, refräng… Tryck på en del för att lägga till den i din låt!</p>
        <section className="grid grid-cols-5 gap-2">
          {(Object.keys(PARTS) as PartId[]).map(id => (
            <button key={id} onClick={() => song.length < MAX && setSong([...song, id])}
              className="bounce-click rounded-2xl p-3 text-center font-fredoka font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: `hsl(var(--${PARTS[id].color}))` }}>
              <div className="text-3xl">{PARTS[id].emoji}</div>{PARTS[id].label}
            </button>
          ))}
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-lg">
          <h2 className="mb-3 font-fredoka text-lg font-bold text-foreground">Din låt ({song.length}/{MAX} delar)</h2>
          {song.length === 0 && <p className="text-muted-foreground">Tom än – lägg till delar ovanför!</p>}
          <div className="flex flex-wrap gap-2">
            {song.map((id, i) => (
              <div key={i} className={`relative flex min-w-20 flex-col items-center rounded-2xl p-2 font-fredoka text-sm font-bold text-primary-foreground transition-transform ${playing === i ? 'scale-110 animate-pulse-glow' : ''}`}
                style={{ backgroundColor: `hsl(var(--${PARTS[id].color}))` }}>
                <span className="text-2xl">{PARTS[id].emoji}</span>{PARTS[id].label}
                <button aria-label="Ta bort" onClick={() => setSong(song.filter((_, k) => k !== i))}
                  className="absolute -right-2 -top-2 rounded-full bg-card p-1 text-destructive shadow"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-card p-4 shadow-lg">
          <div className="flex items-center justify-between font-fredoka font-bold text-foreground"><span>Tempo</span><span>{tempo} BPM</span></div>
          <Slider value={[tempo]} min={70} max={150} step={5} onValueChange={v => setTempo(v[0])} className="mt-3" disabled={playing !== null} />
        </section>

        <div className="flex justify-center gap-3">
          {playing === null
            ? <Button size="lg" onClick={play} disabled={!song.length} className="rounded-full font-fredoka"><Play /> Spela låten</Button>
            : <Button size="lg" onClick={stop} variant="destructive" className="rounded-full font-fredoka"><Square /> Stoppa</Button>}
          <Button size="lg" variant="outline" onClick={save} disabled={!song.length} className="rounded-full font-fredoka"><Save /> Spara</Button>
        </div>
        <p className="rounded-2xl bg-secondary/30 p-4 text-center text-sm text-foreground">💡 Tips: Refrängen är den del man sjunger med i – prova att ha den flera gånger!</p>
      </main>
    </div>
  );
};
export default SongBuilder;
