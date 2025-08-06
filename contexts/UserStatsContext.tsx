import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserStats {
  totalStoriesRead: number;
  totalListeningTime: number; // in minutes
  favoriteGenre: string;
  readingStreak: number; // days
  storiesCreated: number;
  averageRating: number;
  lastActiveDate: string;
  streakStartDate: string;
  weeklyGoal: number; // stories per week
  monthlyListenTime: number; // minutes this month
  completedStories: string[]; // story IDs
  listeningHistory: ListeningSession[];
  // Enhanced real-time tracking
  todayListeningTime: number;
  currentWeekStories: number;
  currentMonthStories: number;
  longestStreak: number;
  completionRate: number; // percentage of stories completed vs started
  favoriteCategories: { [key: string]: number }; // category: count
  dailyGoal: number; // minutes per day
  lastSessionDate: string;
  totalSessions: number;
  averageSessionLength: number; // minutes
  achievementsUnlocked: Achievement[];
  currentLevel: number;
  experiencePoints: number;
}

export interface ListeningSession {
  storyId: string;
  storyTitle: string;
  storyCategory: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  completed: boolean;
  progress: number; // percentage (0-100)
  pauseCount: number;
  sessionId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate: string;
  category: 'streak' | 'listening' | 'completion' | 'exploration' | 'social';
  points: number;
}

