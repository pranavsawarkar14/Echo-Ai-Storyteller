import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Bookmark,
  BookOpen,
  Moon,
  Sun,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Audio Waveform Component
const AudioWaveform: React.FC<{ 
  isPlaying: boolean; 
  progress: number; 
  color: string;
}> = ({ isPlaying, progress, color }) => {
  // Generate waveform bars
  const waveformData = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    height: Math.random() * 40 + 10,
    played: (i / 60) < progress,
  }));

  const animatedValues = waveformData.map(() => useSharedValue(1));

  useEffect(() => {
    if (isPlaying) {
      // Animate playing bars
      animatedValues.forEach((value, index) => {
        if (waveformData[index].played) {
          value.value = withSpring(Math.random() * 0.7 + 0.3, {
            damping: 10,
            stiffness: 100,
          });
        }
      });
    }
  }, [isPlaying, progress]);

  return (
    <View style={styles.waveformContainer}>
      {waveformData.map((bar, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scaleY: animatedValues[index].value }],
        }));

        return (
          <Animated.View
            key={bar.id}
            style={[
              styles.waveformBar,
              {
                height: bar.height,
                backgroundColor: bar.played ? color : '#E5E7EB',
              },
              animatedStyle,
            ]}
          />
        );
      })}
    </View>
  );
};

// Speed Control Component
const SpeedControl: React.FC<{ 
  speed: number; 
  onSpeedChange: (speed: number) => void;
  color: string;
}> = ({ speed, onSpeedChange, color }) => {
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);

  return (
    <View style={styles.speedControlContainer}>
      {showSpeedOptions && (
        <View style={styles.speedOptions}>
          {speeds.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.speedOption,
                { backgroundColor: s === speed ? color + '20' : 'transparent' }
              ]}
              onPress={() => {
                onSpeedChange(s);
                setShowSpeedOptions(false);
              }}
            >
              <Text style={[
                styles.speedOptionText, 
                { color: s === speed ? color : '#6B7280' }
              ]}>
                {s}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={styles.speedButton}
        onPress={() => setShowSpeedOptions(!showSpeedOptions)}
      >
        <Text style={[styles.speedText, { color }]}>{speed}x</Text>
        <Text style={[styles.speedLabel, { color: '#6B7280' }]}>Speed</Text>
      </TouchableOpacity>
    </View>
  );
};

