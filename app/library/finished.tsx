import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  Clock,
  Star,
  RotateCcw,
  Share,
  MoreVertical,
  Search,
  SortAsc,
  Trophy,
  Calendar,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserStats } from "@/contexts/UserStatsContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Story } from "@/mocks/stories";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface FinishedStory extends Story {
  completedDate: string;
  completionTime: string;
  rating?: number;
  personalRating?: number; // User's own rating
  playCount: number;
}

interface FinishedStoryCardProps {
  story: FinishedStory;
  onPress: () => void;
  colors: any;
}

const FinishedStoryCard: React.FC<FinishedStoryCardProps> = ({ story, onPress, colors }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.storyCard, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.storyCardTouchable, { backgroundColor: colors.card }]}
      >
        <View style={styles.storyImageContainer}>
          <Image source={{ uri: story.imageUrl }} style={styles.storyImage} />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.storyImageGradient}
          />
          
          <View style={styles.playButtonOverlay}>
            <BlurView intensity={20} style={styles.playButton}>
              <RotateCcw size={16} color="white" />
            </BlurView>
          </View>

          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton story={story} size={20} />
          </View>

          <View style={styles.completedIndicator}>
            <BlurView intensity={20} style={styles.completedBadge}>
              <CheckCircle size={12} color="#4CAF50" fill="#4CAF50" />
            </BlurView>
          </View>

          {/* Achievement badge for highly rated stories */}
          {story.personalRating && story.personalRating >= 5 && (
            <View style={styles.achievementBadge}>
              <BlurView intensity={20} style={styles.achievementBadgeContent}>
                <Trophy size={10} color="#FFD700" fill="#FFD700" />
              </BlurView>
            </View>
          )}
        </View>

        <View style={styles.storyContent}>
          <Text style={[styles.storyTitle, { color: colors.text }]} numberOfLines={2}>
            {story.title}
          </Text>
          <Text style={[styles.storyAuthor, { color: colors.mutedText }]}>
            by {story.author}
          </Text>
          
          <View style={styles.storyMeta}>
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.mutedText} />
              <Text style={[styles.metaText, { color: colors.mutedText }]}>
                {story.duration}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={12} color={colors.mutedText} />
              <Text style={[styles.metaText, { color: colors.mutedText }]}>
                {story.completedDate}
              </Text>
            </View>
          </View>

          <View style={styles.completionInfo}>
            <Text style={[styles.completionTime, { color: colors.mutedText }]}>
              Completed in {story.completionTime}
            </Text>
            {story.personalRating && (
              <View style={styles.personalRating}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    size={12}
                    color={rating <= story.personalRating! ? "#FFD700" : colors.mutedText}
                    fill={rating <= story.personalRating! ? "#FFD700" : "transparent"}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.storyActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => {/* Handle replay */}}
            >
              <RotateCcw size={14} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Replay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: colors.primary + '20' }]}>
              <Share size={14} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.moreButton, { backgroundColor: colors.primary + '20' }]}>
              <MoreVertical size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mock finished stories data
