import { useState } from 'react';
import { Play, Trash2, Music, Award, Star } from 'lucide-react';
import { BackButton } from '@/components/music/BackButton';
import { StarCounter } from '@/components/music/StarCounter';
import { useGameProgress, SavedSong, Badge } from '@/hooks/useGameProgress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const typeEmojis = {
  beat: '🥁',
  melody: '🎹',
  mix: '🎧',
};

const typeLabels = {
  beat: 'Beat',
  melody: 'Melodi',
  mix: 'Mix',
};

const MyRoom = () => {
  const { progress, deleteSong, allBadges } = useGameProgress();
  const [playingSong, setPlayingSong] = useState<string | null>(null);

  const handlePlay = (song: SavedSong) => {
    setPlayingSong(song.id);
    // Simulate playing
    setTimeout(() => setPlayingSong(null), 3000);
  };

  const handleDelete = (songId: string) => {
    if (confirm('Vill du verkligen ta bort den här låten?')) {
      deleteSong(songId);
    }
  };

  const unlockedBadgeIds = progress.badges.map(b => b.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-pink/10 px-4 py-6">
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <h1 className="font-fredoka text-2xl font-bold text-foreground">Mitt Rum</h1>
        </div>
        <StarCounter count={progress.stars} size="sm" />
      </header>

      <main className="mx-auto mt-6 max-w-4xl">
        {/* Stats */}
        <section className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center shadow-lg">
            <div className="text-3xl">🎵</div>
            <div className="font-fredoka text-2xl font-bold text-foreground">
              {progress.savedSongs.length}
            </div>
            <div className="text-sm text-muted-foreground">Låtar</div>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center shadow-lg">
            <div className="text-3xl">🏅</div>
            <div className="font-fredoka text-2xl font-bold text-foreground">
              {progress.badges.length}
            </div>
            <div className="text-sm text-muted-foreground">Märken</div>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center shadow-lg">
            <div className="text-3xl">⭐</div>
            <div className="font-fredoka text-2xl font-bold text-secondary">
              {progress.stars}
            </div>
            <div className="text-sm text-muted-foreground">Stjärnor</div>
          </div>
        </section>

        <Tabs defaultValue="songs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger 
              value="songs" 
              className="gap-2 rounded-lg font-fredoka data-[state=active]:bg-card"
            >
              <Music size={18} />
              Mina låtar
            </TabsTrigger>
            <TabsTrigger 
              value="badges"
              className="gap-2 rounded-lg font-fredoka data-[state=active]:bg-card"
            >
              <Award size={18} />
              Märken
            </TabsTrigger>
          </TabsList>

          <TabsContent value="songs" className="mt-4">
            {progress.savedSongs.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 text-center shadow-lg">
                <div className="text-5xl">🎶</div>
                <h3 className="mt-4 font-fredoka text-xl font-bold text-foreground">
                  Inga låtar än!
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Gå till Trumrummet, Pianoparken eller Mixerstudion för att skapa musik!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {progress.savedSongs.map((song) => (
                  <div
                    key={song.id}
                    className={`flex items-center gap-4 rounded-2xl bg-card p-4 shadow-lg transition-all ${
                      playingSong === song.id ? 'ring-2 ring-primary animate-pulse' : ''
                    }`}
                  >
                    <div className="text-3xl">{typeEmojis[song.type]}</div>
                    <div className="flex-1">
                      <h3 className="font-fredoka font-bold text-foreground">{song.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {typeLabels[song.type]} • {new Date(song.createdAt).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlay(song)}
                        size="icon"
                        className="h-10 w-10 rounded-full bg-melody hover:bg-melody/90"
                      >
                        <Play size={20} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(song.id)}
                        size="icon"
                        variant="outline"
                        className="h-10 w-10 rounded-full border-2 border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 size={18} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {allBadges.map((badge) => {
                const isUnlocked = unlockedBadgeIds.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`relative rounded-2xl p-4 text-center transition-all ${
                      isUnlocked 
                        ? 'bg-card shadow-lg' 
                        : 'bg-muted/50 opacity-50'
                    }`}
                  >
                    {isUnlocked && (
                      <div className="absolute -right-1 -top-1">
                        <Star size={20} className="fill-secondary text-secondary" />
                      </div>
                    )}
                    <div className={`text-4xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    <h3 className="mt-2 font-fredoka font-bold text-foreground">
                      {badge.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                    {isUnlocked && (
                      <div className="mt-2 text-xs font-semibold text-melody">
                        ✓ Upplåst!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Decorative */}
      <div className="fixed -bottom-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-secondary/20 blur-3xl" />
    </div>
  );
};

export default MyRoom;
