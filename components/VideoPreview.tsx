import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface VideoPreviewProps {
  videoUrl: string;
  thumbnailUrl: string;
  title?: string;
  author?: string;
  duration?: number;
  style?: any;
  autoPlay?: boolean;
  showControls?: boolean;
  muted?: boolean;
  onPlayPress?: () => void;
  borderRadius?: number;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  author,
  duration,
  style,
  autoPlay = true,
  showControls = false,
  muted = true,
  onPlayPress,
  borderRadius = 12,
}) => {
  const { colors } = useTheme();
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(!autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  // Animation values
  const playButtonScale = useSharedValue(1);
  const controlsOpacity = useSharedValue(1);

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // Auto play effect
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const startAutoPlay = async () => {
        try {
          setShowThumbnail(false);
          await videoRef.current?.playAsync();
        } catch (error) {
          console.log('Auto play failed:', error);
        }
      };
      
      // Small delay to ensure video is loaded
      const timer = setTimeout(startAutoPlay, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  const handlePlayPress = async () => {
    if (onPlayPress) {
      onPlayPress();
      return;
    }

    playButtonScale.value = withSpring(0.9, {}, () => {
      playButtonScale.value = withSpring(1);
    });

    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      setIsLoading(true);
      setShowThumbnail(false);
      await videoRef.current?.playAsync();
    }
  };

  const handleMuteToggle = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    await videoRef.current?.setIsMutedAsync(newMutedState);
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    
    if (playbackStatus.isLoaded) {
      setIsLoading(false);
      setIsPlaying(playbackStatus.isPlaying || false);
      
      // Don't show thumbnail again if we're auto-playing with loop
      if (playbackStatus.didJustFinish && !autoPlay) {
        setIsPlaying(false);
        setShowThumbnail(true);
        videoRef.current?.setPositionAsync(0);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, style, { borderRadius }]}>
      {/* Video Component */}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={[styles.video, { borderRadius }]}
        resizeMode={ResizeMode.COVER}
        isLooping={true}
        isMuted={isMuted}
        shouldPlay={autoPlay}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        useNativeControls={false}
      />

      {/* Thumbnail Overlay */}
      {showThumbnail && (
        <View style={[styles.thumbnailContainer, { borderRadius }]}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={[styles.thumbnail, { borderRadius }]}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.thumbnailGradient}
          />
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <BlurView intensity={20} style={styles.loadingBlur}>
            <Text style={styles.loadingText}>Loading...</Text>
          </BlurView>
        </View>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <Animated.View style={[styles.controlsContainer, controlsAnimatedStyle]}>
          {/* Only show play button if not autoPlay */}
          {!autoPlay && (
            <TouchableOpacity
              style={styles.playButtonContainer}
              onPress={handlePlayPress}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.playButton, playButtonAnimatedStyle]}>
                <BlurView intensity={20} style={styles.playButtonBlur}>
                  {isPlaying ? (
                    <Pause size={32} color="white" fill="white" />
                  ) : (
                    <Play size={32} color="white" fill="white" />
                  )}
                </BlurView>
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Video Info */}
            {(title || author) && (
              <View style={styles.videoInfo}>
                {title && (
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {title}
                  </Text>
                )}
                {author && (
                  <Text style={styles.videoAuthor} numberOfLines={1}>
                    by {author}
                  </Text>
                )}
              </View>
            )}

            {/* Right Controls */}
            <View style={styles.rightControls}>
              {/* Duration */}
              {duration && (
                <View style={styles.durationContainer}>
                  <Text style={styles.durationText}>
                    {formatDuration(duration)}
                  </Text>
                </View>
              )}

              {/* Mute Toggle */}
              <TouchableOpacity
                style={styles.muteButton}
                onPress={handleMuteToggle}
                activeOpacity={0.7}
              >
                <BlurView intensity={15} style={styles.muteButtonBlur}>
                  {isMuted ? (
                    <VolumeX size={16} color="white" />
                  ) : (
                    <Volume2 size={16} color="white" />
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar (if playing) */}
          {status?.isLoaded && status.durationMillis && isPlaying && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${((status.positionMillis || 0) / status.durationMillis) * 100}%` 
                    }
                  ]} 
                />
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  playButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  videoInfo: {
    flex: 1,
    marginRight: 12,
  },
  videoTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  videoAuthor: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  muteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  muteButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressTrack: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
});