const mockFinishedStories: FinishedStory[] = [
  {
    id: "finished-1",
    title: "The Time Traveler's Dilemma",
    duration: "28 min",
    author: "Dr. Alexandra Smith",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1222",
    category: "Sci-Fi",
    rating: 4.9,
    description: "A complex tale of temporal paradoxes",
    playCount: 3200,
    tags: ["time travel", "paradox", "science"],
    completedDate: "Jan 16",
    completionTime: "28m 15s",
    personalRating: 5,
  },
  {
    id: "finished-2",
    title: "The Last Library",
    duration: "21 min",
    author: "Elena Vasquez",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1170",
    category: "Mystery",
    rating: 4.7,
    description: "Protecting knowledge in a digital world",
    playCount: 2100,
    tags: ["books", "knowledge", "future"],
    completedDate: "Jan 14",
    completionTime: "21m 32s",
    personalRating: 4,
  },
  {
    id: "finished-3",
    title: "Dragon's Heart",
    duration: "35 min",
    author: "Kai Windweaver",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1169",
    category: "Fantasy",
    rating: 4.8,
    description: "The bond between dragon and rider",
    playCount: 2800,
    tags: ["dragons", "bond", "magic"],
    completedDate: "Jan 12",
    completionTime: "35m 48s",
    personalRating: 5,
  },
  {
    id: "finished-4",
    title: "City of Mirrors",
    duration: "19 min",
    author: "Luna Park",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1170",
    category: "Drama",
    rating: 4.6,
    description: "Reflections of urban life",
    playCount: 1600,
    tags: ["city", "life", "reflection"],
    completedDate: "Jan 10",
    completionTime: "19m 12s",
    personalRating: 3,
  },
  {
    id: "finished-5",
    title: "The Silent Ocean",
    duration: "24 min",
    author: "Captain Rivera",
    imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1170",
    category: "Adventure",
    rating: 4.5,
    description: "Mysteries beneath the waves",
    playCount: 1900,
    tags: ["ocean", "mystery", "adventure"],
    completedDate: "Jan 8",
    completionTime: "24m 5s",
    personalRating: 4,
  },
  {
    id: "finished-6",
    title: "Starlight Symphony",
    duration: "31 min",
    author: "Aria Moonwhisper",
    imageUrl: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?q=80&w=1074",
    category: "Fantasy",
    rating: 4.9,
    description: "Music that shapes reality",
    playCount: 3500,
    tags: ["music", "magic", "reality"],
    completedDate: "Jan 6",
    completionTime: "31m 22s",
    personalRating: 5,
  },
];

export default function FinishedStoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userStats } = useUserStats();
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'rating'>('recent');
  const [finishedStories] = useState(mockFinishedStories);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleStoryPress = (story: FinishedStory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/story/[id]",
      params: { id: story.id }
    });
  };

  const sortedStories = [...finishedStories].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'rating':
        return (b.personalRating || 0) - (a.personalRating || 0);
      default:
        return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
    }
  });

  const totalListenTime = finishedStories.reduce((total, story) => {
    const minutes = parseInt(story.completionTime);
    return total + minutes;
  }, 0);

  const averageRating = finishedStories.reduce((total, story) => {
    return total + (story.personalRating || 0);
  }, 0) / finishedStories.filter(story => story.personalRating).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Finished Stories</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Search size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsHeader}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '05']}
          style={styles.statsGradient}
        >
          <View style={styles.statsContent}>
            <View style={styles.statsLeft}>
              <View style={[styles.statsIcon, { backgroundColor: '#4CAF5020' }]}>
                <CheckCircle size={24} color="#4CAF50" fill="#4CAF50" />
              </View>
              <View style={styles.statsInfo}>
                <Text style={[styles.statsNumber, { color: colors.text }]}>
                  {finishedStories.length}
                </Text>
                <Text style={[styles.statsLabel, { color: colors.mutedText }]}>
                  Completed • {Math.floor(totalListenTime / 60)}h {totalListenTime % 60}m
                </Text>
                {!isNaN(averageRating) && (
                  <View style={styles.averageRating}>
                    <Star size={12} color="#FFD700" fill="#FFD700" />
                    <Text style={[styles.ratingText, { color: colors.mutedText }]}>
                      {averageRating.toFixed(1)} avg rating
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.sortButton, { backgroundColor: colors.card }]}
              onPress={() => {
                const sortOptions = ['recent', 'alphabetical', 'rating'] as const;
                const currentIndex = sortOptions.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortBy(sortOptions[nextIndex]);
                Haptics.selectionAsync();
              }}
            >
              <SortAsc size={16} color={colors.primary} />
              <Text style={[styles.sortText, { color: colors.primary }]}>
                {sortBy === 'recent' ? 'Recent' : sortBy === 'alphabetical' ? 'A-Z' : 'Rating'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.storiesGrid}>
          {sortedStories.map((story) => (
            <FinishedStoryCard
              key={story.id}
              story={story}
              onPress={() => handleStoryPress(story)}
              colors={colors}
            />
          ))}
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsInfo: {},
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 14,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  storiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  storyCard: {
    width: (width - 52) / 2,
  },
  storyCardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  storyImageContainer: {
    position: 'relative',
    aspectRatio: 3/4,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  completedIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  achievementBadge: {
    position: 'absolute',
    top: 44,
    left: 12,
  },
  achievementBadgeContent: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storyContent: {
    padding: 16,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  completionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTime: {
    fontSize: 11,
  },
  personalRating: {
    flexDirection: 'row',
    gap: 2,
  },
  storyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});