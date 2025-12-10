import { Drum, Piano, Headphones, Trophy, Music } from "lucide-react";
import { StarCounter } from "@/components/music/StarCounter";
import { ModuleCard } from "@/components/music/ModuleCard";
import { useGameProgress } from "@/hooks/useGameProgress";

const Index = () => {
  const { progress } = useGameProgress();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 px-4 py-6">
      {/* Header */}
      <header className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-float rounded-2xl bg-primary p-3 shadow-lg">
              <Music size={32} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-fredoka text-2xl font-bold text-foreground md:text-3xl">Musikikubik</h1>
              <p className="text-sm text-muted-foreground">Skapa din egen musik! 🎵</p>
            </div>
          </div>
          <StarCounter count={progress.stars} />
        </div>
      </header>

      {/* Main navigation */}
      <main className="mx-auto mt-8 max-w-2xl">
        <div className="mb-6 text-center">
          <p className="font-fredoka text-xl text-foreground">Vad vill du göra idag?</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ModuleCard
            to="/drum-room"
            icon={Drum}
            title="Trumrummet"
            description="Skapa coola beats!"
            color="drum-red"
            delay={0}
          />
          <ModuleCard
            to="/piano-park"
            icon={Piano}
            title="Pianoparken"
            description="Spela melodier!"
            color="melody-green"
            delay={100}
          />
          <ModuleCard
            to="/mixer-studio"
            icon={Headphones}
            title="Mixerstudion"
            description="Mixa din musik!"
            color="effects-blue"
            delay={200}
          />
          <ModuleCard
            to="/my-room"
            icon={Trophy}
            title="Mitt Rum"
            description="Dina låtar & märken"
            color="pink-accent"
            delay={300}
          />
        </div>

        {/* Recent badges */}
        {progress.badges.length > 0 && (
          <div className="mt-8 rounded-2xl bg-card p-4 shadow-lg">
            <h2 className="mb-3 font-fredoka text-lg font-bold text-foreground">Senaste märken 🏆</h2>
            <div className="flex flex-wrap gap-3">
              {progress.badges.slice(-3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-2 rounded-xl bg-secondary/30 px-3 py-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="font-semibold text-foreground">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Decorative elements */}
      <div className="fixed -bottom-20 -left-20 h-40 w-40 rounded-full bg-drum/20 blur-3xl" />
      <div className="fixed -bottom-20 -right-20 h-40 w-40 rounded-full bg-melody/20 blur-3xl" />
    </div>
  );
};

export default Index;
