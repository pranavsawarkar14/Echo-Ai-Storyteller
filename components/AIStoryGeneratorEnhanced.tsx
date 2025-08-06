import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { 
  X, 
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
import Colors from "@/constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Keep all your existing interfaces exactly the same
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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// New Elegant Bouncing Circles Loader
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
              // Bounce up
              withTiming(0, { duration: 250 }, () => {
                // At peak, reset scale and height
                scaleValue.value = withTiming(1);
                heightValue.value = withTiming(20);
                shadowScaleValue.value = withTiming(0.2);
                shadowOpacityValue.value = withTiming(0.4);
              }),
              // Bounce down
              withTiming(60, { duration: 250 }, () => {
                // At bottom, squash effect
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

      // Animate each circle with different delays
      animateCircle(circle1Y, circle1Scale, circle1Height, shadow1Scale, shadow1Opacity, 0);
      animateCircle(circle2Y, circle2Scale, circle2Height, shadow2Scale, shadow2Opacity, 200);
      animateCircle(circle3Y, circle3Scale, circle3Height, shadow3Scale, shadow3Opacity, 300);
    } else {
      // Reset all animations
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
        {/* Circles */}
        <Animated.View style={[bouncingStyles.circle, bouncingStyles.circle1, circle1Style]} />
        <Animated.View style={[bouncingStyles.circle, bouncingStyles.circle2, circle2Style]} />
        <Animated.View style={[bouncingStyles.circle, bouncingStyles.circle3, circle3Style]} />
        
        {/* Shadows */}
        <Animated.View style={[bouncingStyles.shadow, bouncingStyles.shadow1, shadow1Style]} />
        <Animated.View style={[bouncingStyles.shadow, bouncingStyles.shadow2, shadow2Style]} />
        <Animated.View style={[bouncingStyles.shadow, bouncingStyles.shadow3, shadow3Style]} />
      </View>
      
      <Text style={bouncingStyles.statusText}>Creating your story...</Text>
    </View>
  );
};

// Refined Progress Indicator (keeping this the same)
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

// Refined Status Messages (keeping this the same)
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

export const AIStoryGeneratorEnhanced: React.FC<{ 
  visible: boolean; 
  onClose: () => void; 
  initialPrompt?: string; 
}> = ({ visible, onClose, initialPrompt = "" }) => {
  // Keep all your existing state variables exactly the same
  const { addStory } = useStories();
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

  // Keep all your existing data arrays and functions EXACTLY the same
  const genres = ["Adventure", "Mystery", "Sci-Fi", "Fantasy", "Romance", "Horror", "Comedy", "Drama"];
  const lengths = ["Short (5-10 min)", "Medium (10-15 min)", "Long (15-20 min)", "Extended (20-30 min)", "Epic (30+ min)"];
  const tones = ["Light & Fun", "Mysterious", "Epic", "Romantic", "Dark", "Inspiring"];
  const audiences = ["Children", "Teenagers", "Young Adults", "Adults", "All Ages"];

  // Keep all your existing functions exactly the same
  const paginateStory = (chapters: Chapter[]): Chapter[][] => {
    const chaptersPerPage = 2;
    const pages: Chapter[][] = [];
    for (let i = 0; i < chapters.length; i += chaptersPerPage) {
      pages.push(chapters.slice(i, i + chaptersPerPage));
    }
    return pages.length > 0 ? pages : [[]];
  };

  // Keep all your existing animation values and effects
  const modalTranslateY = useSharedValue(screenHeight);
  const modalOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalTranslateY.value = withSpring(0, { damping: 20, stiffness: 300, mass: 0.8 });
      modalOpacity.value = withTiming(1, { duration: 300 });
      backgroundOpacity.value = withTiming(0.8, { duration: 300 });
    } else {
      modalTranslateY.value = withTiming(screenHeight, { duration: 250 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      backgroundOpacity.value = withTiming(0, { duration: 200 });
      setShowSummary(false);
      setIsSaved(false);
    }
  }, [visible]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
    opacity: modalOpacity.value,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  // Keep ALL your existing functions exactly the same (generateStory, saveStory, etc.)
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

      const storyData = await generateProfessionalStory({
        prompt: finalPrompt,
        genre: finalGenre,
        tone: finalTone,
        audience: finalAudience,
        length: finalLength,
        creativityLevel
      });

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

  // [Keep all your other existing functions - saveStory, toggleSummary, getRealTimeSummary, fetchStoryImage, generateAIStory, generateProfessionalStory, handleClose - EXACTLY the same]

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

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  const getRealTimeSummary = () => {
    if (!generatedStory) return '';
    
    const currentChapters = storyPages[currentPage] || [];
    if (currentChapters.length === 0 && generatedStory.chapters.length > 0) {
      const firstChapter = generatedStory.chapters[0];
      return firstChapter.text.slice(0, 300) + (firstChapter.text.length > 300 ? '...' : '');
    }
    
    const currentContent = currentChapters.map(chapter => chapter.text).join(' ');
    return currentContent.slice(0, 300) + (currentContent.length > 300 ? '...' : '');
  };

  const fetchStoryImage = async (query: string): Promise<string | undefined> => {
    const unsplashKey = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || 'O_7CnnZ2qjU80VvAjDo7wbap_bAo7mzTbzEvN-gwS04';
    if (!unsplashKey) return undefined;

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${unsplashKey}`,
          },
        }
      );
      const data = await response.json();
      return data.results?.[0]?.urls?.regular;
    } catch (error) {
      console.error('Error fetching image:', error);
      return undefined;
    }
  };

  const generateAIStory = async (prompt: string, length: string): Promise<{title: string; chapters: Chapter[]}> => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || 'AIzaSyD1xUm97NeOeeNKozOga12SANLqkaWh_pY';
    if (!apiKey) {
      throw new Error('Google AI API key not found');
    }

    let chapterCount = 3;
    let maxTokens = 2048;
    
    switch (length) {
      case "Short (5-10 min)":
        chapterCount = 3;
        maxTokens = 2048;
        break;
      case "Medium (10-15 min)":
        chapterCount = 5;
        maxTokens = 3072;
        break;
      case "Long (15-20 min)":
        chapterCount = 7;
        maxTokens = 4096;
        break;
      case "Extended (20-30 min)":
        chapterCount = 10;
        maxTokens = 6144;
        break;
      case "Epic (30+ min)":
        chapterCount = 15;
        maxTokens = 8192;
        break;
      default:
        chapterCount = 5;
        maxTokens = 3072;
    }

    const enhancedPrompt = `Create a compelling story with exactly ${chapterCount} chapters based on: "${prompt}". 

Please structure your response as follows:
- Start with a clear title using "# Title: [Your Story Title]"
- Each chapter should start with "## Chapter [number]: [Chapter Title]"
- Each chapter should be at least 200-300 words with vivid descriptions
- Include dialogue, character development, and immersive storytelling
- Build tension and maintain reader engagement throughout
- Create a satisfying conclusion

Make the story detailed, engaging, and well-paced with rich descriptions and character development.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: enhancedPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: maxTokens,
              candidateCount: 1,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No content generated from AI');
      }

      const lines = generatedText.split('\n').filter((line: string) => line.trim());
      let title = "Generated Story";
      const chapters: Chapter[] = [];
      let currentChapter = { title: "", text: "" };
      let titleFound = false;

      for (const line of lines) {
        if (line.startsWith('# Title:') || (line.startsWith('# ') && !titleFound)) {
          title = line.replace(/^# (Title: ?)?/, '').trim();
          titleFound = true;
          continue;
        }
        
        if (line.startsWith('## Chapter') || line.startsWith('## ')) {
          if (currentChapter.title && currentChapter.text.trim()) {
            chapters.push({ ...currentChapter });
          }
          
          let chapterTitle = line.replace(/^## (Chapter \d+: ?)?/, '').trim();
          currentChapter = { title: chapterTitle, text: "" };
          continue;
        }
        
        if (currentChapter.title && line.trim()) {
          currentChapter.text += line + '\n\n';
        } else if (!currentChapter.title && line.trim() && titleFound) {
          currentChapter = { title: "Chapter 1", text: line + '\n\n' };
        }
      }
      
      if (currentChapter.title && currentChapter.text.trim()) {
        chapters.push(currentChapter);
      }
      
      if (chapters.length === 0) {
        const fallbackChapters = generatedText.split('\n\n').filter(p => p.trim()).slice(0, chapterCount);
        fallbackChapters.forEach((text, index) => {
          chapters.push({
            title: `Chapter ${index + 1}`,
            text: text.trim()
          });
        });
      }

      return { title, chapters };
    } catch (error) {
      console.error('Error generating AI story:', error);
      throw error;
    }
  };

  const generateProfessionalStory = async (params: {
    prompt: string;
    genre: string;
    tone: string;
    audience: string;
    length: string;
    creativityLevel: number;
  }): Promise<StoryData> => {
    
    const wordCount = params.length.includes('Short') ? '800-1200' : 
                     params.length.includes('Medium') ? '1500-2000' : '2500-3500';
    
    const aiPrompt = `Create a complete ${params.tone.toLowerCase()} ${params.genre.toLowerCase()} story for ${params.audience.toLowerCase()} based on this concept: "${params.prompt}"

Story Requirements:
- Genre: ${params.genre}
- Tone: ${params.tone}
- Target audience: ${params.audience}
- Length: ${wordCount} words approximately
- Create 2-3 chapters with clear progression
- Include vivid descriptions and engaging characters
- Build to a satisfying conclusion

IMPORTANT FORMATTING RULES:
1. Start with the main story title on the first line
2. Use "## Chapter 1: [Title]" format for each chapter header
3. Write substantial content for each chapter (300-500 words per chapter)
4. Make each chapter self-contained but part of the overall story
5. Use descriptive language that matches the ${params.tone.toLowerCase()} tone

Example structure:
# The Magical Quest

## Chapter 1: The Discovery
[Chapter content here...]

## Chapter 2: The Challenge  
[Chapter content here...]

## Chapter 3: The Resolution
[Chapter content here...]

Now write the complete story:`;

    try {
      console.log('Starting AI story generation...');
      const { title, chapters } = await generateAIStory(aiPrompt, params.length);
      console.log(`Generated story: "${title}" with ${chapters.length} chapters`);
      
      const chaptersWithImages: Chapter[] = [];
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        const words = chapter.text.toLowerCase().split(' ').slice(0, 10);
        const keyWords = words.filter(word => 
          word.length > 4 && 
          !['the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'would', 'there', 'could', 'other'].includes(word)
        ).slice(0, 3);
        
        const imageQuery = keyWords.length > 0 
          ? `${params.genre.toLowerCase()} ${keyWords.join(' ')} scene`
          : `${params.genre.toLowerCase()} ${params.tone.toLowerCase()} story scene`;
        
        console.log(`Fetching image for chapter ${i + 1} with query: "${imageQuery}"`);
        const image = await fetchStoryImage(imageQuery);
        console.log(`Image ${image ? 'found' : 'not found'} for chapter ${i + 1}`);
        
        chaptersWithImages.push({
          ...chapter,
          image
        });
      }

      const fullContent = chaptersWithImages.map(c => `${c.title}\n${c.text}`).join('\n\n');
      
      const summary = chaptersWithImages.length > 0 
        ? chaptersWithImages[0].text.slice(0, 200) + (chaptersWithImages[0].text.length > 200 ? '...' : '')
        : fullContent.slice(0, 200) + (fullContent.length > 200 ? '...' : '');
      
      return {
        title,
        content: fullContent,
        genre: params.genre,
        summary,
        readingTime: params.length,
        chapters: chaptersWithImages,
      };
    } catch (error) {
      console.error('Story generation failed:', error);
      Alert.alert('Story Generation', 'Using AI failed, generating a basic story instead.');
      
      const fallbackTitle = `${params.genre} Adventure: ${params.prompt}`;
      const fallbackChapters: Chapter[] = [
        {
          title: "Chapter 1: The Beginning",
          text: `In this ${params.tone.toLowerCase()} ${params.genre.toLowerCase()} tale, our story begins with "${params.prompt}". The setting is carefully crafted for ${params.audience.toLowerCase()}, where mysteries unfold and adventures await. The protagonist finds themselves at the center of events that will test their courage and determination.`,
          image: await fetchStoryImage(`${params.genre.toLowerCase()} beginning scene`)
        },
        {
          title: "Chapter 2: The Challenge",
          text: `As the story progresses, the challenges become more significant. The ${params.tone.toLowerCase()} atmosphere intensifies as our hero faces obstacles that seemed impossible to overcome. Each decision leads to new discoveries, and the path forward becomes both clearer and more treacherous.`,
          image: await fetchStoryImage(`${params.genre.toLowerCase()} challenge adventure`)
        },
        {
          title: "Chapter 3: Resolution", 
          text: `In the final chapter, all threads come together in a ${params.tone.toLowerCase()} conclusion. The journey that began with "${params.prompt}" reaches its satisfying end, leaving our characters transformed by their experiences and ready for whatever comes next.`,
          image: await fetchStoryImage(`${params.genre.toLowerCase()} conclusion victory`)
        }
      ];

      const fullContent = fallbackChapters.map(c => `${c.title}\n${c.text}`).join('\n\n');
      const summary = fallbackChapters.length > 0 
        ? fallbackChapters[0].text.slice(0, 200) + (fallbackChapters[0].text.length > 200 ? '...' : '')
        : fullContent.slice(0, 200) + (fullContent.length > 200 ? '...' : '');

      return {
        title: fallbackTitle,
        content: fullContent,
        genre: params.genre,
        summary,
        readingTime: params.length,
        chapters: fallbackChapters,
      };
    }
  };

  const handleClose = () => {
    setIsGenerating(false);
    setShowStory(false);
    setGeneratedStory(null);
    setPrompt("");
    setSelectedGenre("");
    setSelectedLength("");
    setSelectedTone("");
    setSelectedAudience("");
    setGenerationProgress(0);
    setShowAdvancedOptions(false);
    setCreativityLevel(3);
    setCurrentPage(0);
    setTotalPages(1);
    setStoryPages([]);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={refinedStyles.overlay}>
        <Animated.View style={[refinedStyles.backgroundOverlay, backgroundStyle]} />
        
        <Animated.View style={[refinedStyles.bottomSheet, modalStyle]}>
          {showStory && generatedStory ? (
            // Keep your existing reader view exactly the same
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
            // REDESIGNED Generator View with New Bouncing Loader
            <View style={refinedStyles.container}>
              {/* Refined Header */}
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
                    {/* Refined Prompt Input */}
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

                    {/* Refined Options */}
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
                                      selectedTone === tone && refinedStyles.selectedToneChip
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
                              <Users size={16} color="#43e97b" />
                              <Text style={refinedStyles.optionTitle}>Target Audience</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              <View style={refinedStyles.chipContainer}>
                                {audiences.map((audience) => (
                                  <TouchableOpacity
                                    key={audience}
                                    style={[
                                      refinedStyles.refinedChip,
                                      selectedAudience === audience && refinedStyles.selectedAudienceChip
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

                          {/* Creativity Slider */}
                          <View style={refinedStyles.creativitySection}>
                            <View style={refinedStyles.optionHeader}>
                              <Brain size={16} color="#667eea" />
                              <Text style={refinedStyles.optionTitle}>Creativity Level: {creativityLevel}/5</Text>
                            </View>
                            <View style={refinedStyles.creativitySlider}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <TouchableOpacity
                                  key={level}
                                  style={[
                                    refinedStyles.creativityDot,
                                    creativityLevel >= level && refinedStyles.activeDot
                                  ]}
                                  onPress={() => setCreativityLevel(level)}
                                >
                                  <View style={[
                                    refinedStyles.dotInner,
                                    creativityLevel >= level && refinedStyles.activeDotInner
                                  ]} />
                                </TouchableOpacity>
                              ))}
                            </View>
                            <View style={refinedStyles.creativityLabels}>
                              <Text style={refinedStyles.creativityLabel}>Conservative</Text>
                              <Text style={refinedStyles.creativityLabel}>Creative</Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Refined Generate Button */}
                    <View style={refinedStyles.generateSection}>
                      <TouchableOpacity
                        style={refinedStyles.generateButton}
                        onPress={generateStory}
                        disabled={isGenerating}
                      >
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={refinedStyles.generateGradient}
                        >
                          <View style={refinedStyles.generateContent}>
                            <Sparkles size={20} color="white" />
                            <Text style={refinedStyles.generateText}>
                              {isGenerating ? 'Creating Story...' : 'Generate Story'}
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                      <Text style={refinedStyles.generateSubtext}>
                        ✨ Powered by AI • High-quality stories
                      </Text>
                    </View>
                  </View>
                ) : (
                  // New Generation View with Bouncing Circles Loader
                  <View style={refinedStyles.generationView}>
                    <BouncingCirclesLoader isGenerating={isGenerating} />
                    <RefinedProgressIndicator progress={generationProgress} isGenerating={isGenerating} />
                    <RefinedStatusMessages isGenerating={isGenerating} />
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// New Bouncing Circles Loader Styles
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

// Refined Styles - Clean and Modern (keep existing styles)
const refinedStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomSheet: {
    width: screenWidth,
    height: screenHeight * 0.95,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  
  // Container
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
  
  // Scroll Content
  scrollContent: {
    flex: 1,
  },
  
  // Generator Content
  generatorContent: {
    padding: 20,
    gap: 24,
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
    lineHeight: 24,
    padding: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.3)',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.3)',
  },
  
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Chips
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  
  refinedChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  
  selectedChip: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  
  selectedToneChip: {
    backgroundColor: '#f093fb',
    borderColor: '#f093fb',
  },
  
  selectedAudienceChip: {
    backgroundColor: '#43e97b',
    borderColor: '#43e97b',
  },
  
  selectedChipText: {
    color: 'white',
  },
  
  // Length Options
  lengthGrid: {
    gap: 8,
  },
  
  lengthOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  lengthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  
  selectedLengthOption: {
    backgroundColor: '#764ba2',
    borderColor: '#764ba2',
  },
  
  selectedLengthText: {
    color: 'white',
  },
  
  // Advanced Toggle
  advancedToggle: {
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.3)',
  },
  
  advancedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  
  advancedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  
  toggleArrow: {
    marginLeft: 8,
  },
  
  arrowIcon: {
    fontSize: 16,
    color: '#667eea',
  },
  
  // Advanced Panel
  advancedPanel: {
    gap: 20,
    marginTop: 8,
  },
  
  // Creativity Section
  creativitySection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.3)',
  },
  
  creativitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  
  creativityDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  
  dotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  
  activeDot: {
    borderColor: '#667eea',
  },
  
  activeDotInner: {
    backgroundColor: '#667eea',
  },
  
  creativityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  creativityLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Generate Section
  generateSection: {
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  
  generateButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  
  generateGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  
  generateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  generateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  generateSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Generation View
  generationView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 32,
  },
  
  // Progress Section
  progressSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 4,
  },
  
  progressGradient: {
    flex: 1,
  },
  
  // Status Message
  statusMessage: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.3)',
  },
  
  statusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});

// Keep all your existing reader styles exactly the same
const styles = StyleSheet.create({
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
  readerBody: {
    fontSize: 17,
    color: '#333',
    lineHeight: 28,
    textAlign: 'justify',
    fontFamily: 'serif',
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
  readerPageNumber: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
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

export default AIStoryGeneratorEnhanced;
