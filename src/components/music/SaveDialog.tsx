import { useState } from 'react';
import { Save, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  type: 'beat' | 'melody' | 'mix';
}

const funNames = {
  beat: ['Coolt Beat', 'Dansgroove', 'Superrytm', 'Partybeat', 'Häftigt Komp'],
  melody: ['Fin Melodi', 'Glad Sång', 'Trollmelodi', 'Stjärnsång', 'Drömmusik'],
  mix: ['Min Låt', 'Supermix', 'Partylåt', 'Häftig Mix', 'Dansmusik'],
};

export function SaveDialog({ isOpen, onClose, onSave, type }: SaveDialogProps) {
  const [name, setName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalName = name.trim() || funNames[type][Math.floor(Math.random() * funNames[type].length)];
    setShowConfetti(true);
    setTimeout(() => {
      onSave(finalName);
      setName('');
      setShowConfetti(false);
      onClose();
    }, 500);
  };

  const suggestName = () => {
    setName(funNames[type][Math.floor(Math.random() * funNames[type].length)]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="relative w-full max-w-md animate-bounce-in rounded-3xl bg-card p-6 shadow-2xl">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '50%',
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                <Sparkles 
                  size={20} 
                  className="text-secondary" 
                  style={{ color: `hsl(${Math.random() * 360}, 80%, 60%)` }}
                />
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted"
        >
          <X size={24} />
        </button>
        
        <div className="text-center">
          <div className="mb-4 text-5xl">
            {type === 'beat' ? '🥁' : type === 'melody' ? '🎹' : '🎧'}
          </div>
          <h2 className="font-fredoka text-2xl font-bold text-foreground">
            Spara din {type === 'beat' ? 'rytm' : type === 'melody' ? 'melodi' : 'låt'}!
          </h2>
          <p className="mt-2 text-muted-foreground">Ge den ett roligt namn</p>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Skriv ett namn..."
              className="rounded-xl border-2 border-primary/30 text-lg focus:border-primary"
            />
            <Button
              onClick={suggestName}
              variant="outline"
              className="rounded-xl border-2 border-secondary hover:bg-secondary/20"
            >
              <Sparkles size={20} className="text-secondary" />
            </Button>
          </div>
          
          <Button
            onClick={handleSave}
            className="w-full gap-2 rounded-xl bg-primary py-6 text-lg font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Save size={24} />
            Spara!
          </Button>
        </div>
      </div>
    </div>
  );
}
