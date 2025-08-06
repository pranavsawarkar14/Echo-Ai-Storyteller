import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Play, Clock, User, Share2, FileText, Sparkles, Video, ImageIcon, BookOpen, Star, Heart, Headphones, Download, MoreHorizontal } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { TextEffect } from "@/components/ui/text-effect";
import { SpeechButton } from "@/components/ui/speech-button";
import { VideoPreview } from "@/components/VideoPreview";
import { Story } from "@/mocks/stories";
import { useTheme } from "@/contexts/ThemeContext";
import { useStories } from "@/contexts/StoriesContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { mediaService, MediaItem } from "@/lib/mediaService";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

const { width, height } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function StoryDetailScreen() {
  const { colors } = useTheme();
  const { getStoryById } = useStories();
  const { playStory } = useAudioPlayer();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [summaryAnimationComplete, setSummaryAnimationComplete] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [storyVideo, setStoryVideo] = useState<MediaItem | null>(null);
  const [additionalMedia, setAdditionalMedia] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [storyBookSections, setStoryBookSections] = useState<any[]>([]);
  
  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);
  const playButtonScale = useSharedValue(1);
  const summaryScale = useSharedValue(0);
  const favoriteScale = useSharedValue(1);
  const favoriteRotate = useSharedValue(0);
  const favoriteHeartScale = useSharedValue(1);
  const favoritePulse = useSharedValue(1);
  const storyImageOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (id) {
      const foundStory = getStoryById(id);
      if (foundStory) {
        setStory(foundStory);
        loadStoryMedia(foundStory);
        
        // Create storybook sections and animate them
        if (foundStory.content) {
          const sections = createStorybookSections(foundStory.content, foundStory.images);
          setStoryBookSections(sections);
          
          // Animate story images
          storyImageOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
        }
      }
    }
  }, [id, getStoryById]);

  // Show video after 3 seconds
  useEffect(() => {
    if (story && storyVideo) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [story, storyVideo]);

  const loadStoryMedia = async (storyData: Story) => {
    try {
      // Get video for the story
      const video = await mediaService.getUniqueVideoForStory(storyData.id, storyData.category);
      if (video) {
        setStoryVideo(video);
      }

      // Get additional media for the story
      const media = await mediaService.getMediaForCategory(storyData.category, true);
      setAdditionalMedia(media.slice(0, 10)); // Limit to 10 items
    } catch (error) {
      console.error('Error loading story media:', error);
    }
  };

  // Enhanced animations and interactions
  useEffect(() => {
    contentTranslateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, [story]);

  useEffect(() => {
    if (showSummary) {
      summaryScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      summaryScale.value = withSpring(0, { damping: 15, stiffness: 150 });
    }
  }, [showSummary]);

  const handleBackPress = () => {
    contentTranslateY.value = withTiming(height, { duration: 300 });
    headerOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => router.back(), 250);
  };

  const handlePlayPress = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    playButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    if (story) {
      try {
        await playStory(story, 1);
      } catch (error) {
        console.error('Failed to play story:', error);
      }
    }
  };

  const handleSharePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    console.log("Share story:", story?.title);
  };

  const handleSummaryPress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setShowSummary(!showSummary);
    setSummaryAnimationComplete(false);
  };

  const handleFavoritePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Modern heart animation with multiple effects
    favoriteScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1.2, { duration: 200 }),
      withTiming(1, { duration: 150 })
    );
    
    favoriteRotate.value = withSequence(
      withTiming(-15, { duration: 100 }),
      withTiming(15, { duration: 150 }),
      withTiming(0, { duration: 100 })
    );
    
    favoriteHeartScale.value = withSequence(
      withTiming(1.4, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
    
    // Pulse effect for liked state
    if (!isFavorite) {
      favoritePulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        3,
        true
      );
    }
    
    setIsFavorite(!isFavorite);
  };

  const toggleVideoView = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setShowVideo(!showVideo);
  };

  const handleMediaChange = (direction: 'next' | 'prev') => {
    if (additionalMedia.length === 0) return;
    
    if (direction === 'next') {
      setCurrentMediaIndex((prev) => (prev + 1) % additionalMedia.length);
    } else {
      setCurrentMediaIndex((prev) => (prev - 1 + additionalMedia.length) % additionalMedia.length);
    }
    
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // Calculate reading progress
    const maxScroll = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
    const progress = Math.max(0, Math.min(100, (offsetY / maxScroll) * 100));
    setReadingProgress(progress);
  };

  // Create storybook sections with integrated images
  const createStorybookSections = (content: string, images: string[] = []) => {
    if (!content) return [];
    
    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const sections = [];
    let imageIndex = 0;
    
    for (let i = 0; i < paragraphs.length; i++) {
      // Add text section
      sections.push({
        type: 'text',
        content: paragraphs[i].trim(),
        index: i
      });
      
      // Add image after every 2-3 paragraphs (if images available)
      if (images.length > imageIndex && (i + 1) % 2 === 0 && i < paragraphs.length - 1) {
        sections.push({
          type: 'image',
          content: images[imageIndex],
          index: imageIndex
        });
        imageIndex++;
      }
    }
    
    // Add remaining images at the end if any
    while (imageIndex < images.length) {
      sections.push({
        type: 'image',
        content: images[imageIndex],
        index: imageIndex
      });
      imageIndex++;
    }
    
    return sections;
  };

  const generateAISummary = (content: string): string => {
    if (!content) return "";
    
    // Split content into sentences
    const sentences = content.match(/[^\.!?]+[\.!?]+/g) || [];
    
    // Take first 2-3 sentences as summary, or first 200 characters
    let summary = sentences.slice(0, 3).join(" ");
    
    // If summary is too long, truncate to ~200 characters
    if (summary.length > 200) {
      summary = content.substring(0, 200);
      const lastSpace = summary.lastIndexOf(" ");
      if (lastSpace > 150) {
        summary = summary.substring(0, lastSpace) + "...";
      } else {
        summary = summary + "...";
      }
    }
    
    return summary || "This is an AI-generated story with rich characters and an engaging plot that will captivate your imagination.";
  };

  const getSummaryText = () => {
    if (!story) return "";
    
    // For AI-generated stories with content, generate real-time summary
    if (story.content && story.id.startsWith('ai-story-')) {
      return generateAISummary(story.content);
    }
    
    // Pre-defined summaries for original stories
    const summaries: Record<string, string> = {
      "1": "Deep beneath the ocean waves lies Atlantis, a magnificent city of crystal spires and flowing water channels. Dr. Marina Wells discovers ancient technology that could change humanity's future, but awakening the city's guardians brings unexpected consequences.",
      "2": "In the heart of an ancient forest, strange whispers echo through the trees at midnight. Sarah, a young botanist, uncovers a hidden world where plants communicate through bioluminescent signals, revealing secrets that have been buried for centuries.",
      "3": "Captain Alex Rivera leads humanity's first mission beyond the solar system aboard the starship Horizon. When they encounter an alien artifact near Proxima Centauri, the crew must decide whether to make contact or return home with their discovery.",
      "4": "Princess Lyra discovers she possesses the rare gift of dream magic in the kingdom of Aethermoor. As dark forces threaten to consume the realm, she must master her powers and unite the scattered magical clans before it's too late.",
      "5": "Archaeologist Dr. James Carter uncovers a tomb that predates known civilization by thousands of years. Inside, hieroglyphs tell of an advanced race that once ruled Earth, and their warning about a cosmic threat that returns every millennium.",
      "6": "The old Victorian mansion on Elm Street has stood empty for decades, but recent owners report strange phenomena. Paranormal investigator Emma Stone discovers the house exists in multiple dimensions simultaneously, trapping souls across time.",
      "7": "When time-travel researcher Dr. Elena Vasquez accidentally creates a temporal rift, she meets her soulmate from the 18th century. Their love story spans across centuries as they fight to find a way to be together without destroying the timeline.",
      "8": "Detective Marcus Kane faces his most challenging case yet: a series of murders that seem to predict future events. As he delves deeper, he realizes the killer might be trying to prevent a catastrophic future, making Kane question everything he believes about justice."
    };
    
    return summaries[story.id] || "This captivating story takes you on an unforgettable journey filled with mystery, adventure, and discovery. Experience a tale that will transport you to new worlds and leave you questioning the boundaries of imagination.";
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -50],
          Extrapolate.CLAMP
        )
      }
    ]
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }]
  }));

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }]
  }));

  const summaryAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: summaryScale.value }],
    opacity: summaryScale.value
  }));

  const favoriteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: favoriteScale.value * favoritePulse.value },
      { rotate: `${favoriteRotate.value}deg` }
    ]
  }));

  const favoriteHeartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteHeartScale.value }]
  }));

  const storyImageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: storyImageOpacity.value,
    transform: [
      { 
        translateY: interpolate(
          storyImageOpacity.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP
        ) 
      }
    ]
  }));

  if (!story) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Sparkles size={40} color="white" />
            <Text style={styles.loadingText}>Loading your story...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Reading Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${readingProgress}%`, backgroundColor: colors.primary }
          ]} 
        />
      </View>

      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Parallax Effect */}
        <Animated.View style={[styles.heroContainer, headerAnimatedStyle]}>
          {showVideo && storyVideo ? (
            <VideoPreview
              videoUrl={storyVideo.url}
              thumbnailUrl={storyVideo.thumbnailUrl || story.imageUrl}
              title={story.title}
              author={story.author}
              style={styles.heroImage}
              autoPlay={true}
              muted={true}
              borderRadius={0}
            />
          ) : (
            <Image
              source={{ uri: story.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
            />
          )}
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.heroOverlay}
          />
          
          {/* Header Controls */}
          <View style={styles.headerControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleBackPress}
              testID="back-button"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                style={styles.controlButtonGradient}
              >
                <ArrowLeft size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.headerRightControls}>
              {storyVideo && (
                <TouchableOpacity 
                  style={styles.controlButton} 
                  onPress={toggleVideoView}
                  testID="video-toggle-button"
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                    style={styles.controlButtonGradient}
                  >
                    {showVideo ? (
                      <ImageIcon size={20} color="white" />
                    ) : (
                      <Video size={20} color="white" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={handleSharePress}
                testID="share-button"
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                  style={styles.controlButtonGradient}
                >
                  <Share2 size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Hero Content */}
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{story.category?.toUpperCase() || 'STORY'}</Text>
            </View>
            
            <Text style={styles.heroTitle}>{story.title}</Text>
            
            <View style={styles.heroMeta}>
              <View style={styles.metaChip}>
                <Clock size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaChipText}>{story.duration}</Text>
              </View>
              <View style={styles.metaChip}>
                <User size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaChipText}>{story.author}</Text>
              </View>
              <View style={styles.metaChip}>
                <Star size={14} color="#FFD700" />
                <Text style={styles.metaChipText}>4.8</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Main Content */}
        <Animated.View style={[styles.mainContent, contentAnimatedStyle, { backgroundColor: colors.background }]}>
          {/* Action Section */}
          <View style={styles.actionSection}>
            <View style={styles.primaryActions}>
              <AnimatedTouchableOpacity 
                style={[styles.primaryPlayButton, playButtonAnimatedStyle]}
                onPress={handlePlayPress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.playButtonGradient}
                >
                  <Play size={24} color="white" fill="white" />
                  <Text style={styles.primaryPlayText}>Start Listening</Text>
                </LinearGradient>
              </AnimatedTouchableOpacity>
              
              <AnimatedTouchableOpacity 
                style={[styles.favoriteButton, favoriteAnimatedStyle]}
                onPress={handleFavoritePress}
              >
                <LinearGradient
                  colors={isFavorite ? ['#FF6B6B', '#FF8E8E'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.favoriteButtonGradient}
                >
                  <Animated.View style={favoriteHeartAnimatedStyle}>
                    <Heart 
                      size={24} 
                      color={isFavorite ? "white" : colors.text} 
                      fill={isFavorite ? "white" : "transparent"}
                    />
                  </Animated.View>
                </LinearGradient>
              </AnimatedTouchableOpacity>
            </View>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={[styles.actionChip, { backgroundColor: colors.card }]}
                onPress={handleSummaryPress}
                activeOpacity={0.8}
              >
                <FileText size={18} color={colors.primary} />
                <Text style={[styles.actionChipText, { color: colors.primary }]}>Summary</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionChip, { backgroundColor: colors.card }]}
                activeOpacity={0.8}
              >
                <Download size={18} color={colors.text} />
                <Text style={[styles.actionChipText, { color: colors.text }]}>Download</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionChip, { backgroundColor: colors.card }]}
                activeOpacity={0.8}
              >
                <Headphones size={18} color={colors.text} />
                <Text style={[styles.actionChipText, { color: colors.text }]}>Queue</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Summary Section */}
          {showSummary && (
            <Animated.View style={[styles.summaryCard, summaryAnimatedStyle]}>
              <LinearGradient
                colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']}
                style={[styles.summaryCardGradient, { backgroundColor: colors.card }]}
              >
                <View style={styles.summaryCardHeader}>
                  <View style={styles.summaryIcon}>
                    <Sparkles size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.summaryCardTitle, { color: colors.text }]}>AI Story Summary</Text>
                </View>
                
                <TextEffect
                  per="char"
                  preset="slide"
                  delay={50}
                  trigger={showSummary}
                  onAnimationComplete={() => setSummaryAnimationComplete(true)}
                  fontSize={16}
                  color={colors.mutedText}
                  style={styles.summaryCardText}
                >
                  {getSummaryText()}
                </TextEffect>
              </LinearGradient>
            </Animated.View>
          )}
          
          {/* Story Content */}
          {story.content ? (
            <View style={styles.contentSection}>
              <View style={styles.sectionHeader}>
                <BookOpen size={20} color={colors.primary} />
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Read Full Story</Text>
              </View>
              
              {/* Storybook Format with Integrated Images */}
              <View style={styles.storybookContainer}>
                {storyBookSections.map((section, index) => {
                  if (section.type === 'text') {
                    return (
                      <View 
                        key={`text-${index}`} 
                        style={[styles.storyTextSection, { backgroundColor: colors.card }]}
                      >
                        <Text style={[styles.storyContentText, { color: colors.text }]}>
                          {section.content}
                        </Text>
                      </View>
                    );
                  } else if (section.type === 'image') {
                    return (
                      <Animated.View 
                        key={`image-${index}`} 
                        style={[styles.storyImageSection, storyImageAnimatedStyle]}
                      >
                        <View style={styles.storyImageContainer}>
                          <Image
                            source={{ uri: section.content }}
                            style={styles.storyImage}
                            contentFit="cover"
                          />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.4)']}
                            style={styles.storyImageOverlay}
                          />
                          <View style={styles.storyImageCaption}>
                            <Text style={styles.storyImageCaptionText}>
                              Scene {section.index + 1}
                            </Text>
                          </View>
                        </View>
                      </Animated.View>
                    );
                  }
                  return null;
                })}
              </View>
            </View>
          ) : (
            <View style={styles.audioExperienceSection}>
              <View style={[styles.experienceCard, { backgroundColor: colors.card }]}>
                <LinearGradient
                  colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']}
                  style={styles.experienceCardGradient}
                >
                  <View style={styles.experienceHeader}>
                    <Headphones size={24} color={colors.primary} />
                    <Text style={[styles.experienceTitle, { color: colors.text }]}>Immersive Audio Experience</Text>
                  </View>
                  
                  <Text style={[styles.experienceDescription, { color: colors.mutedText }]}>
                    Listen as our advanced AI narrator brings every character to life with unique voices, 
                    atmospheric sound design, and immersive storytelling that transports you into the story.
                  </Text>
                  
                  <View style={styles.experienceFeatures}>
                    <View style={styles.featureItem}>
                      <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                        <User size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.featureText, { color: colors.text }]}>Unique Character Voices</Text>
                    </View>
                    
                    <View style={styles.featureItem}>
                      <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                        <Sparkles size={16} color={colors.primary} />
                      </View>
                      <Text style={[styles.featureText, { color: colors.text }]}>Atmospheric Soundscapes</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}
          
          {/* Enhanced Media Gallery */}
          {additionalMedia.length > 0 && (
            <View style={styles.mediaSection}>
              <View style={styles.sectionHeader}>
                <Video size={20} color={colors.primary} />
                <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Related Media</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.mutedText }]}>
                  {additionalMedia.length} items
                </Text>
              </View>
              
              <View style={[styles.currentMediaCard, { backgroundColor: colors.card }]}>
                {additionalMedia[currentMediaIndex]?.type === 'video' ? (
                  <VideoPreview
                    videoUrl={additionalMedia[currentMediaIndex].url}
                    thumbnailUrl={additionalMedia[currentMediaIndex].thumbnailUrl || additionalMedia[currentMediaIndex].url}
                    title={additionalMedia[currentMediaIndex].title}
                    author={additionalMedia[currentMediaIndex].author}
                    style={styles.currentMediaImage}
                    autoPlay={true}
                    muted={true}
                  />
                ) : (
                  <Image
                    source={{ uri: additionalMedia[currentMediaIndex].url }}
                    style={styles.currentMediaImage}
                    contentFit="cover"
                  />
                )}
                
                <View style={[styles.mediaControls, { backgroundColor: colors.background }]}>
                  <TouchableOpacity
                    style={[styles.mediaNavButton, { backgroundColor: colors.card }]}
                    onPress={() => handleMediaChange('prev')}
                    disabled={additionalMedia.length <= 1}
                  >
                    <ArrowLeft size={18} color={colors.primary} />
                  </TouchableOpacity>
                  
                  <View style={styles.mediaInfoContainer}>
                    <Text style={[styles.mediaInfoTitle, { color: colors.text }]} numberOfLines={1}>
                      {additionalMedia[currentMediaIndex]?.title || 'Related Media'}
                    </Text>
                    <Text style={[styles.mediaInfoCounter, { color: colors.mutedText }]}>
                      {currentMediaIndex + 1} of {additionalMedia.length} • {additionalMedia[currentMediaIndex]?.source.toUpperCase()}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.mediaNavButton, { backgroundColor: colors.card }]}
                    onPress={() => handleMediaChange('next')}
                    disabled={additionalMedia.length <= 1}
                  >
                    <ArrowLeft size={18} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.mediaThumbnailsContainer}
                contentContainerStyle={styles.thumbnailsScrollContent}
              >
                {additionalMedia.map((media, index) => (
                  <TouchableOpacity
                    key={media.id}
                    style={[
                      styles.mediaThumbnail,
                      index === currentMediaIndex && [styles.activeThumbnail, { borderColor: colors.primary }]
                    ]}
                    onPress={() => setCurrentMediaIndex(index)}
                  >
                    <Image
                      source={{ uri: media.thumbnailUrl || media.url }}
                      style={styles.thumbnailImg}
                      contentFit="cover"
                    />
                    {media.type === 'video' && (
                      <View style={styles.thumbnailVideoIndicator}>
                        <Video size={10} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Progress Bar
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 1000,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Hero Section
  heroContainer: {
    height: height * 0.6,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 2,
  },
  
  // Header Controls
  headerControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Hero Content
  heroContent: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    backdropFilter: 'blur(10px)',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    backdropFilter: 'blur(10px)',
  },
  metaChipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Live Indicator
  liveIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 127, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  liveIndicatorText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  // Main Content
  mainContent: {
    marginTop: -42,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
    minHeight: height * 0.7,
    position: 'relative',
    zIndex: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  // Action Section
  actionSection: {
    marginBottom: 30,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  primaryPlayButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryPlayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  favoriteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  favoriteButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Summary Card
  summaryCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryCardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryCardText: {
    lineHeight: 24,
  },
  
  // Content Section
  contentSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  storyContentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  storyContentText: {
    fontSize: 16,
    lineHeight: 26,
  },
  
  // Storybook Format
  storybookContainer: {
    gap: 20,
  },
  storyTextSection: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
  },
  storyImageSection: {
    marginVertical: 16,
  },
  storyImageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  storyImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
  },
  storyImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  storyImageCaption: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  storyImageCaptionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Image Gallery
  imageGallery: {
    marginBottom: 20,
  },
  galleryImageContainer: {
    width: width * 0.7,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  
  // Audio Experience Section
  audioExperienceSection: {
    marginBottom: 30,
  },
  experienceCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  experienceCardGradient: {
    padding: 24,
  },
  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  experienceTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  experienceDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  experienceFeatures: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Media Section
  mediaSection: {
    marginBottom: 30,
  },
  currentMediaCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  currentMediaImage: {
    width: '100%',
    height: width * 0.6,
  },
  mediaControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  mediaNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaInfoContainer: {
    flex: 1,
  },
  mediaInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mediaInfoCounter: {
    fontSize: 14,
  },
  
  // Media Thumbnails
  mediaThumbnailsContainer: {
    marginTop: 8,
  },
  thumbnailsScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  mediaThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  activeThumbnail: {
    borderWidth: 3,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailVideoIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    padding: 3,
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: 100,
  },
});