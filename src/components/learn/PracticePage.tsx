import { useState } from 'react';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { useGameProgress } from '@/hooks/useGameProgress';
import { makeQuiz, type Question, type QuizKind } from '@/lib/quiz';
import { QuizRunner, ResultCard } from './QuizRunner';

export interface Exercise { id: string; title: string; emoji: string; desc: string; kinds: QuizKind[]; pool: number }

export function PracticePage({ title, emoji, intro, exercises }: { title: string; emoji: string; intro: string; exercises: Exercise[] }) {
  const { progress, addStars } = useGameProgress();
  const [active, setActive] = useState<Exercise | null>(null);
  const [qs, setQs] = useState<Question[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const start = (e: Exercise) => { setActive(e); setQs(makeQuiz(e.kinds, e.pool, 8)); setResult(null); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 px-4 py-6">
      <header className="mx-auto flex max-w-2xl items-center justify-between">
        <BackButton />
        <h1 className="font-fredoka text-2xl font-bold text-foreground">{emoji} {title}</h1>
        <StarCounter count={progress.stars} size="sm" />
      </header>
      <main className="mx-auto mt-6 max-w-2xl">
        {!active && (
          <>
            <p className="mb-4 text-center text-muted-foreground">{intro}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {exercises.map(e => (
                <button key={e.id} onClick={() => start(e)} className="bounce-click rounded-3xl bg-card p-5 text-left shadow-lg transition-all hover:scale-105">
                  <div className="text-4xl">{e.emoji}</div>
                  <h2 className="mt-2 font-fredoka text-xl font-bold text-foreground">{e.title}</h2>
                  <p className="text-sm text-muted-foreground">{e.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}
        {active && result === null && (
          <QuizRunner key={qs.map(q => q.answer).join()} questions={qs} onFinish={c => { setResult(c); addStars(Math.max(1, Math.round(c / 3))); }} />
        )}
        {active && result !== null && (
          <ResultCard correct={result} total={qs.length} onAgain={() => start(active)} onBack={() => setActive(null)} />
        )}
      </main>
    </div>
  );
}
