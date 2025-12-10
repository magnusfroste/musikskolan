import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

export function ModuleCard({ to, icon: Icon, title, description, color, delay = 0 }: ModuleCardProps) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-105 bounce-click"
      style={{ 
        backgroundColor: `hsl(var(--${color}))`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform group-hover:scale-150" />
      
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm transition-transform group-hover:rotate-12">
          <Icon size={48} className="text-white drop-shadow-lg" />
        </div>
        <div>
          <h2 className="font-fredoka text-2xl font-bold text-white drop-shadow-lg">{title}</h2>
          <p className="mt-1 text-sm text-white/80">{description}</p>
        </div>
      </div>
    </Link>
  );
}
