import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Sparkles, Wand2, BookOpen, Users, Download, Share, FileText } from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { TextEffect } from "@/components/ui/text-effect";
import { SpeechButton } from "@/components/ui/speech-button";
import Colors from "@/constants/colors";
import { useStories } from "@/contexts/StoriesContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AIStoryGeneratorProps {
  visible: boolean;
  onClose: () => void;
}

interface StoryWithImages {
  title: string;
  content: string;
  images: string[];
  genre: string;
  readingTime: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Enhanced AI Neural Network Animation with Interactive Elements
const NeuralNetworkAnimation = ({ isGenerating }: { isGenerating: boolean }) => {
  const nodes = Array.from({ length: 32 }, (_, i) => i);
  const connections = Array.from({ length: 48 }, (_, i) => i);
  
  return (
    <View style={styles.neuralContainer}>
      {/* Neural Network Nodes */}
      {nodes.map((node) => {
        const pulseScale = useSharedValue(0.5);
        const opacity = useSharedValue(0);
        const glow = useSharedValue(0);

        useEffect(() => {
          if (isGenerating) {
            pulseScale.value = withRepeat(
              withSequence(
                withDelay(node * 150, withTiming(1.2, { duration: 800 })),
                withTiming(0.8, { duration: 600 }),
                withTiming(1, { duration: 400 })
              ), -1, true
            );
            
            opacity.value = withDelay(node * 100, withTiming(1, { duration: 500 }));
            glow.value = withRepeat(
              withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.3, { duration: 800 })
              ), -1, true
            );
          } else {
            pulseScale.value = withTiming(0.5);
            opacity.value = withTiming(0);
            glow.value = withTiming(0);
          }
        }, [isGenerating]);

        const nodeStyle = useAnimatedStyle(() => ({
          transform: [
            { scale: pulseScale.value },
            { rotateY: `${pulseScale.value * 15}deg` }
          ],
          opacity: opacity.value,
          shadowOpacity: glow.value * 0.8,
          elevation: glow.value * 10,
        }));

        const x = 25 + (node % 8) * 40;
        const y = 30 + Math.floor(node / 8) * 50;
        
        return (
          <Animated.View
            key={`node-${node}`}
            style={[
              styles.neuralNode,
              {
                left: x,
                top: y,
                backgroundColor: node % 4 === 0 ? Colors.primary : 
                              node % 4 === 1 ? '#8B5CF6' : 
                              node % 4 === 2 ? '#06B6D4' : '#FF6B6B',
              },
              nodeStyle
            ]}
          >
            <LinearGradient
              colors={[
                node % 4 === 0 ? Colors.primary : 
                node % 4 === 1 ? '#8B5CF6' : 
                node % 4 === 2 ? '#06B6D4' : '#FF6B6B',
                'rgba(255,255,255,0.3)'
              ]}
              style={styles.nodeGradient}
            />
          </Animated.View>
        );
      })}
      
      {/* Enhanced Neural Connections */}
      {connections.map((connection) => {
        const lineOpacity = useSharedValue(0);
        const lineWidth = useSharedValue(1);

        useEffect(() => {
          if (isGenerating) {
            lineOpacity.value = withRepeat(
              withSequence(
                withDelay(connection * 80, withTiming(0.8, { duration: 400 })),
                withTiming(0.2, { duration: 600 })
              ), -1, true
            );
            
            lineWidth.value = withRepeat(
              withSequence(
                withTiming(2, { duration: 500 }),
                withTiming(0.5, { duration: 700 })
              ), -1, true
            );
          } else {
            lineOpacity.value = withTiming(0);
            lineWidth.value = withTiming(1);
          }
        }, [isGenerating]);

        const connectionStyle = useAnimatedStyle(() => ({
          opacity: lineOpacity.value,
          height: lineWidth.value,
        }));

        const startNode = connection % 18;
        const endNode = (connection + 6) % 18;
        const x1 = 30 + (startNode % 6) * 50;
        const y1 = 40 + Math.floor(startNode / 6) * 60;
        const x2 = 30 + (endNode % 6) * 50;
        const y2 = 40 + Math.floor(endNode / 6) * 60;
        
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        
        return (
          <Animated.View
            key={`connection-${connection}`}
            style={[
              styles.neuralConnection,
              {
                left: x1,
                top: y1,
                width: length,
                transform: [{ rotate: `${angle}deg` }],
              },
              connectionStyle
            ]}
          />
        );
      })}
    </View>
  );
};

