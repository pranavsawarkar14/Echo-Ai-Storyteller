import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Clock, User, Heart } from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Story } from "@/mocks/stories";

interface StoryCardProps {
  story: Story;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onPress,
}) => {
  const { colors } = useTheme();
  const { playStory, currentStory, isPlaying } = useAudioPlayer();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isCurrentStory = currentStory?.id === story.id;

  // Sound wave animations
  const wave1 = useSharedValue(0.3);
  const wave2 = useSharedValue(0.5);
  const wave3 = useSharedValue(0.7);

  React.useEffect(() => {
    if (isCurrentStory && isPlaying) {
      wave1.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 600 }, () => {
        wave1.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 400 });
      });
      wave2.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 800 }, () => {
        wave2.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 600 });
      });
      wave3.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 500 }, () => {
        wave3.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 700 });
      });
    }
  }, [isCurrentStory, isPlaying]);

  const wave1Style = useAnimatedStyle(() => ({
    height: wave1.value * 16 + 4,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    height: wave2.value * 16 + 4,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    height: wave3.value * 16 + 4,
  }));

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

  const handleStartListen = async () => {
    try {
      await playStory(story, 1);
      // The full-screen player will automatically show due to the playStory function
    } catch (error) {
      console.error('Failed to start story playback:', error);
    }
  };

  return (
    <AnimatedTouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }, animatedStyle]} 
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
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
      </View>
      
      <View style={styles.playButtonContainer}>
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
          activeOpacity={0.8}
          onPress={handleStartListen}
        >
          <Play size={16} color="white" fill="white" />
        </TouchableOpacity>
      </View>

      {/* Now Playing Indicator */}
      {isCurrentStory && isPlaying && (
        <View style={styles.nowPlayingContainer}>
          <View style={styles.nowPlayingIndicator}>
            <Animated.View
              style={[
                styles.soundWave,
                { backgroundColor: colors.primary },
                wave1Style,
              ]}
            />
            <Animated.View
              style={[
                styles.soundWave,
                { backgroundColor: colors.primary },
                wave2Style,
              ]}
            />
            <Animated.View
              style={[
                styles.soundWave,
                { backgroundColor: colors.primary },
                wave3Style,
              ]}
            />
          </View>
          <Text style={styles.nowPlayingText}>Now Playing</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{story.title}</Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.mutedText} />
            <Text style={[styles.metaText, { color: colors.mutedText }]}>{story.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <User size={12} color={colors.mutedText} />
            <Text style={[styles.metaText, { color: colors.mutedText }]}>{story.author}</Text>
          </View>
        </View>
        
        {/* Listen Button */}
        <View style={styles.listenContainer}>
          <TouchableOpacity 
            style={[
              styles.listenButton, 
              { 
                borderColor: isCurrentStory && isPlaying ? colors.primary : colors.mutedText,
                backgroundColor: isCurrentStory && isPlaying ? colors.primary + '20' : 'transparent'
              }
            ]}
            onPress={handleStartListen}
            activeOpacity={0.7}
          >
            <Play 
              size={14} 
              color={isCurrentStory && isPlaying ? colors.primary : colors.mutedText} 
              fill={isCurrentStory && isPlaying ? colors.primary : 'transparent'}
            />
            <Text style={[
              styles.listenButtonText, 
              { color: isCurrentStory && isPlaying ? colors.primary : colors.mutedText }
            ]}>
              {isCurrentStory && isPlaying ? 'Now Playing' : 'Start Listen'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.favoriteButtonContainer}>
        <FavoriteButton 
          story={story} 
          size={16} 
          showBackground={true}
          style={styles.favoriteButton}
        />
      </View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    height: 160,
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
    top: 12,
    right: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  favoriteButtonContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  favoriteButton: {
    // Styles will be handled by FavoriteButton component
  },
  nowPlayingContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  nowPlayingIndicator: {
    flexDirection: 'row',
    gap: 2,
  },
  soundWave: {
    width: 2,
    height: 10,
    borderRadius: 1,
    opacity: 0.8,
  },
  nowPlayingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  listenContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    minWidth: 120,
  },
  listenButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});