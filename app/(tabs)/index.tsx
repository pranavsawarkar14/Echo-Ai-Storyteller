import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";

const { width } = Dimensions.get('window');
import { useRouter } from "expo-router";
import { StorySearchInteraction } from '@/components/AirbnbSearchInteraction';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { 
  Sparkles, 
  Plus,
  TrendingUp,
  Clock,
  BookOpen,
  Headphones,
  Star,
  Users,
  Target,
  Zap,
  Globe,
  ChevronRight,
  PlayCircle,
  Activity,
  Crown,
  Award,
  Calendar,
  Heart,
  Play,
  Flame,
  Eye,
  TrendingUp as Trending,
  BarChart3,
  Music,
  Download,
  Share,
  Bookmark,
  Volume2,
  Coffee,
  Moon,
  Sun,
  Mic,
  Radio,
  Headphones as HeadphonesIcon
} from "lucide-react-native";
import { Header } from "@/components/Header";
import { StoryCard } from "@/components/StoryCard";
import { CategoryPills } from "@/components/CategoryPills";

import { EnhancedStoryGrid } from "@/components/EnhancedStoryGrid";
import { VideoPreview } from "@/components/VideoPreview";
import { MediaGallery } from "@/components/MediaGallery";

import { Story } from "@/mocks/stories";
import { useTheme } from "@/contexts/ThemeContext";
import { useStories } from "@/contexts/StoriesContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useUserStats } from "@/contexts/UserStatsContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { OnboardingDebugTools } from "@/components/OnboardingDebugTools";
import { mediaService, MediaItem } from "@/lib/mediaService";
import NotificationIcon from "@/components/NotificationIcon";
import RealtimeJourneyDashboard from "@/components/RealtimeJourneyDashboard";

import * as Haptics from 'expo-haptics';

