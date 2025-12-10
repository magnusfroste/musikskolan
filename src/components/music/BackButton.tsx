import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function BackButton() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 font-fredoka font-semibold text-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl bounce-click"
    >
      <Home size={20} />
      <span>Hem</span>
    </Link>
  );
}
