import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import {
  Play,
  Pause,
  SkipForward,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface MiniPlayerProps {
  onExpand: () => void;
}

// Mini Waveform Animation
const MiniWaveform = ({ isPlaying }: { isPlaying: boolean }) => {
  const { colors } = useTheme();
  
  // Create 4 bars for mini waveform
  const bars = Array.from({ length: 4 }, () => useSharedValue(0.3));
  
  React.useEffect(() => {
    if (isPlaying) {
      bars.forEach((bar, index) => {
        bar.value = withRepeat(
          withSequence(
            withTiming(Math.random() * 0.8 + 0.2, { duration: 400 + index * 100 }),
            withTiming(Math.random() * 0.8 + 0.2, { duration: 400 + index * 100 })
          ),
          -1,
          true
        );
      });
    } else {
      bars.forEach(bar => {
        bar.value = withTiming(0.3, { duration: 300 });
      });
    }
  }, [isPlaying]);

  return (
    <View style={styles.miniWaveform}>
      {bars.map((bar, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          height: bar.value * 8 + 2,
        }));

        return (
          <Animated.View
            key={index}
            style={[
              styles.miniWaveformBar,
              { backgroundColor: colors.primary },
              animatedStyle,
            ]}
          />
        );
      })}
    </View>
  );
};

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { colors } = useTheme();
  const {
    currentStory,
    isPlaying,
    currentTime,
    duration,
    currentChapter,
    totalChapters,
    togglePlayPause,
    skipToNext,
    stop,
  } = useAudioPlayer();

  // Animation for mini player appearance
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    if (currentStory) {
      translateY.value = withTiming(0, { duration: 400 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 400 });
    } else {
      translateY.value = withTiming(100, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 250 });
    }
  }, [currentStory]);

  // Pan gesture handler for swipe down to close
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (event.translationY > 0) {
        translateY.value = context.startY + event.translationY;
        opacity.value = Math.max(0, 1 - event.translationY / 100);
      }
    },
    onEnd: (event) => {
      if (event.translationY > 50 || event.velocityY > 500) {
        // Close mini player
        translateY.value = withTiming(100, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 });
        scale.value = withTiming(0.8, { duration: 250 });
        runOnJS(stop)();
      } else {
        // Return to original position
        translateY.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  if (!currentStory) return null;

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <LinearGradient
          colors={[colors.background + 'F5', colors.background]}
          style={styles.gradient}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.mutedText + '30' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${progress * 100}%`
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.content}>
            {/* Story Info Section */}
            <TouchableOpacity 
              style={styles.storyInfo}
              onPress={() => {
                // Add haptic feedback and smooth animation before expanding
                scale.value = withTiming(0.95, { duration: 100 }, () => {
                  scale.value = withTiming(1, { duration: 150 });
                });
                onExpand();
              }}
              activeOpacity={0.9}
            >
              <View style={styles.coverImageMini}>
                <Image
                  source={{ uri: currentStory.imageUrl }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.textInfo}>
                <Text style={[styles.storyTitle, { color: colors.text }]} numberOfLines={1}>
                  {currentStory.title}
                </Text>
                <View style={styles.metaInfo}>
                  <Text style={[styles.authorText, { color: colors.mutedText }]}>
                    {currentStory.author}
                  </Text>
                  <Text style={[styles.separator, { color: colors.mutedText }]}>•</Text>
                  <Text style={[styles.chapterText, { color: colors.mutedText }]}>
                    Ch {currentChapter}/{totalChapters}
                  </Text>
                  <Text style={[styles.separator, { color: colors.mutedText }]}>•</Text>
                  <Text style={[styles.timeText, { color: colors.mutedText }]}>
                    {formatTime(currentTime)}
                  </Text>
                </View>
              </View>

              {/* Mini Waveform */}
              <MiniWaveform isPlaying={isPlaying} />
            </TouchableOpacity>

            {/* Controls Section */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={togglePlayPause}
                style={[styles.playButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <View style={styles.pauseIcon}>
                    <View style={[styles.pauseBar, { backgroundColor: 'white' }]} />
                    <View style={[styles.pauseBar, { backgroundColor: 'white' }]} />
                  </View>
                ) : (
                  <Play size={14} color="white" fill="white" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={isPlaying ? skipToNext : stop}
                style={styles.controlButton}
                activeOpacity={0.7}
              >
                {isPlaying ? (
                  <SkipForward size={16} color={colors.text} />
                ) : (
                  <X size={16} color={colors.mutedText} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 95, // Small gap above the tab bar (tab bar height ~65px + margin + gap)
    left: 24,
    right: 24,
    zIndex: 1000, // Lower than tab bar but higher than content
    borderRadius: 25, // Highly rounded for professional look
    overflow: 'hidden',
    height: 50, // Much smaller than tab bar (65px)
  },
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 25,
    height: '100%',
  },
  progressContainer: {
    height: 2,
  },
  progressTrack: {
    flex: 1,
    height: '100%',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flex: 1,
  },
  storyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coverImageMini: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  textInfo: {
    flex: 1,
    gap: 2,
  },
  storyTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorText: {
    fontSize: 10,
  },
  separator: {
    fontSize: 10,
  },
  chapterText: {
    fontSize: 10,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  miniWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 6,
  },
  miniWaveformBar: {
    width: 1,
    borderRadius: 0.5,
    minHeight: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 2,
  },
  pauseBar: {
    width: 2,
    height: 10,
    borderRadius: 1,
  },
  controlButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});