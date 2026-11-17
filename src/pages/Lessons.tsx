import { useState } from 'react';
import { Lock, Flame } from 'lucide-react';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { Button } from '@/components/ui/button';
import { useGameProgress } from '@/hooks/useGameProgress';
import { LESSONS, completeLesson, currentStreak, loadLessonState, todayKey, type Lesson } from '@/lib/lessons';
import { makeQuiz, type Question } from '@/lib/quiz';
import { QuizRunner, ResultCard } from '@/components/learn/QuizRunner';

const Lessons = () => {
  const { progress, addStars } = useGameProgress();
  const [state, setState] = useState(loadLessonState);
  const [active, setActive] = useState<Lesson | null>(null);
  const [intro, setIntro] = useState(true);
  const [qs, setQs] = useState<Question[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const streak = currentStreak(state);
  const doneToday = state.lastDay === todayKey();

  const start = (l: Lesson) => { setActive(l); setIntro(true); setQs(makeQuiz(l.kinds, l.pool, 6)); setResult(null); };
  const finish = (c: number) => {
    const stars = c === 6 ? 3 : c >= 4 ? 2 : 1;
    setState(completeLesson(active!.id, stars));
    addStars(stars);
    setResult(c);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-orange/10 px-4 py-6">
      <header className="mx-auto flex max-w-2xl items-center justify-between">
        <BackButton />
        <h1 className="font-fredoka text-2xl font-bold text-foreground">📚 Dagens lektion</h1>
        <StarCounter count={progress.stars} size="sm" />
      </header>
      <main className="mx-auto mt-6 max-w-2xl">
        {!active && (
          <>
            <div className="mb-6 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-lg">
              <Flame size={44} className={streak ? 'fill-secondary text-orange' : 'text-muted-foreground'} />
              <div>
                <p className="font-fredoka text-2xl font-bold text-foreground">{streak} {streak === 1 ? 'dag' : 'dagar'} i rad</p>
                <p className="text-sm text-muted-foreground">{doneToday ? 'Dagens mål klart! Kom tillbaka i morgon 🎉' : 'Gör en lektion idag för att hålla elden vid liv!'}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              {LESSONS.map((l, idx) => {
                const unlocked = idx === 0 || state.completed[LESSONS[idx - 1].id];
                const stars = state.completed[l.id] ?? 0;
                return (
                  <div key={l.id} className="flex flex-col items-center" style={{ transform: `translateX(${Math.sin(idx * 1.2) * 70}px)` }}>
                    <button disabled={!unlocked} onClick={() => start(l)} aria-label={l.title}
                      className={`bounce-click flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-lg transition-transform hover:scale-110 disabled:cursor-not-allowed ${unlocked ? (stars ? 'bg-melody' : 'bg-primary animate-pulse-glow') : 'bg-muted'}`}>
                      {unlocked ? l.emoji : <Lock className="text-muted-foreground" />}
                    </button>
                    <span className="mt-1 font-fredoka text-sm font-bold text-foreground">{l.title}</span>
                    <span className="text-xs">{stars ? '⭐'.repeat(stars) : '\u00a0'}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {active && intro && (
          <div className="animate-bounce-in rounded-3xl bg-card p-8 text-center shadow-lg">
            <div className="text-6xl">{active.emoji}</div>
            <h2 className="mt-3 font-fredoka text-2xl font-bold text-foreground">{active.title}</h2>
            <p className="mt-3 rounded-2xl bg-secondary/30 p-4 text-foreground">💡 {active.tip}</p>
            <Button onClick={() => setIntro(false)} size="lg" className="mt-5 rounded-full font-fredoka">Starta!</Button>
          </div>
        )}
        {active && !intro && result === null && <QuizRunner questions={qs} onFinish={finish} />}
        {active && result !== null && (
          <ResultCard correct={result} total={qs.length} onAgain={() => start(active)} onBack={() => setActive(null)} />
        )}
      </main>
    </div>
  );
};
export default Lessons;
