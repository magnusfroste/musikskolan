import { PracticePage } from '@/components/learn/PracticePage';

const NoteSchool = () => (
  <PracticePage title="Notskolan" emoji="🎼" intro="Lär dig läsa riktiga noter! Varje linje och mellanrum är en egen ton."
    exercises={[
      { id: 'n1', title: 'Nivå 1', emoji: '🐣', desc: 'Do, Re, Mi', kinds: ['readNote'], pool: 3 },
      { id: 'n2', title: 'Nivå 2', emoji: '🐥', desc: 'Do till Sol', kinds: ['readNote'], pool: 5 },
      { id: 'n3', title: 'Nivå 3', emoji: '🦜', desc: 'Hela skalan Do–Do', kinds: ['readNote'], pool: 8 },
      { id: 'n4', title: 'Nivå 4', emoji: '🦅', desc: 'Upp till höga Fa', kinds: ['readNote'], pool: 11 },
    ]} />
);
export default NoteSchool;
