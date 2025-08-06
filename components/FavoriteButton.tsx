import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Story } from '@/mocks/stories';
import * as Haptics from 'expo-haptics';

interface FavoriteButtonProps {
  story: Story;
  size?: number;
  style?: any;
  showBackground?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  story,
  size = 24,
  style,
  showBackground = true,
}) => {
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isCurrentlyFavorite = isFavorite(story.id);

  const handlePress = async () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animation
    scale.value = withSequence(
      withSpring(0.8, { damping: 10, stiffness: 300 }),
      withSpring(1.2, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    if (!isCurrentlyFavorite) {
      // Adding to favorites - pulse effect
      opacity.value = withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }

    // Toggle favorite
    await toggleFavorite(story);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const heartColor = isCurrentlyFavorite ? '#FF6B6B' : colors.mutedText;
  const backgroundColor = showBackground 
    ? isCurrentlyFavorite 
      ? '#FF6B6B20' 
      : 'rgba(0,0,0,0.3)'
    : 'transparent';

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.container,
        showBackground && {
          backgroundColor,
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
        },
        style,
        animatedStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Heart
        size={size}
        color={heartColor}
        fill={isCurrentlyFavorite ? heartColor : 'transparent'}
      />
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});