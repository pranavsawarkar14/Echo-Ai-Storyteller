import React, { useState, useEffect, useCallback } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  RefreshControl,
  TextInput,
  Dimensions,
  Alert,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { 
  Play, 
  Pause, 
  Search, 
  Filter,
  Clock,
  Star,
  Headphones,
  TrendingUp,
  Calendar,
  Volume2,
  MoreHorizontal,
  ChevronRight,
  PlayCircle,
  Video,
  Eye,
  Download,
  Heart,
  Bookmark,
  ImageIcon,
  Film,
  Flame,
  Zap,
  Users,
  Award,
  Radio,
  Mic,
  BarChart3,
  Sparkles,
  Crown,
  Trending,
  Coffee,
  Layers,
  Music
} from "lucide-react-native";
import { VideoPreview } from "@/components/VideoPreview";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Story } from "@/mocks/stories";
import { mediaService, MediaItem } from "@/lib/mediaService";
import { pexelsApi } from "@/lib/pexelsApi";
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Episode {
  id: string;
  title: string;
  imageUrl: string;
  progress: number;
  duration: string;
  category: string;
  description: string;
  content: string;
  author: string;
  rating: number;
  totalListeners: number;
  releaseDate: string;
  isNew?: boolean;
  isTrending?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
  pexelsMedia?: MediaItem[];
  isFavorite?: boolean;
  downloadCount?: number;
}

const episodes: Episode[] = [
  {
    id: "1",
    title: "The Lost City of Atlantis",
    imageUrl: "https://images.unsplash.com/photo-1682686580391-615b1f28e6d0?q=80&w=1170&auto=format&fit=crop",
    progress: 100,
    duration: "15:30",
    category: "Adventure",
    description: "Dive deep into the mysterious underwater kingdom and discover its ancient secrets beneath the waves.",
    content: "Marina discovers an ancient map leading to Atlantis...",
    author: "Echo AI",
    rating: 4.8,
    totalListeners: 12500,
    releaseDate: "2024-01-15",
    isNew: false,
    isTrending: true,
    isFavorite: false,
    downloadCount: 2300,
  },
  {
    id: "2",
    title: "Whispers in the Dark Forest",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1170&auto=format&fit=crop",
    progress: 75,
    duration: "12:45",
    category: "Mystery",
    description: "Strange sounds echo through ancient woods. What secrets do the shadows hold?",
    content: "Sarah ventures into the mysterious forest...",
    author: "Echo AI",
    rating: 4.6,
    totalListeners: 8900,
    releaseDate: "2024-01-20",
    isNew: true,
    isTrending: false,
    isFavorite: true,
    downloadCount: 1800,
  },
  {
    id: "3",
    title: "Journey to the Stars",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1222&auto=format&fit=crop",
    progress: 25,
    duration: "18:20",
    category: "Sci-Fi",
    description: "Humanity's first interstellar voyage begins with unexpected discoveries.",
    content: "Captain Rodriguez commands the starship Horizon...",
    author: "Echo AI",
    rating: 4.9,
    totalListeners: 15600,
    releaseDate: "2024-01-10",
    isNew: false,
    isTrending: true,
    isFavorite: false,
    downloadCount: 4200,
  },
  {
    id: "4",
    title: "The Clockmaker's Secret",
    imageUrl: "https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=1170&auto=format&fit=crop",
    progress: 0,
    duration: "14:15",
    category: "Steampunk",
    description: "In Victorian London, a mysterious clockmaker holds the key to time itself.",
    content: "Professor Whitmore discovers an extraordinary timepiece...",
    author: "Echo AI",
    rating: 4.7,
    totalListeners: 6800,
    releaseDate: "2024-01-25",
    isNew: true,
    isTrending: false,
    isFavorite: false,
    downloadCount: 920,
  },
  {
    id: "5",
    title: "Echoes of Tomorrow",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1170&auto=format&fit=crop",
    progress: 45,
    duration: "16:45",
    category: "Sci-Fi",
    description: "A time traveler discovers that changing the past has unexpected consequences.",
    content: "Dr. Sarah Chen activates the temporal device...",
    author: "Echo AI",
    rating: 4.5,
    totalListeners: 7200,
    releaseDate: "2024-01-28",
    isNew: true,
    isTrending: false,
    isFavorite: true,
    downloadCount: 1150,
  },
  {
    id: "6",
    title: "The Dragon's Last Flight",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1170&auto=format&fit=crop",
    progress: 0,
    duration: "20:10",
    category: "Fantasy",
    description: "The last dragon awakens to find a world that has forgotten magic.",
    content: "Drakor opens his ancient eyes to a changed world...",
    author: "Echo AI",
    rating: 4.9,
    totalListeners: 18900,
    releaseDate: "2024-01-12",
    isNew: false,
    isTrending: true,
    isFavorite: false,
    downloadCount: 5600,
  },
];

