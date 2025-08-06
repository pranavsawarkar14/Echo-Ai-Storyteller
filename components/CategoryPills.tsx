import React, { useState } from "react";
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";

interface CategoryPillsProps {
  categories: string[];
  onSelectCategory: (category: string) => void;
  selectedCategory?: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const CategoryPills: React.FC<CategoryPillsProps> = ({ 
  categories, 
  onSelectCategory,
  selectedCategory: externalSelectedCategory
}) => {
  const { colors } = useTheme();
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>(categories[0]);
  
  // Use external selectedCategory if provided, otherwise use internal state
  const selectedCategory = externalSelectedCategory ?? internalSelectedCategory;

  const handleSelect = (category: string) => {
    if (!externalSelectedCategory) {
      setInternalSelectedCategory(category);
    }
    onSelectCategory(category);
  };

  const CategoryPill = ({ category, isSelected }: { category: string; isSelected: boolean }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
      opacity.value = withTiming(0.8);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    };

    if (isSelected) {
      return (
        <AnimatedTouchableOpacity
          style={[animatedStyle]}
          onPress={() => handleSelect(category)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          testID={`category-${category}`}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.selectedPill}
          >
            <Text style={styles.selectedPillText}>{category}</Text>
          </LinearGradient>
        </AnimatedTouchableOpacity>
      );
    }

    return (
      <AnimatedTouchableOpacity
        style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }, animatedStyle]}
        onPress={() => handleSelect(category)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={`category-${category}`}
      >
        <Text style={[styles.pillText, { color: colors.text }]}>{category}</Text>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <CategoryPill
            key={category}
            category={category}
            isSelected={category === selectedCategory}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pillText: {
    fontWeight: "500",
    fontSize: 14,
  },
  selectedPillText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});