import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { SendHorizontal, Check, Loader2, X } from "lucide-react-native";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");
const SLIDE_WIDTH = width * 0.7;
const BUTTON_SIZE = 50;
const SLIDE_THRESHOLD = SLIDE_WIDTH - BUTTON_SIZE - 20;

interface SlideButtonProps {
  onSlideComplete?: () => void;
  text?: string;
}

export const SlideButton: React.FC<SlideButtonProps> = ({
  onSlideComplete,
  text = "Slide to generate story"
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isCompleted, setIsCompleted] = useState(false);
  
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const handleSlideComplete = () => {
    setStatus("loading");
    onSlideComplete?.();
    
    // Simulate processing
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setIsCompleted(false);
        translateX.value = withSpring(0);
        opacity.value = withTiming(1);
      }, 2000);
    }, 2000);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isCompleted,
    onPanResponderGrant: () => {
      opacity.value = withTiming(0.8);
    },
    onPanResponderMove: (_, gestureState) => {
      if (!isCompleted) {
        const newX = Math.max(0, Math.min(gestureState.dx, SLIDE_THRESHOLD));
        translateX.value = newX;
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      opacity.value = withTiming(1);
      
      if (gestureState.dx >= SLIDE_THRESHOLD * 0.8) {
        translateX.value = withSpring(SLIDE_THRESHOLD);
        setIsCompleted(true);
        runOnJS(handleSlideComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: translateX.value + BUTTON_SIZE,
  }));

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 size={20} color="white" />;
      case "success":
        return <Check size={20} color="white" />;
      case "error":
        return <X size={20} color="white" />;
      default:
        return <SendHorizontal size={20} color="white" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.progress, progressAnimatedStyle]}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </Animated.View>
        
        <Text style={styles.text}>{text}</Text>
        
        <Animated.View
          style={[styles.button, buttonAnimatedStyle]}
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.buttonGradient}
          >
            {getStatusIcon()}
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  track: {
    width: SLIDE_WIDTH,
    height: 60,
    backgroundColor: Colors.card,
    borderRadius: 30,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  progress: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 30,
    overflow: "hidden",
  },
  progressGradient: {
    flex: 1,
    opacity: 0.3,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.mutedText,
  },
  button: {
    position: "absolute",
    left: 5,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});