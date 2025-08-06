import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';
// Colors import removed - using theme colors passed as props

type PresetType = 'blur' | 'shake' | 'scale' | 'fade' | 'slide';

type TextEffectProps = {
  children: string;
  per?: 'word' | 'char';
  style?: any;
  preset?: PresetType;
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  fontSize?: number;
  color?: string;
};

const defaultStaggerTimes: Record<'char' | 'word', number> = {
  char: 50,
  word: 100,
};

const AnimatedText = Animated.createAnimatedComponent(Text);

const AnimationComponent: React.FC<{
  segment: string;
  index: number;
  preset: PresetType;
  staggerDelay: number;
  fontSize?: number;
  color?: string;
  onComplete?: () => void;
  isLast?: boolean;
}> = React.memo(({ segment, index, preset, staggerDelay, fontSize, color, onComplete, isLast }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(preset === 'scale' ? 0 : 1);
  const translateY = useSharedValue(preset === 'slide' ? 20 : 0);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    const animationDelay = index * staggerDelay;
    
    opacity.value = withDelay(animationDelay, withTiming(1, { duration: 300 }));
    
    if (preset === 'scale') {
      scale.value = withDelay(animationDelay, withTiming(1, { duration: 300 }));
    }
    
    if (preset === 'slide') {
      translateY.value = withDelay(animationDelay, withTiming(0, { duration: 300 }));
    }
    
    if (preset === 'shake') {
      translateX.value = withDelay(
        animationDelay,
        withSequence(
          withTiming(-5, { duration: 50 }),
          withTiming(5, { duration: 50 }),
          withTiming(-5, { duration: 50 }),
          withTiming(5, { duration: 50 }),
          withTiming(0, { duration: 50 })
        )
      );
    }

    if (isLast && onComplete) {
      setTimeout(() => {
        runOnJS(onComplete)();
      }, animationDelay + 300);
    }
  }, [index, staggerDelay, preset, opacity, scale, translateY, translateX, onComplete, isLast]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
    };
  });

  return (
    <AnimatedText
      style={[
        {
          fontSize: fontSize || 16,
          color: color || '#000000', // Default to black, should be overridden by theme
        },
        animatedStyle,
      ]}
    >
      {segment}
    </AnimatedText>
  );
});

AnimationComponent.displayName = 'AnimationComponent';

export function TextEffect({
  children,
  per = 'word',
  style,
  preset = 'fade',
  delay = 0,
  trigger = true,
  onAnimationComplete,
  fontSize,
  color,
}: TextEffectProps) {
  let segments: string[];

  if (per === 'word') {
    segments = children.split(/(\s+)/);
  } else {
    segments = children.split('');
  }

  const stagger = defaultStaggerTimes[per];

  if (!trigger) {
    return null;
  }

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap' }, style]}>
      {segments.map((segment, index) => (
        <AnimationComponent
          key={`${per}-${index}-${segment}`}
          segment={segment}
          index={index}
          preset={preset}
          staggerDelay={stagger}
          fontSize={fontSize}
          color={color}
          onComplete={index === segments.length - 1 ? onAnimationComplete : undefined}
          isLast={index === segments.length - 1}
        />
      ))}
    </View>
  );
}