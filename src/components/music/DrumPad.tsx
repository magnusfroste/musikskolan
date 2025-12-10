import { useState } from 'react';

interface DrumPadProps {
  label: string;
  emoji: string;
  color: string;
  onPlay: () => void;
}

export function DrumPad({ label, emoji, color, onPlay }: DrumPadProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    onPlay();
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <button
      onMouseDown={handlePress}
      onTouchStart={handlePress}
      className={`
        relative flex flex-col items-center justify-center gap-1 
        rounded-2xl p-4 transition-all duration-150
        ${isPressed ? 'scale-90 brightness-110' : 'hover:scale-105'}
        bounce-click shadow-lg
      `}
      style={{ 
        backgroundColor: `hsl(var(--${color}))`,
        boxShadow: isPressed 
          ? `0 0 30px hsl(var(--${color}) / 0.8), inset 0 0 20px rgba(255,255,255,0.3)` 
          : `0 8px 20px hsl(var(--${color}) / 0.4)`,
      }}
    >
      <span className="text-4xl drop-shadow-md">{emoji}</span>
      <span className="font-fredoka text-sm font-semibold text-white drop-shadow-md">{label}</span>
      {isPressed && (
        <div className="absolute inset-0 rounded-2xl bg-white/30 animate-ping" />
      )}
    </button>
  );
}
