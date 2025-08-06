import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Search, BookOpen, Clock, Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StorySearchInteraction } from '@/components/AirbnbSearchInteraction';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface StorySearchSectionProps {
  onSearch?: (searchData: { genre: string; duration: string; mood: string }) => void;
  scrollY?: Animated.SharedValue<number>;
}

export const StorySearchSection: React.FC<StorySearchSectionProps> = ({
  onSearch,
  scrollY,
}) => {
  const { colors } = useTheme();
  
  // Animated styles that work with existing scroll behavior
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    
    const opacity = withTiming(
      scrollY.value > 50 ? 0.8 : 1,
      { 
        duration: 200,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      }
    );
    
    const scale = withTiming(
      scrollY.value > 50 ? 0.95 : 1,
      { 
        duration: 200,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      }
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const handleStorySearch = useCallback((searchData: { genre: string; duration: string; mood: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSearch?.(searchData);
  }, [onSearch]);

  return (
    <Animated.View style={[styles.container, searchBarAnimatedStyle]}>
      <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
        <View style={styles.searchContainer}>
          <StorySearchInteraction 
            onSearch={handleStorySearch}
            scrollY={scrollY}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchWrapper: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    alignItems: 'center',
  },
});

export default StorySearchSection;