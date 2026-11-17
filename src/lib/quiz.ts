// Question generators shared by lessons, ear training and note reading.
export const NOTE_POOL = [
  { note: 'C4', name: 'Do', letter: 'C', color: 'drum-red' },
  { note: 'D4', name: 'Re', letter: 'D', color: 'orange-accent' },
  { note: 'E4', name: 'Mi', letter: 'E', color: 'bass-yellow' },
  { note: 'F4', name: 'Fa', letter: 'F', color: 'melody-green' },
  { note: 'G4', name: 'Sol', letter: 'G', color: 'cyan-accent' },
  { note: 'A4', name: 'La', letter: 'A', color: 'effects-blue' },
  { note: 'B4', name: 'Si', letter: 'B', color: 'primary' },
  { note: 'C5', name: 'Do', letter: 'C', color: 'pink-accent' },
  { note: 'D5', name: 'Re', letter: 'D', color: 'orange-accent' },
  { note: 'E5', name: 'Mi', letter: 'E', color: 'bass-yellow' },
  { note: 'F5', name: 'Fa', letter: 'F', color: 'melody-green' },
];

export type QuizKind = 'highLow' | 'sameDiff' | 'hearNote' | 'readNote';

export interface QuizOption { id: string; label: string; color?: string }
export interface Question {
  kind: QuizKind;
  prompt: string;
  play?: string[];
  staffNote?: string;
  options: QuizOption[];
  answer: string;
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

/** poolSize = how many notes from NOTE_POOL are in play (3–11). */
export function makeQuestion(kind: QuizKind, poolSize = 3): Question {
  const pool = NOTE_POOL.slice(0, Math.max(2, Math.min(poolSize, NOTE_POOL.length)));
  if (kind === 'highLow') {
    const [a, b] = shuffle(pool).slice(0, 2);
    const higher = NOTE_POOL.indexOf(b) > NOTE_POOL.indexOf(a);
    return {
      kind, prompt: 'Var den andra tonen högre eller lägre?', play: [a.note, b.note],
      options: [{ id: 'high', label: '⬆️ Högre' }, { id: 'low', label: '⬇️ Lägre' }],
      answer: higher ? 'high' : 'low',
    };
  }
  if (kind === 'sameDiff') {
    const a = pick(pool);
    const same = Math.random() < 0.5;
    const b = same ? a : pick(pool.filter(n => n !== a));
    return {
      kind, prompt: 'Var tonerna likadana eller olika?', play: [a.note, b.note],
      options: [{ id: 'same', label: '🟰 Samma' }, { id: 'diff', label: '↔️ Olika' }],
      answer: same ? 'same' : 'diff',
    };
  }
  const target = pick(pool);
  const distractors = shuffle(pool.filter(n => n.note !== target.note && n.name !== target.name)).slice(0, 2);
  const options = shuffle([target, ...distractors]).map(n => ({ id: n.note, label: `${n.name} (${n.letter})`, color: n.color }));
  if (kind === 'hearNote') {
    return { kind, prompt: 'Lyssna på Do, sedan på en hemlig ton. Vilken var den?', play: ['C4', target.note], options, answer: target.note };
  }
  return { kind, prompt: 'Vilken not är det här?', staffNote: target.note, play: [target.note], options, answer: target.note };
}

export function makeQuiz(kinds: QuizKind[], poolSize: number, count = 5): Question[] {
  return Array.from({ length: count }, (_, i) => makeQuestion(kinds[i % kinds.length], poolSize));
}