const trendingTags = [
  { label: "🚀 Tranding", color: "#FF6B6B" },
  { label: "💎 Creator's Choice", color: "#4ECDC4" },
  { label: "🎧 Most Played", color: "#45B7D1" },
  { label: "⚡ Fresh Drops", color: "#9B59B6" },
  { label: "👑 Premium", color: "#F39C12" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { getStoriesByCategory, categories } = useStories();
  const { playStory } = useAudioPlayer();
  const { userStats } = useUserStats();

  
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showMediaGallery, setShowMediaGallery] = useState<boolean>(false);
  const [heroMedia, setHeroMedia] = useState<MediaItem | null>(null);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentFeaturedStoryIndex, setCurrentFeaturedStoryIndex] = useState(0);
  const featuredStoriesRef = useRef<FlatList>(null);
  
  const filteredStories = hasSearched ? searchResults : getStoriesByCategory(selectedCategory);
  const recentStories = filteredStories.slice(0, 5);
  const recommendedStories = filteredStories.slice(2, 7);
  const trendingStories = filteredStories.filter(story => story.rating && story.rating > 4.7);
  const featuredStories = filteredStories.slice(0, 6); // Get first 6 stories for featured carousel
  const featuredStory = featuredStories[currentFeaturedStoryIndex] || filteredStories[0];

  // Debug log
  console.log('Featured Stories:', featuredStories.length, 'stories available');

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  
  // Animated styles for search bar
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const velocity = Math.abs(scrollY.value);
    const duration = Math.max(150, 300 - velocity); // Faster scroll = shorter duration

    const height = withTiming(
      scrollY.value > 10 ? 0 : 70,
      { 
        duration,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      }
    );
    
    const opacity = withTiming(
      scrollY.value > 10 ? 0 : 1,
      { 
        duration,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      }
    );

    const marginTop = withTiming(
      scrollY.value > 10 ? -20 : 0,
      {
        duration,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      }
    );

    return {
      height,
      opacity,
      transform: [{ scale: opacity }],
      marginTop,
    };
  });

  // Load enhanced media
  useEffect(() => {
    loadEnhancedMedia();
  }, [selectedCategory]);

  // Auto-rotate featured media
  useEffect(() => {
    if (featuredMedia.length > 1) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredMedia.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredMedia]);

  // Auto-rotate featured stories
  useEffect(() => {
    if (featuredStories.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentFeaturedStoryIndex + 1) % featuredStories.length;
        setCurrentFeaturedStoryIndex(nextIndex);
        try {
          featuredStoriesRef.current?.scrollToIndex({ 
            index: nextIndex, 
            animated: true 
          });
        } catch (error) {
          console.log('ScrollToIndex error:', error);
        }
      }, 8000); // Slower rotation for stories
      return () => clearInterval(interval);
    }
  }, [featuredStories, currentFeaturedStoryIndex]);

  const loadEnhancedMedia = async () => {
    try {
      if (featuredStory) {
        const hero = await mediaService.getHeroMedia(featuredStory.category);
        setHeroMedia(hero);
      }
      
      // Get multiple featured media
      const featured = await mediaService.getRandomMediaMix(8);
      setFeaturedMedia(featured);
    } catch (error) {
      console.error('Error loading enhanced media:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Refresh will be handled by the RealtimeJourneyDashboard component
    // which automatically updates every 30 seconds
    setIsRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleStoryPress = useCallback((story: Story) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/story/[id]",
      params: { id: story.id }
    });
  }, [router]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleAIGenerate = useCallback(() => {
    router.push("/ai-story-generator");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [router]);

  const handleStorySearch = useCallback((searchData: { genre: string; duration: string; mood: string }) => {
    // Filter stories based on search criteria
    let filtered = getStoriesByCategory("All");
    
    if (searchData.genre) {
      filtered = filtered.filter(story => 
        story.category.toLowerCase().includes(searchData.genre.toLowerCase()) ||
        story.title.toLowerCase().includes(searchData.genre.toLowerCase()) ||
        story.tags?.some(tag => tag.toLowerCase().includes(searchData.genre.toLowerCase()))
      );
    }
    
    if (searchData.duration) {
      const durationMap = {
        'short': { min: 0, max: 600 },
        'medium': { min: 600, max: 1200 },
        'long': { min: 1200, max: Infinity }
      };
      
      const searchDuration = searchData.duration.toLowerCase();
      Object.keys(durationMap).forEach(key => {
        if (searchDuration.includes(key)) {
          filtered = filtered.filter(story => {
            const durationInSeconds = parseInt(story.duration.replace('min', '')) * 60 || 600;
            return durationInSeconds >= durationMap[key as keyof typeof durationMap].min && 
                   durationInSeconds <= durationMap[key as keyof typeof durationMap].max;
          });
        }
      });
    }
    
    if (searchData.mood) {
      filtered = filtered.filter(story => 
        story.description?.toLowerCase().includes(searchData.mood.toLowerCase()) ||
        story.title.toLowerCase().includes(searchData.mood.toLowerCase()) ||
        story.category.toLowerCase().includes(searchData.mood.toLowerCase())
      );
    }
    
    // Store search results and update view
    setSearchResults(filtered);
    setHasSearched(true);
    setSelectedCategory("All");
    
    if (filtered.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [getStoriesByCategory]);

  const handleSearchBarPress = useCallback(() => {
    setShowSearchModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleClearSearch = useCallback(() => {
    setHasSearched(false);
    setSearchResults([]);
    setSelectedCategory("All");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Add scroll handler for the animated search bar
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Featured Story Card Component
  const FeaturedStoryCard = ({ story, index }: { story: Story, index: number }) => {
    const currentMedia = featuredMedia[currentFeaturedIndex];
    
    return (
      <View style={styles.storyCardWrapper}>
        <TouchableOpacity
          style={styles.heroContainer}
          onPress={() => handleStoryPress(story)}
          activeOpacity={0.95}
        >
        {currentMedia && currentMedia.type === 'video' ? (
          <VideoPreview
            videoUrl={currentMedia.url}
            thumbnailUrl={currentMedia.thumbnailUrl || story?.imageUrl || ''}
            title={story?.title}
            author={story?.author}
            style={styles.heroVideo}
            autoPlay={index === currentFeaturedStoryIndex}
            showControls={false}
            muted={true}
          />
        ) : (
          <Image
            source={{ uri: story?.imageUrl }}
            style={styles.heroVideo}
            contentFit="cover"
          />
        )}
        
        {/* Multi-layer gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
          style={styles.heroGradient}
        />
        
        {/* Floating trending badges */}
        <View style={styles.trendingBadges}>
          {trendingTags.slice(0, 2).map((tag, tagIndex) => (
            <Animated.View 
              key={tag.label}
              style={[
                styles.trendingBadge,
                { backgroundColor: tag.color + '20', borderColor: tag.color + '40' }
              ]}
            >
              <Text style={[styles.trendingBadgeText, { color: tag.color }]}>
                {tag.label}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Hero content */}
        <View style={styles.heroContent}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroCategory}>
              {story?.category?.toUpperCase() || 'FEATURED'}
            </Text>
            <View style={styles.heroRating}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>
                {story?.rating || 4.9}
              </Text>
            </View>
          </View>
          
          <Text style={styles.heroTitle} numberOfLines={2}>
            {story?.title}
          </Text>
          
          <Text style={styles.heroAuthor}>
            by {story?.author}
          </Text>
          
          <Text style={styles.heroDescription} numberOfLines={3}>
            {story?.description}
          </Text>
          
          {/* Auto-playing indicator */}
          <View style={styles.autoPlayIndicator}>
            <View style={styles.audioWaves}>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
              <View style={[styles.wave, styles.wave4]} />
            </View>
            <Text style={styles.autoPlayText}>
              {currentMedia?.type === 'video' ? 'Video Playing' : 'Ready to Listen'}
            </Text>
          </View>
          
          {/* Story stats */}
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Clock size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{story?.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>12K listeners</Text>
            </View>
            <View style={styles.statItem}>
              <Download size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>4.2K</Text>
            </View>
          </View>
        </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Premium Hero Section with Swipeable Stories
  const PremiumHeroSection = () => {
    const handleScroll = (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset;
      const index = Math.round(contentOffset.x / width);
      if (index !== currentFeaturedStoryIndex && index >= 0 && index < featuredStories.length) {
        setCurrentFeaturedStoryIndex(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    // Don't render if no stories
    if (!featuredStories || featuredStories.length === 0) {
      return null;
    }

    return (
      <View style={styles.heroSection}>
        <Text style={[styles.sectionTitlef, { color: colors.text }]}>
          Feature Stories ✨
        </Text>
        
        <FlatList
          ref={featuredStoriesRef}
          data={featuredStories}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          renderItem={({ item, index }) => (
            <FeaturedStoryCard story={item} index={index} />
          )}
          snapToInterval={width}
          decelerationRate="fast"
          contentContainerStyle={[
            styles.featuredCarousel,
            { paddingHorizontal: 0 }
          ]}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          snapToAlignment="center"
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
        
        {/* Story indicators */}
        {featuredStories.length > 1 && (
          <View style={styles.storyIndicators}>
            {featuredStories.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  index === currentFeaturedStoryIndex && styles.activeIndicator
                ]}
                onPress={() => {
                  setCurrentFeaturedStoryIndex(index);
                  try {
                    featuredStoriesRef.current?.scrollToIndex({ 
                      index, 
                      animated: true 
                    });
                  } catch (error) {
                    console.log('ScrollToIndex error:', error);
                  }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Premium Welcome Section
  const PremiumWelcomeSection = () => {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good Morning' : timeOfDay < 18 ? 'Good Afternoon' : 'Good Evening';
    const icon = timeOfDay < 12 ? Coffee : timeOfDay < 18 ? Sun : Moon;
    const IconComponent = icon;

    return (
      <View style={styles.welcomeSection}>
        <BlurView intensity={20} style={styles.welcomeBlur}>
          <View style={styles.welcomeContent}>
            <View style={styles.greetingRow}>
              <IconComponent size={20} color={colors.primary} />
              <Text style={[styles.greetingText, { color: colors.mutedText }]}>
                {greeting}
              </Text>
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Ready for your next Story?
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.mutedText }]}>
              Discover new worlds through immersive storytelling
            </Text>
          </View>
        </BlurView>
      </View>
    );
  };

  // Enhanced Stats Dashboard
  const EnhancedStatsSection = () => (
    <View style={styles.statsSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <BarChart3 size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Journey
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/journey')}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsGrid}>
        {/* Primary Stats */}
        <View style={styles.primaryStatsRow}>
          <TouchableOpacity style={[styles.primaryStatCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[colors.primary + '20', colors.primary + '05']}
              style={styles.statCardGradient}
            >
              <View style={styles.statCardContent}>
                <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                  <BookOpen size={24} color={colors.primary} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {userStats.totalStoriesRead}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Stories
                  </Text>
                  <Text style={[styles.statSubLabel, { color: colors.mutedText }]}>
                    Completed
                  </Text>
                </View>
                <View style={styles.statTrend}>
                  <TrendingUp size={16} color="#4CAF50" />
                  <Text style={styles.trendPercentage}>+12%</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.primaryStatCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={['#FF6B6B20', '#FF6B6B05']}
              style={styles.statCardGradient}
            >
              <View style={styles.statCardContent}>
                <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
                  <HeadphonesIcon size={24} color="#FF6B6B" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {Math.floor(userStats.totalListeningTime / 60)}h
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Listen
                  </Text>
                  <Text style={[styles.statSubLabel, { color: colors.mutedText }]}>
                    Time
                  </Text>
                </View>
                <View style={styles.statTrend}>
                  <TrendingUp size={16} color="#4CAF50" />
                  <Text style={styles.trendPercentage}>+8%</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Secondary Stats */}
        <View style={styles.secondaryStatsRow}>
          <TouchableOpacity style={[styles.secondaryStatCard, { backgroundColor: colors.card }]}>
            <View style={[styles.smallStatIcon, { backgroundColor: '#4ECDC420' }]}>
              <Target size={20} color="#4ECDC4" />
            </View>
            <Text style={[styles.secondaryStatNumber, { color: colors.text }]}>
              {userStats.readingStreak}
            </Text>
            <Text style={[styles.secondaryStatLabel, { color: colors.mutedText }]}>
              Day Streak
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.secondaryStatCard, { backgroundColor: colors.card }]}>
            <View style={[styles.smallStatIcon, { backgroundColor: '#F39C1220' }]}>
              <Star size={20} color="#F39C12" />
            </View>
            <Text style={[styles.secondaryStatNumber, { color: colors.text }]}>
              {userStats.averageRating}
            </Text>
            <Text style={[styles.secondaryStatLabel, { color: colors.mutedText }]}>
              Avg Rating
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.secondaryStatCard, { backgroundColor: colors.card }]}>
            <View style={[styles.smallStatIcon, { backgroundColor: '#9B59B620' }]}>
              <Sparkles size={20} color="#9B59B6" />
            </View>
            <Text style={[styles.secondaryStatNumber, { color: colors.text }]}>
              {userStats.storiesCreated}
            </Text>
            <Text style={[styles.secondaryStatLabel, { color: colors.mutedText }]}>
              Created
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // AI Story Generator Card
  const AIGeneratorCard = () => (
    <TouchableOpacity 
      style={[styles.aiGeneratorCard, { backgroundColor: colors.card }]}
      onPress={handleAIGenerate}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.aiGeneratorGradient}
      >
        <View style={styles.aiGeneratorContent}>
          <View style={styles.aiGeneratorIcon}>
            <Sparkles size={28} color="white" />
          </View>
          <View style={styles.aiGeneratorText}>
            <Text style={styles.aiGeneratorTitle}>Create Your Story</Text>
            <Text style={styles.aiGeneratorSubtitle}>
              Let AI craft a personalized adventure just for you
            </Text>
          </View>
          <View style={styles.aiGeneratorButton}>
            <Plus size={24} color="white" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Home" subtitle="Discover, Listen, and Create Your Next Adventure"/>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Search Section */}
      <Animated.View style={[styles.searchWrapper, searchBarAnimatedStyle]}>
        <View style={styles.searchContainer}>
          <StorySearchInteraction 
            onSearch={handleStorySearch}
            scrollY={scrollY}
          />
        </View>
      </Animated.View>

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
        onScroll={(event) => {
          'worklet';
          const currentY = event.nativeEvent.contentOffset.y;
          scrollY.value = currentY;
        }}
        scrollEventThrottle={16}
      >
        <PremiumWelcomeSection />
        <PremiumHeroSection />
        
        {/* Real-time Journey Dashboard */}
        <RealtimeJourneyDashboard variant="home" />
        
        <AIGeneratorCard />
        
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </View>
        
        {/* Stories Grid */}
        <View style={styles.storiesSection}>
          <EnhancedStoryGrid
            stories={filteredStories}
            onStoryPress={handleStoryPress}
            onPlayStory={playStory}
            title="Discover Stories"
          />
        </View>
      </ScrollView>
      




    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    width: '100%',
    zIndex: 1000,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },

  
  // Welcome Section
  welcomeSection: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  welcomeBlur: {
    padding: 16,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Stats Section
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    gap: 12,
  },
  primaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryStatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statSubLabel: {
    fontSize: 10,
  },
  statTrend: {
    alignItems: 'center',
    gap: 2,
  },
  trendPercentage: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  smallStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  secondaryStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  secondaryStatLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  
  // Search Container Styles
  searchContainer: {
    marginHorizontal: 16,
    marginVertical: 1,
    borderRadius: 28,
    backgroundColor: 'transparent',
  },

  // AI Generator Card
  aiGeneratorCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiGeneratorGradient: {
    padding: 20,
  },
  aiGeneratorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aiGeneratorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiGeneratorText: {
    flex: 1,
  },
  aiGeneratorTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiGeneratorSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  aiGeneratorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Section Styles
  heroSection: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitlef: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  heroContainer: {
    height: 520,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    width: width - 32, // Adjust for proper alignment with container padding
    marginHorizontal: 16,
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
  },
  trendingBadges: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  trendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  trendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  heroAuthor: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  autoPlayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  audioWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  wave: {
    width: 3,
    backgroundColor: '#4ECDC4',
    borderRadius: 1.5,
  },
  wave1: {
    height: 12,
  },
  wave2: {
    height: 8,
  },
  wave3: {
    height: 16,
  },
  wave4: {
    height: 10,
  },
  autoPlayText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Categories and Stories
  categoriesSection: {
    marginBottom: 24,
  },
  storiesSection: {
    marginBottom: 40,
  },
  
  // Featured Stories Carousel
  featuredCarousel: {
    alignItems: 'center',
  },
  storyCardWrapper: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeIndicator: {
    backgroundColor: '#4ECDC4',
    width: 24,
  },
});