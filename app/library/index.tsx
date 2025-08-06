import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  ArrowLeft,
  Bookmark,
  Heart,
  List,
  Download,
  CheckCircle,
  ChevronRight,
  Star,
  Clock,
  TrendingUp,
  Users,
  Play,
  Activity,
  Calendar,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useUserStats } from "@/contexts/UserStatsContext";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface LibrarySectionProps {
  icon: React.ReactNode;
  title: string;
  itemCount: number;
  onPress: () => void;
  colors: any;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({
  icon,
  title,
  itemCount,
  onPress,
  colors,
}) => {
  return (
    <TouchableOpacity
      style={[styles.sectionCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[colors.primary + '10', 'transparent']}
        style={styles.sectionGradient}
      >
        <View style={styles.sectionContent}>
          <View style={styles.sectionLeft}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
              {icon}
            </View>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.sectionCount, { color: colors.mutedText }]}>
                {itemCount} items
              </Text>
            </View>
          </View>
          
          <View style={styles.sectionRight}>
            <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                {itemCount}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedText} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function LibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { favorites } = useFavorites();
  const { userStats } = useUserStats();

  // Mock data for different library sections
  const libraryData = {
    saved: 23,
    collections: 5,
    downloads: 12,
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSectionPress = (section: string) => {
    // Navigate to specific section
    switch (section) {
      case 'favorites':
        router.push('/favorites');
        break;
      case 'saved':
        router.push('/library/saved');
        break;
      case 'collections':
        router.push('/library/collections');
        break;
      case 'downloads':
        router.push('/library/downloads');
        break;
      case 'finished':
        router.push('/library/finished');
        break;
      default:
        console.log(`Navigate to ${section}`);
    }
  };

  const handleSeeAll = () => {
    // Navigate to combined view or specific page
    console.log('See all library items');
  };

  const getTotalItems = () => {
    return libraryData.saved + 
           favorites.length + 
           libraryData.collections + 
           libraryData.downloads + 
           userStats.completedStories.length;
  };

  const getTotalListeningTime = () => {
    // Calculate total listening time in minutes
    const mockTotalMinutes = userStats.totalListeningTime || 1240;
    const hours = Math.floor(mockTotalMinutes / 60);
    const minutes = mockTotalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Library</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Library Sections */}
        <View style={styles.sectionsContainer}>
          <LibrarySection
            icon={<Bookmark size={20} color={colors.primary} />}
            title="Saved"
            itemCount={libraryData.saved}
            onPress={() => handleSectionPress('saved')}
            colors={colors}
          />
          
          <LibrarySection
            icon={<Heart size={20} color={colors.primary} />}
            title="Favorites"
            itemCount={favorites.length}
            onPress={() => handleSectionPress('favorites')}
            colors={colors}
          />
          
          <LibrarySection
            icon={<List size={20} color={colors.primary} />}
            title="Collections"
            itemCount={libraryData.collections}
            onPress={() => handleSectionPress('collections')}
            colors={colors}
          />
          
          <LibrarySection
            icon={<Download size={20} color={colors.primary} />}
            title="Downloads"
            itemCount={libraryData.downloads}
            onPress={() => handleSectionPress('downloads')}
            colors={colors}
          />
          
          <LibrarySection
            icon={<CheckCircle size={20} color={colors.primary} />}
            title="Finished"
            itemCount={userStats.completedStories.length}
            onPress={() => handleSectionPress('finished')}
            colors={colors}
          />
        </View>

        {/* Library Stats */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={[colors.primary + '20', colors.primary + '05']}
            style={styles.statsGradient}
          >
            <View style={styles.statsContent}>
              <View style={styles.statsHeader}>
                <Text style={[styles.statsTitle, { color: colors.text }]}>
                  Your Library Stats
                </Text>
                <Activity size={20} color={colors.primary} />
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Star size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {getTotalItems()}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Total Items
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#4CAF5020' }]}>
                    <Clock size={16} color="#4CAF50" />
                  </View>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {getTotalListeningTime()}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Listen Time
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#FF951920' }]}>
                    <TrendingUp size={16} color="#FF9519" />
                  </View>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {userStats.readingStreak || 12}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                    Day Streak
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Recently Added Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
              Recently Added
            </Text>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScroll}
          >
            {/* Mock recent items */}
            {[1, 2, 3, 4].map((item) => (
              <TouchableOpacity 
                key={item}
                style={[styles.recentItem, { backgroundColor: colors.card }]}
              >
                <View style={[styles.recentItemIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Play size={16} color={colors.primary} />
                </View>
                <Text style={[styles.recentItemTitle, { color: colors.text }]} numberOfLines={2}>
                  Recent Story {item}
                </Text>
                <Text style={[styles.recentItemDate, { color: colors.mutedText }]}>
                  2 days ago
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Library Sections
  sectionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionGradient: {
    padding: 16,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionCount: {
    fontSize: 14,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Stats Section
  statsSection: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsContent: {},
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Recent Section
  recentSection: {
    marginTop: 24,
    paddingLeft: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentScroll: {
    paddingRight: 20,
    gap: 12,
  },
  recentItem: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  recentItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  recentItemDate: {
    fontSize: 10,
  },
});