const trendingBadges = [
  { icon: Flame, label: "🔥 Hot", color: "#FF6B6B" },
  { icon: Crown, label: "👑 Premium", color: "#F39C12" },
  { icon: Zap, label: "⚡ New", color: "#9B59B6" },
  { icon: Award, label: "🏆 Top", color: "#4ECDC4" },
  { icon: Trending, label: "📈 Rising", color: "#45B7D1" },
];

export default function EpisodesScreen() {
  const { colors } = useTheme();
  const { playStory, currentStory, isPlaying } = useAudioPlayer();
  const { favorites } = useFavorites();
  
  // State management
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [enhancedEpisodes, setEnhancedEpisodes] = useState<Episode[]>(episodes);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  
  // Animation values
  const searchOpacity = useSharedValue(0);
  const searchScale = useSharedValue(0.9);

  // Load enhanced media for episodes
  useEffect(() => {
    loadEnhancedMedia();
    loadFeaturedMedia();
  }, []);

  const loadEnhancedMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const enhanced = await Promise.all(
        episodes.map(async (episode, index) => {
          // Get Pexels videos for each episode
          const videos = await mediaService.getVideoPreviewsForStory(episode.category);
          const videoIndex = index % Math.max(videos.length, 1);
          const selectedVideo = videos[videoIndex] || null;
          
          // Get additional Pexels media for the episode
          const pexelsMedia = await mediaService.getMediaForCategory(episode.category, true);
          
          return {
            ...episode,
            videoUrl: selectedVideo?.url,
            videoThumbnail: selectedVideo?.thumbnailUrl,
            pexelsMedia: pexelsMedia.slice(0, 5),
          };
        })
      );
      setEnhancedEpisodes(enhanced);
    } catch (error) {
      console.error('Error loading enhanced media for episodes:', error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const loadFeaturedMedia = async () => {
    try {
      const media = await mediaService.getRandomMediaMix(10);
      setFeaturedMedia(media);
    } catch (error) {
      console.error('Error loading featured media:', error);
    }
  };

  // Convert Episode to Story format for audio player
  const convertEpisodeToStory = (episode: Episode): Story => ({
    id: episode.id,
    title: episode.title,
    author: episode.author,
    duration: episode.duration,
    category: episode.category,
    imageUrl: episode.imageUrl,
    description: episode.description,
    content: episode.content,
    isCompleted: episode.progress === 100,
    isFavorite: favorites.has(episode.id),
    rating: episode.rating,
    tags: [episode.category],
    chapters: Math.ceil(parseInt(episode.duration.split(':')[0]) / 5) || 1,
  });

  // Toggle favorite
  const toggleFavorite = useCallback((episodeId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(episodeId)) {
        newFavorites.delete(episodeId);
      } else {
        newFavorites.add(episodeId);
      }
      return newFavorites;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Get filtered episodes
  const filteredEpisodes = enhancedEpisodes.filter(episode => {
    const matchesSearch = episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         episode.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         episode.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "All" || episode.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Get featured episode (trending or highest rated)
  const featuredEpisode = episodes.find(ep => ep.isTrending) || episodes[0];
  const recentEpisodes = filteredEpisodes.filter(ep => ep.isNew);
  const popularEpisodes = filteredEpisodes.filter(ep => ep.totalListeners > 10000);
  const categories = ["All", "Adventure", "Mystery", "Sci-Fi", "Fantasy", "Steampunk"];

  // Handle play/pause
  const handlePlayPause = useCallback(async (episode: Episode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const storyData = convertEpisodeToStory(episode);
      await playStory(storyData, 1);
    } catch (error) {
      console.error('Failed to play episode:', error);
      Alert.alert("Playback Error", "Failed to play episode.");
    }
  }, [playStory]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadEnhancedMedia(),
      loadFeaturedMedia(),
      new Promise(resolve => setTimeout(resolve, 1000))
    ]);
    setIsRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Toggle search
  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    searchOpacity.value = withTiming(showSearch ? 0 : 1, { duration: 300 });
    searchScale.value = withSpring(showSearch ? 0.9 : 1, { damping: 20 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [showSearch]);

  const animatedSearchStyle = useAnimatedStyle(() => {
    return {
      opacity: searchOpacity.value,
      transform: [{ scale: searchScale.value }],
    };
  });

  // Premium Header Section with Auto-Playing Video
  const PremiumHeaderSection = () => {
    const enhancedFeatured = enhancedEpisodes.find(ep => ep.id === featuredEpisode.id) || featuredEpisode;
    
    return (
      <View style={styles.headerSection}>
        <TouchableOpacity
          style={styles.heroContainer}
          onPress={() => handlePlayPause(enhancedFeatured)}
          activeOpacity={0.95}
        >
          {enhancedFeatured.videoUrl ? (
            <VideoPreview
              videoUrl={enhancedFeatured.videoUrl}
              thumbnailUrl={enhancedFeatured.videoThumbnail || featuredEpisode.imageUrl}
              title={featuredEpisode.title}
              author={featuredEpisode.author}
              style={styles.heroVideo}
              autoPlay={true}
              showControls={false}
              muted={true}
              loop={true}
            />
          ) : (
            <Image
              source={{ uri: featuredEpisode.imageUrl }}
              style={styles.heroVideo}
              contentFit="cover"
            />
          )}
          
      {/* Enhanced gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
        style={styles.heroGradient}
      />

      {/* Floating trending badges moved to top */}
      <View style={[styles.floatingBadges, { top: 20, left: 20, right: 20, position: 'absolute', zIndex: 10 }]}> 
        {trendingBadges.slice(0, 3).map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <View 
              key={badge.label}
              style={[
                styles.floatingBadge,
                { backgroundColor: badge.color + '20', borderColor: badge.color + '40' }
              ]}
            >
              <IconComponent size={12} color={badge.color} />
              <Text style={[styles.floatingBadgeText, { color: badge.color }]}> 
                {badge.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Search Bar */}
      {showSearch && (
        <Animated.View style={[styles.searchContainer, animatedSearchStyle]}>
          <BlurView intensity={20} style={styles.searchBlur}>
            <View style={styles.searchInputContainer}>
              <Search size={18} color={colors.mutedText} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search episodes..."
                placeholderTextColor={colors.mutedText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={showSearch}
              />
            </View>
          </BlurView>
        </Animated.View>
      )}

          {/* Hero content */}
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {featuredEpisode.category.toUpperCase()}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{featuredEpisode.rating}</Text>
              </View>
            </View>
            
            <Text style={styles.heroTitle} numberOfLines={2}>
              {featuredEpisode.title}
            </Text>
            
            <Text style={styles.heroDescription} numberOfLines={3}>
              {featuredEpisode.description}
            </Text>
            
            {/* Auto-playing indicator */}
            <View style={styles.playingIndicator}>
              <View style={styles.audioWaves}>
                <View style={[styles.wave, styles.wave1]} />
                <View style={[styles.wave, styles.wave2]} />
                <View style={[styles.wave, styles.wave3]} />
                <View style={[styles.wave, styles.wave4]} />
              </View>
              <Text style={styles.playingText}>
                {enhancedFeatured.videoUrl ? 'Auto-Playing Video' : 'Tap to Listen'}
              </Text>
            </View>
            
            {/* Episode stats */}
            <View style={styles.episodeStats}>
              <View style={styles.statItem}>
                <Clock size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>{featuredEpisode.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>{(featuredEpisode.totalListeners / 1000).toFixed(1)}K</Text>
              </View>
              <View style={styles.statItem}>
                <Download size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>{(featuredEpisode.downloadCount! / 1000).toFixed(1)}K</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Enhanced Episode Card
  const EpisodeCard = ({ episode, index }: { episode: Episode; index: number }) => {
    const isCurrentlyPlaying = currentStory?.id === episode.id && isPlaying;
    
    // Convert Episode to Story format for FavoriteButton
    const episodeAsStory: Story = {
      id: episode.id,
      title: episode.title,
      author: episode.author,
      duration: episode.duration,
      imageUrl: episode.imageUrl,
      category: episode.category,
      description: episode.description,
      rating: episode.rating,
      playCount: episode.totalListeners,
      tags: [episode.category.toLowerCase()],
    };
    
    return (
      <TouchableOpacity 
        style={[styles.episodeCard, { backgroundColor: colors.card }]}
        onPress={() => handlePlayPause(episode)}
        activeOpacity={0.9}
      >
        <View style={styles.episodeImageContainer}>
          {episode.videoUrl ? (
            <VideoPreview
              videoUrl={episode.videoUrl}
              thumbnailUrl={episode.videoThumbnail || episode.imageUrl}
              title={episode.title}
              author={episode.author}
              style={styles.episodeImage}
              autoPlay={true}
              showControls={false}
              muted={true}
              loop={true}
            />
          ) : (
            <Image
              source={{ uri: episode.imageUrl }}
              style={styles.episodeImage}
              contentFit="cover"
            />
          )}
          
          {/* Episode badges */}
          <View style={styles.episodeBadges}>
            {episode.isNew && (
              <View style={[styles.episodeBadge, { backgroundColor: '#9B59B6' }]}>
                <Sparkles size={10} color="white" />
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
            {episode.isTrending && (
              <View style={[styles.episodeBadge, { backgroundColor: '#FF6B6B' }]}>
                <TrendingUp size={10} color="white" />
                <Text style={styles.badgeText}>HOT</Text>
              </View>
            )}
            {episode.videoUrl && (
              <View style={[styles.episodeBadge, { backgroundColor: '#8B5CF6' }]}>
                <Video size={10} color="white" />
                <Text style={styles.badgeText}>VIDEO</Text>
              </View>
            )}
          </View>
          
          {/* Play button overlay */}
          <View style={styles.playOverlay}>
            <View style={[styles.playButton, { backgroundColor: colors.primary + 'E6' }]}>
              {isCurrentlyPlaying ? (
                <Pause size={16} color="white" />
              ) : (
                <Play size={16} color="white" fill="white" />
              )}
            </View>
          </View>
          
          {/* Progress bar */}
          {episode.progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${episode.progress}%`,
                      backgroundColor: colors.primary 
                    }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.episodeContent}>
          <View style={styles.episodeHeader}>
            <Text style={[styles.episodeTitle, { color: colors.text }]} numberOfLines={2}>
              {episode.title}
            </Text>
            <FavoriteButton 
              story={episodeAsStory}
              size={18}
              showBackground={false}
              style={styles.favoriteButton}
            />
          </View>
          
          <Text style={[styles.episodeDescription, { color: colors.mutedText }]} numberOfLines={2}>
            {episode.description}
          </Text>
          
          <View style={styles.episodeMetrics}>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Clock size={12} color={colors.mutedText} />
                <Text style={[styles.metricText, { color: colors.mutedText }]}>
                  {episode.duration}
                </Text>
              </View>
              <View style={styles.metric}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={[styles.metricText, { color: colors.mutedText }]}>
                  {episode.rating}
                </Text>
              </View>
              <View style={styles.metric}>
                <Headphones size={12} color={colors.mutedText} />
                <Text style={[styles.metricText, { color: colors.mutedText }]}>
                  {(episode.totalListeners / 1000).toFixed(1)}K
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Category Filter Pills
  const CategoryFilters = () => (
    <View style={styles.filtersSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterPill,
              selectedFilter === category && { backgroundColor: colors.primary },
              { borderColor: colors.border }
            ]}
            onPress={() => setSelectedFilter(category)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === category 
                  ? { color: 'white' }
                  : { color: colors.text }
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <PremiumHeaderSection />
        <CategoryFilters />
        
        {/* Episodes List */}
        <View style={styles.episodesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              All Episodes
            </Text>
            <Text style={[styles.episodeCount, { color: colors.mutedText }]}>
              {filteredEpisodes.length} episodes
            </Text>
          </View>
          
          {isLoadingMedia && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedText }]}>
                Loading enhanced content...
              </Text>
            </View>
          )}
          
          <View style={styles.episodesList}>
            {filteredEpisodes.map((episode, index) => (
              <EpisodeCard key={episode.id} episode={episode} index={index} />
            ))}
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
  scrollView: {
    flex: 1,
  },
  
  // Header Section
  headerSection: {
    height: height * 0.6,
    marginBottom: 20,
  },
  heroContainer: {
    flex: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  heroVideo: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StatusBar.currentHeight || 44,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  topNavigation: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 3,
  },
  navLeft: {
    flex: 1,
  },
  appTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  appSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  navRight: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 70,
    left: 20,
    right: 20,
    zIndex: 3,
  },
  searchBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  floatingBadges: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 140,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  floatingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 32,
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  audioWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  wave: {
    width: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  wave1: { height: 10 },
  wave2: { height: 16 },
  wave3: { height: 6 },
  wave4: { height: 12 },
  playingText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  episodeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Filters Section
  filtersSection: {
    marginBottom: 20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Episodes Section
  episodesSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  episodeCount: {
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  episodesList: {
    gap: 16,
  },
  
  // Episode Card
  episodeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  episodeImageContainer: {
    position: 'relative',
    height: 180,
  },
  episodeImage: {
    width: '100%',
    height: '100%',
  },
  episodeBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  episodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressBackground: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
  },
  episodeContent: {
    padding: 16,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  episodeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginRight: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  episodeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  episodeMetrics: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '500',
  },
});