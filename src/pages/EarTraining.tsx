import { PracticePage } from '@/components/learn/PracticePage';

const EarTraining = () => (
  <PracticePage title="Gehörslabbet" emoji="👂" intro="Träna öronen! Lyssna och gissa – ju mer du övar, desto bättre hör du."
    exercises={[
      { id: 'hl', title: 'Högt eller lågt?', emoji: '🎈', desc: 'Två toner – vilken var högst?', kinds: ['highLow'], pool: 8 },
      { id: 'sd', title: 'Samma eller olika?', emoji: '👯', desc: 'Lät tonerna likadant?', kinds: ['sameDiff'], pool: 8 },
      { id: 'h3', title: 'Hemlig ton (lätt)', emoji: '🔍', desc: 'Do, Re eller Mi?', kinds: ['hearNote'], pool: 3 },
      { id: 'h8', title: 'Hemlig ton (svår)', emoji: '🕵️', desc: 'Hela skalan Do–Do', kinds: ['hearNote'], pool: 8 },
    ]} />
);
export default EarTraining;
