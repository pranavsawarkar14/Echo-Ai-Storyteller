import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  Sparkles,
  BookOpen,
  Headphones,
  Star,
  ChevronRight,
  PlayCircle,
  Heart,
  Zap,
  Users,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  backgroundImage?: string;
  gradient: string[];
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to Echo",
    subtitle: "Your Personal AI Storyteller",
    description: "Discover thousands of captivating stories, from thrilling adventures to peaceful bedtime tales.",
    icon: <Sparkles size={60} color="#FFD700" />,
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 2,
    title: "Listen Anywhere",
    subtitle: "Premium Audio Experience",
    description: "High-quality narration with immersive sound design. Perfect for commuting, exercising, or relaxing.",
    icon: <Headphones size={60} color="#4ECDC4" />,
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: 3,
    title: "AI-Powered Stories",
    subtitle: "Personalized Just for You",
    description: "Our AI learns your preferences to recommend stories you'll love and can even create custom tales.",
    icon: <Zap size={60} color="#FF6B6B" />,
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: 4,
    title: "Join Our Community",
    subtitle: "Share & Discover Together",
    description: "Connect with fellow story lovers, share favorites, and discover hidden gems from our community.",
    icon: <Users size={60} color="#9B59B6" />,
    gradient: ['#43e97b', '#38f9d7'],
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);
  const buttonAnim = useSharedValue(0);
  const dotsAnim = useSharedValue(0);

  useEffect(() => {
    // Initial animation
    fadeAnim.value = withDelay(300, withTiming(1, { duration: 800 }));
    slideAnim.value = withDelay(500, withSpring(1, { damping: 15, stiffness: 150 }));
    scaleAnim.value = withDelay(700, withSpring(1, { damping: 12, stiffness: 100 }));
    buttonAnim.value = withDelay(1000, withTiming(1, { duration: 600 }));
    dotsAnim.value = withDelay(1200, withTiming(1, { duration: 400 }));
  }, [currentStep]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      { translateY: interpolate(slideAnim.value, [0, 1], [50, 0], Extrapolate.CLAMP) },
      { scale: scaleAnim.value },
    ],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonAnim.value,
    transform: [
      { translateY: interpolate(buttonAnim.value, [0, 1], [30, 0], Extrapolate.CLAMP) },
    ],
  }));

  const animatedDotsStyle = useAnimatedStyle(() => ({
    opacity: dotsAnim.value,
  }));

  const handleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep < onboardingSteps.length - 1) {
      // Animate out
      fadeAnim.value = withTiming(0, { duration: 300 });
      slideAnim.value = withTiming(0, { duration: 300 });
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        // Reset and animate in
        fadeAnim.value = 0;
        slideAnim.value = 0;
        scaleAnim.value = 0.8;
        buttonAnim.value = 0;
        
        fadeAnim.value = withTiming(1, { duration: 600 });
        slideAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
        scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
        buttonAnim.value = withDelay(400, withTiming(1, { duration: 600 }));
        
        setIsAnimating(false);
      }, 300);
    } else {
      // Complete onboarding
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={currentStepData.gradient}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        {Array.from({ length: 20 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingElement,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                animationDelay: Math.random() * 2000,
              },
            ]}
          />
        ))}
      </View>

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedContentStyle]}>
          {currentStepData.icon}
        </Animated.View>

        <Animated.View style={[styles.textContainer, animatedContentStyle]}>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </Animated.View>

        {/* Page Indicators */}
        <Animated.View style={[styles.dotsContainer, animatedDotsStyle]}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentStep ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Action Button */}
        <AnimatedTouchableOpacity
          style={[styles.actionButton, animatedButtonStyle]}
          onPress={handleNext}
          disabled={isAnimating}
        >
          <BlurView intensity={20} tint="light" style={styles.buttonBlur}>
            <Text style={styles.buttonText}>
              {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Continue"}
            </Text>
            <ChevronRight size={24} color="#FFFFFF" />
          </BlurView>
        </AnimatedTouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingElement: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
    padding: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  actionButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});