// Sleep Timer Component
const SleepTimer: React.FC<{ 
  sleepTimer: number | null; 
  onSetTimer: (minutes: number | null) => void;
  color: string;
}> = ({ sleepTimer, onSetTimer, color }) => {
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const timerOptions = [5, 10, 15, 30, 45, 60];

  return (
    <View style={styles.timerControlContainer}>
      {showTimerOptions && (
        <View style={styles.timerOptions}>
          <TouchableOpacity
            style={styles.timerOption}
            onPress={() => {
              onSetTimer(null);
              setShowTimerOptions(false);
            }}
          >
            <Text style={[styles.timerOptionText, { color: '#6B7280' }]}>Off</Text>
          </TouchableOpacity>
          {timerOptions.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.timerOption,
                { backgroundColor: minutes === sleepTimer ? color + '20' : 'transparent' }
              ]}
              onPress={() => {
                onSetTimer(minutes);
                setShowTimerOptions(false);
              }}
            >
              <Text style={[
                styles.timerOptionText, 
                { color: minutes === sleepTimer ? color : '#6B7280' }
              ]}>
                {minutes}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={styles.timerButton}
        onPress={() => setShowTimerOptions(!showTimerOptions)}
      >
        <Moon size={20} color={sleepTimer ? color : '#6B7280'} />
        <Text style={[styles.timerLabel, { color: sleepTimer ? color : '#6B7280' }]}>
          {sleepTimer ? `${sleepTimer}m` : 'Sleep timer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const AudioPlayer: React.FC = () => {
  const { colors } = useTheme();
  const {
    isPlayerVisible,
    currentStory,
    currentChapter,
    totalChapters,
    isPlaying,
    isLoading,
    position,
    duration,
    playbackSpeed,
    isBookmarked,
    sleepTimer,
    play,
    pause,
    hidePlayer,
    skipForward,
    skipBackward,
    nextChapter,
    previousChapter,
    seek,
    setPlaybackSpeed,
    toggleBookmark,
    setSleepTimer,
  } = useAudioPlayer();

  const [showSummary, setShowSummary] = useState(false);

  const modalTranslateY = useSharedValue(screenHeight);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (isPlayerVisible) {
      modalTranslateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      modalTranslateY.value = withTiming(screenHeight, { duration: 250 });
      modalOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isPlayerVisible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
    opacity: modalOpacity.value,
  }));

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  if (!currentStory) {
    return null;
  }

  return (
    <Modal
      visible={isPlayerVisible}
      animationType="none"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <Animated.View style={[styles.container, { backgroundColor: colors.background }, modalStyle]}>
        <LinearGradient
          colors={[colors.background, colors.card]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hidePlayer}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerIcon}>
                <Sun size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <BookOpen size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <Text style={[styles.moreIcon, { color: colors.text }]}>⋯</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Book Cover */}
            <View style={styles.coverContainer}>
              <Image
                source={{ uri: currentStory.imageUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            </View>

            {/* Chapter Info */}
            <Text style={[styles.chapterInfo, { color: colors.mutedText }]}>
              Chapter {currentChapter} of {totalChapters}
            </Text>

            {/* Title and Author */}
            <Text style={[styles.title, { color: colors.text }]}>
              {currentStory.title}
            </Text>
            <Text style={[styles.author, { color: colors.mutedText }]}>
              {currentStory.author}
            </Text>

            {/* Waveform */}
            <View style={styles.waveformSection}>
              <AudioWaveform 
                isPlaying={isPlaying} 
                progress={progress} 
                color={colors.primary}
              />
            </View>

            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {formatTime(position)}
              </Text>
              <Text style={[styles.timeText, { color: colors.mutedText }]}>
                {formatTime(duration)}
              </Text>
            </View>

            {/* Progress Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onValueChange={seek}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#E5E7EB"
                thumbStyle={styles.sliderThumb}
              />
            </View>

            {/* Media Controls */}
            <View style={styles.mediaControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={previousChapter}
                disabled={currentChapter <= 1}
              >
                <SkipBack 
                  size={32} 
                  color={currentChapter <= 1 ? '#9CA3AF' : colors.text} 
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => skipBackward(10)}
              >
                <RotateCcw size={28} color={colors.text} />
                <Text style={[styles.skipText, { color: colors.text }]}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: colors.text }]}
                onPress={isPlaying ? pause : play}
                disabled={isLoading}
              >
                {isPlaying ? (
                  <View style={styles.pauseIcon}>
                    <View style={[styles.pauseBar, { backgroundColor: colors.background }]} />
                    <View style={[styles.pauseBar, { backgroundColor: colors.background }]} />
                  </View>
                ) : (
                  <Play size={28} color={colors.background} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => skipForward(15)}
              >
                <RotateCw size={28} color={colors.text} />
                <Text style={[styles.skipText, { color: colors.text }]}>15</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={nextChapter}
                disabled={currentChapter >= totalChapters}
              >
                <SkipForward 
                  size={32} 
                  color={currentChapter >= totalChapters ? '#9CA3AF' : colors.text} 
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <SpeedControl 
                speed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
                color={colors.primary}
              />

              <TouchableOpacity
                style={styles.bottomControlButton}
                onPress={toggleBookmark}
              >
                <Bookmark 
                  size={20} 
                  color={isBookmarked ? colors.primary : '#6B7280'}
                  fill={isBookmarked ? colors.primary : 'transparent'}
                />
                <Text style={[styles.bottomControlLabel, { 
                  color: isBookmarked ? colors.primary : '#6B7280' 
                }]}>
                  Bookmark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bottomControlButton}
                onPress={() => setShowSummary(!showSummary)}
              >
                <BookOpen size={20} color={showSummary ? colors.primary : '#6B7280'} />
                <Text style={[styles.bottomControlLabel, { 
                  color: showSummary ? colors.primary : '#6B7280' 
                }]}>
                  Summary
                </Text>
              </TouchableOpacity>

              <SleepTimer 
                sleepTimer={sleepTimer}
                onSetTimer={setSleepTimer}
                color={colors.primary}
              />
            </View>

            {/* Summary Section */}
            {showSummary && (
              <View style={styles.summaryContainer}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Story Summary
                </Text>
                <Text style={[styles.summaryText, { color: colors.mutedText }]}>
                  {currentStory.content || "This is a captivating story that takes you on an incredible journey. Follow along as the narrative unfolds with rich characters and vivid descriptions that bring the story to life."}
                </Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  coverImage: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.9,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  chapterInfo: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  author: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 40,
  },
  waveformSection: {
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
    opacity: 0.8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sliderContainer: {
    marginBottom: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mediaControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginBottom: 50,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  skipText: {
    position: 'absolute',
    bottom: -15,
    fontSize: 10,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  bottomControlButton: {
    alignItems: 'center',
    gap: 8,
  },
  bottomControlLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  speedControlContainer: {
    position: 'relative',
  },
  speedButton: {
    alignItems: 'center',
    gap: 8,
  },
  speedText: {
    fontSize: 16,
    fontWeight: '600',
  },
  speedLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  speedOptions: {
    position: 'absolute',
    bottom: 60,
    left: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 80,
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  speedOptionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerControlContainer: {
    position: 'relative',
  },
  timerButton: {
    alignItems: 'center',
    gap: 8,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  timerOptions: {
    position: 'absolute',
    bottom: 60,
    right: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 100,
  },
  timerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  timerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 30,
    marginBottom: 40,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
});