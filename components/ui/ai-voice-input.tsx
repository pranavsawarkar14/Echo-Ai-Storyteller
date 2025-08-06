import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mic } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 24,
  className
}: AIVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      onStart?.();
      
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (time > 0) {
        onStop?.(time);
      }
      setTime(0);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, onStart, onStop, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    setIsRecording(prev => !prev);
  };

  const VisualizerBar = ({ index }: { index: number }) => {
    const height = isRecording ? Math.random() * 40 + 4 : 4;
    
    return (
      <View 
        style={[
          styles.visualizerBar,
          {
            height: height,
            backgroundColor: isRecording ? Colors.primary : Colors.mutedText + '30'
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          {
            backgroundColor: isRecording ? Colors.primary : Colors.card
          }
        ]}
        activeOpacity={0.8}
      >
        {isRecording ? (
          <View style={styles.stopIcon} />
        ) : (
          <Mic size={24} color={isRecording ? 'white' : Colors.text} />
        )}
      </TouchableOpacity>

      <Text style={styles.timeText}>
        {formatTime(time)}
      </Text>

      <View style={styles.visualizerContainer}>
        {Array.from({ length: visualizerBars }, (_, i) => (
          <VisualizerBar key={i} index={i} />
        ))}
      </View>

      <Text style={styles.statusText}>
        {isRecording ? 'Recording...' : 'Tap to record'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  stopIcon: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: Colors.mutedText,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: 48,
  },
  visualizerBar: {
    width: 2,
    borderRadius: 1,
  },
  statusText: {
    fontSize: 12,
    color: Colors.mutedText,
  },
});