import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Flame,
  TrendingUp,
  Award,
  Target,
  Calendar,
  BarChart3,
  Users,
  Star,
  Headphones,
  Crown,
  ChevronRight,
  Zap,
  Timer,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserStats } from "@/contexts/UserStatsContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import RealtimeJourneyDashboard from "@/components/RealtimeJourneyDashboard";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  gradient: string[];
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  gradient,
  delay = 0
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 600 });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <LinearGradient
        colors={gradient}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardContent}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            {icon}
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

interface StreakIndicatorProps {
  streak: number;
  isActive: boolean;
}

const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streak, isActive }) => {
  const { colors } = useTheme();
  const pulseScale = useSharedValue(1);
  const flameOpacity = useSharedValue(0.8);

  useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
      flameOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.6, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
  }));

  return (
    <View style={[styles.streakContainer, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={isActive ? ['#FF6B6B', '#FF8E53'] : [colors.mutedText, colors.border]}
        style={styles.streakGradient}
      >
        <Animated.View style={[styles.streakIconContainer, animatedStyle]}>
          <Animated.View style={flameStyle}>
            <Flame size={32} color="white" fill="white" />
          </Animated.View>
        </Animated.View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakStatus}>
            {isActive ? 'Keep it up!' : 'Start your streak!'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function JourneyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userStats } = useUserStats();
  const { favorites } = useFavorites();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatListeningTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getWeeklyProgress = () => {
    const currentWeekStories = Math.min(userStats.totalStoriesRead % 7, userStats.weeklyGoal);
    return (currentWeekStories / userStats.weeklyGoal) * 100;
  };

  const getTopGenre = () => {
    // Simple implementation - in real app, track by actual listening history
    return userStats.favoriteGenre;
  };

  const getAchievementLevel = () => {
    if (userStats.totalStoriesRead >= 100) return "Master Storyteller";
    if (userStats.totalStoriesRead >= 50) return "Story Enthusiast";
    if (userStats.totalStoriesRead >= 20) return "Active Listener";
    if (userStats.totalStoriesRead >= 5) return "Getting Started";
    return "Beginner";
  };

  const isStreakActive = () => {
    const today = new Date().toISOString().split('T')[0];
    return userStats.lastActiveDate === today;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Journey</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Real-time Journey Dashboard */}
        <RealtimeJourneyDashboard variant="full" />
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '05']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <Crown size={28} color={colors.primary} />
                <Text style={[styles.heroLevel, { color: colors.primary }]}>
                  {getAchievementLevel()}
                </Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Keep exploring amazing stories!
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.mutedText }]}>
                You're doing great on your storytelling journey
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Streak Section */}
        <View style={styles.streakSection}>
          <StreakIndicator 
            streak={userStats.readingStreak} 
            isActive={isStreakActive()}
          />
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<BookOpen size={24} color="white" />}
            title="Stories Read"
            value={userStats.totalStoriesRead.toString()}
            subtitle="Completed adventures"
            gradient={[colors.primary, colors.primary + '80']}
            delay={100}
          />
          
          <StatCard
            icon={<Clock size={24} color="white" />}
            title="Listen Time"
            value={formatListeningTime(userStats.totalListeningTime)}
            subtitle="Total time spent"
            gradient={['#4ECDC4', '#44A08D']}
            delay={200}
          />
          
          <StatCard
            icon={<Star size={24} color="white" />}
            title="Favorites"
            value={favorites.length.toString()}
            subtitle="Stories you loved"
            gradient={['#FFD700', '#FFA000']}
            delay={300}
          />
          
          <StatCard
            icon={<Target size={24} color="white" />}
            title="Weekly Goal"
            value={`${Math.min(userStats.totalStoriesRead % 7, userStats.weeklyGoal)}/${userStats.weeklyGoal}`}
            subtitle="This week's progress"
            gradient={['#9B59B6', '#8E44AD']}
            delay={400}
          />
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week's Progress</Text>
          <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>Weekly Goal</Text>
                <Text style={[styles.progressSubtitle, { color: colors.mutedText }]}>
                  {Math.min(userStats.totalStoriesRead % 7, userStats.weeklyGoal)} of {userStats.weeklyGoal} stories
                </Text>
              </View>
              <View style={[styles.progressBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                  {Math.round(getWeeklyProgress())}%
                </Text>
              </View>
            </View>
            
            <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${getWeeklyProgress()}%`,
                    backgroundColor: colors.primary 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            <View style={styles.achievementsList}>
              {/* First Listener Achievement */}
              <View style={[styles.achievementCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={userStats.totalStoriesRead > 0 ? [colors.primary + '30', colors.primary + '10'] : [colors.border, colors.card]}
                  style={styles.achievementGradient}
                >
                  <View style={[styles.achievementIcon, { 
                    backgroundColor: userStats.totalStoriesRead > 0 ? colors.primary + '20' : colors.border 
                  }]}>
                    <Headphones size={20} color={userStats.totalStoriesRead > 0 ? colors.primary : colors.mutedText} />
                  </View>
                  <Text style={[styles.achievementTitle, { 
                    color: userStats.totalStoriesRead > 0 ? colors.text : colors.mutedText 
                  }]}>
                    First Listen
                  </Text>
                  <Text style={[styles.achievementDescription, { color: colors.mutedText }]}>
                    Complete your first story
                  </Text>
                </LinearGradient>
              </View>

              {/* Streak Master Achievement */}
              <View style={[styles.achievementCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={userStats.readingStreak >= 7 ? ['#FF6B6B30', '#FF6B6B10'] : [colors.border, colors.card]}
                  style={styles.achievementGradient}
                >
                  <View style={[styles.achievementIcon, { 
                    backgroundColor: userStats.readingStreak >= 7 ? '#FF6B6B20' : colors.border 
                  }]}>
                    <Flame size={20} color={userStats.readingStreak >= 7 ? '#FF6B6B' : colors.mutedText} />
                  </View>
                  <Text style={[styles.achievementTitle, { 
                    color: userStats.readingStreak >= 7 ? colors.text : colors.mutedText 
                  }]}>
                    Streak Master
                  </Text>
                  <Text style={[styles.achievementDescription, { color: colors.mutedText }]}>
                    7 day listening streak
                  </Text>
                </LinearGradient>
              </View>

              {/* Story Collector Achievement */}
              <View style={[styles.achievementCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={favorites.length >= 10 ? ['#FFD70030', '#FFD70010'] : [colors.border, colors.card]}
                  style={styles.achievementGradient}
                >
                  <View style={[styles.achievementIcon, { 
                    backgroundColor: favorites.length >= 10 ? '#FFD70020' : colors.border 
                  }]}>
                    <Star size={20} color={favorites.length >= 10 ? '#FFD700' : colors.mutedText} />
                  </View>
                  <Text style={[styles.achievementTitle, { 
                    color: favorites.length >= 10 ? colors.text : colors.mutedText 
                  }]}>
                    Story Collector
                  </Text>
                  <Text style={[styles.achievementDescription, { color: colors.mutedText }]}>
                    Favorite 10 stories
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Stats Summary */}
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Favorite Genre</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{getTopGenre()}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Average Rating</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {userStats.averageRating > 0 ? userStats.averageRating.toFixed(1) : '—'}
                </Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Stories Created</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{userStats.storiesCreated}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Member Since</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>Jan 2024</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Hero Section
  heroSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLevel: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },

  // Streak Section
  streakSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  streakContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  streakIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    lineHeight: 36,
  },
  streakLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  streakStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    minHeight: 120,
  },
  statCardContent: {
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Achievements Section
  achievementsSection: {
    marginTop: 32,
  },
  achievementsScroll: {
    marginTop: 16,
  },
  achievementsList: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    gap: 12,
  },
  achievementCard: {
    width: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },

  // Summary Section
  summarySection: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Common
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});