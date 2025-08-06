import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import {
  X,
  SkipBack,
  RotateCcw,
  Play,
  Pause,
  RotateCw,
  SkipForward,
  Bookmark,
  Settings,
  Moon,
  MoreHorizontal,
  Sun,
  FileText,
  Mic,
  Check,
  Timer,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useAudioPreferences, VOICE_OPTIONS } from '@/contexts/AudioPreferencesContext';

const { width, height } = Dimensions.get('window');

// Animated Waveform Component
const AnimatedWaveform = ({ isPlaying, progress }: { isPlaying: boolean; progress: number }) => {
  const { colors } = useTheme();
  
  // Create animated values for each bar
  const bars = Array.from({ length: 50 }, () => useSharedValue(Math.random() * 0.5 + 0.3));
  
  useEffect(() => {
    if (isPlaying) {
      bars.forEach((bar, index) => {
        bar.value = withRepeat(
          withSequence(
            withTiming(Math.random() * 0.8 + 0.2, { duration: 300 + Math.random() * 200 }),
            withTiming(Math.random() * 0.8 + 0.2, { duration: 300 + Math.random() * 200 })
          ),
          -1,
          true
        );
      });
    } else {
      bars.forEach(bar => {
        bar.value = withTiming(Math.random() * 0.3 + 0.2, { duration: 500 });
      });
    }
  }, [isPlaying]);

  return (
    <View style={styles.waveformContainer}>
      {bars.map((bar, index) => {
        const animatedStyle = useAnimatedStyle(() => ({
          height: bar.value * 40 + 8,
          opacity: index / bars.length <= progress ? 1 : 0.4,
        }));

        return (
          <Animated.View
            key={index}
            style={[
              styles.waveformBar,
              {
                backgroundColor: index / bars.length <= progress ? colors.primary : colors.mutedText,
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
const SpeedControl = ({ speed, onSpeedChange }: { speed: number; onSpeedChange: (speed: number) => void }) => {
  const { colors } = useTheme();
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <TouchableOpacity 
      style={styles.bottomControl}
      onPress={() => {
        const currentIndex = speeds.indexOf(speed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        onSpeedChange(speeds[nextIndex]);
      }}
    >
      <Text style={[styles.speedText, { color: colors.text }]}>{speed}x</Text>
      <Text style={[styles.controlLabel, { color: colors.mutedText }]}>Speed</Text>
    </TouchableOpacity>
  );
};

interface FullScreenAudioPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export const FullScreenAudioPlayer: React.FC<FullScreenAudioPlayerProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const {
    currentStory,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    currentChapter,
    totalChapters,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    changePlaybackSpeed,
    skipBackward,
    skipForward,
    changeVoice,
    toggleBookmark,
    setSleepTimer,
    sleepTimer,
    isBookmarked,
  } = useAudioPlayer();

  const { selectedVoice, setSelectedVoice } = useAudioPreferences();
  const { isDarkMode, toggleTheme } = useTheme();

  const [showSummary, setShowSummary] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);

  // Animation values
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      // Smooth entry animation
      modalScale.value = withSpring(1, { 
        damping: 25, 
        stiffness: 200,
        mass: 0.8 
      });
      modalOpacity.value = withTiming(1, { duration: 400 });
      modalTranslateY.value = withSpring(0, { 
        damping: 20, 
        stiffness: 300 
      });
    } else {
      // Quick exit animation
      modalScale.value = withTiming(0.8, { duration: 250 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalTranslateY.value = withTiming(50, { duration: 250 });
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value }
    ],
    opacity: modalOpacity.value,
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceSelect = async (voice: any) => {
    console.log('Voice selected in FullScreenPlayer:', voice.name);
    
    // Update the selected voice first
    setSelectedVoice(voice);
    setShowVoiceModal(false);
    setShowOptionsMenu(false);
    
    // If currently playing, change voice in real-time
    if (isPlaying && currentStory) {
      console.log('Applying voice change in real-time...');
      await changeVoice(voice);
    } else {
      console.log('Voice will be applied on next play');
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // Show empty state if no story is selected
  const showEmptyState = !currentStory;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      presentationStyle="fullScreen"
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[colors.background, colors.background + 'DD']}
        style={styles.container}
      >
        {/* Background overlay to close menu when tapped */}
        {showOptionsMenu && (
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowOptionsMenu(false)}
          />
        )}

        <Animated.View style={[styles.content, modalAnimatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <TouchableOpacity 
                style={styles.lightModeIcon}
                onPress={toggleTheme}
              >
                {isDarkMode ? (
                  <Sun size={20} color={colors.text} />
                ) : (
                  <Moon size={20} color={colors.text} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuIcon}>
                <FileText size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => setShowOptionsMenu(!showOptionsMenu)}
            >
              <MoreHorizontal size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Story Cover Image */}
          <View style={styles.coverContainer}>
            <View style={styles.coverImageContainer}>
              {showEmptyState ? (
                <View style={[styles.coverImage, styles.emptyCover]}>
                  <Text style={[styles.emptyCoverText, { color: colors.mutedText }]}>
                    No Story Selected
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: currentStory.imageUrl }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>

          {/* Chapter Info */}
          <View style={styles.chapterInfo}>
            <Text style={[styles.chapterText, { color: colors.mutedText }]}>
              {showEmptyState ? 'No chapters available' : `Chapter ${currentChapter} of ${totalChapters}`}
            </Text>
          </View>

          {/* Story Title and Author */}
          <View style={styles.titleContainer}>
            <Text style={[styles.storyTitle, { color: colors.text }]}>
              {showEmptyState ? 'Select a Story to Play' : currentStory.title}
            </Text>
            <Text style={[styles.storyAuthor, { color: colors.mutedText }]}>
              {showEmptyState ? 'Choose from your library' : currentStory.author}
            </Text>
          </View>

          {/* Waveform */}
          <View style={styles.waveformSection}>
            <AnimatedWaveform isPlaying={isPlaying} progress={progress} />
          </View>

          {/* Time Progress with Slider */}
          <View style={styles.timeProgressContainer}>
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(currentTime)}
            </Text>
            
            {/* Progress Slider */}
            <View style={styles.progressSliderContainer}>
              <Slider
                style={styles.progressSlider}
                minimumValue={0}
                maximumValue={duration || 1}
                value={currentTime}
                onValueChange={(value) => {
                  // Real-time update during dragging
                  if (!showEmptyState) {
                    seekTo(value);
                  }
                }}
                onSlidingStart={() => {
                  console.log('Started sliding timeline');
                }}
                onSlidingComplete={(value) => {
                  console.log(`Timeline seek completed at: ${value}s`);
                  if (!showEmptyState) {
                    seekTo(value);
                  }
                }}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.mutedText + '40'}
                thumbStyle={[styles.sliderThumb, { backgroundColor: colors.primary }]}
                trackStyle={styles.sliderTrack}
                disabled={showEmptyState}
              />
            </View>
            
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(duration)}
            </Text>
          </View>

          {/* Media Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              onPress={showEmptyState ? undefined : skipToPrevious} 
              style={[styles.controlButton, showEmptyState && styles.disabledButton]}
              disabled={showEmptyState}
            >
              <SkipBack size={32} color={showEmptyState ? colors.mutedText : colors.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={showEmptyState ? undefined : () => skipBackward(10)} 
              style={[styles.seekButton, showEmptyState && styles.disabledButton]}
              disabled={showEmptyState}
            >
              <RotateCcw size={24} color={showEmptyState ? colors.mutedText : colors.text} />
              <Text style={[styles.seekText, { color: showEmptyState ? colors.mutedText : colors.text }]}>10</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={showEmptyState ? undefined : togglePlayPause} 
              style={[styles.playButton, { backgroundColor: showEmptyState ? colors.mutedText : colors.text }]}
              disabled={showEmptyState}
            >
              {isPlaying && !showEmptyState ? (
                <View style={styles.pauseIcon}>
                  <View style={[styles.pauseBar, { backgroundColor: colors.background }]} />
                  <View style={[styles.pauseBar, { backgroundColor: colors.background }]} />
                </View>
              ) : (
                <Play size={32} color={colors.background} fill={colors.background} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={showEmptyState ? undefined : () => skipForward(30)} 
              style={[styles.seekButton, showEmptyState && styles.disabledButton]}
              disabled={showEmptyState}
            >
              <RotateCw size={24} color={showEmptyState ? colors.mutedText : colors.text} />
              <Text style={[styles.seekText, { color: showEmptyState ? colors.mutedText : colors.text }]}>30</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={showEmptyState ? undefined : skipToNext} 
              style={[styles.controlButton, showEmptyState && styles.disabledButton]}
              disabled={showEmptyState}
            >
              <SkipForward size={32} color={showEmptyState ? colors.mutedText : colors.text} />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={[styles.bottomControl, showEmptyState && styles.disabledButton]}
              onPress={showEmptyState ? undefined : () => {
                const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                const currentIndex = speeds.indexOf(playbackSpeed);
                const nextIndex = (currentIndex + 1) % speeds.length;
                changePlaybackSpeed(speeds[nextIndex]);
              }}
              disabled={showEmptyState}
            >
              <Text style={[styles.speedText, { color: showEmptyState ? colors.mutedText : colors.text }]}>{playbackSpeed}x</Text>
              <Text style={[styles.controlLabel, { color: colors.mutedText }]}>Speed</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bottomControl, showEmptyState && styles.disabledButton]}
              onPress={showEmptyState ? undefined : toggleBookmark}
              disabled={showEmptyState}
            >
              <Bookmark 
                size={24} 
                color={showEmptyState ? colors.mutedText : colors.text} 
                fill={isBookmarked && !showEmptyState ? colors.text : 'transparent'}
              />
              <Text style={[styles.controlLabel, { color: colors.mutedText }]}>
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bottomControl, showEmptyState && styles.disabledButton]}
              onPress={showEmptyState ? undefined : () => setShowSummary(!showSummary)}
              disabled={showEmptyState}
            >
              <Settings size={24} color={showEmptyState ? colors.mutedText : colors.text} />
              <Text style={[styles.controlLabel, { color: colors.mutedText }]}>
                Summary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bottomControl, showEmptyState && styles.disabledButton]}
              onPress={showEmptyState ? undefined : () => setShowSleepTimerModal(true)}
              disabled={showEmptyState}
            >
              <Timer 
                size={24} 
                color={showEmptyState ? colors.mutedText : colors.text}
                fill={sleepTimer && !showEmptyState ? colors.text : 'transparent'}
              />
              <Text style={[styles.controlLabel, { color: colors.mutedText }]}>
                {sleepTimer ? `${sleepTimer}m` : 'Sleep Timer'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Options Menu */}
          {showOptionsMenu && (
            <View style={[styles.optionsMenu, { backgroundColor: colors.card, borderColor: colors.mutedText + '20' }]}>
              <TouchableOpacity
                style={[styles.optionItem, { backgroundColor: colors.background + '50' }]}
                onPress={() => setShowVoiceModal(true)}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Mic size={18} color={colors.primary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionText, { color: colors.text }]}>Voice Type</Text>
                  <Text style={[styles.optionSubtext, { color: colors.mutedText }]}>{selectedVoice.name}</Text>
                </View>
                <View style={styles.optionArrow}>
                  <Text style={[styles.arrowText, { color: colors.mutedText }]}>›</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Sleep Timer Modal */}
      {showSleepTimerModal && (
        <Modal
          visible={showSleepTimerModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSleepTimerModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Sleep Timer</Text>
                <TouchableOpacity onPress={() => setShowSleepTimerModal(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timerOptions}>
                {[5, 10, 15, 30, 45, 60].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.timerOption,
                      { 
                        backgroundColor: sleepTimer === minutes ? colors.primary + '20' : colors.background,
                        borderColor: sleepTimer === minutes ? colors.primary : colors.mutedText + '40'
                      }
                    ]}
                    onPress={() => {
                      setSleepTimer(minutes);
                      setShowSleepTimerModal(false);
                    }}
                  >
                    <Text style={[
                      styles.timerOptionText, 
                      { color: sleepTimer === minutes ? colors.primary : colors.text }
                    ]}>
                      {minutes} minutes
                    </Text>
                    {sleepTimer === minutes && <Check size={20} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
                
                {sleepTimer && (
                  <TouchableOpacity
                    style={[styles.timerOption, { backgroundColor: colors.background, borderColor: colors.mutedText + '40' }]}
                    onPress={() => {
                      setSleepTimer(null);
                      setShowSleepTimerModal(false);
                    }}
                  >
                    <Text style={[styles.timerOptionText, { color: colors.text }]}>Turn Off</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Voice Selection Modal */}
      <Modal
        visible={showVoiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View style={[styles.voiceModalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.voiceModalHeader, { borderBottomColor: colors.mutedText + '30' }]}>
            <Text style={[styles.voiceModalTitle, { color: colors.text }]}>Choose Voice Type</Text>
            <TouchableOpacity
              onPress={() => setShowVoiceModal(false)}
              style={styles.voiceCloseButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.voiceList}>
            {VOICE_OPTIONS.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[styles.voiceOption, { borderBottomColor: colors.mutedText + '20' }]}
                onPress={() => handleVoiceSelect(voice)}
              >
                <View style={styles.voiceInfo}>
                  <Text style={[styles.voiceName, { color: colors.text }]}>{voice.name}</Text>
                  <Text style={[styles.voiceDescription, { color: colors.mutedText }]}>{voice.description}</Text>
                  <View style={styles.voiceTags}>
                    <View style={[styles.voiceTag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.voiceTagText, { color: colors.primary }]}>{voice.gender}</Text>
                    </View>
                    <View style={[styles.voiceTag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.voiceTagText, { color: colors.primary }]}>{voice.accent}</Text>
                    </View>
                  </View>
                </View>
                {selectedVoice.id === voice.id && (
                  <Check size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    justifyContent: 'space-evenly', // Even distribution with less spacing
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 5,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  lightModeIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  menuIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  menuLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  moreButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  coverImageContainer: {
    width: width * 0.4,
    height: width * 0.45,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  emptyCover: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyCoverText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  coverTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  coverSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coverBackground: {
    width: '100%',
    height: '100%',
  },
  silhouette: {
    marginVertical: 8,
    alignItems: 'center',
  },
  silhouetteHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  silhouetteBody: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  silhouetteLegs: {
    flexDirection: 'row',
    gap: 2,
  },
  silhouetteLeg: {
    width: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
  },
  coverAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  chapterInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  chapterText: {
    fontSize: 12,
    fontWeight: '400',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 14,
  },
  waveformSection: {
    marginVertical: 6,
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    gap: 20,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  seekButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  seekText: {
    fontSize: 10,
    position: 'absolute',
    bottom: -8,
    fontWeight: '600',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bottomControl: {
    alignItems: 'center',
    gap: 4,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlLabel: {
    fontSize: 10,
  },
  timeProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 12,
    gap: 12,
  },
  progressSliderContainer: {
    flex: 1,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  optionsMenu: {
    position: 'absolute',
    top: 80,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 60,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtext: {
    fontSize: 13,
    opacity: 0.8,
  },
  optionArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '300',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  voiceModalContainer: {
    flex: 1,
  },
  voiceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voiceModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  voiceCloseButton: {
    padding: 4,
  },
  voiceList: {
    flex: 1,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voiceDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  voiceTags: {
    flexDirection: 'row',
    gap: 8,
  },
  voiceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voiceTagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  // Sleep Timer Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 16,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  timerOptions: {
    gap: 12,
  },
  timerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timerOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});