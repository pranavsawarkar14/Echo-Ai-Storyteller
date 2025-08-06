import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  PanResponder,
  Vibration,
  LayoutAnimation,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { 
  X, 
  Sparkles, 
  Wand2, 
  BookOpen, 
  Users, 
  Download, 
  Share, 
  FileText, 
  Brain, 
  Zap, 
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Send,
  Mic,
  MicOff,
  Heart,
  Star,
  Eye,
  Layers,
  Shuffle,
  Settings,
  Magic,
  Lightbulb,
  Flame,
  Waves,
  Wind,
  Mountain,
  Sun,
  Moon
} from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
  useDerivedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { PanGestureHandler, PinchGestureHandler, State } from "react-native-gesture-handler";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { TextEffect } from "@/components/ui/text-effect";
import { VapourTextEffect } from "@/components/ui/vapour-text-effect";
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
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Enhanced Interactive Particle System
const InteractiveParticleSystem = ({ isGenerating, touchPosition }: { 
  isGenerating: boolean; 
  touchPosition: { x: number; y: number } | null;
}) => {
  const particles = Array.from({ length: 50 }, (_, i) => i);
  
  return (
    <View style={styles.particleSystemContainer}>
      {particles.map((particle) => {
        const translateX = useSharedValue(Math.random() * screenWidth);
        const translateY = useSharedValue(Math.random() * screenHeight);
        const scale = useSharedValue(0);
        const opacity = useSharedValue(0);
        const rotation = useSharedValue(0);

        useEffect(() => {
          if (isGenerating) {
            // Complex particle behavior
            translateX.value = withRepeat(
              withSequence(
                withTiming(Math.random() * screenWidth, { duration: 3000 + particle * 100 }),
                withTiming(Math.random() * screenWidth, { duration: 2000 + particle * 50 })
              ), -1, true
            );
            
            translateY.value = withRepeat(
              withSequence(
                withTiming(Math.random() * screenHeight, { duration: 2500 + particle * 80 }),
                withTiming(Math.random() * screenHeight, { duration: 3500 + particle * 120 })
              ), -1, true
            );
            
            scale.value = withRepeat(
              withSequence(
                withDelay(particle * 50, withSpring(1.5, { damping: 10, stiffness: 100 })),
                withSpring(0.3, { damping: 15, stiffness: 200 }),
                withSpring(1, { damping: 12, stiffness: 150 })
              ), -1, true
            );
            
            opacity.value = withRepeat(
              withSequence(
                withTiming(0.9, { duration: 1000 }),
                withTiming(0.2, { duration: 1500 })
              ), -1, true
            );
            
            rotation.value = withRepeat(
              withTiming(360, { duration: 5000 + particle * 200 }), -1, false
            );
          } else {
            scale.value = withSpring(0);
            opacity.value = withTiming(0);
          }
        }, [isGenerating]);

        // React to touch
        useEffect(() => {
          if (touchPosition && isGenerating) {
            const distance = Math.sqrt(
              Math.pow(touchPosition.x - translateX.value, 2) + 
              Math.pow(touchPosition.y - translateY.value, 2)
            );
            
            if (distance < 100) {
              scale.value = withSpring(2, { damping: 8, stiffness: 300 });
              opacity.value = withTiming(1);
            }
          }
        }, [touchPosition]);

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
            { rotate: `${rotation.value}deg` }
          ],
          opacity: opacity.value,
        }));

        const ParticleIcon = particle % 6 === 0 ? Sparkles : 
                           particle % 6 === 1 ? Zap : 
                           particle % 6 === 2 ? Magic :
                           particle % 6 === 3 ? Lightbulb :
                           particle % 6 === 4 ? Flame : Star;

        return (
          <Animated.View
            key={particle}
            style={[styles.interactiveParticle, animatedStyle]}
            pointerEvents="none"
          >
            <ParticleIcon 
              size={8 + (particle % 4) * 4} 
              color={particle % 6 === 0 ? Colors.primary : 
                    particle % 6 === 1 ? '#FF6B6B' : 
                    particle % 6 === 2 ? '#4ECDC4' :
                    particle % 6 === 3 ? '#45B7D1' :
                    particle % 6 === 4 ? '#96CEB4' : '#FFEAA7'} 
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

// 3D Holographic Brain with Advanced Physics
const HolographicBrainUltra = ({ isGenerating, intensity = 1 }: { 
  isGenerating: boolean; 
  intensity?: number;
}) => {
  const synapses = Array.from({ length: 48 }, (_, i) => i);
  const brainScale = useSharedValue(0.8);
  const brainRotationX = useSharedValue(0);
  const brainRotationY = useSharedValue(0);
  const hologramOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (isGenerating) {
      brainScale.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 200 }),
          withSpring(0.9, { damping: 12, stiffness: 300 }),
          withSpring(1.1, { damping: 10, stiffness: 250 })
        ), -1, true
      );
      
      brainRotationX.value = withRepeat(
        withTiming(360, { duration: 8000 }), -1, false
      );
      
      brainRotationY.value = withRepeat(
        withTiming(360, { duration: 12000 }), -1, false
      );
      
      hologramOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1500 }),
          withTiming(0.4, { duration: 1000 }),
          withTiming(0.7, { duration: 800 })
        ), -1, true
      );
    } else {
      brainScale.value = withSpring(0.8);
      brainRotationX.value = withTiming(0);
      brainRotationY.value = withTiming(0);
      hologramOpacity.value = withTiming(0);
    }
  }, [isGenerating]);

  const brainStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: brainScale.value * intensity },
      { rotateX: `${brainRotationX.value}deg` },
      { rotateY: `${brainRotationY.value}deg` }
    ],
    opacity: hologramOpacity.value,
  }));

  return (
    <View style={styles.holographicBrainContainer}>
      <Animated.View style={[styles.brainCore3D, brainStyle]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4']}
          style={styles.brainGradient3D}
        >
          <Brain size={80} color="rgba(255,255,255,0.95)" />
        </LinearGradient>
        
        {/* Holographic Layers */}
        {[0, 1, 2].map((layer) => (
          <Animated.View
            key={layer}
            style={[
              styles.holographicLayer,
              {
                transform: [{ scale: 1 + layer * 0.15 }],
                opacity: 0.3 - layer * 0.1,
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.2)']}
              style={styles.layerGradient}
            />
          </Animated.View>
        ))}
      </Animated.View>
      
      {/* Enhanced Synaptic Network */}
      {synapses.map((synapse) => {
        const pulseScale = useSharedValue(0);
        const synapseRotation = useSharedValue(0);
        const synapseGlow = useSharedValue(0);
        const synapseTrail = useSharedValue(0);

        useEffect(() => {
          if (isGenerating) {
            const delay = synapse * 50;
            
            pulseScale.value = withRepeat(
              withSequence(
                withDelay(delay, withSpring(2.5, { damping: 6, stiffness: 400 })),
                withSpring(0.3, { damping: 15, stiffness: 200 }),
                withSpring(1.8, { damping: 10, stiffness: 300 })
              ), -1, true
            );
            
            synapseRotation.value = withRepeat(
              withTiming(360, { duration: 6000 + synapse * 150 }), -1, false
            );
            
            synapseGlow.value = withRepeat(
              withSequence(
                withTiming(1, { duration: 400 }),
                withTiming(0.1, { duration: 800 }),
                withTiming(0.6, { duration: 600 })
              ), -1, true
            );
            
            synapseTrail.value = withRepeat(
              withTiming(1, { duration: 1500 }), -1, false
            );
          } else {
            pulseScale.value = withTiming(0);
            synapseRotation.value = withTiming(0);
            synapseGlow.value = withTiming(0);
            synapseTrail.value = withTiming(0);
          }
        }, [isGenerating]);

        const synapseStyle = useAnimatedStyle(() => {
          const radius = 120 + Math.sin(synapse * 0.3) * 60;
          const angle = (synapse / synapses.length) * 2 * Math.PI;
          const heightVariation = Math.sin(synapse * 0.5 + synapseTrail.value * 2 * Math.PI) * 30;
          
          return {
            transform: [
              { rotate: `${synapseRotation.value}deg` },
              { scale: pulseScale.value },
              { 
                translateX: Math.cos(angle) * radius 
              },
              { 
                translateY: Math.sin(angle) * radius + heightVariation
              },
            ],
            opacity: synapseGlow.value,
            shadowOpacity: synapseGlow.value * 0.8,
          };
        });

        return (
          <Animated.View
            key={`synapse-${synapse}`}
            style={[styles.synapse3D, synapseStyle]}
          >
            <LinearGradient
              colors={['#8B5CF6', '#06B6D4', '#10B981', '#FF6B6B']}
              style={styles.synapseGradient3D}
            >
              <Zap size={10} color="white" />
            </LinearGradient>
            
            {/* Synapse Trail Effect */}
            {[0, 1, 2].map((trailIndex) => (
              <Animated.View
                key={trailIndex}
                style={[
                  styles.synapseTrail,
                  {
                    transform: [{ scale: 1 - trailIndex * 0.3 }],
                    opacity: (synapseGlow.value * 0.5) / (trailIndex + 1),
                  }
                ]}
              />
            ))}
          </Animated.View>
        );
      })}
    </View>
  );
};

// Morphing UI Cards with Gesture Interactions
const MorphingCard = ({ 
  children, 
  style, 
  onPress, 
  isSelected = false,
  morphIntensity = 1 
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  isSelected?: boolean;
  morphIntensity?: number;
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const borderWidth = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const morphShape = useSharedValue(20);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.05, { damping: 12, stiffness: 300 });
      borderWidth.value = withTiming(2);
      glowIntensity.value = withTiming(1);
      morphShape.value = withSpring(15, { damping: 10, stiffness: 200 });
    } else {
      scale.value = withSpring(1);
      borderWidth.value = withTiming(1);
      glowIntensity.value = withTiming(0);
      morphShape.value = withSpring(20);
    }
  }, [isSelected]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      'worklet';
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      rotation.value = withSpring(Math.random() * 6 - 3);
      if (Platform.OS === 'ios') {
        runOnJS(Vibration.vibrate)(10);
      }
    },
    onEnd: () => {
      'worklet';
      scale.value = withSpring(isSelected ? 1.05 : 1);
      rotation.value = withSpring(0);
      runOnJS(onPress || (() => {}))();
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    borderWidth: borderWidth.value,
    borderRadius: morphShape.value,
    shadowOpacity: glowIntensity.value * 0.6,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.morphingCard, style, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

// Floating Action Menu
const FloatingActionMenu = ({ isVisible, onAction }: {
  isVisible: boolean;
  onAction: (action: string) => void;
}) => {
  const menuScale = useSharedValue(0);
  const menuRotation = useSharedValue(0);
  const menuOpacity = useSharedValue(0);

  const actions = [
    { icon: Shuffle, color: '#FF6B6B', action: 'shuffle' },
    { icon: Mic, color: '#4ECDC4', action: 'voice' },
    { icon: Settings, color: '#45B7D1', action: 'settings' },
    { icon: Heart, color: '#FF6B9D', action: 'favorite' },
  ];

  useEffect(() => {
    if (isVisible) {
      menuScale.value = withSpring(1, { damping: 10, stiffness: 300 });
      menuRotation.value = withSpring(360, { damping: 15, stiffness: 200 });
      menuOpacity.value = withTiming(1);
    } else {
      menuScale.value = withTiming(0);
      menuRotation.value = withTiming(0);
      menuOpacity.value = withTiming(0);
    }
  }, [isVisible]);

  const menuStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: menuScale.value },
      { rotate: `${menuRotation.value}deg` }
    ],
    opacity: menuOpacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingMenu, menuStyle]}>
      {actions.map((action, index) => {
        const actionScale = useSharedValue(0);
        const actionTranslateY = useSharedValue(0);

        useEffect(() => {
          if (isVisible) {
            actionScale.value = withDelay(
              index * 100,
              withSpring(1, { damping: 12, stiffness: 400 })
            );
            actionTranslateY.value = withDelay(
              index * 100,
              withSpring(-(index + 1) * 60, { damping: 15, stiffness: 300 })
            );
          } else {
            actionScale.value = withTiming(0);
            actionTranslateY.value = withTiming(0);
          }
        }, [isVisible, index]);

        const actionStyle = useAnimatedStyle(() => ({
          transform: [
            { scale: actionScale.value },
            { translateY: actionTranslateY.value }
          ],
        }));

        return (
          <AnimatedTouchableOpacity
            key={action.action}
            style={[styles.floatingActionItem, actionStyle]}
            onPress={() => onAction(action.action)}
          >
            <LinearGradient
              colors={[action.color, action.color + '80']}
              style={styles.actionItemGradient}
            >
              <action.icon size={20} color="white" />
            </LinearGradient>
          </AnimatedTouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

// Main Component
export const AIStoryGeneratorUltra: React.FC<AIStoryGeneratorProps> = ({ visible, onClose }) => {
  const { addStory } = useStories();
  const [prompt, setPrompt] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedStory, setGeneratedStory] = useState<StoryWithImages | null>(null);
  const [showStory, setShowStory] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'input' | 'generating' | 'story'>('input');

  const genres = [
    { name: "Adventure", icon: Mountain, color: '#FF6B6B' },
    { name: "Mystery", icon: Eye, color: '#4ECDC4' },
    { name: "Sci-Fi", icon: Cpu, color: '#45B7D1' },
    { name: "Fantasy", icon: Magic, color: '#96CEB4' },
    { name: "Romance", icon: Heart, color: '#FF6B9D' },
    { name: "Horror", icon: Moon, color: '#A0A0A0' }
  ];

  const lengths = [
    { name: "Short (5-10 min)", icon: Sun, duration: "short" },
    { name: "Medium (10-15 min)", icon: Layers, duration: "medium" },
    { name: "Long (15-20 min)", icon: BookOpen, duration: "long" }
  ];
  
  const placeholders = [
    "A detective solving mysteries in space stations orbiting distant planets...",
    "A magical forest where time flows differently and ancient spirits whisper secrets...",
    "Two lovers separated by parallel dimensions who can only meet in dreams...",
    "An ancient artifact discovered in the depths of the ocean holds humanity's future...",
    "A chef whose recipes have magical properties that heal both body and soul...",
    "A librarian discovers that certain books can transport readers into their stories...",
  ];

  // Enhanced animations
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const backgroundBlur = useSharedValue(0);
  const containerRotation = useSharedValue(0);
  const morphIntensity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      modalOpacity.value = withTiming(1, { duration: 400 });
      backgroundBlur.value = withTiming(25, { duration: 500 });
      containerRotation.value = withSpring(360, { damping: 20, stiffness: 100 });
    } else {
      modalScale.value = withTiming(0, { duration: 300 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      backgroundBlur.value = withTiming(0, { duration: 400 });
      containerRotation.value = withTiming(0);
    }
  }, [visible]);

  // Touch interaction handler
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setTouchPosition({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
      morphIntensity.value = withSpring(1.2);
    },
    onPanResponderMove: (evt) => {
      setTouchPosition({ x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY });
    },
    onPanResponderRelease: () => {
      setTouchPosition(null);
      morphIntensity.value = withSpring(1);
    },
  });

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: modalScale.value },
      { rotate: `${containerRotation.value}deg` }
    ],
    opacity: modalOpacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  // Mock generation function
  const generateStory = async () => {
    if (!prompt.trim() || !selectedGenre || !selectedLength) {
      Alert.alert("Missing Information", "Please fill in all fields to generate your story.");
      return;
    }

    setIsGenerating(true);
    setCurrentView('generating');
    setGenerationProgress(0);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate([100, 50, 100]);
    }

    // Animate generation progress
    const progressSteps = [15, 35, 55, 70, 85, 95, 100];
    
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setGenerationProgress(progressSteps[i]);
    }

    // Mock story result
    const mockStory: StoryWithImages = {
      title: "The AI-Generated Tale",
      content: `Based on your prompt "${prompt}", here's your ${selectedGenre.toLowerCase()} story...\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      images: [],
      genre: selectedGenre,
      readingTime: selectedLength
    };

    setGeneratedStory(mockStory);
    setIsGenerating(false);
    setCurrentView('story');
    setShowStory(true);
  };

  const handleFloatingAction = (action: string) => {
    switch (action) {
      case 'shuffle':
        setPrompt(placeholders[Math.floor(Math.random() * placeholders.length)]);
        break;
      case 'voice':
        // Implement voice input
        break;
      case 'settings':
        // Open settings
        break;
      case 'favorite':
        // Add to favorites
        break;
    }
    setShowFloatingMenu(false);
  };

  const handleClose = () => {
    setIsGenerating(false);
    setShowStory(false);
    setCurrentView('input');
    setGeneratedStory(null);
    setPrompt("");
    setSelectedGenre("");
    setSelectedLength("");
    setGenerationProgress(0);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay} {...panResponder.panHandlers}>
        <AnimatedBlurView 
          style={[styles.blurBackground, blurStyle]} 
          intensity={25}
          tint="dark"
        />
        
        <InteractiveParticleSystem 
          isGenerating={isGenerating} 
          touchPosition={touchPosition}
        />
        
        <Animated.View style={[styles.container, modalStyle]}>
          <AnimatedLinearGradient
            colors={[
              'rgba(0,0,0,0.95)', 
              'rgba(20,20,40,0.9)', 
              'rgba(0,0,0,0.95)'
            ]}
            style={styles.modalGradient}
          >
            {/* Enhanced Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <LinearGradient
                  colors={[Colors.primary, '#8B5CF6', '#FF6B6B']}
                  style={styles.iconContainer3D}
                >
                  <Wand2 size={28} color="white" />
                </LinearGradient>
                <View>
                  <Text style={styles.title}>AI Story Generator</Text>
                  <Text style={styles.subtitle}>Ultra Interactive Mode</Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => setShowFloatingMenu(!showFloatingMenu)}
                  style={styles.menuButton}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.buttonGradient}
                  >
                    <Sparkles size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleClose} style={styles.closeButton3D}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                    style={styles.buttonGradient}
                  >
                    <X size={24} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {currentView === 'input' && (
                <View style={styles.inputSection}>
                  {/* Story Prompt Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      <Lightbulb size={16} color={Colors.primary} /> Story Idea
                    </Text>
                    <PlaceholdersAndVanishInput
                      placeholders={placeholders}
                      onChange={setPrompt}
                      onSubmit={() => {}}
                    />
                  </View>

                  {/* Genre Selection with Enhanced Cards */}
                  <View style={styles.selectionContainer}>
                    <Text style={styles.label}>
                      <BookOpen size={16} color={Colors.primary} /> Genre
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.optionsRow}>
                        {genres.map((genre) => (
                          <MorphingCard
                            key={genre.name}
                            style={[
                              styles.genreCard,
                              selectedGenre === genre.name && styles.selectedCard
                            ]}
                            onPress={() => setSelectedGenre(genre.name)}
                            isSelected={selectedGenre === genre.name}
                          >
                            <LinearGradient
                              colors={[
                                genre.color + '40',
                                genre.color + '20'
                              ]}
                              style={styles.cardGradient}
                            >
                              <genre.icon size={24} color={genre.color} />
                              <Text style={[
                                styles.cardText,
                                selectedGenre === genre.name && styles.selectedCardText
                              ]}>
                                {genre.name}
                              </Text>
                            </LinearGradient>
                          </MorphingCard>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Length Selection */}
                  <View style={styles.selectionContainer}>
                    <Text style={styles.label}>
                      <FileText size={16} color={Colors.primary} /> Length
                    </Text>
                    <View style={styles.optionsColumn}>
                      {lengths.map((length) => (
                        <MorphingCard
                          key={length.name}
                          style={[
                            styles.lengthCard,
                            selectedLength === length.name && styles.selectedCard
                          ]}
                          onPress={() => setSelectedLength(length.name)}
                          isSelected={selectedLength === length.name}
                        >
                          <View style={styles.lengthCardContent}>
                            <length.icon 
                              size={20} 
                              color={selectedLength === length.name ? Colors.primary : 'rgba(255,255,255,0.7)'} 
                            />
                            <Text style={[
                              styles.lengthCardText,
                              selectedLength === length.name && styles.selectedCardText
                            ]}>
                              {length.name}
                            </Text>
                          </View>
                        </MorphingCard>
                      ))}
                    </View>
                  </View>

                  {/* Enhanced Generate Button */}
                  <AnimatedTouchableOpacity
                    style={styles.generateButton3D}
                    onPress={generateStory}
                  >
                    <LinearGradient
                      colors={[Colors.primary, '#8B5CF6', '#06B6D4', '#FF6B6B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient3D}
                    >
                      <Magic size={24} color="white" />
                      <Text style={styles.generateButtonText3D}>Generate Story</Text>
                      <View style={styles.buttonParticles}>
                        {[0, 1, 2].map((i) => (
                          <View key={i} style={[styles.buttonParticle, { 
                            left: `${20 + i * 30}%`,
                            animationDelay: `${i * 200}ms`
                          }]}>
                            <Sparkles size={8} color="rgba(255,255,255,0.6)" />
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  </AnimatedTouchableOpacity>
                </View>
              )}

              {currentView === 'generating' && (
                <View style={styles.generationContainer}>
                  <HolographicBrainUltra 
                    isGenerating={isGenerating} 
                    intensity={morphIntensity.value}
                  />
                  
                  {/* Enhanced Progress Indicator */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressRing}>
                      <Text style={styles.progressPercentage}>
                        {Math.round(generationProgress)}%
                      </Text>
                    </View>
                    
                    <Text style={styles.progressMessage}>
                      AI is crafting your masterpiece...
                    </Text>
                  </View>
                </View>
              )}

              {currentView === 'story' && generatedStory && (
                <View style={styles.storyContainer}>
                  <Text style={styles.storyTitle}>{generatedStory.title}</Text>
                  <ScrollView style={styles.storyContentScroll}>
                    <Text style={styles.storyContent}>{generatedStory.content}</Text>
                  </ScrollView>
                  
                  <View style={styles.storyActions3D}>
                    <TouchableOpacity style={styles.actionButton3D}>
                      <LinearGradient
                        colors={['#FF6B6B', '#FF8E8E']}
                        style={styles.actionGradient}
                      >
                        <Heart size={20} color="white" />
                        <Text style={styles.actionText3D}>Love</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton3D}>
                      <LinearGradient
                        colors={['#4ECDC4', '#7ED6D1']}
                        style={styles.actionGradient}
                      >
                        <Share size={20} color="white" />
                        <Text style={styles.actionText3D}>Share</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton3D}>
                      <LinearGradient
                        colors={['#45B7D1', '#78C9E0']}
                        style={styles.actionGradient}
                      >
                        <Download size={20} color="white" />
                        <Text style={styles.actionText3D}>Save</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </AnimatedLinearGradient>
        </Animated.View>
        
        <FloatingActionMenu 
          isVisible={showFloatingMenu}
          onAction={handleFloatingAction}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  particleSystemContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  interactiveParticle: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.9,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer3D: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  closeButton3D: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    gap: 30,
  },
  inputContainer: {
    gap: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionContainer: {
    gap: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 5,
  },
  optionsColumn: {
    gap: 15,
  },
  morphingCard: {
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 8,
  },
  genreCard: {
    width: 120,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  lengthCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: Colors.primary,
    shadowOpacity: 0.8,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 15,
  },
  cardText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCardText: {
    color: 'white',
    fontWeight: '700',
  },
  lengthCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  lengthCardText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  generateButton3D: {
    marginTop: 30,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  buttonGradient3D: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    gap: 12,
    position: 'relative',
  },
  generateButtonText3D: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonParticles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  buttonParticle: {
    position: 'absolute',
    top: '50%',
  },
  generationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
    gap: 40,
  },
  holographicBrainContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  brainCore3D: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
  },
  brainGradient3D: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holographicLayer: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.4)',
  },
  layerGradient: {
    flex: 1,
    borderRadius: 60,
  },
  synapse3D: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
  },
  synapseGradient3D: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  synapseTrail: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  progressSection: {
    alignItems: 'center',
    gap: 20,
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: Colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  storyContainer: {
    gap: 25,
  },
  storyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  storyContentScroll: {
    maxHeight: 300,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
  },
  storyContent: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 26,
  },
  storyActions3D: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 25,
  },
  actionButton3D: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  actionText3D: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  floatingMenu: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  floatingActionItem: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  actionItemGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});