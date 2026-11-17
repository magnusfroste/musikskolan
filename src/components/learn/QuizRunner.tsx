import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAudio } from '@/hooks/useAudio';
import { NOTE_POOL, type Question } from '@/lib/quiz';
import { Staff } from './Staff';

interface Props { questions: Question[]; onFinish: (correct: number) => void }

const PRAISE = ['Snyggt! 🎉', 'Rätt! ⭐', 'Wow! 🌟', 'Du är grym! 🔥'];

export function QuizRunner({ questions, onFinish }: Props) {
  const { playNote } = useAudio();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[i];

  const play = () => q.play?.forEach((n, k) => setTimeout(() => playNote(n), k * 700));
  useEffect(() => { if (q.kind !== 'readNote') play(); /* eslint-disable-next-line */ }, [i]);

  const choose = (id: string) => {
    if (chosen) return;
    setChosen(id);
    if (id === q.answer) setCorrect(c => c + 1);
    if (q.kind === 'readNote') playNote(q.answer);
  };
  const next = () => {
    if (i + 1 >= questions.length) return onFinish(correct);
    setI(i + 1); setChosen(null);
  };
  const isRight = chosen === q.answer;
  const staffColor = NOTE_POOL.find(n => n.note === q.staffNote)?.color;

  return (
    <div className="space-y-5">
      <Progress value={(i / questions.length) * 100} className="h-3" />
      <div className="rounded-3xl bg-card p-6 text-center shadow-lg">
        <p className="font-fredoka text-xl font-bold text-foreground">{q.prompt}</p>
        {q.staffNote && <div className="mt-4"><Staff note={q.staffNote} color={chosen ? staffColor : 'muted-foreground'} /></div>}
        {q.kind !== 'readNote' && (
          <Button onClick={play} size="lg" className="mt-4 rounded-full font-fredoka"><Volume2 /> Lyssna igen</Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {q.options.map(o => {
          const state = chosen && (o.id === q.answer ? 'ring-4 ring-melody' : o.id === chosen ? 'ring-4 ring-destructive opacity-70' : 'opacity-50');
          return (
            <button key={o.id} onClick={() => choose(o.id)}
              className={`bounce-click rounded-2xl bg-card p-4 font-fredoka text-lg font-bold text-foreground shadow-md transition-all hover:scale-105 ${state || ''}`}
              style={o.color ? { borderBottom: `6px solid hsl(var(--${o.color}))` } : undefined}>
              {o.label}
            </button>
          );
        })}
      </div>
      {chosen && (
        <div className={`animate-bounce-in flex items-center justify-between rounded-2xl p-4 ${isRight ? 'bg-melody/20' : 'bg-destructive/15'}`}>
          <span className="font-fredoka text-lg font-bold text-foreground">
            {isRight ? PRAISE[i % PRAISE.length] : `Nästan! Rätt svar: ${q.options.find(o => o.id === q.answer)?.label}`}
          </span>
          <Button onClick={next} className="rounded-full font-fredoka">{i + 1 >= questions.length ? 'Klar!' : 'Nästa'}</Button>
        </div>
      )}
    </div>
  );
}

export function ResultCard({ correct, total, onAgain, onBack }: { correct: number; total: number; onAgain: () => void; onBack: () => void }) {
  const stars = correct === total ? 3 : correct >= total * 0.6 ? 2 : 1;
  return (
    <div className="animate-bounce-in rounded-3xl bg-card p-8 text-center shadow-lg">
      <div className="text-5xl">{'⭐'.repeat(stars)}</div>
      <h2 className="mt-3 font-fredoka text-2xl font-bold text-foreground">{correct} av {total} rätt!</h2>
      <p className="mt-1 text-muted-foreground">{stars === 3 ? 'Perfekt! Du är en musikstjärna!' : 'Bra jobbat – öva igen så blir du ännu bättre!'}</p>
      <div className="mt-5 flex justify-center gap-3">
        <Button onClick={onAgain} className="rounded-full font-fredoka">Igen!</Button>
        <Button onClick={onBack} variant="outline" className="rounded-full font-fredoka">Tillbaka</Button>
      </div>
    </div>
  );
}