// Enhanced Particle System with AI Elements
const AIParticleSystem = ({ isGenerating }: { isGenerating: boolean }) => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <View style={styles.particleContainer}>
      {particles.map((particle) => {
        const rotation = useSharedValue(0);
        const scale = useSharedValue(0);
        const translateX = useSharedValue(0);
        const translateY = useSharedValue(0);
        const opacity = useSharedValue(0);

        useEffect(() => {
          if (isGenerating) {
            // Complex orbital motion
            rotation.value = withRepeat(
              withTiming(360 * (particle % 2 === 0 ? 1 : -1), { 
                duration: 4000 + (particle * 300) 
              }), -1, false
            );
            
            scale.value = withRepeat(
              withSequence(
                withDelay(particle * 150, withTiming(1.8, { duration: 1200 })),
                withTiming(0.4, { duration: 800 }),
                withTiming(1.2, { duration: 600 })
              ), -1, true
            );
            
            // Spiral motion pattern
            translateX.value = withRepeat(
              withSequence(
                withTiming(Math.sin(particle * 0.5) * 60, { duration: 2500 }),
                withTiming(-Math.sin(particle * 0.5) * 60, { duration: 2500 })
              ), -1, true
            );
            
            translateY.value = withRepeat(
              withSequence(
                withTiming(Math.cos(particle * 0.7) * 45, { duration: 2000 }),
                withTiming(-Math.cos(particle * 0.7) * 45, { duration: 2000 })
              ), -1, true
            );
            
            opacity.value = withRepeat(
              withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.3, { duration: 1200 })
              ), -1, true
            );
          } else {
            rotation.value = withTiming(0, { duration: 500 });
            scale.value = withTiming(0, { duration: 300 });
            translateX.value = withTiming(0, { duration: 400 });
            translateY.value = withTiming(0, { duration: 400 });
            opacity.value = withTiming(0, { duration: 200 });
          }
        }, [isGenerating]);

        const animatedStyle = useAnimatedStyle(() => {
          return {
            transform: [
              { rotate: `${rotation.value}deg` },
              { scale: scale.value },
              { translateX: translateX.value },
              { translateY: translateY.value },
            ],
            opacity: opacity.value,
          };
        });
        
        const ParticleIcon = particle % 4 === 0 ? Sparkles : 
                           particle % 4 === 1 ? Wand2 : 
                           particle % 4 === 2 ? BookOpen : FileText;
        
        return (
          <Animated.View
            key={particle}
            style={[
              styles.particle,
              {
                left: `${15 + (particle * 4)}%`,
                top: `${20 + (particle * 3.5)}%`,
              },
              animatedStyle
            ]}
          >
            <ParticleIcon 
              size={12 + (particle % 4) * 6} 
              color={particle % 4 === 0 ? Colors.primary : 
                    particle % 4 === 1 ? '#8B5CF6' : 
                    particle % 4 === 2 ? '#06B6D4' : '#10B981'} 
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

export const AIStoryGenerator: React.FC<AIStoryGeneratorProps> = ({ visible, onClose }) => {
  const { addStory } = useStories();
  const [prompt, setPrompt] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showVoiceInput, setShowVoiceInput] = useState<boolean>(false);
  const [generatedStory, setGeneratedStory] = useState<StoryWithImages | null>(null);
  const [showStory, setShowStory] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [contentLoaded, setContentLoaded] = useState<boolean>(false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState<number>(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [showSpeechButton, setShowSpeechButton] = useState<boolean>(false);

  const genres = ["Adventure", "Mystery", "Sci-Fi", "Fantasy", "Romance", "Horror"];
  const lengths = ["Short (5-10 min)", "Medium (10-15 min)", "Long (15-20 min)"];
  
  const placeholders = [
    "A detective solving mysteries in space stations orbiting distant planets...",
    "A magical forest where time flows differently and ancient spirits whisper secrets...",
    "Two lovers separated by parallel dimensions who can only meet in dreams...",
    "An ancient artifact discovered in the depths of the ocean that holds the key to humanity's future...",
    "A journey to the center of the earth where a hidden civilization has thrived for millennia...",
    "A young inventor who creates a machine that can translate animal thoughts into human language...",
    "A librarian who discovers that certain books can transport readers into their stories...",
    "A chef whose recipes have magical properties that can heal both body and soul...",
  ];

  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const neuralAnimation = useSharedValue(0);

  useEffect(() => {
    if (isGenerating) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ), -1, true
      );
      
      rotateAnimation.value = withRepeat(
        withTiming(360, { duration: 3000 }), -1, false
      );
      
      neuralAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0.3, { duration: 800 })
        ), -1, true
      );
      
      progressAnimation.value = withTiming(1, { duration: 8000 });
    } else {
      pulseAnimation.value = withTiming(1);
      rotateAnimation.value = withTiming(0);
      neuralAnimation.value = withTiming(0);
      progressAnimation.value = withTiming(0);
    }
  }, [isGenerating]);

  const mainAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: pulseAnimation.value },
        { rotate: `${rotateAnimation.value}deg` }
      ],
    };
  });

  const neuralAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: neuralAnimation.value,
    };
  });

  const fetchStoryImages = async (storyText: string, genre: string): Promise<string[]> => {
    // Using placeholder images to avoid CORB issues in development
    const genreImages = {
      'Adventure': [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150ad6fbeb8?w=800&h=600&fit=crop'
      ],
      'Mystery': [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=800&h=600&fit=crop'
      ],
      'Sci-Fi': [
        'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop'
      ],
      'Fantasy': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
      ],
      'Romance': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
      ],
      'Horror': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1520637836862-4d197d17c38a?w=800&h=600&fit=crop'
      ]
    };

    // Return genre-specific images or default to mystery images
    return genreImages[genre as keyof typeof genreImages] || genreImages.Mystery;
  };

  const extractKeywordsFromStory = (text: string): string[] => {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return words.filter(word => !commonWords.includes(word)).slice(0, 5);
  };

  const generateStoryWithAPI = async (): Promise<StoryWithImages> => {
    try {
      const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
      
      if (!GOOGLE_API_KEY) {
        throw new Error("Google API key not found. Please add EXPO_PUBLIC_GOOGLE_AI_API_KEY to your .env file");
      }

      const promptWordCount = selectedLength.includes("Short") ? "800-1200" : 
                       selectedLength.includes("Medium") ? "1200-1800" : "1800-2500";

      const storyPrompt = `Write a captivating ${selectedGenre.toLowerCase()} story based on this premise: "${prompt}". 

      Requirements:
      - Approximately ${promptWordCount} words
      - Well-structured with clear beginning, middle, and end
      - Rich descriptions and compelling dialogue
      - Engaging characters and plot
      - Format with proper paragraphs
      - Include a compelling title
      - Make it immersive and emotionally engaging

      Please format your response as follows:
      TITLE: [Story Title]
      
      [Story content with proper paragraphs]`;

      setGenerationProgress(20);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: storyPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        }
      );

      setGenerationProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("No story content received from API");
      }

      const fullText = data.candidates[0].content.parts[0].text;
      
      let title = "Untitled Story";
      let content = fullText;
      
      const titleMatch = fullText.match(/TITLE:\s*(.+?)(?:\n|$)/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
        content = fullText.replace(/TITLE:\s*.+?(?:\n|$)/i, '').trim();
      }

      setGenerationProgress(80);

      const images = await fetchStoryImages(content, selectedGenre);
      
      setGenerationProgress(100);

      const wordsPerMinute = 200;
      const actualWordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(actualWordCount / wordsPerMinute);

      return {
        title,
        content,
        images,
        genre: selectedGenre,
        readingTime: `${readingTime} min read`
      };
    } catch (error) {
      console.error('Story generation error:', error);
      throw error;
    }
  };

  const prepareSpeechContent = (story: StoryWithImages): string[] => {
    return [
      story.title,
      `Genre: ${story.genre}`,
      `Reading time: ${story.readingTime}`,
      story.content
    ];
  };

  const generateSummaryWithAPI = async (storyContent: string): Promise<string> => {
    try {
      const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
      if (!GOOGLE_API_KEY) {
        throw new Error("Google API key not found.");
      }

      const summaryPrompt = `Please provide a concise summary of the following story. The summary should capture the main plot points, character arcs, and the overall theme. Aim for a summary that is about 100-150 words long.

      Story:
      ---
      ${storyContent}
      ---
      
      Summary:`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: summaryPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              maxOutputTokens: 512,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("No summary content received from API");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Summary generation error:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Missing Information", "Please enter a story prompt");
      return;
    }

    if (!selectedGenre) {
      Alert.alert("Missing Information", "Please select a genre");
      return;
    }

    if (!selectedLength) {
      Alert.alert("Missing Information", "Please select a story length");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setShowStory(false);
    setContentLoaded(false);
    setCurrentVisibleIndex(0);
    
    try {
      const story = await generateStoryWithAPI();
      
      setGeneratedStory(story);
      setIsGenerating(false);
      setShowStory(true);
      
      const paragraphs = story.content.split('\n\n').filter(p => p.trim().length > 0);
      const totalElements = paragraphs.length + Math.min(story.images.length, 2);
      
      const revealInterval = setInterval(() => {
        setCurrentVisibleIndex(prev => {
          if (prev >= totalElements - 1) {
            clearInterval(revealInterval);
            setContentLoaded(true);
            return prev;
          }
          return prev + 1;
        });
      }, 200);

      return () => clearInterval(revealInterval);
    } catch (error: any) {
      setIsGenerating(false);
      Alert.alert(
        "Generation Failed", 
        error.message || "Failed to generate story. Please check your API keys and try again."
      );
    }
  };

  const handleViewSummary = async () => {
    if (!generatedStory?.content || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    setSummary(null);

    try {
      const generatedSummary = await generateSummaryWithAPI(generatedStory.content);
      setSummary(generatedSummary);
      setShowSummaryModal(true);
    } catch (error: any) {
      Alert.alert("Summary Failed", error.message || "Could not generate the story summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handlePromptSubmit = (text: string) => {
    setPrompt(text);
  };

  const handleVoiceStart = () => {
    console.log("Voice recording started");
  };

  const handleVoiceStop = (duration: number) => {
    console.log("Voice recording stopped, duration:", duration);
    setShowVoiceInput(false);
  };

  const handleCreateNew = () => {
    setGeneratedStory(null);
    setShowStory(false);
    setPrompt("");
    setSelectedGenre("");
    setSelectedLength("");
    setGenerationProgress(0);
    setContentLoaded(false);
    setCurrentVisibleIndex(0);
  };

  const handleSaveAndClose = () => {
    if (generatedStory) {
      // Generate a unique ID for the story
      const newStoryId = `ai-story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Convert the AI-generated story to the Story format expected by the app
      const newStory = {
        id: newStoryId,
        title: generatedStory.title,
        duration: generatedStory.readingTime,
        author: "Echo AI",
        imageUrl: generatedStory.images[0] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        category: generatedStory.genre,
        content: generatedStory.content, // Include the full story content
        images: generatedStory.images, // Include all images
      };

      // Add the story to the context
      addStory(newStory);
      
      // Close the modal first
      onClose();
      
      // Show success alert after closing
      setTimeout(() => {
        Alert.alert(
          "Story Saved!",
          "Your AI-generated story has been saved and will appear on your home page.",
          [{ text: "OK" }]
        );
      }, 300);
    } else {
      // If no story generated, just close
      onClose();
    }
  };

  const OptionButton = ({ 
    title, 
    isSelected, 
    onPress 
  }: { 
    title: string; 
    isSelected: boolean; 
    onPress: () => void; 
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <AnimatedTouchableOpacity
        style={[
          styles.optionButton,
          isSelected && styles.selectedOption,
          animatedStyle
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={[
          styles.optionText,
          isSelected && styles.selectedOptionText
        ]}>
          {title}
        </Text>
      </AnimatedTouchableOpacity>
    );
  };

  const renderStoryContent = () => {
    if (!generatedStory) return null;

    const paragraphs = generatedStory.content.split('\n\n').filter(p => p.trim().length > 0);
    const imageInsertionPoints = [
      Math.floor(paragraphs.length * 0.3),
      Math.floor(paragraphs.length * 0.6)
    ].filter(p => p > 0 && p < paragraphs.length);
    
    let imageIndex = 0;
    let contentElements = [];

    paragraphs.forEach((paragraph, idx) => {
      contentElements.push(
        <TextEffect
          key={`para-${idx}`}
          per="word"
          preset="fade"
          delay={10 + (idx * 5)}
          trigger={contentLoaded}
          fontSize={16}
          color={Colors.text}
          style={styles.storyText}
          duration={300}
          stagger={50}
        >
          {paragraph}
        </TextEffect>
      );

      if (imageInsertionPoints.includes(idx) && imageIndex < generatedStory.images.length) {
        contentElements.push(
          <View key={`img-${imageIndex}`} style={styles.storyImageContainer}>
            <Image
              source={{ uri: generatedStory.images[imageIndex] }}
              style={styles.storyImage}
              resizeMode="cover"
            />
            <Text style={styles.imageCaption}>{`Illustration ${imageIndex + 1}`}</Text>
          </View>
        );
        imageIndex++;
      }
    });

    return contentElements;
  };

  const renderFixedActions = () => {
    if (!showStory || !generatedStory || !contentLoaded) return null;

    return (
      <View style={styles.fixedActionsContainer}>
        <View style={styles.fixedActions}>
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.iconActionButton}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Share size={20} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.iconActionButton}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Download size={20} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconActionButton}
              onPress={handleViewSummary}
              disabled={isGeneratingSummary}
              activeOpacity={0.8}
            >
              {isGeneratingSummary ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <FileText size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.createNewButton}
              onPress={handleCreateNew}
              activeOpacity={0.8}
            >
              <Text style={styles.createNewButtonText}>Create New</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleSaveAndClose}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionText}>Save & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSummaryModal = () => (
    <Modal
      visible={showSummaryModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowSummaryModal(false)}
    >
      <View style={styles.summaryModalContainer}>
        <View style={styles.summaryModalContent}>
          <View style={styles.summaryHeader}>
             <FileText size={22} color={Colors.primary} />
             <Text style={styles.summaryTitle}>Story Summary</Text>
          </View>
          <ScrollView style={styles.summaryScrollView}>
            <Text style={styles.summaryText}>{summary}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.summaryCloseButton}
            onPress={() => setShowSummaryModal(false)}
          >
            <Text style={styles.summaryCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    if (showStory && generatedStory) {
      return (
        <View style={styles.storyOuterContainer}>
          <ScrollView 
            style={styles.storyContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storyContentContainer}
          >
            <View style={styles.storyHeader}>
              <View style={styles.storyTitleContainer}>
                <Sparkles size={24} color={Colors.primary} />
                <Text style={styles.storyTitle}>{generatedStory.title}</Text>
              </View>
              <View style={styles.storyMeta}>
                <Text style={styles.storyMetaText}>{generatedStory.genre} • {generatedStory.readingTime}</Text>
              </View>
            </View>

            {renderStoryContent()}
          </ScrollView>
          {renderFixedActions()}
          {renderSummaryModal()}
        </View>
      );
    }

    if (isGenerating) {
      return (
        <View style={styles.generationContainer}>
          <NeuralNetworkAnimation isGenerating={isGenerating} />
          <AIParticleSystem isGenerating={isGenerating} />
          
          <View style={styles.generationContent}>
            <Animated.View style={[styles.mainGenerationIcon, mainAnimationStyle]}>
              <LinearGradient
                colors={[Colors.primary, '#8B5CF6', '#06B6D4']}
                style={styles.mainIconGradient}
              >
                <Sparkles size={60} color="white" />
              </LinearGradient>
            </Animated.View>
            
            <View style={styles.enhancedNeuralNetwork}>
              {Array.from({ length: 8 }, (_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.enhancedNeuralNode,
                    { 
                      left: `${10 + i * 10}%`,
                      backgroundColor: i % 3 === 0 ? Colors.primary : 
                                     i % 3 === 1 ? '#8B5CF6' : '#06B6D4',
                    },
                    neuralAnimationStyle
                  ]}
                />
              ))}
            </View>
            
            <TextEffect
              preset="fade"
              per="word"
              color="white"
              fontSize={24}
              style={styles.enhancedTitle}
            >
              {"AI Crafting Your Story"}
            </TextEffect>
            
            <View style={styles.enhancedGenerationDetails}>
              <TextEffect
                preset="slide"
                per="char"
                color={Colors.primary}
                fontSize={16}
                delay={500}
              >
                {"🧠 Neural networks analyzing..."}
              </TextEffect>
              <TextEffect
                preset="scale"
                per="word"
                color="#8B5CF6"
                fontSize={16}
                delay={1500}
              >
                {"✨ Creative synapses firing..."}
              </TextEffect>
              <TextEffect
                preset="shake"
                per="word"
                color="#06B6D4"
                fontSize={16}
                delay={2500}
              >
                {"🔮 Narrative pathways forming..."}
              </TextEffect>
            </View>
            
            <View style={styles.enhancedProgressContainer}>
              <View style={styles.enhancedProgressBar}>
                <Animated.View 
                  style={[
                    styles.enhancedProgressFill, 
                    { 
                      width: `${generationProgress || 0}%`,
                      backgroundColor: (generationProgress || 0) > 50 ? Colors.primary : '#8B5CF6'
                    }
                  ]} 
                >
                  <LinearGradient
                    colors={[Colors.primary, '#8B5CF6', '#06B6D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>
              <View style={styles.progressTextContainer}>
                <TextEffect
                  preset="fade"
                  per="char"
                  color="white"
                  fontSize={18}
                >
                  {`${Math.round(generationProgress || 0)}% Complete`}
                </TextEffect>
                <View style={styles.progressDots}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.progressDot,
                        {
                          opacity: ((generationProgress || 0) > i * 33) ? 1 : 0.3,
                          backgroundColor: Colors.primary
                        }
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Story Prompt</Text>
          </View>
          
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={setPrompt}
            onSubmit={handlePromptSubmit}
            style={styles.promptInput}
          />
          
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={() => setShowVoiceInput(!showVoiceInput)}
            activeOpacity={0.8}
          >
            <Text style={styles.voiceButtonText}>
              {showVoiceInput ? "Hide Voice Input" : "Use Voice Input"}
            </Text>
          </TouchableOpacity>

          {showVoiceInput && (
            <AIVoiceInput
              onStart={handleVoiceStart}
              onStop={handleVoiceStop}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wand2 size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Genre</Text>
          </View>
          <View style={styles.optionsGrid}>
            {genres.map((genre) => (
              <OptionButton
                key={genre}
                title={genre}
                isSelected={selectedGenre === genre}
                onPress={() => setSelectedGenre(genre)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Story Length</Text>
          </View>
          <View style={styles.optionsGrid}>
            {lengths.map((length) => (
              <OptionButton
                key={length}
                title={length}
                isSelected={selectedLength === length}
                onPress={() => setSelectedLength(length)}
              />
            ))}
          </View>
        </View>

        <AnimatedTouchableOpacity
          style={[styles.enhancedGenerateButton, isGenerating && styles.generatingButton]}
          onPress={handleGenerate}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isGenerating ? 
              ['rgba(102, 126, 234, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(6, 182, 212, 0.8)'] : 
              [Colors.primary, '#8B5CF6', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enhancedGenerateButtonGradient}
          >
            <Animated.View style={mainAnimationStyle}>
              {isGenerating ? <Wand2 size={20} color="white" /> : <Sparkles size={20} color="white" />}
            </Animated.View>
            <TextEffect
              preset={isGenerating ? "fade" : "scale"}
              per="word"
              color="white"
              fontSize={16}
              trigger={true}
            >
              {isGenerating ? "🔮 Generating Story..." : "✨ Generate Story"}
            </TextEffect>
          </LinearGradient>
          
          {/* Enhanced button glow effect */}
          {!isGenerating && (
            <View style={styles.buttonGlowEffect}>
              <LinearGradient
                colors={['transparent', Colors.primary + '20', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.glowGradient}
              />
            </View>
          )}
        </AnimatedTouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Sparkles size={24} color="white" />
              <Text style={styles.headerTitle}>AI Story Generator</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {renderContent()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  generationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    position: 'relative',
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    zIndex: 1,
  },
  // Enhanced Neural Network Styles
  neuralContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  neuralNode: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  nodeGradient: {
    flex: 1,
    borderRadius: 6,
  },
  neuralConnection: {
    position: 'absolute',
    backgroundColor: 'rgba(102, 126, 234, 0.6)',
    borderRadius: 1,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    elevation: 2,
  },
  mainIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  enhancedNeuralNetwork: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    height: 40,
    marginTop: 30,
  },
  enhancedNeuralNode: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  enhancedTitle: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  enhancedGenerationDetails: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 15,
  },
  enhancedProgressContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  enhancedProgressBar: {
    width: "90%",
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  enhancedProgressFill: {
    height: "100%",
    borderRadius: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
  progressGradient: {
    flex: 1,
  },
  progressTextContainer: {
    alignItems: 'center',
    gap: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 2,
  },
  generationContent: {
    alignItems: "center",
    width: "100%",
    zIndex: 2,
  },
  mainGenerationIcon: {
    marginBottom: 20,
  },
  neuralNetwork: {
    flexDirection: 'row',
    width: '100%',
    height: 40,
    position: 'relative',
    marginBottom: 20,
  },
  neuralNode: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  generationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
  },
  generationDetails: {
    alignItems: 'center',
    marginBottom: 40,
  },
  generationSubtitle: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.mutedText,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  promptInput: {
    marginBottom: 16,
  },
  voiceButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  voiceButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  generateButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 40,
  },
  enhancedGenerateButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 40,
    position: 'relative',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.4,
    elevation: 12,
  },
  generatingButton: {
    opacity: 0.9,
  },
  generateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  enhancedGenerateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 18,
    gap: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonGlowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 27,
    zIndex: -1,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 27,
  },
  storyOuterContainer: {
    flex: 1,
    position: 'relative',
  },
  storyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 110, 
  },
  storyContentContainer: {
    paddingBottom: 40,
  },
  storyHeader: {
    marginBottom: 24,
    alignItems: "center",
  },
  storyTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 8,
    textAlign: "center",
    flex: 1,
  },
  storyMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  storyMetaText: {
    fontSize: 14,
    color: Colors.mutedText,
    fontWeight: "500",
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    textAlign: "justify",
    marginBottom: 16,
  },
  storyImageContainer: {
    marginVertical: 24,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storyImage: {
    width: '100%',
    height: 200,
  },
  imageCaption: {
    fontSize: 12,
    color: Colors.mutedText,
    textAlign: "center",
    paddingVertical: 8,
    backgroundColor: Colors.surfaceLight,
  },
  fixedActionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
    borderTopWidth: 0,
  },
  fixedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionButton: {
    padding: 12,
    borderRadius: 22,
    backgroundColor: 'transparent',
  },
  createNewButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  createNewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  primaryActionButton: {
    borderRadius: 22,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  // --- SUMMARY MODAL STYLES ---
  summaryModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  summaryModalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 10,
  },
  summaryScrollView: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  summaryCloseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  summaryCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIStoryGenerator;
