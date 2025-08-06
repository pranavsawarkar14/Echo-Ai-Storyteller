import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  rate: number;
  pitch: number;
  identifier?: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'natural-female',
    name: 'Sarah - Natural Female',
    description: 'Warm and engaging female voice, perfect for storytelling',
    gender: 'female',
    accent: 'American',
    rate: 0.75,
    pitch: 1.0,
  },
  {
    id: 'natural-male',
    name: 'David - Natural Male',
    description: 'Clear and confident male voice with great articulation',
    gender: 'male',
    accent: 'American',
    rate: 0.8,
    pitch: 0.95,
  },
  {
    id: 'storyteller-female',
    name: 'Emma - Storyteller',
    description: 'Expressive female voice with dramatic flair',
    gender: 'female',
    accent: 'British',
    rate: 0.7,
    pitch: 1.05,
  },
  {
    id: 'professional-male',
    name: 'Michael - Professional',
    description: 'Deep, authoritative male voice for serious content',
    gender: 'male',
    accent: 'American',
    rate: 0.85,
    pitch: 0.9,
  },
  {
    id: 'young-female',
    name: 'Lily - Young & Energetic',
    description: 'Bright and enthusiastic voice, great for adventure stories',
    gender: 'female',
    accent: 'American',
    rate: 0.9,
    pitch: 1.1,
  },
  {
    id: 'narrator-male',
    name: 'James - Classic Narrator',
    description: 'Traditional storytelling voice with rich tone',
    gender: 'male',
    accent: 'British',
    rate: 0.75,
    pitch: 0.95,
  },
];

interface AudioPreferences {
  selectedVoice: VoiceOption;
  playbackSpeed: number;
  autoPlay: boolean;
  sleepTimerDefault: number;
  backgroundPlayback: boolean;
  enhancedAudio: boolean;
}

interface AudioPreferencesContextType extends AudioPreferences {
  setSelectedVoice: (voice: VoiceOption) => void;
  setPlaybackSpeed: (speed: number) => void;
  setAutoPlay: (enabled: boolean) => void;
  setSleepTimerDefault: (minutes: number) => void;
  setBackgroundPlayback: (enabled: boolean) => void;
  setEnhancedAudio: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultPreferences: AudioPreferences = {
  selectedVoice: VOICE_OPTIONS[0], // Sarah - Natural Female
  playbackSpeed: 1.0,
  autoPlay: true,
  sleepTimerDefault: 30,
  backgroundPlayback: true,
  enhancedAudio: true,
};

const AudioPreferencesContext = createContext<AudioPreferencesContextType | undefined>(undefined);

interface AudioPreferencesProviderProps {
  children: ReactNode;
}

export function AudioPreferencesProvider({ children }: AudioPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<AudioPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from storage
  useEffect(() => {
    loadPreferences();
  }, []);

  // Save preferences to storage whenever they change
  useEffect(() => {
    if (isLoaded) {
      savePreferences();
    }
  }, [preferences, isLoaded]);

  const loadPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem('audio_preferences');
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences);
        // Ensure the selected voice exists in current options
        const voiceExists = VOICE_OPTIONS.find(v => v.id === parsed.selectedVoice?.id);
        if (!voiceExists && parsed.selectedVoice) {
          parsed.selectedVoice = VOICE_OPTIONS[0];
        }
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load audio preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem('audio_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save audio preferences:', error);
    }
  };

  const setSelectedVoice = (voice: VoiceOption) => {
    setPreferences(prev => ({ ...prev, selectedVoice: voice }));
  };

  const setPlaybackSpeed = (speed: number) => {
    setPreferences(prev => ({ ...prev, playbackSpeed: speed }));
  };

  const setAutoPlay = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, autoPlay: enabled }));
  };

  const setSleepTimerDefault = (minutes: number) => {
    setPreferences(prev => ({ ...prev, sleepTimerDefault: minutes }));
  };

  const setBackgroundPlayback = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, backgroundPlayback: enabled }));
  };

  const setEnhancedAudio = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, enhancedAudio: enabled }));
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  const contextValue: AudioPreferencesContextType = {
    ...preferences,
    setSelectedVoice,
    setPlaybackSpeed,
    setAutoPlay,
    setSleepTimerDefault,
    setBackgroundPlayback,
    setEnhancedAudio,
    resetToDefaults,
  };

  return (
    <AudioPreferencesContext.Provider value={contextValue}>
      {children}
    </AudioPreferencesContext.Provider>
  );
}

export function useAudioPreferences(): AudioPreferencesContextType {
  const context = useContext(AudioPreferencesContext);
  if (context === undefined) {
    throw new Error('useAudioPreferences must be used within an AudioPreferencesProvider');
  }
  return context;
}