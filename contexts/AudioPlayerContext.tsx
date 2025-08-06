import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { Story } from '@/mocks/stories';
import { speechManager, SpeechOptions } from '@/lib/speechUtils';
import { useAudioPreferences } from '@/contexts/AudioPreferencesContext';
import { useUserStats } from '@/contexts/UserStatsContext';

interface AudioPlayerState {
  // Current playback state
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  
  // Current story/chapter
  currentStory: Story | null;
  currentChapter: number;
  totalChapters: number;
  
  // Player UI state
  isPlayerVisible: boolean;
  isMiniPlayerVisible: boolean;
  
  // Audio settings
  playbackSpeed: number;
  isBookmarked: boolean;
  sleepTimer: number | null;
  
  // Real-time tracking
  currentSessionId: string | null;
  sessionStartTime: Date | null;
  lastProgressUpdate: number;
  sessionPauseCount: number;
}

interface AudioPlayerContextType extends AudioPlayerState {
  // Playback controls
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  
  // Story/chapter navigation
  nextChapter: () => Promise<void>;
  previousChapter: () => Promise<void>;
  playStory: (story: Story, chapter?: number) => Promise<void>;
  
  // Player UI controls
  showPlayer: () => void;
  hidePlayer: () => void;
  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;
  
  // Settings
  setPlaybackSpeed: (speed: number) => void;
  toggleBookmark: () => void;
  setSleepTimer: (minutes: number | null) => void;
  
  // Skip controls
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;

  // Voice controls
  changeVoice: (voice: any) => Promise<void>;
  
  // Compatibility aliases for StoryCard
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  currentChapter: number;
  totalChapters: number;
  isBookmarked: boolean;
  sleepTimer: number | null;
  togglePlayPause: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  seekTo: (position: number) => void;
  changePlaybackSpeed: (speed: number) => void;
  seekForward: (seconds?: number) => void;
  seekBackward: (seconds?: number) => void;
}

