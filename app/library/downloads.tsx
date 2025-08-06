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
  Download,
  Play,
  Clock,
  Star,
  Trash2,
  Share,
  Search,
  SortAsc,
  HardDrive,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Story } from "@/mocks/stories";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface DownloadedStory extends Story {
  downloadDate: string;
  fileSize: string;
  downloadStatus: 'completed' | 'downloading' | 'paused' | 'failed';
  progress?: number; // For downloading/paused states
}

interface DownloadedStoryCardProps {
  story: DownloadedStory;
  onPress: () => void;
  colors: any;
}

const DownloadedStoryCard: React.FC<DownloadedStoryCardProps> = ({ story, onPress, colors }) => {
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

  const getStatusIcon = () => {
    switch (story.downloadStatus) {
      case 'completed':
        return <CheckCircle size={12} color="#4CAF50" />;
      case 'downloading':
        return <Download size={12} color="#2196F3" />;
      case 'paused':
        return <AlertCircle size={12} color="#FF9500" />;
      case 'failed':
        return <AlertCircle size={12} color="#F44336" />;
    }
  };

  const getStatusColor = () => {
    switch (story.downloadStatus) {
      case 'completed':
        return '#4CAF50';
      case 'downloading':
        return '#2196F3';
      case 'paused':
        return '#FF9500';
      case 'failed':
        return '#F44336';
      default:
        return colors.mutedText;
    }
  };

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
          
          {story.downloadStatus === 'completed' && (
            <View style={styles.playButtonOverlay}>
              <BlurView intensity={20} style={styles.playButton}>
                <Play size={16} color="white" fill="white" />
              </BlurView>
            </View>
          )}

          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton story={story} size={20} />
          </View>

          <View style={styles.downloadIndicator}>
            <BlurView intensity={20} style={styles.downloadBadge}>
              {getStatusIcon()}
            </BlurView>
          </View>

          {/* Progress bar for downloading stories */}
          {(story.downloadStatus === 'downloading' || story.downloadStatus === 'paused') && story.progress && (
            <View style={styles.progressContainer}>
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                style={styles.progressBackground}
              >
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${story.progress}%`,
                        backgroundColor: getStatusColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{story.progress}%</Text>
              </LinearGradient>
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
              <HardDrive size={12} color={colors.mutedText} />
              <Text style={[styles.metaText, { color: colors.mutedText }]}>
                {story.fileSize}
              </Text>
            </View>
          </View>

          <View style={styles.downloadInfo}>
            <Text style={[styles.downloadDate, { color: colors.mutedText }]}>
              Downloaded {story.downloadDate}
            </Text>
            <View style={styles.statusContainer}>
              {getStatusIcon()}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {story.downloadStatus.charAt(0).toUpperCase() + story.downloadStatus.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.storyActions}>
            {story.downloadStatus === 'completed' && (
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
                <Play size={14} color={colors.primary} />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>Play</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
              <Share size={14} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F4433620' }]}>
              <Trash2 size={14} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mock downloaded stories data
const mockDownloadedStories: DownloadedStory[] = [
  {
    id: "download-1",
    title: "The Quantum Leap",
    duration: "22 min",
    author: "Dr. Sarah Chen",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1222",
    category: "Sci-Fi",
    rating: 4.9,
    description: "A mind-bending journey through parallel realities",
    playCount: 2500,
    tags: ["quantum", "reality", "science"],
    downloadDate: "Jan 15, 2024",
    fileSize: "45.2 MB",
    downloadStatus: 'completed',
  },
  {
    id: "download-2",
    title: "Echoes of the Past",
    duration: "18 min",
    author: "Marcus Williams",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1170",
    category: "Mystery",
    rating: 4.7,
    description: "Unraveling secrets buried in time",
    playCount: 1800,
    tags: ["mystery", "time", "secrets"],
    downloadDate: "Jan 12, 2024",
    fileSize: "38.7 MB",
    downloadStatus: 'completed',
  },
  {
    id: "download-3",
    title: "The Crystal Forest",
    duration: "25 min",
    author: "Luna Starweaver",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1169",
    category: "Fantasy",
    rating: 4.8,
    description: "A magical realm of living crystals",
    playCount: 2100,
    tags: ["fantasy", "crystals", "magic"],
    downloadDate: "Jan 10, 2024",
    fileSize: "52.1 MB",
    downloadStatus: 'downloading',
    progress: 65,
  },
  {
    id: "download-4",
    title: "Ocean's Memory",
    duration: "16 min",
    author: "Elena Rodriguez",
    imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1170",
    category: "Adventure",
    rating: 4.6,
    description: "Diving deep into forgotten waters",
    playCount: 1400,
    tags: ["ocean", "memory", "adventure"],
    downloadDate: "Jan 8, 2024",
    fileSize: "34.5 MB",
    downloadStatus: 'failed',
  },
];

export default function DownloadsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'size'>('recent');
  const [downloadedStories] = useState(mockDownloadedStories);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleStoryPress = (story: DownloadedStory) => {
    if (story.downloadStatus === 'completed') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/story/[id]",
        params: { id: story.id }
      });
    }
  };

  const sortedStories = [...downloadedStories].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'size':
        return parseFloat(b.fileSize) - parseFloat(a.fileSize);
      default:
        return new Date(b.downloadDate).getTime() - new Date(a.downloadDate).getTime();
    }
  });

  const totalSize = downloadedStories.reduce((total, story) => {
    return total + parseFloat(story.fileSize);
  }, 0);

  const completedCount = downloadedStories.filter(story => story.downloadStatus === 'completed').length;

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Downloads</Text>
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
              <View style={[styles.statsIcon, { backgroundColor: '#2196F320' }]}>
                <Download size={24} color="#2196F3" />
              </View>
              <View style={styles.statsInfo}>
                <Text style={[styles.statsNumber, { color: colors.text }]}>
                  {completedCount}/{downloadedStories.length}
                </Text>
                <Text style={[styles.statsLabel, { color: colors.mutedText }]}>
                  Downloaded • {totalSize.toFixed(1)} MB
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.sortButton, { backgroundColor: colors.card }]}
              onPress={() => {
                const sortOptions = ['recent', 'alphabetical', 'size'] as const;
                const currentIndex = sortOptions.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                setSortBy(sortOptions[nextIndex]);
                Haptics.selectionAsync();
              }}
            >
              <SortAsc size={16} color={colors.primary} />
              <Text style={[styles.sortText, { color: colors.primary }]}>
                {sortBy === 'recent' ? 'Recent' : sortBy === 'alphabetical' ? 'A-Z' : 'Size'}
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
            <DownloadedStoryCard
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
  downloadIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  downloadBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressBackground: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
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
  downloadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  downloadDate: {
    fontSize: 11,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  storyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});