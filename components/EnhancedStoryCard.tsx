import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Clock, Star, Users, Heart } from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Story } from "@/mocks/stories";

interface EnhancedStoryCardProps {
  story: Story;
  onPress: () => void;
  style?: any;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const EnhancedStoryCard: React.FC<EnhancedStoryCardProps> = ({
  story,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  return (
    <AnimatedTouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }, style, animatedStyle]} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: story.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {/* Play button overlay */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: colors.primary }]} 
            activeOpacity={0.8}
          >
            <Play size={14} color="white" fill="white" />
          </TouchableOpacity>
        </View>

        {/* Story badges */}
        <View style={styles.badges}>
          {story.isNew && (
            <View style={[styles.badge, { backgroundColor: '#4ECDC4' }]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          {story.isPremium && (
            <View style={[styles.badge, { backgroundColor: '#F39C12' }]}>
              <Text style={styles.badgeText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Favorite button */}
        <View style={styles.favoriteContainer}>
          <FavoriteButton 
            story={story} 
            size={18} 
            showBackground={true}
          />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={[styles.author, { color: colors.mutedText }]}>
          by {story.author}
        </Text>
        
        {story.description && (
          <Text style={[styles.description, { color: colors.mutedText }]} numberOfLines={2}>
            {story.description}
          </Text>
        )}
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.mutedText} />
            <Text style={[styles.metaText, { color: colors.mutedText }]}>
              {story.duration}
            </Text>
          </View>
          
          {story.rating && (
            <View style={styles.metaItem}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={[styles.metaText, { color: colors.mutedText }]}>
                {story.rating.toFixed(1)}
              </Text>
            </View>
          )}
          
          {story.playCount && (
            <View style={styles.metaItem}>
              <Users size={12} color={colors.mutedText} />
              <Text style={[styles.metaText, { color: colors.mutedText }]}>
                {story.playCount > 1000 ? `${(story.playCount / 1000).toFixed(1)}K` : story.playCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    aspectRatio: 16 / 10,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  playButtonContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badges: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  favoriteContainer: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 20,
  },
  author: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "500",
  },
});