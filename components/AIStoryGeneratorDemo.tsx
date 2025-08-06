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
} from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { TextEffect } from "@/components/ui/text-effect";
import { useStories } from "@/contexts/StoriesContext";
import Colors from "@/constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- (Interfaces and other components remain the same) ---

interface Chapter {
  title: string;
  text: string;
  image?: string; // Add image support for chapters
}

interface StoryData {
  title: string;
  content: string; // Full content for compatibility
  genre: string;
  readingTime: string;
  chapters: Chapter[];
  summary?: string; // Add summary field
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Simple AI Animation
const SimpleAIAnimation = ({ isGenerating }: { isGenerating: boolean }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  
  useEffect(() => {
    if (isGenerating) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000 }), -1, false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ), -1, true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.5, { duration: 800 })
        ), -1, true
      );
    } else {
      rotation.value = withTiming(0);
      scale.value = withTiming(1);
      opacity.value = withTiming(0.7);
    }
  }, [isGenerating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.aiAnimationContainer}>
      <Animated.View style={[styles.aiCore, animatedStyle]}>
        <LinearGradient
          colors={[Colors.primary, '#8B5CF6', '#06B6D4']}
          style={styles.aiGradient}
        >
          <Brain size={48} color="white" />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.aiText}>AI Processing...</Text>
    </View>
  );
};

// AI Progress Indicator with Dynamic Effects
const AIProgressIndicator = ({ progress, isGenerating }: { progress: number; isGenerating: boolean }) => {
  const progressAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    if (isGenerating) {
      progressAnim.value = withTiming(progress / 100, { duration: 1000 });
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.6, { duration: 600 })
        ), -1, true
      );
    }
  }, [progress, isGenerating]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
    shadowOpacity: glowAnim.value * 0.8,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]}>
          <LinearGradient
            colors={[Colors.primary, '#8B5CF6', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </Animated.View>
      </View>
      <Text style={styles.progressText}>
        {Math.round(progress)}% • AI is crafting your story...
      </Text>
    </View>
  );
};

