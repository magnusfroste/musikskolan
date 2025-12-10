import { useState, useEffect } from 'react';

export interface SavedSong {
  id: string;
  name: string;
  createdAt: Date;
  type: 'beat' | 'melody' | 'mix';
  data: any;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface GameProgress {
  stars: number;
  badges: Badge[];
  savedSongs: SavedSong[];
  achievements: {
    firstBeat: boolean;
    firstMelody: boolean;
    firstMix: boolean;
    beatMaster: boolean;
    melodyMaker: boolean;
    mixMaster: boolean;
  };
}

const INITIAL_PROGRESS: GameProgress = {
  stars: 0,
  badges: [],
  savedSongs: [],
  achievements: {
    firstBeat: false,
    firstMelody: false,
    firstMix: false,
    beatMaster: false,
    melodyMaker: false,
    mixMaster: false,
  },
};

const ALL_BADGES: Badge[] = [
  { id: 'first-beat', name: 'Första Beatet!', description: 'Skapa ditt första trumkomp', icon: '🥁' },
  { id: 'first-melody', name: 'Första Melodin!', description: 'Spela din första melodi', icon: '🎹' },
  { id: 'first-mix', name: 'Första Låten!', description: 'Mixa din första låt', icon: '🎧' },
  { id: 'beat-master', name: 'Beatmästare', description: 'Spara 5 beats', icon: '⭐' },
  { id: 'melody-maker', name: 'Melodimakare', description: 'Spara 5 melodier', icon: '🌟' },
  { id: 'mix-master', name: 'Mixmästare', description: 'Spara 5 låtar', icon: '🏆' },
];

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(INITIAL_PROGRESS);

  useEffect(() => {
    const saved = localStorage.getItem('musicmaker-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
      } catch (e) {
        console.error('Failed to parse saved progress:', e);
      }
    }
  }, []);

  const saveProgress = (newProgress: GameProgress) => {
    setProgress(newProgress);
    localStorage.setItem('musicmaker-progress', JSON.stringify(newProgress));
  };

  const addStars = (count: number) => {
    saveProgress({ ...progress, stars: progress.stars + count });
  };

  const unlockBadge = (badgeId: string) => {
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (badge && !progress.badges.find(b => b.id === badgeId)) {
      const unlockedBadge = { ...badge, unlockedAt: new Date() };
      saveProgress({
        ...progress,
        badges: [...progress.badges, unlockedBadge],
        stars: progress.stars + 5,
      });
      return true;
    }
    return false;
  };

  const saveSong = (song: Omit<SavedSong, 'id' | 'createdAt'>) => {
    const newSong: SavedSong = {
      ...song,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const newSongs = [...progress.savedSongs, newSong];
    let newAchievements = { ...progress.achievements };
    let badgesToUnlock: string[] = [];

    // Check achievements
    const beatCount = newSongs.filter(s => s.type === 'beat').length;
    const melodyCount = newSongs.filter(s => s.type === 'melody').length;
    const mixCount = newSongs.filter(s => s.type === 'mix').length;

    if (song.type === 'beat' && !newAchievements.firstBeat) {
      newAchievements.firstBeat = true;
      badgesToUnlock.push('first-beat');
    }
    if (song.type === 'melody' && !newAchievements.firstMelody) {
      newAchievements.firstMelody = true;
      badgesToUnlock.push('first-melody');
    }
    if (song.type === 'mix' && !newAchievements.firstMix) {
      newAchievements.firstMix = true;
      badgesToUnlock.push('first-mix');
    }
    if (beatCount >= 5 && !newAchievements.beatMaster) {
      newAchievements.beatMaster = true;
      badgesToUnlock.push('beat-master');
    }
    if (melodyCount >= 5 && !newAchievements.melodyMaker) {
      newAchievements.melodyMaker = true;
      badgesToUnlock.push('melody-maker');
    }
    if (mixCount >= 5 && !newAchievements.mixMaster) {
      newAchievements.mixMaster = true;
      badgesToUnlock.push('mix-master');
    }

    let newBadges = [...progress.badges];
    badgesToUnlock.forEach(badgeId => {
      const badge = ALL_BADGES.find(b => b.id === badgeId);
      if (badge && !newBadges.find(b => b.id === badgeId)) {
        newBadges.push({ ...badge, unlockedAt: new Date() });
      }
    });

    saveProgress({
      ...progress,
      savedSongs: newSongs,
      achievements: newAchievements,
      badges: newBadges,
      stars: progress.stars + 1 + (badgesToUnlock.length * 5),
    });

    return { song: newSong, newBadges: badgesToUnlock };
  };

  const deleteSong = (songId: string) => {
    saveProgress({
      ...progress,
      savedSongs: progress.savedSongs.filter(s => s.id !== songId),
    });
  };

  return {
    progress,
    addStars,
    unlockBadge,
    saveSong,
    deleteSong,
    allBadges: ALL_BADGES,
  };
}
