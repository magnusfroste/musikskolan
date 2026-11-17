import type { QuizKind } from './quiz';

export interface Lesson { id: string; title: string; emoji: string; kinds: QuizKind[]; pool: number; tip: string }

export const LESSONS: Lesson[] = [
  { id: 'l1', title: 'Höga & låga toner', emoji: '🎈', kinds: ['highLow'], pool: 8, tip: 'Höga toner låter som en fågel, låga som en björn!' },
  { id: 'l2', title: 'Samma eller olika?', emoji: '👯', kinds: ['sameDiff'], pool: 5, tip: 'Lyssna noga – ibland är skillnaden liten.' },
  { id: 'l3', title: 'Möt Do, Re, Mi', emoji: '🎵', kinds: ['readNote'], pool: 3, tip: 'Do sitter på en egen liten linje under notraderna.' },
  { id: 'l4', title: 'Hör Do, Re, Mi', emoji: '👂', kinds: ['hearNote'], pool: 3, tip: 'Jämför alltid med Do – är den hemliga tonen långt bort?' },
  { id: 'l5', title: 'Fa och Sol', emoji: '☀️', kinds: ['readNote', 'hearNote'], pool: 5, tip: 'Noterna klättrar en linje eller ett mellanrum i taget.' },
  { id: 'l6', title: 'La och Si', emoji: '🪜', kinds: ['readNote', 'highLow'], pool: 7, tip: 'Si ligger precis på mittenlinjen.' },
  { id: 'l7', title: 'Hela skalan', emoji: '🌈', kinds: ['readNote', 'hearNote', 'highLow'], pool: 8, tip: 'Do Re Mi Fa Sol La Si Do – du kan hela skalan!' },
  { id: 'l8', title: 'Högt uppe', emoji: '🚀', kinds: ['readNote', 'hearNote'], pool: 11, tip: 'Över översta linjen fortsätter skalan igen.' },
];

export interface LessonState { completed: Record<string, number>; streak: number; lastDay: string | null }
const KEY = 'musikskolan-lessons';

export const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export function loadLessonState(): LessonState {
  try { return { completed: {}, streak: 0, lastDay: null, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { completed: {}, streak: 0, lastDay: null }; }
}

/** Streak: +1 for the first lesson on a new consecutive day, reset to 1 after a missed day. */
export function nextStreak(state: LessonState, today: string): number {
  if (state.lastDay === today) return state.streak;
  const y = new Date(today); y.setDate(y.getDate() - 1);
  return state.lastDay === todayKey(y) ? state.streak + 1 : 1;
}

/** Visible streak: 0 if the last lesson was before yesterday. */
export function currentStreak(state: LessonState, today = todayKey()): number {
  if (!state.lastDay) return 0;
  const y = new Date(today); y.setDate(y.getDate() - 1);
  return state.lastDay === today || state.lastDay === todayKey(y) ? state.streak : 0;
}

export function completeLesson(id: string, stars: number): LessonState {
  const s = loadLessonState();
  const today = todayKey();
  const next: LessonState = {
    completed: { ...s.completed, [id]: Math.max(s.completed[id] ?? 0, stars) },
    streak: nextStreak(s, today),
    lastDay: today,
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
