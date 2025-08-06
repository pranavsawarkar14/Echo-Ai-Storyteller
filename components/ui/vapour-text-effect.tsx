import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface VapourTextEffectProps {
  texts: string[];
  onComplete?: () => void;
  fontSize?: number;
  color?: string;
}

const { width } = Dimensions.get('window');

export const VapourTextEffect: React.FC<VapourTextEffectProps> = ({
  texts = ['Echo'],
  onComplete,
  fontSize = 48,
  color = Colors.primary,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const textOpacity = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  // Ensure we have valid texts array
  const validTexts = Array.isArray(texts) && texts.length > 0 ? texts : ['Echo'];
  const currentText = validTexts[currentTextIndex] || validTexts[0] || 'Echo';

  useEffect(() => {
    // Generate particles for current text
    if (!currentText) return;
    
    const newParticles = Array.from({ length: currentText.length * 8 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * 200 + 100,
    }));
    setParticles(newParticles);

    // Animation sequence
    const animateText = () => {
      // Fade in text
      textOpacity.value = withTiming(1, { duration: 800 });
      scale.value = withTiming(1, { duration: 800 });
      
      // Show particles briefly
      particleOpacity.value = withDelay(1000, withTiming(1, { duration: 300 }));
      
      // Vaporize effect
      setTimeout(() => {
        textOpacity.value = withTiming(0, { duration: 600 });
        particleOpacity.value = withTiming(0, { duration: 1000 });
        
        // Move to next text or complete
        setTimeout(() => {
          if (currentTextIndex < validTexts.length - 1) {
            setCurrentTextIndex(prev => prev + 1);
          } else {
            onComplete?.();
          }
        }, 1000);
      }, 2000);
    };

    animateText();
  }, [currentTextIndex, validTexts.length, onComplete]);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={[styles.text, { fontSize, color }]}>
          {currentText}
        </Text>
      </Animated.View>
      
      <Animated.View style={[styles.particlesContainer, particleAnimatedStyle, { pointerEvents: 'none' }]}>
        {particles.map((particle) => (
          <View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
});