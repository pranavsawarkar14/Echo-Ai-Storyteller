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
  Bookmark,
  Play,
  Clock,
  Star,
  Download,
  Share,
  MoreVertical,
  Search,
  SortAsc,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Story } from "@/mocks/stories";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface SavedStoryCardProps {
  story: Story;
  onPress: () => void;
  colors: any;
}

const SavedStoryCard: React.FC<SavedStoryCardProps> = ({ story, onPress, colors }) => {
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
              <Play size={16} color="white" fill="white" />
            </BlurView>
          </View>

          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton story={story} size={20} />
          </View>

          <View style={styles.savedIndicator}>
            <BlurView intensity={20} style={styles.savedBadge}>
              <Bookmark size={12} color="#4CAF50" fill="#4CAF50" />
            </BlurView>
          </View>
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
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={[styles.metaText, { color: colors.mutedText }]}>
                {story.rating || 4.8}
              </Text>
            </View>
          </View>

          <View style={styles.storyActions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
              <Download size={14} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
              <Share size={14} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
              <MoreVertical size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mock saved stories data
const mockSavedStories: Story[] = [
  {
    id: "saved-1",
    title: "The Midnight Express",
    duration: "14 min",
    author: "Emma Thompson",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1169",
    category: "Mystery",
    rating: 4.6,
    description: "A thrilling journey on a mysterious train",
    playCount: 890,
    tags: ["mystery", "train", "thriller"],
  },
  {
    id: "saved-2",
    title: "Digital Dreams",
    duration: "16 min",
    author: "Alex Chen",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1169",
    category: "Sci-Fi",
    rating: 4.8,
    description: "Exploring consciousness in the digital age",
    playCount: 1200,
    tags: ["technology", "consciousness", "future"],
  },
  {
    id: "saved-3",
    title: "The Garden of Memories",
    duration: "18 min",
    author: "Sarah Williams",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1170",
    category: "Fantasy",
    rating: 4.9,
    description: "A magical place where memories bloom like flowers",
    playCount: 1500,
    tags: ["memory", "magic", "garden"],
  },
  {
    id: "saved-4",
    title: "Ocean's Whisper",
    duration: "12 min",
    author: "Marcus Reed",
    imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1170",
    category: "Adventure",
    rating: 4.5,
    description: "Secrets hidden beneath the waves",
    playCount: 750,
    tags: ["ocean", "adventure", "mystery"],
  },
];

export default function SavedStoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'duration'>('recent');
  const [savedStories] = useState(mockSavedStories);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleStoryPress = (story: Story) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/story/[id]",
      params: { id: story.id }
    });
  };

  const sortedStories = [...savedStories].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'duration':
        return parseInt(a.duration) - parseInt(b.duration);
      default:
        return 0;
    }
  });

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Stories</Text>
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
                <Bookmark size={24} color="#4CAF50" fill="#4CAF50" />
              </View>
              <View style={styles.statsInfo}>
                <Text style={[styles.statsNumber, { color: colors.text }]}>
                  {savedStories.length}
                </Text>
                <Text style={[styles.statsLabel, { color: colors.mutedText }]}>
                  Saved Stories
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.sortButton, { backgroundColor: colors.card }]}
              onPress={() => {
                const sortOptions = ['recent', 'alphabetical', 'duration'] as const;
                const currentIndex = sortOptions.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortBy(sortOptions[nextIndex]);
                Haptics.selectionAsync();
              }}
            >
              <SortAsc size={16} color={colors.primary} />
              <Text style={[styles.sortText, { color: colors.primary }]}>
                {sortBy === 'recent' ? 'Recent' : sortBy === 'alphabetical' ? 'A-Z' : 'Duration'}
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
            <SavedStoryCard
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
  savedIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  savedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    marginBottom: 12,
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
  storyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});