interface UserStatsContextType {
  userStats: UserStats;
  updateStats: (updates: Partial<UserStats>) => void;
  addListeningSession: (session: ListeningSession) => void;
  markStoryCompleted: (storyId: string, category?: string) => void;
  updateReadingStreak: () => void;
  resetStats: () => void;
  // Enhanced real-time methods
  startListeningSession: (storyId: string, storyTitle: string, storyCategory: string) => string;
  updateSessionProgress: (sessionId: string, progress: number, duration: number) => void;
  endListeningSession: (sessionId: string, completed: boolean) => void;
  trackStoryStart: (storyId: string, category: string) => void;
  checkAchievements: () => Achievement[];
  getTodayStats: () => { storiesRead: number; listeningTime: number; sessionsCount: number };
  getWeekStats: () => { storiesRead: number; listeningTime: number; goalProgress: number };
  getMonthStats: () => { storiesRead: number; listeningTime: number; averageDaily: number };
  isStreakActive: () => boolean;
  getRealtimeProgress: () => {
    dailyProgress: number;
    weeklyProgress: number;
    streakStatus: 'active' | 'inactive' | 'at_risk';
    nextAchievement: Achievement | null;
  };
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

const USER_STATS_STORAGE_KEY = '@echo_user_stats';

const defaultUserStats: UserStats = {
  totalStoriesRead: 0,
  totalListeningTime: 0,
  favoriteGenre: "Adventure",
  readingStreak: 0,
  storiesCreated: 0,
  averageRating: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakStartDate: new Date().toISOString().split('T')[0],
  weeklyGoal: 5,
  monthlyListenTime: 0,
  completedStories: [],
  listeningHistory: [],
  // Enhanced real-time tracking defaults
  todayListeningTime: 0,
  currentWeekStories: 0,
  currentMonthStories: 0,
  longestStreak: 0,
  completionRate: 0,
  favoriteCategories: {},
  dailyGoal: 30, // 30 minutes per day
  lastSessionDate: new Date().toISOString().split('T')[0],
  totalSessions: 0,
  averageSessionLength: 0,
  achievementsUnlocked: [],
  currentLevel: 1,
  experiencePoints: 0,
};

// Achievement definitions
const ACHIEVEMENTS: { [key: string]: Omit<Achievement, 'unlockedDate'> } = {
  FIRST_LISTEN: {
    id: 'FIRST_LISTEN',
    title: 'First Listen',
    description: 'Complete your first story',
    icon: '🎧',
    category: 'completion',
    points: 10
  },
  STREAK_3: {
    id: 'STREAK_3',
    title: 'Getting Started',
    description: 'Maintain a 3-day listening streak',
    icon: '🔥',
    category: 'streak',
    points: 25
  },
  STREAK_7: {
    id: 'STREAK_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day listening streak',
    icon: '⚡',
    category: 'streak',
    points: 50
  },
  STREAK_30: {
    id: 'STREAK_30',
    title: 'Streak Master',
    description: 'Maintain a 30-day listening streak',
    icon: '👑',
    category: 'streak',
    points: 200
  },
  STORIES_10: {
    id: 'STORIES_10',
    title: 'Story Explorer',
    description: 'Complete 10 stories',
    icon: '📚',
    category: 'completion',
    points: 50
  },
  STORIES_50: {
    id: 'STORIES_50',
    title: 'Avid Listener',
    description: 'Complete 50 stories',
    icon: '🌟',
    category: 'completion',
    points: 150
  },
  LISTENING_60: {
    id: 'LISTENING_60',
    title: 'Hour Master',
    description: 'Listen for 60 minutes in a single day',
    icon: '⏰',
    category: 'listening',
    points: 30
  },
  LISTENING_300: {
    id: 'LISTENING_300',
    title: 'Time Traveler',
    description: 'Accumulate 5 hours of total listening time',
    icon: '🚀',
    category: 'listening',
    points: 75
  },
  GENRE_EXPLORER: {
    id: 'GENRE_EXPLORER',
    title: 'Genre Explorer',
    description: 'Listen to stories from 5 different categories',
    icon: '🗺️',
    category: 'exploration',
    points: 40
  },
  DAILY_GOAL_7: {
    id: 'DAILY_GOAL_7',
    title: 'Consistent Listener',
    description: 'Meet your daily goal for 7 consecutive days',
    icon: '🎯',
    category: 'streak',
    points: 60
  },
};

interface UserStatsProviderProps {
  children: ReactNode;
}

export function UserStatsProvider({ children }: UserStatsProviderProps) {
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const storedStats = await AsyncStorage.getItem(USER_STATS_STORAGE_KEY);
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        setUserStats({ ...defaultUserStats, ...parsedStats });
        // Update streak on app load
        updateReadingStreak(parsedStats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const saveUserStats = async (newStats: UserStats) => {
    try {
      await AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(newStats));
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    const newStats = { ...userStats, ...updates };
    setUserStats(newStats);
    await saveUserStats(newStats);
  };

  const addListeningSession = async (session: ListeningSession) => {
    const newHistory = [...userStats.listeningHistory, session];
    const newTotalTime = userStats.totalListeningTime + session.duration;
    
    const newStats = {
      ...userStats,
      listeningHistory: newHistory,
      totalListeningTime: newTotalTime,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    setUserStats(newStats);
    await saveUserStats(newStats);
  };

  const markStoryCompleted = async (storyId: string) => {
    if (!userStats.completedStories.includes(storyId)) {
      const newCompletedStories = [...userStats.completedStories, storyId];
      const newTotalRead = userStats.totalStoriesRead + 1;
      
      const newStats = {
        ...userStats,
        completedStories: newCompletedStories,
        totalStoriesRead: newTotalRead,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };

      setUserStats(newStats);
      await saveUserStats(newStats);
      updateReadingStreak(newStats);
    }
  };

  const updateReadingStreak = async (stats: UserStats = userStats) => {
    const today = new Date();
    const lastActive = new Date(stats.lastActiveDate);
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = stats.readingStreak;
    let newStreakStart = stats.streakStartDate;

    if (daysDiff === 0) {
      // Active today, maintain streak
      return;
    } else if (daysDiff === 1) {
      // Active yesterday, continue streak
      newStreak += 1;
    } else if (daysDiff > 1) {
      // Missed a day, reset streak
      newStreak = 0;
      newStreakStart = today.toISOString().split('T')[0];
    }

    const newStats = {
      ...stats,
      readingStreak: newStreak,
      streakStartDate: newStreakStart,
    };

    setUserStats(newStats);
    await saveUserStats(newStats);
  };

  const resetStats = async () => {
    const newStats = { ...defaultUserStats };
    setUserStats(newStats);
    await saveUserStats(newStats);
  };

  // Enhanced real-time methods
  const startListeningSession = (storyId: string, storyTitle: string, storyCategory: string): string => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // Track story start for analytics
    trackStoryStart(storyId, storyCategory);
    
    return sessionId;
  };

  const updateSessionProgress = async (sessionId: string, progress: number, duration: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newTodayTime = progress > 0 ? userStats.todayListeningTime + (duration / 60) : userStats.todayListeningTime;
    
    const newStats = {
      ...userStats,
      todayListeningTime: newTodayTime,
      lastSessionDate: today,
    };
    
    setUserStats(newStats);
    await saveUserStats(newStats);
  };

  const endListeningSession = async (sessionId: string, completed: boolean) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Update total sessions count
    const newTotalSessions = userStats.totalSessions + 1;
    const newAverageSessionLength = ((userStats.averageSessionLength * userStats.totalSessions) + userStats.todayListeningTime) / newTotalSessions;
    
    const newStats = {
      ...userStats,
      totalSessions: newTotalSessions,
      averageSessionLength: newAverageSessionLength,
      lastSessionDate: today,
    };
    
    setUserStats(newStats);
    await saveUserStats(newStats);
    
    // Check for new achievements
    checkAchievements();
  };

  const trackStoryStart = async (storyId: string, category: string) => {
    // Update favorite categories
    const newFavoriteCategories = { ...userStats.favoriteCategories };
    newFavoriteCategories[category] = (newFavoriteCategories[category] || 0) + 1;
    
    const newStats = {
      ...userStats,
      favoriteCategories: newFavoriteCategories,
    };
    
    setUserStats(newStats);
    await saveUserStats(newStats);
  };

  const checkAchievements = (): Achievement[] => {
    const newAchievements: Achievement[] = [];
    const unlockedIds = userStats.achievementsUnlocked.map(a => a.id);
    
    // Check each achievement
    Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
      if (unlockedIds.includes(id)) return; // Already unlocked
      
      let shouldUnlock = false;
      
      switch (id) {
        case 'FIRST_LISTEN':
          shouldUnlock = userStats.totalStoriesRead >= 1;
          break;
        case 'STREAK_3':
          shouldUnlock = userStats.readingStreak >= 3;
          break;
        case 'STREAK_7':
          shouldUnlock = userStats.readingStreak >= 7;
          break;
        case 'STREAK_30':
          shouldUnlock = userStats.readingStreak >= 30;
          break;
        case 'STORIES_10':
          shouldUnlock = userStats.totalStoriesRead >= 10;
          break;
        case 'STORIES_50':
          shouldUnlock = userStats.totalStoriesRead >= 50;
          break;
        case 'LISTENING_60':
          shouldUnlock = userStats.todayListeningTime >= 60;
          break;
        case 'LISTENING_300':
          shouldUnlock = userStats.totalListeningTime >= 300;
          break;
        case 'GENRE_EXPLORER':
          shouldUnlock = Object.keys(userStats.favoriteCategories).length >= 5;
          break;
        case 'DAILY_GOAL_7':
          // This would require more complex tracking - simplified for now
          shouldUnlock = userStats.readingStreak >= 7 && userStats.todayListeningTime >= userStats.dailyGoal;
          break;
      }
      
      if (shouldUnlock) {
        const newAchievement: Achievement = {
          ...achievement,
          unlockedDate: new Date().toISOString(),
        };
        newAchievements.push(newAchievement);
      }
    });
    