const initialState: AudioPlayerState = {
  isPlaying: false,
  isLoading: false,
  duration: 0,
  position: 0,
  currentStory: null,
  currentChapter: 1,
  totalChapters: 1,
  isPlayerVisible: false,
  isMiniPlayerVisible: false,
  playbackSpeed: 1.0,
  isBookmarked: false,
  sleepTimer: null,
  // Real-time tracking
  currentSessionId: null,
  sessionStartTime: null,
  lastProgressUpdate: 0,
  sessionPauseCount: 0,
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const [state, setState] = useState<AudioPlayerState>(initialState);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [sleepTimerInterval, setSleepTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [progressUpdateInterval, setProgressUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const audioPreferences = useAudioPreferences();
  const {
    startListeningSession,
    updateSessionProgress,
    endListeningSession,
    markStoryCompleted,
    trackStoryStart,
  } = useUserStats();

  // Configure audio session
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.warn('Failed to configure audio:', error);
      }
    };
    
    configureAudio();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
      }
    };
  }, [sound, sleepTimerInterval]);

  // Position tracking for both TTS and audio with real-time session tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isPlaying && state.currentSessionId) {
      interval = setInterval(async () => {
        try {
          let newPosition = 0;
          let newDuration = 0;
          let progress = 0;
          
          if (speechManager.getIsPlaying()) {
            // TTS position tracking
            const positionData = speechManager.getCurrentPosition();
            const progressData = speechManager.getProgress();
            
            newPosition = positionData.timeElapsed;
            newDuration = progressData > 0 ? (positionData.timeElapsed / (progressData / 100)) : state.duration;
            progress = progressData;
          } else if (sound) {
            // Audio file position tracking
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              newPosition = status.positionMillis || 0;
              newDuration = status.durationMillis || 0;
              progress = newDuration > 0 ? (newPosition / newDuration) * 100 : 0;
            }
          }
          
          setState(prev => ({
            ...prev,
            position: newPosition,
            duration: newDuration,
            lastProgressUpdate: progress,
          }));
          
          // Update session progress in UserStatsContext
          if (state.sessionStartTime && state.currentSessionId) {
            const sessionDuration = (Date.now() - state.sessionStartTime.getTime()) / 1000 / 60; // minutes
            await updateSessionProgress(state.currentSessionId, progress, sessionDuration);
          }
        } catch (error) {
          console.warn('Failed to get playback status:', error);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isPlaying, sound, state.currentSessionId, state.sessionStartTime, updateSessionProgress]);

  // Sleep timer logic
  useEffect(() => {
    if (state.sleepTimer && state.sleepTimer > 0) {
      const interval = setInterval(() => {
        setState(prev => {
          const newTimer = (prev.sleepTimer || 0) - 1;
          if (newTimer <= 0) {
            // Stop playback when timer reaches 0
            pause();
            return { ...prev, sleepTimer: null };
          }
          return { ...prev, sleepTimer: newTimer };
        });
      }, 60000); // Update every minute
      
      setSleepTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
        setSleepTimerInterval(null);
      };
    }
  }, [state.sleepTimer]);

  const play = async () => {
    try {
      if (state.currentStory) {
        // Use Text-to-Speech for natural story narration
        if (speechManager.getIsPaused()) {
          // Resume from pause - this preserves position
          console.log('Resuming from pause...');
          await speechManager.resume();
          setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
        } else if (!speechManager.getIsPlaying()) {
          // Start new speech with selected voice preferences
          const selectedVoice = audioPreferences?.selectedVoice;
          const speechOptions: SpeechOptions = {
            rate: (selectedVoice?.rate || 0.8) * state.playbackSpeed, // Use voice's preferred rate or default
            pitch: selectedVoice?.pitch || 1.0,
            language: 'en-US',
            voiceType: selectedVoice?.id,
            onStart: () => {
              console.log('TTS Started');
              setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
            },
            onDone: () => {
              console.log('TTS Completed');
              setState(prev => ({ ...prev, isPlaying: false }));
              nextChapter(); // Auto-play next chapter
            },
            onStopped: () => {
              console.log('TTS Stopped');
              setState(prev => ({ ...prev, isPlaying: false }));
            },
            onError: (error) => {
              console.error('TTS Error:', error);
              setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
            },
            onProgress: (currentSentence, totalSentences) => {
              // Update progress based on sentence completion
              const progress = (currentSentence / totalSentences) * 100;
              setState(prev => ({
                ...prev,
                position: (progress / 100) * prev.duration
              }));
            }
          };

          setState(prev => ({ ...prev, isLoading: true }));
          await speechManager.speakStoryContent(state.currentStory, speechOptions);
        }
      } else if (sound) {
        // Fallback to audio file if available
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.playAsync();
          setState(prev => ({ ...prev, isPlaying: true }));
        }
      }
    } catch (error) {
      console.error('Failed to play story:', error);
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
    }
  };

  const pause = async () => {
    try {
      if (speechManager.getIsPlaying()) {
        // Pause TTS
        await speechManager.pause();
      } else if (sound) {
        // Pause audio file
        await sound.pauseAsync();
      }
      setState(prev => ({ ...prev, isPlaying: false }));
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  };

  const stop = async () => {
    try {
      // Stop TTS if playing
      if (speechManager.getIsPlaying() || speechManager.getIsPaused()) {
        await speechManager.stop();
      }
      
      // Stop audio file if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      
      setState(prev => ({
        ...prev,
        isPlaying: false,
        position: 0,
        currentStory: null,
        isPlayerVisible: false,
        isMiniPlayerVisible: false,
      }));
    } catch (error) {
      console.error('Failed to stop:', error);
    }
  };

  const seek = async (positionSeconds: number) => {
    try {
      const positionMs = positionSeconds * 1000; // Convert to milliseconds
      console.log(`Seeking to ${positionSeconds}s (${positionMs}ms)`);
      
      // Always update the UI position immediately for real-time feedback
      setState(prev => ({ ...prev, position: positionMs }));
      
      if (speechManager.getIsPlaying() || speechManager.getIsPaused()) {
        // For TTS, we can seek by sentence approximation
        const currentPosition = speechManager.getCurrentPosition();
        if (currentPosition.totalSentences > 0) {
          const progress = Math.max(0, Math.min(100, positionMs / state.duration * 100));
          const targetSentence = Math.floor((progress / 100) * currentPosition.totalSentences);
          console.log(`Seeking to sentence ${targetSentence} (${progress.toFixed(1)}% progress)`);
          await speechManager.seekToSentence(targetSentence);
          
          // If we were playing, restart from new position
          if (speechManager.getIsPlaying()) {
            console.log('Restarting TTS from new position...');
          }
        }
      } else if (sound) {
        await sound.setPositionAsync(positionMs);
      }
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const skipForward = async (seconds: number = 15) => {
    const currentPositionSeconds = state.position / 1000;
    const newPositionSeconds = Math.min(currentPositionSeconds + seconds, state.duration / 1000);
    await seek(newPositionSeconds);
  };

  const skipBackward = async (seconds: number = 10) => {
    const currentPositionSeconds = state.position / 1000;
    const newPositionSeconds = Math.max(currentPositionSeconds - seconds, 0);
    await seek(newPositionSeconds);
  };

  const changeVoice = async (voice: any) => {
    console.log('Changing voice to:', voice.name);
    
    if (state.isPlaying && state.currentStory) {
      // Store current state
      const wasPlaying = state.isPlaying;
      const currentPosition = state.position;
      
      console.log('Stopping current playback for voice change...');
      // Stop current speech
      await pause();
      
      // Brief pause for smooth transition
      setTimeout(async () => {
        console.log('Restarting with new voice...');
        // Clear any previous state and restart
        setState(prev => ({ ...prev, isPlaying: false, position: currentPosition }));
        
        // Start playing again with new voice (the new voice will be picked up from audioPreferences)
        setTimeout(async () => {
          await play();
          
          // Try to seek to approximate position if we had one
          if (currentPosition > 0) {
            setTimeout(() => {
              seek(currentPosition / 1000); // Convert ms to seconds
            }, 1500);
          }
        }, 100);
      }, 200);
    }
  };

  const nextChapter = async () => {
    if (state.currentChapter < state.totalChapters) {
      setState(prev => ({ ...prev, currentChapter: prev.currentChapter + 1 }));
      // In a real app, you'd load the next chapter's audio here
      await seek(0); // Seek to beginning (0 seconds)
    }
  };

  const previousChapter = async () => {
    if (state.currentChapter > 1) {
      setState(prev => ({ ...prev, currentChapter: prev.currentChapter - 1 }));
      // In a real app, you'd load the previous chapter's audio here
      await seek(0); // Seek to beginning (0 seconds)
    }
  };

  const playStory = async (story: Story, chapter: number = 1) => {
    // Stop current playback
    await stop();

    // Calculate total chapters based on story duration (estimated)
    const durationInMinutes = parseInt(story.duration.split(' ')[0]);
    const estimatedChapters = Math.max(1, Math.ceil(durationInMinutes / 5)); // ~5 min per chapter
    
    // Estimate duration in milliseconds for TTS
    const estimatedDurationMs = durationInMinutes * 60 * 1000;

    setState(prev => ({
      ...prev,
      currentStory: story,
      currentChapter: chapter,
      totalChapters: estimatedChapters,
      position: 0,
      duration: estimatedDurationMs,
      isPlaying: false,
      isMiniPlayerVisible: false,
      isPlayerVisible: true, // Show full screen player immediately
    }));

    // Auto-start playing after a short delay
    setTimeout(() => {
      play();
    }, 500);
  };

  const showPlayer = () => {
    setState(prev => ({ 
      ...prev, 
      isPlayerVisible: true, 
      isMiniPlayerVisible: false 
    }));
  };

  const hidePlayer = () => {
    setState(prev => ({ 
      ...prev, 
      isPlayerVisible: false,
      isMiniPlayerVisible: prev.currentStory && (prev.isPlaying || prev.position > 0) ? true : false
    }));
  };

  const showMiniPlayer = () => {
    setState(prev => ({ 
      ...prev, 
      isMiniPlayerVisible: true, 
      isPlayerVisible: false 
    }));
  };

  const hideMiniPlayer = () => {
    setState(prev => ({ ...prev, isMiniPlayerVisible: false }));
  };

  const setPlaybackSpeed = async (speed: number) => {
    try {
      setState(prev => ({ ...prev, playbackSpeed: speed }));
      
      // If currently playing TTS, restart with new speed
      if (speechManager.getIsPlaying() && state.currentStory) {
        const wasPlaying = speechManager.getIsPlaying();
        if (wasPlaying) {
          await speechManager.stop();
          // Restart with new speed after a brief delay
          setTimeout(async () => {
            await play();
          }, 200);
        }
      } else if (sound) {
        await sound.setRateAsync(speed, true);
      }
    } catch (error) {
      console.error('Failed to set playback speed:', error);
    }
  };

  const toggleBookmark = () => {
    console.log('Toggling bookmark:', !state.isBookmarked);
    setState(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    // In a real app, you'd save this to storage or backend
  };

  const setSleepTimer = (minutes: number | null) => {
    setState(prev => ({ ...prev, sleepTimer: minutes }));
  };

  // Compatibility functions for StoryCard
  const togglePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skipToNext = () => {
    nextChapter();
  };

  const skipToPrevious = () => {
    previousChapter();
  };

  const seekTo = (position: number) => {
    seek(position);
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const seekForwardCompat = (seconds?: number) => {
    skipForward(seconds);
  };

  const seekBackwardCompat = (seconds?: number) => {
    skipBackward(seconds);
  };

  const contextValue: AudioPlayerContextType = {
    ...state,
    // Add computed properties for compatibility
    currentTime: state.position / 1000, // Convert ms to seconds
    duration: state.duration / 1000, // Convert ms to seconds
    
    // Original functions
    play,
    pause,
    stop,
    seek,
    nextChapter,
    previousChapter,
    playStory,
    showPlayer,
    hidePlayer,
    showMiniPlayer,
    hideMiniPlayer,
    setPlaybackSpeed,
    toggleBookmark,
    setSleepTimer,
    skipForward,
    skipBackward,
    changeVoice,
    
    // Compatibility aliases
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    changePlaybackSpeed,
    seekForward: seekForwardCompat,
    seekBackward: seekBackwardCompat,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}