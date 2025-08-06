import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Send } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface PlaceholdersAndVanishInputProps {
  placeholders: string[];
  onChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  style?: any;
}

export const PlaceholdersAndVanishInput: React.FC<PlaceholdersAndVanishInputProps> = ({
  placeholders,
  onChange,
  onSubmit,
  style,
}) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [value, setValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholders.length);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [placeholders.length]);

  const handleChangeText = (text: string) => {
    if (!isAnimating) {
      setValue(text);
      onChange?.(text);
    }
  };

  const vanishAndSubmit = () => {
    if (!value.trim() || isAnimating) return;

    setIsAnimating(true);
    
    opacity.value = withSequence(
      withTiming(0.5, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );
    
    scale.value = withSequence(
      withTiming(0.95, { duration: 300 }),
      withTiming(0.8, { duration: 300 }, () => {
        runOnJS(() => {
          onSubmit?.(value);
          setValue('');
          setIsAnimating(false);
          opacity.value = withTiming(1, { duration: 300 });
          scale.value = withTiming(1, { duration: 300 });
        })();
      })
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const currentPlaceholderText = placeholders[currentPlaceholder] || 'Enter your message...';

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          placeholder={value ? '' : currentPlaceholderText}
          placeholderTextColor={Colors.mutedText}
          style={styles.textInput}
          editable={!isAnimating}
          multiline={false}
        />
        
        <TouchableOpacity
          onPress={vanishAndSubmit}
          disabled={!value.trim() || isAnimating}
          style={[
            styles.submitButton,
            {
              backgroundColor: value.trim() && !isAnimating ? Colors.primary : Colors.mutedText,
            }
          ]}
          activeOpacity={0.8}
        >
          <Send size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      {isAnimating && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 12,
  },
  submitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.card + '80',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 14,
    color: Colors.mutedText,
  },
});