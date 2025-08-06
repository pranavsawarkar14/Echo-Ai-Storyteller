import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface ModernTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<string, {
    options: {
      title?: string;
      tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
      tabBarAccessibilityLabel?: string;
    };
  }>;
  navigation: any;
  style?: any;
}

const { width } = Dimensions.get("window");

const ModernTabBar: React.FC<ModernTabBarProps> = ({
  state,
  descriptors,
  navigation,
  style,
}) => {
  const { colors } = useTheme();
  const tabWidth = (width - 60) / state.routes.length;
  const translateX = useSharedValue(0);
  const lastIndex = useRef(0);

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 300,
    });
    lastIndex.current = state.index;
  }, [state.index, tabWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[colors.card, colors.card]}
        style={styles.background}
      >
        <Animated.View 
          style={[
            styles.indicator, 
            { width: tabWidth - 20 },
            indicatorStyle
          ]} 
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.indicatorGradient}
          />
        </Animated.View>
        
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
              if (Platform.OS !== "web") {
                Haptics.selectionAsync();
              }
            }
          };

          const icon = options.tabBarIcon ? 
            options.tabBarIcon({ 
              focused: isFocused, 
              color: isFocused ? "white" : colors.mutedText, 
              size: 22 
            }) : null;

          const iconScale = useSharedValue(1);
          const textOpacity = useSharedValue(isFocused ? 1 : 0);
          const textTranslateY = useSharedValue(isFocused ? 0 : 4);

          useEffect(() => {
            if (isFocused) {
              iconScale.value = withSpring(1.1, { damping: 15, stiffness: 300 });
              textOpacity.value = withTiming(1, { duration: 300 });
              textTranslateY.value = withTiming(0, { duration: 300 });
            } else {
              iconScale.value = withSpring(1, { damping: 15, stiffness: 300 });
              textOpacity.value = withTiming(0, { duration: 300 });
              textTranslateY.value = withTiming(4, { duration: 300 });
            }
          }, [isFocused]);

          const iconAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: iconScale.value }],
          }));

          const textAnimatedStyle = useAnimatedStyle(() => ({
            opacity: textOpacity.value,
            transform: [{ translateY: textTranslateY.value }],
          }));

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Animated.View style={iconAnimatedStyle}>
                  {icon}
                </Animated.View>
              </View>
              <Animated.Text 
                style={[
                  styles.tabText,
                  { color: isFocused ? "white" : colors.mutedText },
                  textAnimatedStyle
                ]}
              >
                {options.title}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 30,
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 25, // Much higher elevation to ensure tab bar is above mini player
    zIndex: 3000, // Very high z-index to ensure tab bar is always on top
  },
  background: {
    flexDirection: "row",
    height: 65,
    position: "relative",
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    zIndex: 2,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  tabText: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  indicator: {
    height: "80%",
    position: "absolute",
    top: "10%",
    left: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 20,
  },
});

export default ModernTabBar;