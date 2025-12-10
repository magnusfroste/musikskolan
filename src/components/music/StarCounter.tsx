import { Star } from 'lucide-react';

interface StarCounterProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarCounter({ count, size = 'md' }: StarCounterProps) {
  const sizeClasses = {
    sm: 'text-lg gap-1',
    md: 'text-2xl gap-2',
    lg: 'text-4xl gap-3',
  };

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 36,
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} font-fredoka font-bold text-secondary`}>
      <Star 
        size={iconSize[size]} 
        className="fill-secondary text-secondary animate-pulse-glow" 
        style={{ filter: 'drop-shadow(0 0 8px hsl(var(--bass-yellow)))' }}
      />
      <span className="drop-shadow-lg">{count}</span>
    </div>
  );
}