    // Update user stats with new achievements
    if (newAchievements.length > 0) {
      const totalPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
      const newLevel = Math.floor((userStats.experiencePoints + totalPoints) / 100) + 1;
      
      const newStats = {
        ...userStats,
        achievementsUnlocked: [...userStats.achievementsUnlocked, ...newAchievements],
        experiencePoints: userStats.experiencePoints + totalPoints,
        currentLevel: Math.max(newLevel, userStats.currentLevel),
      };
      
      setUserStats(newStats);
      saveUserStats(newStats);
    }
    
    return newAchievements;
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSessions = userStats.listeningHistory.filter(session => session.date === today);
    const todaysCompletedStories = todaysSessions.filter(session => session.completed).length;
    
    return {
      storiesRead: todaysCompletedStories,
      listeningTime: userStats.todayListeningTime,
      sessionsCount: todaysSessions.length,
    };
  };

  const getWeekStats = () => {
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const weekSessions = userStats.listeningHistory.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart;
    });
    
    const weeklyStoriesRead = weekSessions.filter(session => session.completed).length;
    const weeklyListeningTime = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    const goalProgress = (weeklyStoriesRead / userStats.weeklyGoal) * 100;
    
    return {
      storiesRead: weeklyStoriesRead,
      listeningTime: weeklyListeningTime,
      goalProgress: Math.min(goalProgress, 100),
    };
  };

  const getMonthStats = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthSessions = userStats.listeningHistory.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= monthStart;
    });
    
    const monthlyStoriesRead = monthSessions.filter(session => session.completed).length;
    const monthlyListeningTime = monthSessions.reduce((sum, session) => sum + session.duration, 0);
    const daysInMonth = today.getDate();
    const averageDaily = daysInMonth > 0 ? monthlyListeningTime / daysInMonth : 0;
    
    return {
      storiesRead: monthlyStoriesRead,
      listeningTime: monthlyListeningTime,
      averageDaily,
    };
  };

  const isStreakActive = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return userStats.lastActiveDate === today || userStats.lastActiveDate === yesterdayStr;
  };

  const getRealtimeProgress = () => {
    const dailyProgress = (userStats.todayListeningTime / userStats.dailyGoal) * 100;
    const weekStats = getWeekStats();
    const weeklyProgress = weekStats.goalProgress;
    
    let streakStatus: 'active' | 'inactive' | 'at_risk' = 'inactive';
    if (isStreakActive()) {
      const today = new Date().toISOString().split('T')[0];
      streakStatus = userStats.lastActiveDate === today ? 'active' : 'at_risk';
    }
    
    // Find next achievable achievement
    const unlockedIds = userStats.achievementsUnlocked.map(a => a.id);
    const nextAchievement = Object.entries(ACHIEVEMENTS).find(([id, achievement]) => {
      if (unlockedIds.includes(id)) return false;
      
      // Check if this achievement is close to being unlocked
      switch (id) {
        case 'FIRST_LISTEN':
          return userStats.totalStoriesRead === 0;
        case 'STREAK_3':
          return userStats.readingStreak >= 1 && userStats.readingStreak < 3;
        case 'STREAK_7':
          return userStats.readingStreak >= 3 && userStats.readingStreak < 7;
        default:
          return false;
      }
    });
    
    return {
      dailyProgress: Math.min(dailyProgress, 100),
      weeklyProgress,
      streakStatus,
      nextAchievement: nextAchievement ? {
        ...nextAchievement[1],
        unlockedDate: '',
      } : null,
    };
  };

  const contextValue: UserStatsContextType = {
    userStats,
    updateStats,
    addListeningSession,
    markStoryCompleted,
    updateReadingStreak,
    resetStats,
    // Enhanced real-time methods
    startListeningSession,
    updateSessionProgress,
    endListeningSession,
    trackStoryStart,
    checkAchievements,
    getTodayStats,
    getWeekStats,
    getMonthStats,
    isStreakActive,
    getRealtimeProgress,
  };

  return (
    <UserStatsContext.Provider value={contextValue}>
      {children}
    </UserStatsContext.Provider>
  );
}

export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
}