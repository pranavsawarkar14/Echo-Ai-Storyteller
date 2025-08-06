import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Play, Pause, Volume2 } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { speechManager, SpeechOptions } from '@/lib/speechUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface SpeechButtonProps {
  text: string | string[];
  buttonText?: string;
  icon?: 'play' | 'volume' | 'none';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  speechOptions?: SpeechOptions;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: any) => void;
  style?: any;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  text,
  buttonText = "Start Listen",
  icon = 'play',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  speechOptions = {},
  onSpeechStart,
  onSpeechEnd,
  onSpeechError,
  style,
}) => {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isPlaying) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulseScale.value }
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = async () => {
    if (disabled) return;

    try {
      if (isPlaying) {
        // Stop current speech
        await speechManager.stop();
        setIsPlaying(false);
        onSpeechEnd?.();
      } else {
        // Start speech
        setIsLoading(true);
        
        const textToSpeak = Array.isArray(text) ? text : [text];
        const options = {
          ...speechOptions,
          onStart: () => {
            setIsLoading(false);
            setIsPlaying(true);
            onSpeechStart?.();
          },
          onDone: () => {
            setIsPlaying(false);
            onSpeechEnd?.();
          },
          onStopped: () => {
            setIsPlaying(false);
            onSpeechEnd?.();
          },
          onError: (error: any) => {
            setIsLoading(false);
            setIsPlaying(false);
            onSpeechError?.(error);
          },
        };

        await speechManager.speakPageContent(textToSpeak, options);
      }
    } catch (error) {
      setIsLoading(false);
      setIsPlaying(false);
      onSpeechError?.(error);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [
          ...baseStyle, 
          { backgroundColor: colors.primary },
          disabled && { backgroundColor: colors.mutedText }
        ];
      case 'secondary':
        return [
          ...baseStyle, 
          { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
        ];
      case 'outline':
        return [
          ...baseStyle, 
          { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary }
        ];
      default:
        return [...baseStyle, { backgroundColor: colors.primary }];
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonText, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
        return [...baseTextStyle, { color: 'white' }];
      case 'secondary':
        return [...baseTextStyle, { color: colors.text }];
      case 'outline':
        return [...baseTextStyle, { color: colors.primary }];
      default:
        return [...baseTextStyle, { color: 'white' }];
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      default:
        return 'white';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 18;
      case 'large':
        return 22;
      default:
        return 18;
    }
  };

  const renderIcon = () => {
    const iconColor = getIconColor();
    const iconSize = getIconSize();
    
    if (isLoading) {
      return <ActivityIndicator size="small" color={iconColor} style={{ marginRight: 8 }} />;
    }
    
    if (icon === 'none') return null;
    
    const IconComponent = isPlaying ? Pause : (icon === 'volume' ? Volume2 : Play);
    
    return (
      <IconComponent 
        size={iconSize} 
        color={iconColor} 
        style={{ marginRight: 8 }}
        fill={isPlaying ? iconColor : 'transparent'}
      />
    );
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {renderIcon()}
      <Text style={getTextStyle()}>
        {isLoading ? 'Loading...' : isPlaying ? 'Stop' : buttonText}
      </Text>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});