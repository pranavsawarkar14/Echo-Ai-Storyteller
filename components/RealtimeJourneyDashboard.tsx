import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedProps,
  withRepeat,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import {
  Flame,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Star,
  Crown,
  Calendar,
  Trophy,
  Zap,
  Activity,
  Eye,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserStats, Achievement } from '@/contexts/UserStatsContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RealtimeJourneyDashboardProps {
  variant?: 'home' | 'full';
  onPress?: () => void;
}

const RealtimeJourneyDashboard: React.FC<RealtimeJourneyDashboardProps> = ({
  variant = 'home',
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const {
    userStats,
    getTodayStats,
    getWeekStats,
    getRealtimeProgress,
    isStreakActive,
    checkAchievements,
  } = useUserStats();

  const [realtimeData, setRealtimeData] = useState({
    today: getTodayStats(),
    week: getWeekStats(),
    progress: getRealtimeProgress(),
  });
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Animation values
  const dailyProgress = useSharedValue(0);
  const weeklyProgress = useSharedValue(0);
  const streakPulse = useSharedValue(1);
  const achievementScale = useSharedValue(0);

  // Update real-time data every 30 seconds
  useEffect(() => {
    const updateData = () => {
      const newData = {
        today: getTodayStats(),
        week: getWeekStats(),
        progress: getRealtimeProgress(),
      };
      setRealtimeData(newData);

      // Animate progress bars
      dailyProgress.value = withSpring(newData.progress.dailyProgress / 100);
      weeklyProgress.value = withSpring(newData.progress.weeklyProgress / 100);

      // Check for new achievements
      const unlockedAchievements = checkAchievements();
      if (unlockedAchievements.length > 0) {
        setNewAchievements(unlockedAchievements);
        achievementScale.value = withSpring(1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [userStats]);

  // Streak animation
  useEffect(() => {
    if (realtimeData.progress.streakStatus === 'active') {
      streakPulse.value = withRepeat(
        withTiming(1.1, { duration: 2000 }),
        -1,
        true
      );
    } else {
      streakPulse.value = withTiming(1);
    }
  }, [realtimeData.progress.streakStatus]);

  const handleJourneyPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/journey');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStreakColor = () => {
    switch (realtimeData.progress.streakStatus) {
      case 'active':
        return '#FF6B6B';
      case 'at_risk':
        return '#FFA726';
      default:
        return colors.mutedText;
    }
  };

  const getStreakIcon = () => {
    const color = getStreakColor();
    return <Flame size={20} color={color} fill={color} />;
  };

  // Animated styles
  const dailyProgressStyle = useAnimatedStyle(() => ({
    width: `${dailyProgress.value * 100}%`,
  }));

  const weeklyProgressStyle = useAnimatedStyle(() => ({
    width: `${weeklyProgress.value * 100}%`,
  }));

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakPulse.value }],
  }));

  const achievementAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: achievementScale.value }],
    opacity: achievementScale.value,
  }));

  if (variant === 'home') {
    return (
      <TouchableOpacity
        style={[styles.homeContainer, { backgroundColor: colors.card }]}
        onPress={handleJourneyPress}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={[colors.primary + '15', colors.primary + '05']}
          style={styles.homeGradient}
        >
          <View style={styles.homeHeader}>
            <View style={styles.homeTitle}>
              <Activity size={20} color={colors.primary} />
              <Text style={[styles.homeTitleText, { color: colors.text }]}>
                Your Journey
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedText} />
          </View>

          <View style={styles.homeStats}>
            {/* Today's Progress */}
            <View style={styles.homeStatItem}>
              <Text style={[styles.homeStatLabel, { color: colors.mutedText }]}>
                Today
              </Text>
              <Text style={[styles.homeStatValue, { color: colors.text }]}>
                {formatTime(realtimeData.today.listeningTime)}
              </Text>
              <View style={[styles.homeProgressBar, { backgroundColor: colors.border }]}>
                <Animated.View
                  style={[
                    styles.homeProgressFill,
                    { backgroundColor: colors.primary },
                    dailyProgressStyle,
                  ]}
                />
              </View>
            </View>

            {/* Streak */}
            <View style={styles.homeStatItem}>
              <Animated.View style={[styles.homeStreakContainer, streakAnimatedStyle]}>
                {getStreakIcon()}
                <Text style={[styles.homeStreakText, { color: getStreakColor() }]}>
                  {userStats.readingStreak}
                </Text>
              </Animated.View>
              <Text style={[styles.homeStatLabel, { color: colors.mutedText }]}>
                Day Streak
              </Text>
            </View>

            {/* Stories Read */}
            <View style={styles.homeStatItem}>
              <Text style={[styles.homeStatLabel, { color: colors.mutedText }]}>
                Stories
              </Text>
              <Text style={[styles.homeStatValue, { color: colors.text }]}>
                {userStats.totalStoriesRead}
              </Text>
              <View style={styles.homeStatSubValue}>
                <BookOpen size={12} color={colors.mutedText} />
                <Text style={[styles.homeStatSubText, { color: colors.mutedText }]}>
                  completed
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
      {/* Real-time Progress Header */}
      <View style={[styles.progressHeader, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '05']}
          style={styles.progressHeaderGradient}
        >
          <View style={styles.progressHeaderContent}>
            <View style={styles.progressTitle}>
              <Zap size={24} color={colors.primary} />
              <Text style={[styles.progressTitleText, { color: colors.text }]}>
                Live Progress
              </Text>
            </View>
            <Text style={[styles.progressSubtitle, { color: colors.mutedText }]}>
              Real-time tracking of your journey
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Daily Progress Circle */}
      <View style={[styles.dailyCircleContainer, { backgroundColor: colors.card }]}>
        <View style={styles.circleWrapper}>
          <Svg width={120} height={120} style={styles.progressCircle}>
            <Circle
              cx={60}
              cy={60}
              r={50}
              stroke={colors.border}
              strokeWidth={8}
              fill="transparent"
            />
            <AnimatedCircle
              cx={60}
              cy={60}
              r={50}
              stroke={colors.primary}
              strokeWidth={8}
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - dailyProgress.value)}`}
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.circleContent}>
            <Text style={[styles.circleValue, { color: colors.text }]}>
              {Math.round(realtimeData.progress.dailyProgress)}%
            </Text>
            <Text style={[styles.circleLabel, { color: colors.mutedText }]}>
              Daily Goal
            </Text>
          </View>
        </View>
        <View style={styles.circleStats}>
          <View style={styles.circleStatItem}>
            <Clock size={16} color={colors.primary} />
            <Text style={[styles.circleStatText, { color: colors.text }]}>
              {formatTime(realtimeData.today.listeningTime)} / {formatTime(userStats.dailyGoal)}
            </Text>
          </View>
          <View style={styles.circleStatItem}>
            <Target size={16} color={colors.primary} />
            <Text style={[styles.circleStatText, { color: colors.text }]}>
              {realtimeData.today.storiesRead} stories today
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={[styles.weeklyContainer, { backgroundColor: colors.card }]}>
        <View style={styles.weeklyHeader}>
          <Text style={[styles.weeklyTitle, { color: colors.text }]}>
            Weekly Progress
          </Text>
          <Text style={[styles.weeklySubtitle, { color: colors.mutedText }]}>
            {realtimeData.week.storiesRead} of {userStats.weeklyGoal} stories
          </Text>
        </View>
        <View style={[styles.weeklyProgressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.weeklyProgressFill,
              { backgroundColor: colors.primary },
              weeklyProgressStyle,
            ]}
          />
        </View>
        <Text style={[styles.weeklyPercentage, { color: colors.primary }]}>
          {Math.round(realtimeData.progress.weeklyProgress)}% Complete
        </Text>
      </View>

      {/* Real-time Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={['#FF6B6B20', '#FF6B6B05']}
            style={styles.statCardGradient}
          >
            <Animated.View style={[styles.statIconContainer, streakAnimatedStyle]}>
              <Flame size={24} color="#FF6B6B" />
            </Animated.View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {userStats.readingStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>
              Day Streak
            </Text>
            <Text style={[styles.statStatus, { color: getStreakColor() }]}>
              {realtimeData.progress.streakStatus === 'active' ? 'Active' : 
               realtimeData.progress.streakStatus === 'at_risk' ? 'At Risk' : 'Inactive'}
            </Text>
          </LinearGradient>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '05']}
            style={styles.statCardGradient}
          >
            <View style={styles.statIconContainer}>
              <Crown size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {userStats.currentLevel}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>
              Level
            </Text>
            <Text style={[styles.statStatus, { color: colors.primary }]}>
              {userStats.experiencePoints} XP
            </Text>
          </LinearGradient>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={['#4ECDC420', '#4ECDC405']}
            style={styles.statCardGradient}
          >
            <View style={styles.statIconContainer}>
              <Trophy size={24} color="#4ECDC4" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {userStats.achievementsUnlocked.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>
              Achievements
            </Text>
            <Text style={[styles.statStatus, { color: '#4ECDC4' }]}>
              Unlocked
            </Text>
          </LinearGradient>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={['#9B59B620', '#9B59B605']}
            style={styles.statCardGradient}
          >
            <View style={styles.statIconContainer}>
              <Clock size={24} color="#9B59B6" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatTime(userStats.totalListeningTime)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>
              Total Time
            </Text>
            <Text style={[styles.statStatus, { color: '#9B59B6' }]}>
              Listened
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* New Achievement Notification */}
      {newAchievements.length > 0 && (
        <Animated.View
          style={[
            styles.achievementNotification,
            { backgroundColor: colors.card },
            achievementAnimatedStyle,
          ]}
        >
          <LinearGradient
            colors={[colors.primary + '20', 'transparent']}
            style={styles.achievementGradient}
          >
            <View style={styles.achievementContent}>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>
                🎉 Achievement Unlocked!
              </Text>
              {newAchievements.map((achievement, index) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementDetails}>
                    <Text style={[styles.achievementName, { color: colors.text }]}>
                      {achievement.title}
                    </Text>
                    <Text style={[styles.achievementDescription, { color: colors.mutedText }]}>
                      {achievement.description}
                    </Text>
                  </View>
                  <Text style={[styles.achievementPoints, { color: colors.primary }]}>
                    +{achievement.points} XP
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Home variant styles
  homeContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  homeGradient: {
    padding: 16,
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  homeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  homeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  homeStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  homeStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  homeStatValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  homeProgressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  homeProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  homeStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  homeStreakText: {
    fontSize: 16,
    fontWeight: '700',
  },
  homeStatSubValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  homeStatSubText: {
    fontSize: 10,
  },

  // Full variant styles
  fullContainer: {
    flex: 1,
  },
  progressHeader: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressHeaderGradient: {
    padding: 20,
  },
  progressHeaderContent: {
    alignItems: 'center',
  },
  progressTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressTitleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressSubtitle: {
    fontSize: 14,
  },
  dailyCircleContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  circleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    transform: [{ rotate: '-90deg' }],
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  circleValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  circleLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  circleStats: {
    gap: 8,
  },
  circleStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleStatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  weeklyContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
  },
  weeklyHeader: {
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  weeklySubtitle: {
    fontSize: 14,
  },
  weeklyProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  weeklyProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  weeklyPercentage: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statStatus: {
    fontSize: 10,
    fontWeight: '500',
  },
  achievementNotification: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: 20,
  },
  achievementContent: {
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
  },
  achievementPoints: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RealtimeJourneyDashboard;