import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
  Pressable,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { 
  X, 
  ArrowLeft,
  Sparkles, 
  Wand2, 
  Users, 
  Brain, 
  Settings,
  Target,
  Type,
  Sun,
  Play,
  Headphones,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Save,
  FileEdit,
  Check,
  Star,
  Zap,
  Heart,
  Feather,
  Edit3,
} from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { TextEffect } from "@/components/ui/text-effect";
import { useStories } from "@/contexts/StoriesContext";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Chapter {
  title: string;
  text: string;
  image?: string;
}

interface StoryData {
  title: string;
  content: string;
  genre: string;
  readingTime: string;
  chapters: Chapter[];
  summary?: string;
}

// Keep the exact same bouncing loader
const BouncingCirclesLoader = ({ isGenerating }: { isGenerating: boolean }) => {
  const circle1Y = useSharedValue(60);
  const circle2Y = useSharedValue(60);
  const circle3Y = useSharedValue(60);
  const circle1Scale = useSharedValue(1.7);
  const circle2Scale = useSharedValue(1.7);
  const circle3Scale = useSharedValue(1.7);
  const circle1Height = useSharedValue(5);
  const circle2Height = useSharedValue(5);
  const circle3Height = useSharedValue(5);
  
  const shadow1Scale = useSharedValue(1.5);
  const shadow2Scale = useSharedValue(1.5);
  const shadow3Scale = useSharedValue(1.5);
  const shadow1Opacity = useSharedValue(0.9);
  const shadow2Opacity = useSharedValue(0.9);
  const shadow3Opacity = useSharedValue(0.9);

  useEffect(() => {
    if (isGenerating) {
      const animateCircle = (
        yValue: Animated.SharedValue<number>,
        scaleValue: Animated.SharedValue<number>,
        heightValue: Animated.SharedValue<number>,
        shadowScaleValue: Animated.SharedValue<number>,
        shadowOpacityValue: Animated.SharedValue<number>,
        delay: number
      ) => {
        const animation = withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(0, { duration: 250 }, () => {
                scaleValue.value = withTiming(1);
                heightValue.value = withTiming(20);
                shadowScaleValue.value = withTiming(0.2);
                shadowOpacityValue.value = withTiming(0.4);
              }),
              withTiming(60, { duration: 250 }, () => {
                scaleValue.value = withTiming(1.7);
                heightValue.value = withTiming(5);
                shadowScaleValue.value = withTiming(1.5);
                shadowOpacityValue.value = withTiming(0.9);
              })
            ),
            -1,
            false
          )
        );
        
        yValue.value = animation;
      };

      animateCircle(circle1Y, circle1Scale, circle1Height, shadow1Scale, shadow1Opacity, 0);
      animateCircle(circle2Y, circle2Scale, circle2Height, shadow2Scale, shadow2Opacity, 200);
      animateCircle(circle3Y, circle3Scale, circle3Height, shadow3Scale, shadow3Opacity, 300);
    } else {
      circle1Y.value = withTiming(60);
      circle2Y.value = withTiming(60);
      circle3Y.value = withTiming(60);
      circle1Scale.value = withTiming(1.7);
      circle2Scale.value = withTiming(1.7);
      circle3Scale.value = withTiming(1.7);
      circle1Height.value = withTiming(5);
      circle2Height.value = withTiming(5);
      circle3Height.value = withTiming(5);
      shadow1Scale.value = withTiming(1.5);
      shadow2Scale.value = withTiming(1.5);
      shadow3Scale.value = withTiming(1.5);
      shadow1Opacity.value = withTiming(0.9);
      shadow2Opacity.value = withTiming(0.9);
      shadow3Opacity.value = withTiming(0.9);
    }
  }, [isGenerating]);

  const circle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: circle1Y.value },
      { scaleX: circle1Scale.value }
    ],
    height: circle1Height.value,
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: circle2Y.value },
      { scaleX: circle2Scale.value }
    ],
    height: circle2Height.value,
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: circle3Y.value },
      { scaleX: circle3Scale.value }
    ],
    height: circle3Height.value,
  }));

  const shadow1Style = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadow1Scale.value }],
    opacity: shadow1Opacity.value,
  }));

  const shadow2Style = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadow2Scale.value }],
    opacity: shadow2Opacity.value,
  }));

  const shadow3Style = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadow3Scale.value }],
    opacity: shadow3Opacity.value,
  }));

  return (
    <View style={bouncingStyles.container}>
      <View style={bouncingStyles.wrapper}>
        <Animated.View style={[bouncingStyles.circle, bouncingStyles.circle1, circle1Style]} />
        <Animated.View style={[bouncingStyles.circle, bouncingStyles.circle2, circle2Style]} />
        <Animated.View style={[bouncingStyles.circle, bouncingStyles.circle3, circle3Style]} />
        
        <Animated.View style={[bouncingStyles.shadow, bouncingStyles.shadow1, shadow1Style]} />
        <Animated.View style={[bouncingStyles.shadow, bouncingStyles.shadow2, shadow2Style]} />
        <Animated.View style={[bouncingStyles.shadow, bouncingStyles.shadow3, shadow3Style]} />
      </View>
      
      <Text style={bouncingStyles.statusText}>Creating your story...</Text>
    </View>
  );
};

