import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  ArrowLeft,
  List,
  Play,
  MoreVertical,
  Search,
  Plus,
  Users,
  Lock,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Collection {
  id: string;
  title: string;
  description: string;
  storyCount: number;
  coverImages: string[]; // Up to 4 images for the grid layout
  isPrivate: boolean;
  createdAt: string;
  totalDuration: string;
}

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
  colors: any;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onPress, colors }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.collectionCard, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.collectionCardTouchable, { backgroundColor: colors.card }]}
      >
        <View style={styles.collectionImageContainer}>
          {/* Create a grid of up to 4 cover images */}
          <View style={styles.imageGrid}>
            {collection.coverImages.slice(0, 4).map((imageUrl, index) => (
              <View
                key={index}
                style={[
                  styles.gridImage,
                  {
                    width: collection.coverImages.length === 1 ? '100%' : '49%',
                    height: collection.coverImages.length <= 2 ? '100%' : '49%',
                  }
                ]}
              >
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.collectionImageGradient}
          />
          
          <View style={styles.playAllButtonOverlay}>
            <BlurView intensity={20} style={styles.playAllButton}>
              <Play size={16} color="white" fill="white" />
            </BlurView>
          </View>

          {collection.isPrivate && (
            <View style={styles.privateIndicator}>
              <BlurView intensity={20} style={styles.privateBadge}>
                <Lock size={12} color="#FF9500" />
              </BlurView>
            </View>
          )}
        </View>

        <View style={styles.collectionContent}>
          <Text style={[styles.collectionTitle, { color: colors.text }]} numberOfLines={2}>
            {collection.title}
          </Text>
          <Text style={[styles.collectionDescription, { color: colors.mutedText }]} numberOfLines={2}>
            {collection.description}
          </Text>
          
          <View style={styles.collectionMeta}>
            <View style={styles.metaItem}>
              <Users size={12} color={colors.mutedText} />
              <Text style={[styles.metaText, { color: colors.mutedText }]}>
                {collection.storyCount} stories
              </Text>
            </View>
            <Text style={[styles.metaText, { color: colors.mutedText }]}>
              {collection.totalDuration}
            </Text>
          </View>

          <View style={styles.collectionActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => {/* Handle play all */}}
            >
              <Play size={14} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Play All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.moreButton, { backgroundColor: colors.primary + '20' }]}>
              <MoreVertical size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mock collections data
const mockCollections: Collection[] = [
  {
    id: "collection-1",
    title: "Sci-Fi Adventures",
    description: "Epic space journeys and futuristic tales",
    storyCount: 12,
    coverImages: [
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1222",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1169",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1170",
      "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1174"
    ],
    isPrivate: false,
    createdAt: "2024-01-15",
    totalDuration: "3h 24m",
  },
  {
    id: "collection-2",
    title: "Mystery & Thriller",
    description: "Dark secrets and suspenseful stories",
    storyCount: 8,
    coverImages: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1170",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1169",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1170"
    ],
    isPrivate: true,
    createdAt: "2024-01-10",
    totalDuration: "2h 16m",
  },
  {
    id: "collection-3",
    title: "Fantasy Realms",
    description: "Magical worlds and legendary creatures",
    storyCount: 15,
    coverImages: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1169",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1170",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1170",
      "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?q=80&w=1074"
    ],
    isPrivate: false,
    createdAt: "2024-01-08",
    totalDuration: "4h 12m",
  },
  {
    id: "collection-4",
    title: "Bedtime Stories",
    description: "Calm and soothing tales for rest",
    storyCount: 6,
    coverImages: [
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1170",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1170"
    ],
    isPrivate: false,
    createdAt: "2024-01-05",
    totalDuration: "1h 48m",
  },
];

export default function CollectionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [collections] = useState(mockCollections);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCollectionPress = (collection: Collection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to collection details
    console.log(`Navigate to collection: ${collection.title}`);
  };

  const handleCreateCollection = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to create collection screen
    console.log("Create new collection");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Collections</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Search size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsHeader}>
        <LinearGradient
          colors={[colors.primary + '20', colors.primary + '05']}
          style={styles.statsGradient}
        >
          <View style={styles.statsContent}>
            <View style={styles.statsLeft}>
              <View style={[styles.statsIcon, { backgroundColor: colors.primary + '20' }]}>
                <List size={24} color={colors.primary} />
              </View>
              <View style={styles.statsInfo}>
                <Text style={[styles.statsNumber, { color: colors.text }]}>
                  {collections.length}
                </Text>
                <Text style={[styles.statsLabel, { color: colors.mutedText }]}>
                  Collections
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateCollection}
            >
              <Plus size={16} color="white" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.collectionsGrid}>
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onPress={() => handleCollectionPress(collection)}
              colors={colors}
            />
          ))}
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsInfo: {},
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  collectionsGrid: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  collectionCard: {
    width: '100%',
  },
  collectionCardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  collectionImageContainer: {
    position: 'relative',
    height: 160,
  },
  imageGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridImage: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  collectionImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playAllButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  playAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  privateIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  privateBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  collectionContent: {
    padding: 16,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  collectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  collectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});