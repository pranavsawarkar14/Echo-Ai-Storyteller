import React, { useRef, useEffect } from "react";
import { View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

interface SpringElementProps {
  children: React.ReactElement;
  springConfig?: {
    stiffness?: number;
    damping?: number;
  };
}

const generateSpringPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  springConfig: {
    coilCount?: number;
    amplitudeMin?: number;
    amplitudeMax?: number;
  } = {}
) => {
  const {
    coilCount = 8,
    amplitudeMin = 8,
    amplitudeMax = 20,
  } = springConfig;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 2) return `M${x1},${y1}`;
  
  const d = dist / coilCount;
  const amplitude = Math.max(amplitudeMin, Math.min(amplitudeMax, amplitudeMax * (1 - (dist - 40) / 200)));
  const ux = dx / dist;
  const uy = dy / dist;
  const perpX = -uy;
  const perpY = ux;

  let path = [];
  for (let i = 0; i < coilCount; i++) {
    const sx = x1 + ux * (i * d);
    const sy = y1 + uy * (i * d);
    const ex = x1 + ux * ((i + 1) * d);
    const ey = y1 + uy * ((i + 1) * d);

    const mx = x1 + ux * ((i + 0.5) * d) + perpX * amplitude;
    const my = y1 + uy * ((i + 0.5) * d) + perpY * amplitude;

    if (i === 0) path.push(`M${sx},${sy}`);
    else path.push(`L${sx},${sy}`);
    path.push(`Q${mx},${my} ${ex},${ey}`);
  }
  return path.join(' ');
};

export const SpringElement: React.FC<SpringElementProps> = ({
  children,
  springConfig = { stiffness: 200, damping: 16 }
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const centerX = useSharedValue(0);
  const centerY = useSharedValue(0);
  const pathData = useSharedValue("");

  const updatePath = () => {
    const path = generateSpringPath(
      centerX.value,
      centerY.value,
      centerX.value + translateX.value,
      centerY.value + translateY.value
    );
    pathData.value = path;
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = (context.startX as number) + event.translationX;
      translateY.value = (context.startY as number) + event.translationY;
      runOnJS(updatePath)();
    },
    onEnd: () => {
      translateX.value = withSpring(0, springConfig);
      translateY.value = withSpring(0, springConfig);
      runOnJS(updatePath)();
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <Svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
        width="100%"
        height="100%"
      >
        <Path
          d={pathData.value}
          stroke="#6366F1"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[{ zIndex: 2 }, animatedStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};