// Professional AI Generation Status with Animated Text Effects
const GenerationStatusMessages = ({ isGenerating }: { isGenerating: boolean }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const messageOpacity = useSharedValue(0);
  const messageScale = useSharedValue(1);

  const messages = [
    { text: "🧠 Initializing AI neural networks...", color: '#667eea' },
    { text: "📖 Reading your preferences...", color: '#764ba2' },
    { text: "✨ Analyzing story patterns...", color: '#ff6b6b' },
    { text: "🎨 Creating vivid scenes...", color: '#4ecdc4' }, 
    { text: "📚 Crafting narrative structure...", color: '#45b7d1' },
    { text: "🖼️ Finding perfect images...", color: '#96ceb4' },
    { text: "📝 Polishing the final story...", color: '#f5576c' }
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        messageOpacity.value = withSequence(
          withTiming(0, { duration: 200 }),
          withTiming(1, { duration: 300 })
        );
        messageScale.value = withSequence(
          withTiming(0.8, { duration: 100 }),
          withSpring(1.1, { damping: 10, stiffness: 300 }),
          withSpring(1, { damping: 15, stiffness: 200 })
        );
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 2500);

      messageOpacity.value = withTiming(1);
      messageScale.value = withSpring(1);
      
      return () => clearInterval(interval);
    } else {
      messageOpacity.value = withTiming(0);
      messageScale.value = withTiming(1);
    }
  }, [isGenerating]);

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [{ scale: messageScale.value }],
  }));

  return (
    <View style={styles.statusContainer}>
      <Animated.View style={[styles.messageContainer, messageStyle]}>
        <LinearGradient
          colors={[messages[currentMessage].color + '40', messages[currentMessage].color + '20']}
          style={styles.messageGradient}
        >
          <TextEffect
            preset="fade"
            per="word"
            color={messages[currentMessage].color}
            fontSize={18}
          >
            {messages[currentMessage].text}
          </TextEffect>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export const AIStoryGeneratorEnhanced: React.FC<{ visible: boolean; onClose: () => void; }> = ({ visible, onClose }) => {
  const { addStory } = useStories();
  const [prompt, setPrompt] = useState<string>("");
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [storyPages, setStoryPages] = useState<Chapter[][]>([]);
  
  // Save and summary states
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const genres = ["Adventure", "Mystery", "Sci-Fi", "Fantasy", "Romance", "Horror", "Comedy", "Drama"];
  const lengths = ["Short (5-10 min)", "Medium (10-15 min)", "Long (15-20 min)", "Extended (20-30 min)", "Epic (30+ min)"];
  const tones = ["Light & Fun", "Mysterious", "Epic", "Romantic", "Dark", "Inspiring"];
  const audiences = ["Children", "Teenagers", "Young Adults", "Adults", "All Ages"];
  
  // Helper function to split story into pages
  const paginateStory = (chapters: Chapter[]): Chapter[][] => {
    const chaptersPerPage = 2; // Show 2 chapters per page
    const pages: Chapter[][] = [];
    for (let i = 0; i < chapters.length; i += chaptersPerPage) {
      pages.push(chapters.slice(i, i + chaptersPerPage));
    }
    return pages.length > 0 ? pages : [[]];
  };
  
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
      
      // Reset states when modal closes
      setShowSummary(false);
      setIsSaved(false);
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
    opacity: modalOpacity.value,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

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

      // Setup pagination
      const pages = paginateStory(storyData.chapters);
      setStoryPages(pages);
      setTotalPages(pages.length);
      setCurrentPage(0);
      
      setGeneratedStory(storyData);
      setIsGenerating(false);
      setShowStory(true);
      setIsSaved(false); // Reset saved state for new story
      
    } catch (error) {
      console.error('Story generation failed:', error);
      setIsGenerating(false);
      Alert.alert("Generation Failed", "Unable to generate story. Please try again.");
    }
  };

  // Save Story Function
  const saveStory = async () => {
    if (!generatedStory) return;
    
    setIsSaving(true);
    
    try {
      // Create a unique ID for the story
      const storyId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Get the first image for the story cover
      const coverImage = generatedStory.chapters.find(chapter => chapter.image)?.image || 
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1170&auto=format&fit=crop';
      
      // Create the story object for the context
      const storyToSave = {
        id: storyId,
        title: generatedStory.title,
        duration: generatedStory.readingTime,
        author: 'You', // Since it's user-generated
        imageUrl: coverImage,
        category: generatedStory.genre,
        content: generatedStory.content,
        images: generatedStory.chapters.map(chapter => chapter.image).filter(Boolean) as string[]
      };
      
      // Add to stories context
      addStory(storyToSave);
      
      // Show success message and set saved state
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

  // Toggle Summary View
  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  // Generate real-time summary from current story content
  const getRealTimeSummary = () => {
    if (!generatedStory) return '';
    
    // Get content from current visible chapters
    const currentChapters = storyPages[currentPage] || [];
    if (currentChapters.length === 0 && generatedStory.chapters.length > 0) {
      // If no current page, use first chapter
      const firstChapter = generatedStory.chapters[0];
      return firstChapter.text.slice(0, 300) + (firstChapter.text.length > 300 ? '...' : '');
    }
    
    // Use current page chapters
    const currentContent = currentChapters.map(chapter => chapter.text).join(' ');
    return currentContent.slice(0, 300) + (currentContent.length > 300 ? '...' : '');
  };

  // Fetch image from Unsplash based on story theme
  const fetchStoryImage = async (query: string): Promise<string | undefined> => {
    // Access environment variables correctly in Expo
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

  // Generate story using Google AI (Gemini)
  const generateAIStory = async (prompt: string, length: string): Promise<{title: string; chapters: Chapter[]}> => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || 'AIzaSyD1xUm97NeOeeNKozOga12SANLqkaWh_pY';
    if (!apiKey) {
      throw new Error('Google AI API key not found');
    }

    // Determine chapter count and token limit based on length
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

      // Parse the generated story into chapters with improved logic
      const lines = generatedText.split('\n').filter((line: string) => line.trim());
      let title = "Generated Story";
      const chapters: Chapter[] = [];
      let currentChapter = { title: "", text: "" };
      let titleFound = false;

      for (const line of lines) {
        // Check for main title
        if (line.startsWith('# Title:') || (line.startsWith('# ') && !titleFound)) {
          title = line.replace(/^# (Title: ?)?/, '').trim();
          titleFound = true;
          continue;
        }
        
        // Check for chapter headers
        if (line.startsWith('## Chapter') || line.startsWith('## ')) {
          // Save current chapter if it exists
          if (currentChapter.title && currentChapter.text.trim()) {
            chapters.push({ ...currentChapter });
          }
          
          // Extract chapter title
          let chapterTitle = line.replace(/^## (Chapter \d+: ?)?/, '').trim();
          currentChapter = { title: chapterTitle, text: "" };
          continue;
        }
        
        // Add text to current chapter
        if (currentChapter.title && line.trim()) {
          currentChapter.text += line + '\n\n';
        } else if (!currentChapter.title && line.trim() && titleFound) {
          // If no chapter started yet but we have content, create first chapter
          currentChapter = { title: "Chapter 1", text: line + '\n\n' };
        }
      }
      
      // Add the last chapter
      if (currentChapter.title && currentChapter.text.trim()) {
        chapters.push(currentChapter);
      }
      
      // Ensure we have at least some chapters
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
    
    // Create a detailed prompt for the AI
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
      // Generate the story using AI
      const { title, chapters } = await generateAIStory(aiPrompt);
      console.log(`Generated story: "${title}" with ${chapters.length} chapters`);
      
      // Add images to chapters
      const chaptersWithImages: Chapter[] = [];
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        // Generate more specific image search query based on chapter content and genre
        const words = chapter.text.toLowerCase().split(' ').slice(0, 10); // First 10 words
        const keyWords = words.filter(word => 
          word.length > 4 && 
          !['the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'would', 'there', 'could', 'other'].includes(word)
        ).slice(0, 3); // Top 3 relevant words
        
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
      
      // Generate a summary from the first chapter or content
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
      
      // Fallback to a more elaborate template-based story if AI fails
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

      // Generate a summary from the first chapter
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
    // Reset pagination
    setCurrentPage(0);
    setTotalPages(1);
    setStoryPages([]);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backgroundOverlay, backgroundStyle]} />
        
        <Animated.View style={[styles.bottomSheet, modalStyle]}>
          {showStory && generatedStory ? (
            // **UPDATED**: Reader View with new button styles
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
                

                
                {/* Display current page chapters */}
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

                {/* Page Navigation */}
                {totalPages > 1 && (
                  <View style={styles.pageNavigationContainer}>
                    <Text style={styles.readerPageNumber}>{currentPage + 1} of {totalPages}</Text>
                    
                    <View style={styles.navigationArrows}>
                      {/* Previous Page Button */}
                      {currentPage > 0 && (
                        <TouchableOpacity 
                          style={[styles.navButton, styles.prevButton]}
                          onPress={() => setCurrentPage(currentPage - 1)}
                          activeOpacity={0.7}
                        >
                          <ChevronLeft size={24} color="#444" />
                        </TouchableOpacity>
                      )}
                      
                      {/* Next Page Button */}
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

                {/* Save Action at Bottom */}
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
                
                {/* Bottom padding for better scrolling */}
                <View style={{ height: 40 }} />
              </ScrollView>

              {/* Summary Popup Modal */}
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
            // Generator View (remains the same)
            <LinearGradient
              colors={['#1a1a2e', '#16213e', '#0f3460']}
              style={styles.modalGradient}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <LinearGradient
                    colors={[Colors.primary, '#8B5CF6', '#06B6D4']}
                    style={styles.iconContainer}
                  >
                    <Wand2 size={28} color="white" />
                  </LinearGradient>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>AI Story Generator</Text>
                    <Text style={styles.subtitle}>Create stories with AI</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.closeButtonGradient}
                  >
                    <X size={24} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {!isGenerating && (
                  <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>
                        <Sparkles size={16} color={Colors.primary} /> What's your story about?
                      </Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Describe your story idea (optional)..."
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={prompt}
                          onChangeText={setPrompt}
                          multiline
                          textAlignVertical="top"
                          maxLength={500}
                        />
                        <View style={styles.inputFooter}>
                          <Text style={styles.characterCount}>{prompt.length}/500</Text>
                        </View>
                      </View>
                      <Text style={styles.inputHint}>
                        💡 Leave blank to let AI surprise you with creative ideas!
                      </Text>
                    </View>

                    <View style={styles.selectionContainer}>
                      <Text style={styles.label}>Genre</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.optionsRow}>
                          {genres.map((genre) => (
                            <AnimatedTouchableOpacity
                              key={genre}
                              style={[ styles.optionChip, selectedGenre === genre && styles.selectedChip ]}
                              onPress={() => setSelectedGenre(genre)}
                            >
                              <Text style={[ styles.optionText, selectedGenre === genre && styles.selectedText ]}>
                                {genre}
                              </Text>
                            </AnimatedTouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.selectionContainer}>
                      <Text style={styles.label}>Story Length</Text>
                      <View style={styles.optionsColumn}>
                        {lengths.map((length) => (
                          <AnimatedTouchableOpacity
                            key={length}
                            style={[ styles.optionChip, selectedLength === length && styles.selectedChip ]}
                            onPress={() => setSelectedLength(length)}
                          >
                            <Text style={[ styles.optionText, selectedLength === length && styles.selectedText ]}>
                              {length}
                            </Text>
                          </AnimatedTouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.advancedToggle}
                      onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <Settings size={20} color={Colors.primary} />
                      <Text style={styles.advancedToggleText}>Advanced Options</Text>
                      <Text style={[styles.advancedToggleIcon, { transform: [{ rotate: showAdvancedOptions ? '180deg' : '0deg' }] }]}>
                        ▼
                      </Text>
                    </TouchableOpacity>

                    {showAdvancedOptions && (
                      <View style={styles.advancedOptions}>
                        <View style={styles.selectionContainer}>
                          <Text style={styles.label}>
                            <Target size={16} color={Colors.primary} /> Tone
                          </Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.optionsRow}>
                              {tones.map((tone) => (
                                <AnimatedTouchableOpacity
                                  key={tone}
                                  style={[ styles.optionChip, selectedTone === tone && styles.selectedChip ]}
                                  onPress={() => setSelectedTone(tone)}
                                >
                                  <Text style={[ styles.optionText, selectedTone === tone && styles.selectedText ]}>
                                    {tone}
                                  </Text>
                                </AnimatedTouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>

                        <View style={styles.selectionContainer}>
                          <Text style={styles.label}>
                            <Users size={16} color={Colors.primary} /> Target Audience
                          </Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.optionsRow}>
                              {audiences.map((audience) => (
                                <AnimatedTouchableOpacity
                                  key={audience}
                                  style={[ styles.optionChip, selectedAudience === audience && styles.selectedChip ]}
                                  onPress={() => setSelectedAudience(audience)}
                                >
                                  <Text style={[ styles.optionText, selectedAudience === audience && styles.selectedText ]}>
                                    {audience}
                                  </Text>
                                </AnimatedTouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>

                        <View style={styles.sliderContainer}>
                          <Text style={styles.label}>
                            <Sparkles size={16} color={Colors.primary} /> Creativity Level: {creativityLevel}/5
                          </Text>
                          <View style={styles.creativitySlider}>
                            {[1, 2, 3, 4, 5].map((level) => (
                              <TouchableOpacity
                                key={level}
                                style={[ styles.creativityDot, creativityLevel >= level && styles.creativityDotActive ]}
                                onPress={() => setCreativityLevel(level)}
                              />
                            ))}
                          </View>
                          <View style={styles.creativityLabels}>
                            <Text style={styles.creativityLabel}>Conservative</Text>
                            <Text style={styles.creativityLabel}>Creative</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    <AnimatedTouchableOpacity
                      style={styles.generateButton}
                      onPress={generateStory}
                      disabled={isGenerating}
                    >
                      <LinearGradient
                        colors={[Colors.primary, '#8B5CF6', '#06B6D4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Sparkles size={20} color="white" />
                        <Text style={styles.generateButtonText}>
                          {isGenerating ? 'Generating...' : 'Generate Story'}
                        </Text>
                      </LinearGradient>
                    </AnimatedTouchableOpacity>
                  </View>
                )}

                {isGenerating && (
                  <View style={styles.generationContainer}>
                    <SimpleAIAnimation isGenerating={isGenerating} />
                    <AIProgressIndicator progress={generationProgress} isGenerating={isGenerating} />
                    <GenerationStatusMessages isGenerating={isGenerating} />
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // --- (Styles for Generator and Animations remain the same) ---
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    width: screenWidth,
    height: screenHeight * 0.95,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalGradient: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputSection: {
    gap: 24,
    paddingBottom: 40,
  },
  inputContainer: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  textInput: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
    minHeight: 100,
    fontWeight: '400',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  selectionContainer: {
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsColumn: {
    gap: 12,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedChip: {
    backgroundColor: Colors.primary + '40',
    borderColor: Colors.primary,
  },
  optionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
  generateButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  generationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    gap: 30,
    paddingVertical: 40,
  },

  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 8,
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    minHeight: 80,
    justifyContent: 'center',
  },
  messageContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  messageGradient: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  aiAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  aiCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 10,
  },
  aiGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 16,
  },
  advancedToggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  advancedToggleIcon: {
    color: Colors.primary,
    fontSize: 14,
  },
  advancedOptions: {
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  sliderContainer: {
    gap: 12,
  },
  creativitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  creativityDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  creativityDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  creativityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creativityLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },

  // STYLES for Reader View
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
    gap: 8, // Adjusted gap for the new button size
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
  // **NEW**: Styles translated from your CSS
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconButtonPressed: {
    backgroundColor: '#DEE1E6', // This is the 'active' state background
  },
  
  // Story Actions Styles
  storyActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  
  summaryButton: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  
  saveButton: {
    backgroundColor: Colors.primary,
  },
  
  actionButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Summary Styles
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  
  // Bottom Save Container (single button)
  bottomSaveContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  
  // Save Button Only Style (full width)
  saveButtonOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    minWidth: 200,
  },
  
  // Saved Button Style
  savedButton: {
    backgroundColor: '#4CAF50',
  },
  
  // Summary Popup Overlay
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
  
  // Summary Popup Modal
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