// Keep exact same progress indicator
const RefinedProgressIndicator = ({ progress, isGenerating }: { progress: number; isGenerating: boolean }) => {
  const progressAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    if (isGenerating) {
      progressAnim.value = withTiming(progress / 100, { duration: 600 });
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0.3, { duration: 1200 })
        ), -1, true
      );
    }
  }, [progress, isGenerating]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowAnim.value * 0.6,
  }));

  return (
    <View style={refinedStyles.progressSection}>
      <View style={refinedStyles.progressHeader}>
        <Text style={refinedStyles.progressTitle}>Creating Story</Text>
        <Text style={refinedStyles.progressValue}>{Math.round(progress)}%</Text>
      </View>
      
      <View style={refinedStyles.progressTrack}>
        <Animated.View style={[refinedStyles.progressBar, progressStyle, glowStyle]}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={refinedStyles.progressGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// Keep exact same status messages
const RefinedStatusMessages = ({ isGenerating }: { isGenerating: boolean }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messageOpacity = useSharedValue(0);

  const messages = [
    { text: "Analyzing your creative vision", icon: "🎨" },
    { text: "Building narrative structure", icon: "📖" },
    { text: "Weaving compelling characters", icon: "✨" },
    { text: "Creating vivid scenes", icon: "🌟" },
    { text: "Adding finishing touches", icon: "💫" }
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        messageOpacity.value = withSequence(
          withTiming(0, { duration: 300 }),
          withTiming(1, { duration: 500 })
        );
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 2500);

      messageOpacity.value = withTiming(1);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  return (
    <Animated.View style={[refinedStyles.statusMessage, messageStyle]}>
      <Text style={refinedStyles.statusIcon}>{messages[currentMessage].icon}</Text>
      <Text style={refinedStyles.statusText}>{messages[currentMessage].text}</Text>
    </Animated.View>
  );
};

export default function AIStoryGeneratorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { addStory } = useStories();

  // Get initial prompt from params
  const initialPrompt = params.prompt as string || "";
  
  // All existing state variables
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<string>("");
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedStory, setGeneratedStory] = useState<StoryData | null>(null);
  const [showStory, setShowStory] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [creativityLevel, setCreativityLevel] = useState<number>(3);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [storyPages, setStoryPages] = useState<Chapter[][]>([]);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // All existing data arrays
  const genres = ["Adventure", "Mystery", "Sci-Fi", "Fantasy", "Romance", "Horror", "Comedy", "Drama"];
  const lengths = ["Short (5-10 min)", "Medium (10-15 min)", "Long (15-20 min)", "Extended (20-30 min)", "Epic (30+ min)"];
  const tones = ["Light & Fun", "Mysterious", "Epic", "Romantic", "Dark", "Inspiring"];
  const audiences = ["Children", "Teenagers", "Young Adults", "Adults", "All Ages"];

  // All existing functions
  const paginateStory = (chapters: Chapter[]): Chapter[][] => {
    const chaptersPerPage = 2;
    const pages: Chapter[][] = [];
    for (let i = 0; i < chapters.length; i += chaptersPerPage) {
      pages.push(chapters.slice(i, i + chaptersPerPage));
    }
    return pages.length > 0 ? pages : [[]];
  };

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleClose = () => {
    router.back();
  };

  const getRealTimeSummary = () => {
    if (!generatedStory || !storyPages[currentPage]) return "";
    return storyPages[currentPage].map(chapter => chapter.text.slice(0, 100) + "...").join("\n\n");
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  const fetchStoryImage = async (query: string): Promise<string | undefined> => {
    try {
      const imageUrl = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
      return imageUrl;
    } catch (error) {
      console.warn('Failed to fetch image:', error);
      return undefined;
    }
  };

  // Keep all the story generation logic exactly the same
  const generateStory = async () => {
    const hasPrompt = prompt && prompt.trim().length > 0;
    const hasGenre = selectedGenre && selectedGenre.length > 0;

    if (!hasPrompt && !hasGenre) {
      Alert.alert("Missing Information", "Please provide a story idea or select a genre to begin generation.");
      return;
    }

    const finalGenre = selectedGenre || "Adventure";
    const finalLength = selectedLength || "Short (5-10 min)";
    const finalTone = selectedTone || "Epic";
    const finalAudience = selectedAudience || "All Ages";
    const finalPrompt = prompt?.trim() || `A ${finalTone.toLowerCase()} ${finalGenre.toLowerCase()} story`;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const steps = [
        { progress: 10, message: "Analyzing your preferences..." },
        { progress: 25, message: "Generating story with AI..." },
        { progress: 50, message: "Crafting compelling chapters..." },
        { progress: 75, message: "Fetching relevant images..." },
        { progress: 100, message: "Finalizing your story..." }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerationProgress(step.progress);
      }

      // Generate fallback story
      const fallbackTitle = `${finalGenre} Adventure: ${finalPrompt}`;
      const fallbackChapters: Chapter[] = [
        {
          title: "Chapter 1: The Beginning",
          text: `In this ${finalTone.toLowerCase()} ${finalGenre.toLowerCase()} tale, our story begins with "${finalPrompt}". The setting is carefully crafted for ${finalAudience.toLowerCase()}, where mysteries unfold and adventures await. The protagonist finds themselves at the center of events that will test their courage and determination.`,
          image: await fetchStoryImage(`${finalGenre.toLowerCase()} beginning scene`)
        },
        {
          title: "Chapter 2: The Challenge",
          text: `As the story progresses, the challenges become more significant. The ${finalTone.toLowerCase()} atmosphere intensifies as our hero faces obstacles that seemed impossible to overcome. Each decision leads to new discoveries, and the path forward becomes both clearer and more treacherous.`,
          image: await fetchStoryImage(`${finalGenre.toLowerCase()} challenge adventure`)
        },
        {
          title: "Chapter 3: Resolution", 
          text: `In the final chapter, all threads come together in a ${finalTone.toLowerCase()} conclusion. The journey that began with "${finalPrompt}" reaches its satisfying end, leaving our characters transformed by their experiences and ready for whatever comes next.`,
          image: await fetchStoryImage(`${finalGenre.toLowerCase()} conclusion victory`)
        }
      ];

      const fullContent = fallbackChapters.map(c => `${c.title}\n${c.text}`).join('\n\n');
      const summary = fallbackChapters.length > 0 
        ? fallbackChapters[0].text.slice(0, 200) + (fallbackChapters[0].text.length > 200 ? '...' : '')
        : fullContent.slice(0, 200) + (fullContent.length > 200 ? '...' : '');

      const storyData: StoryData = {
        title: fallbackTitle,
        content: fullContent,
        genre: finalGenre,
        summary,
        readingTime: finalLength,
        chapters: fallbackChapters,
      };

      const pages = paginateStory(storyData.chapters);
      setStoryPages(pages);
      setTotalPages(pages.length);
      setCurrentPage(0);
      
      setGeneratedStory(storyData);
      setIsGenerating(false);
      setShowStory(true);
      setIsSaved(false);
      
    } catch (error) {
      console.error('Story generation failed:', error);
      setIsGenerating(false);
      Alert.alert("Generation Failed", "Unable to generate story. Please try again.");
    }
  };

  const saveStory = async () => {
    if (!generatedStory) return;
    
    setIsSaving(true);
    
    try {
      const storyId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const coverImage = generatedStory.chapters.find(chapter => chapter.image)?.image || 
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1170&auto=format&fit=crop';
      
      const storyToSave = {
        id: storyId,
        title: generatedStory.title,
        duration: generatedStory.readingTime,
        author: 'You',
        imageUrl: coverImage,
        category: generatedStory.genre,
        content: generatedStory.content,
        images: generatedStory.chapters.map(chapter => chapter.image).filter(Boolean) as string[]
      };
      
      addStory(storyToSave);
      setIsSaved(true);
      Alert.alert(
        "Story Saved!", 
        "Your story has been saved and will appear on your home page.",
        [{ text: "OK", onPress: () => {} }]
      );
      
    } catch (error) {
      console.error('Error saving story:', error);
      Alert.alert("Save Failed", "Unable to save your story. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background || '#FAFBFF' }]}>
      {showStory && generatedStory ? (
        // EXACT SAME STORY READER VIEW - DO NOT CHANGE
        <View style={styles.readerPage}>
          <View style={styles.readerHeader}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={handleClose}
            >
              <X size={19} color="#424955" />
            </Pressable>
            
            <View style={styles.readerHeaderCenter}>
              <Pressable style={({ pressed }) => [ styles.iconButton, pressed && styles.iconButtonPressed, ]}>
                  <Type size={19} color="#424955" />
              </Pressable>
              <Pressable style={({ pressed }) => [ styles.iconButton, pressed && styles.iconButtonPressed, ]}>
                  <Sun size={19} color="#424955" />
              </Pressable>
              <Pressable style={({ pressed }) => [ styles.iconButton, pressed && styles.iconButtonPressed, ]}>
                  <Play size={19} color="#424955" />
              </Pressable>
              <Pressable 
                style={({ pressed }) => [ styles.iconButton, pressed && styles.iconButtonPressed, ]}
                onPress={toggleSummary}
              >
                  <FileEdit size={19} color="#424955" />
              </Pressable>
              <Pressable style={({ pressed }) => [ styles.iconButton, pressed && styles.iconButtonPressed, ]}>
                  <Headphones size={19} color="#424955" />
              </Pressable>
            </View>

            <Pressable style={({ pressed }) => [ styles.iconButton, pressed && styles.iconButtonPressed, ]}>
                <MoreHorizontal size={19} color="#424955" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.readerScrollContent}>
            <Text style={styles.readerMainTitle}>{generatedStory.title}</Text>
            
            {storyPages[currentPage]?.map((chapter, index) => (
              <View key={`${currentPage}-${index}`} style={styles.readerChapterContainer}>
                <Text style={styles.readerChapterTitle}>{chapter.title}</Text>
                {chapter.image && (
                  <View style={styles.chapterImageContainer}>
                    <Image 
                      source={{ uri: chapter.image }}
                      style={styles.chapterImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
                <Text style={styles.readerBody}>{chapter.text}</Text>
              </View>
            ))}

            {totalPages > 1 && (
              <View style={styles.pageNavigationContainer}>
                <Text style={styles.readerPageNumber}>{currentPage + 1} of {totalPages}</Text>
                
                <View style={styles.navigationArrows}>
                  {currentPage > 0 && (
                    <TouchableOpacity 
                      style={[styles.navButton, styles.prevButton]}
                      onPress={() => setCurrentPage(currentPage - 1)}
                      activeOpacity={0.7}
                    >
                      <ChevronLeft size={24} color="#444" />
                    </TouchableOpacity>
                  )}
                  
                  {currentPage < totalPages - 1 && (
                    <TouchableOpacity 
                      style={[styles.navButton, styles.nextButton]}
                      onPress={() => setCurrentPage(currentPage + 1)}
                      activeOpacity={0.7}
                    >
                      <ChevronRight size={24} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <View style={styles.bottomSaveContainer}>
              <TouchableOpacity 
                style={[styles.saveButtonOnly, isSaved ? styles.savedButton : styles.saveButton]}
                onPress={saveStory}
                disabled={isSaving || isSaved}
              >
                {isSaved ? (
                  <Check size={20} color="white" />
                ) : (
                  <Save size={20} color="white" />
                )}
                <Text style={styles.saveButtonText}>
                  {isSaved ? 'Saved' : isSaving ? 'Saving...' : 'Save Story'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>

          {showSummary && (
            <View style={styles.summaryOverlay}>
              <TouchableOpacity 
                style={styles.summaryOverlayBackground}
                onPress={toggleSummary}
                activeOpacity={1}
              />
              <View style={styles.summaryPopup}>
                <View style={styles.summaryPopupHeader}>
                  <Text style={styles.summaryPopupTitle}>📖 Page Summary</Text>
                  <TouchableOpacity onPress={toggleSummary} style={styles.summaryCloseButton}>
                    <X size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.summaryPopupContent}>
                  <Text style={styles.summaryPopupText}>{getRealTimeSummary()}</Text>
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      ) : (
        // GENERATOR VIEW
        <View style={refinedStyles.container}>
          {/* Header */}
          <View style={refinedStyles.header}>
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
              style={refinedStyles.headerGradient}
            />
            <View style={refinedStyles.headerContent}>
              <View style={refinedStyles.headerLeft}>
                <View style={refinedStyles.iconContainer}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={refinedStyles.iconGradient}
                  >
                    <Feather size={24} color="white" />
                  </LinearGradient>
                </View>
                <View style={refinedStyles.titleSection}>
                  <Text style={refinedStyles.mainTitle}>Story Creator</Text>
                  <Text style={refinedStyles.subtitle}>AI-powered storytelling</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={refinedStyles.closeButton}>
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={refinedStyles.scrollContent} showsVerticalScrollIndicator={false}>
            {!isGenerating ? (
              <View style={refinedStyles.generatorContent}>
                {/* Input Section */}
                <View style={refinedStyles.inputSection}>
                  <View style={refinedStyles.labelContainer}>
                    <Sparkles size={18} color="#667eea" />
                    <Text style={refinedStyles.inputLabel}>Describe Your Story</Text>
                  </View>
                  
                  <View style={refinedStyles.inputCard}>
                    <TextInput
                      style={refinedStyles.refinedInput}
                      placeholder="Tell me about your story idea... (e.g., 'A young explorer discovers a hidden world')"
                      placeholderTextColor="rgba(107, 114, 128, 0.6)"
                      value={prompt}
                      onChangeText={setPrompt}
                      multiline
                      textAlignVertical="top"
                      maxLength={500}
                    />
                    <View style={refinedStyles.inputFooter}>
                      <Text style={refinedStyles.inputHint}>💫 Leave blank for surprise stories</Text>
                      <Text style={refinedStyles.charCounter}>{prompt.length}/500</Text>
                    </View>
                  </View>
                </View>

                {/* Options Section */}
                <View style={refinedStyles.optionsSection}>
                  {/* Genre Selection */}
                  <View style={refinedStyles.optionGroup}>
                    <View style={refinedStyles.optionHeader}>
                      <BookOpen size={16} color="#667eea" />
                      <Text style={refinedStyles.optionTitle}>Genre</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={refinedStyles.chipContainer}>
                        {genres.map((genre) => (
                          <TouchableOpacity
                            key={genre}
                            style={[
                              refinedStyles.refinedChip,
                              selectedGenre === genre && refinedStyles.selectedChip
                            ]}
                            onPress={() => setSelectedGenre(genre)}
                          >
                            <Text style={[
                              refinedStyles.chipText,
                              selectedGenre === genre && refinedStyles.selectedChipText
                            ]}>
                              {genre}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Length Selection */}
                  <View style={refinedStyles.optionGroup}>
                    <View style={refinedStyles.optionHeader}>
                      <Target size={16} color="#764ba2" />
                      <Text style={refinedStyles.optionTitle}>Story Length</Text>
                    </View>
                    <View style={refinedStyles.lengthGrid}>
                      {lengths.map((length) => (
                        <TouchableOpacity
                          key={length}
                          style={[
                            refinedStyles.lengthOption,
                            selectedLength === length && refinedStyles.selectedLengthOption
                          ]}
                          onPress={() => setSelectedLength(length)}
                        >
                          <Text style={[
                            refinedStyles.lengthText,
                            selectedLength === length && refinedStyles.selectedLengthText
                          ]}>
                            {length}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Advanced Options Toggle */}
                  <TouchableOpacity 
                    style={refinedStyles.advancedToggle}
                    onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <View style={refinedStyles.advancedContent}>
                      <Settings size={18} color="#667eea" />
                      <Text style={refinedStyles.advancedText}>Advanced Options</Text>
                      <View style={[
                        refinedStyles.toggleArrow,
                        { transform: [{ rotate: showAdvancedOptions ? '180deg' : '0deg' }] }
                      ]}>
                        <Text style={refinedStyles.arrowIcon}>▼</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Advanced Options */}
                  {showAdvancedOptions && (
                    <View style={refinedStyles.advancedPanel}>
                      {/* Tone Selection */}
                      <View style={refinedStyles.optionGroup}>
                        <View style={refinedStyles.optionHeader}>
                          <Heart size={16} color="#f093fb" />
                          <Text style={refinedStyles.optionTitle}>Story Tone</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={refinedStyles.chipContainer}>
                            {tones.map((tone) => (
                              <TouchableOpacity
                                key={tone}
                                style={[
                                  refinedStyles.refinedChip,
                                  selectedTone === tone && refinedStyles.selectedChip
                                ]}
                                onPress={() => setSelectedTone(tone)}
                              >
                                <Text style={[
                                  refinedStyles.chipText,
                                  selectedTone === tone && refinedStyles.selectedChipText
                                ]}>
                                  {tone}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>

                      {/* Audience Selection */}
                      <View style={refinedStyles.optionGroup}>
                        <View style={refinedStyles.optionHeader}>
                          <Users size={16} color="#10b981" />
                          <Text style={refinedStyles.optionTitle}>Target Audience</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={refinedStyles.chipContainer}>
                            {audiences.map((audience) => (
                              <TouchableOpacity
                                key={audience}
                                style={[
                                  refinedStyles.refinedChip,
                                  selectedAudience === audience && refinedStyles.selectedChip
                                ]}
                                onPress={() => setSelectedAudience(audience)}
                              >
                                <Text style={[
                                  refinedStyles.chipText,
                                  selectedAudience === audience && refinedStyles.selectedChipText
                                ]}>
                                  {audience}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </View>

                {/* Generate Button */}
                <View style={refinedStyles.generateSection}>
                  <TouchableOpacity
                    style={[
                      refinedStyles.generateButton,
                      (!prompt.trim() && !selectedGenre) && refinedStyles.generateButtonDisabled
                    ]}
                    onPress={generateStory}
                    disabled={!prompt.trim() && !selectedGenre}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={refinedStyles.generateButtonGradient}
                    >
                      <Wand2 size={20} color="white" />
                      <Text style={refinedStyles.generateButtonText}>Generate Story</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Loading State
              <View style={refinedStyles.loadingContent}>
                <BouncingCirclesLoader isGenerating={isGenerating} />
                <RefinedProgressIndicator progress={generationProgress} isGenerating={isGenerating} />
                <RefinedStatusMessages isGenerating={isGenerating} />
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

// All the exact same styles from original component
const bouncingStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  wrapper: {
    width: 200,
    height: 80,
    position: 'relative',
    marginBottom: 20,
  },
  circle: {
    width: 20,
    height: 20,
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#667eea',
  },
  circle1: {
    left: '15%',
  },
  circle2: {
    left: '45%',
  },
  circle3: {
    right: '15%',
  },
  shadow: {
    width: 20,
    height: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    top: 62,
    zIndex: -1,
  },
  shadow1: {
    left: '15%',
  },
  shadow2: {
    left: '45%',
  },
  shadow3: {
    right: '15%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});

const refinedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  
  // Header
  header: {
    position: 'relative',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  titleSection: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  
  // Progress Section
  progressSection: {
    width: '100%',
    gap: 12,
    marginVertical: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  progressGradient: {
    flex: 1,
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  
  // Scroll Content
  scrollContent: {
    flex: 1,
  },
  
  // Generator Content
  generatorContent: {
    padding: 20,
    gap: 24,
  },
  
  // Loading Content
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 400,
  },
  
  // Input Section
  inputSection: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  
  inputCard: {
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  refinedInput: {
    fontSize: 16,
    color: '#374151',
    padding: 20,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  charCounter: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  
  // Options Section
  optionsSection: {
    gap: 20,
  },
  optionGroup: {
    gap: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  refinedChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedChip: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedChipText: {
    color: 'white',
  },
  
  // Length Grid
  lengthGrid: {
    gap: 8,
  },
  lengthOption: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedLengthOption: {
    backgroundColor: '#764ba2',
    borderColor: '#764ba2',
  },
  lengthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedLengthText: {
    color: 'white',
  },
  
  // Advanced Options
  advancedToggle: {
    marginTop: 8,
  },
  advancedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  advancedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
    flex: 1,
  },
  toggleArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: 'bold',
  },
  advancedPanel: {
    gap: 16,
    paddingTop: 8,
  },
  
  // Generate Button
  generateSection: {
    marginTop: 8,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  generateButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

// EXACT SAME READER STYLES FROM ORIGINAL COMPONENT
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Reader Page Styles - Exactly Same as Original
  readerPage: {
    flex: 1,
    backgroundColor: 'white',
  },
  readerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
  },
  readerHeaderCenter: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconButtonPressed: {
    backgroundColor: '#DEE1E6',
  },
  readerScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  readerMainTitle: {
    fontFamily: 'serif',
    textAlign: 'center',
    fontSize: 20,
    color: '#666',
    marginVertical: 20,
    fontWeight: '600',
  },
  readerChapterContainer: {
    marginBottom: 24,
  },
  readerChapterTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 24,
    fontFamily: 'sans-serif',
  },
  chapterImageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chapterImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  readerBody: {
    fontSize: 17,
    color: '#333',
    lineHeight: 28,
    textAlign: 'justify',
    fontFamily: 'serif',
  },
  pageNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  readerPageNumber: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'serif',
  },
  navigationArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  prevButton: {
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  bottomSaveContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  saveButtonOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    minWidth: 200,
    backgroundColor: Colors.primary,
  },
  savedButton: {
    backgroundColor: '#4CAF50',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Summary Overlay Styles - Exactly Same as Original
  summaryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryOverlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  summaryPopup: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxWidth: screenWidth * 0.85,
    maxHeight: screenHeight * 0.6,
    minWidth: screenWidth * 0.75,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryPopupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryPopupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  summaryCloseButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  summaryPopupContent: {
    maxHeight: screenHeight * 0.4,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryPopupText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    textAlign: 'justify',
  },
});