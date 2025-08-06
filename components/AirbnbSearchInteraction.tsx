import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Search, X, BookOpen, Clock, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Create animated components
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface StorySearchProps {
  onSearch?: (searchData: StorySearchData) => void;
  scrollY?: Animated.SharedValue<number>;
}

interface StorySearchData {
  genre: string;
  duration: string;
  mood: string;
}

export const StorySearchInteraction: React.FC<StorySearchProps> = ({
  onSearch,
  scrollY,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Stories');
  const [searchData, setSearchData] = useState<StorySearchData>({
    genre: '',
    duration: '',
    mood: '',
  });

  // Animation values
  const collapsedScale = useSharedValue(1);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(screenHeight);
  const searchCardScale = useSharedValue(0.9);
  const searchCardOpacity = useSharedValue(0);

  const tabs = ['Stories', 'Audio Books', 'Podcasts'];

  const handleExpand = () => {
    setIsExpanded(true);
    // Start with a subtle scale animation on the search bar
    collapsedScale.value = withSpring(1.02, {
      damping: 20,
      stiffness: 300,
    });
    
    // Fade in the overlay with a smooth transition
    modalOpacity.value = withTiming(1, { 
      duration: 400,
    });
    
    // Animate the modal sliding up with a spring effect
    modalTranslateY.value = withSpring(0, {
      damping: 50,
      stiffness: 400,
      mass: 1,
      velocity: 1,
    });
    
    // Animate the search content with a staggered effect
    setTimeout(() => {
      searchCardScale.value = withSpring(1, {
        damping: 20,
        stiffness: 250,
      });
      searchCardOpacity.value = withTiming(1, { 
        duration: 200 
      });
    }, 100);
  };

  const handleCollapse = () => {
    // First animate the search content out
    searchCardScale.value = withTiming(0.95, { duration: 200 });
    searchCardOpacity.value = withTiming(0, { duration: 150 });
    
    // Then animate the modal sliding down
    setTimeout(() => {
      modalTranslateY.value = withSpring(screenHeight, {
        damping: 40,
        stiffness: 350,
        mass: 0.8,
      });
      modalOpacity.value = withTiming(0, { 
        duration: 300,
      });
      
      // Reset the collapsed scale
      collapsedScale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
    }, 100);
    
    // Cleanup after animations complete
    setTimeout(() => {
      runOnJS(setIsExpanded)(false);
    }, 400);
  };

  const handleSearch = () => {
    onSearch?.(searchData);
    handleCollapse();
  };

  const updateSearchData = (field: keyof StorySearchData, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  // Animated styles
  const collapsedAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: collapsedScale.value }],
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const modalContentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const searchCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchCardScale.value }],
    opacity: searchCardOpacity.value,
  }));

  const handlePressIn = () => {
    collapsedScale.value = withSpring(0.98, {
      damping: 25,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    collapsedScale.value = withSpring(1, {
      damping: 25,
      stiffness: 400,
    });
  };

  // Collapsed Search Bar Component
  const CollapsedSearchBar = () => (
    <AnimatedTouchableOpacity
      style={[styles.collapsedContainer, collapsedAnimatedStyle]}
      onPress={handleExpand}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
    >
      <View style={styles.collapsedContent}>
        <Search size={20} color={colors.text} style={styles.searchIcon} />
        <Text style={[styles.collapsedText, { color: colors.text }]}>Search your story</Text>
      </View>
    </AnimatedTouchableOpacity>
  );

  // Expanded Modal Component
  const ExpandedModal = () => (
    <Modal
      visible={isExpanded}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
    >
      <AnimatedView
        style={[styles.modalOverlay, modalAnimatedStyle]}
      >
        <AnimatedView
          style={[styles.modalContent, modalContentAnimatedStyle]}
        >
          {/* Header with Close Button */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={handleCollapse}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? colors.text : colors.mutedText },
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
                {activeTab === tab && <View style={[styles.tabUnderline, { backgroundColor: colors.text }]} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Search Card */}
          <AnimatedView
            style={[styles.searchCard, searchCardAnimatedStyle, { backgroundColor: colors.card }]}
          >
            {/* Genre Section */}
            <View style={styles.searchSection}>
              <View style={styles.sectionLabelRow}>
                <BookOpen size={18} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Genre</Text>
              </View>
              <TextInput
                style={[styles.sectionInput, { color: colors.text }]}
                placeholder="Fantasy, Sci-Fi, Mystery..."
                placeholderTextColor={colors.mutedText}
                value={searchData.genre}
                onChangeText={(text) => updateSearchData('genre', text)}
              />
            </View>

            <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

            {/* Duration Section */}
            <View style={styles.searchSection}>
              <View style={styles.sectionLabelRow}>
                <Clock size={18} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Duration</Text>
              </View>
              <TextInput
                style={[styles.sectionInput, { color: colors.text }]}
                placeholder="Short, Medium, Long..."
                placeholderTextColor={colors.mutedText}
                value={searchData.duration}
                onChangeText={(text) => updateSearchData('duration', text)}
              />
            </View>

            <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

            {/* Mood Section */}
            <View style={styles.searchSection}>
              <View style={styles.sectionLabelRow}>
                <Star size={18} color={colors.primary} />
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Mood</Text>
              </View>
              <TextInput
                style={[styles.sectionInput, { color: colors.text }]}
                placeholder="Adventure, Romance, Thriller..."
                placeholderTextColor={colors.mutedText}
                value={searchData.mood}
                onChangeText={(text) => updateSearchData('mood', text)}
              />
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
              activeOpacity={0.9}
            >
              <Search size={20} color="white" />
              <Text style={styles.searchButtonText}>Find Stories</Text>
            </TouchableOpacity>
          </AnimatedView>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <CollapsedSearchBar />
      {isExpanded && <ExpandedModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // Collapsed State Styles
  collapsedContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width: '100%',
    minWidth: screenWidth - 32,
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    marginRight: 12,
    opacity: 0.8,
  },
  collapsedText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 20,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  // Tabs Styles
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    position: 'relative',
  },
  activeTab: {
    // Active tab styling handled by text color and underline
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.mutedText,
  },
  activeTabText: {
    color: Colors.text,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: Colors.text,
    borderRadius: 1,
  },
  // Search Card Styles
  searchCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  searchSection: {
    paddingVertical: 16,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionInput: {
    fontSize: 16,
    paddingVertical: 4,
  },
  sectionDivider: {
    height: 1,
    marginHorizontal: -8,
  },
  searchButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

// Legacy export for backward compatibility
export const AirbnbSearchInteraction = StorySearchInteraction;
export default StorySearchInteraction;