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
  withTiming,
} from "react-native-reanimated";
import {
  ArrowLeft,
  Heart,
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
import { useFavorites } from "@/contexts/FavoritesContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Story } from "@/mocks/stories";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface FavoriteStoryCardProps {
  story: Story;
  onPress: () => void;
  colors: any;
}

const FavoriteStoryCard: React.FC<FavoriteStoryCardProps> = ({ story, onPress, colors }) => {
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
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.storyImageGradient}
          />
          
          {/* Play button overlay */}
          <View style={styles.playButtonOverlay}>
            <BlurView intensity={20} style={styles.playButton}>
              <Play size={16} color="white" fill="white" />
            </BlurView>
          </View>

          {/* Favorite button */}
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton story={story} size={20} />
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
                4.8
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

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { favorites } = useFavorites();
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'duration'>('recent');

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

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'duration':
        return parseInt(a.duration) - parseInt(b.duration);
      default:
        return 0; // Keep original order for 'recent'
    }
  });

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Favorites</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Search size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '05']}
          style={styles.statsGradient}
        >
          <View style={styles.statsContent}>
            <View style={styles.statsLeft}>
              <View style={[styles.statsIcon, { backgroundColor: '#FF6B6B20' }]}>
                <Heart size={24} color="#FF6B6B" fill="#FF6B6B" />
              </View>
              <View style={styles.statsInfo}>
                <Text style={[styles.statsNumber, { color: colors.text }]}>
                  {favorites.length}
                </Text>
                <Text style={[styles.statsLabel, { color: colors.mutedText }]}>
                  Favorite Stories
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

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
            <Heart size={48} color={colors.mutedText} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.mutedText }]}>
            Tap the heart icon on any story to add it to your favorites
          </Text>
          <TouchableOpacity 
            style={[styles.exploreButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.exploreButtonText}>Explore Stories</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.storiesGrid}>
            {sortedFavorites.map((story) => (
              <FavoriteStoryCard
                key={story.id}
                story={story}
                onPress={() => handleStoryPress(story)}
                colors={colors}
              />
            ))}
          </View>
        </ScrollView>
      )}
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

  // Stats Header
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

  // Stories Grid
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
  storyContent: {
    padding: 16,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  storyAuthor: {
    fontSize: 14,
    marginBottom: 12,
  },
  storyMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
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

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});