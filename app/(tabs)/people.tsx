import React, { useState, useCallback, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  TextInput,
  Dimensions,
  StatusBar
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
} from "react-native-reanimated";
import { 
  Search, 
  Filter,
  Users,
  BookOpen,
  Star,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Heart,
  MessageCircle,
  ChevronRight,
  Zap,
  Crown,
  Sword,
  Shield,
  Wand2
} from "lucide-react-native";
import { Header } from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Character {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  description: string;
  personality: string[];
  stories: string[];
  totalAppearances: number;
  fanFavorite: boolean;
  origin: string;
  createdDate: string;
  abilities: string[];
  relationships: { characterId: string; relationship: string }[];
  popularity: number;
  characterType: 'protagonist' | 'antagonist' | 'supporting' | 'narrator';
  voiceStyle: string;
  backgroundStory: string;
}

const characters: Character[] = [
  {
    id: "1",
    name: "Professor Marina Artemis",
    role: "Marine Archaeologist",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1287&auto=format&fit=crop",
    description: "A brilliant archaeologist who specializes in underwater civilizations and ancient mysteries.",
    personality: ["Curious", "Brave", "Analytical", "Determined"],
    stories: ["The Lost City of Atlantis", "Secrets of the Deep", "Ancient Echoes"],
    totalAppearances: 15,
    fanFavorite: true,
    origin: "Cambridge, England",
    createdDate: "2024-01-01",
    abilities: ["Deep Sea Diving", "Ancient Languages", "Archaeological Research", "Problem Solving"],
    relationships: [
      { characterId: "2", relationship: "Research Partner" },
      { characterId: "3", relationship: "Mentor" }
    ],
    popularity: 98,
    characterType: 'protagonist',
    voiceStyle: "Intelligent and confident with a British accent",
    backgroundStory: "Born into a family of historians, Marina always felt drawn to the mysteries beneath the waves."
  },
  {
    id: "2",
    name: "Captain Elara Stormwind",
    role: "Airship Captain",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1287&auto=format&fit=crop",
    description: "A fearless captain who navigates both the skies and the seas with unmatched skill.",
    personality: ["Brave", "Leader", "Adventurous", "Loyal"],
    stories: ["Journey to the Stars", "Sky Pirates", "The Floating Islands"],
    totalAppearances: 12,
    fanFavorite: true,
    origin: "The Sky Cities",
    createdDate: "2024-01-05",
    abilities: ["Navigation", "Combat", "Leadership", "Aircraft Piloting"],
    relationships: [
      { characterId: "1", relationship: "Research Partner" },
      { characterId: "4", relationship: "Rival" }
    ],
    popularity: 95,
    characterType: 'protagonist',
    voiceStyle: "Strong and commanding with hints of wanderlust",
    backgroundStory: "Raised among the clouds, Elara learned to navigate by the stars before she could walk."
  },
  {
    id: "3",
    name: "Dr. Marcus Blackthorne",
    role: "Mystic Scholar",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1287&auto=format&fit=crop",
    description: "An enigmatic scholar who bridges the gap between science and magic.",
    personality: ["Wise", "Mysterious", "Patient", "Knowledgeable"],
    stories: ["The Clockmaker's Secret", "Whispers in the Dark Forest", "The Time Weaver"],
    totalAppearances: 18,
    fanFavorite: false,
    origin: "The Ancient Libraries",
    createdDate: "2023-12-15",
    abilities: ["Ancient Magic", "Time Manipulation", "Scholarly Research", "Mentorship"],
    relationships: [
      { characterId: "1", relationship: "Mentor" },
      { characterId: "5", relationship: "Old Friend" }
    ],
    popularity: 87,
    characterType: 'supporting',
    voiceStyle: "Deep and thoughtful with an air of ancient wisdom",
    backgroundStory: "Guardian of forbidden knowledge, Marcus has spent centuries protecting dangerous secrets."
  },
  {
    id: "4",
    name: "Luna Shadowdancer",
    role: "Mystical Guide",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    description: "A mysterious guide who appears when heroes need her most, always knowing the way.",
    personality: ["Enigmatic", "Helpful", "Intuitive", "Secretive"],
    stories: ["Whispers in the Dark Forest", "The Shadow Realm", "Moon's Edge"],
    totalAppearances: 8,
    fanFavorite: true,
    origin: "The Shadow Realm",
    createdDate: "2024-01-10",
    abilities: ["Shadow Magic", "Pathfinding", "Stealth", "Prophecy"],
    relationships: [
      { characterId: "2", relationship: "Rival" },
      { characterId: "6", relationship: "Sister" }
    ],
    popularity: 92,
    characterType: 'supporting',
    voiceStyle: "Soft and melodic with hints of mystery",
    backgroundStory: "Born between worlds, Luna walks the line between light and shadow."
  },
  {
    id: "5",
    name: "Commander Zane Ironwood",
    role: "Military Strategist",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1287&auto=format&fit=crop",
    description: "A tactical genius and veteran commander who protects the realm from ancient threats.",
    personality: ["Strategic", "Honor-bound", "Protective", "Disciplined"],
    stories: ["The Last Stand", "Guardians of the Realm", "War of the Ancients"],
    totalAppearances: 10,
    fanFavorite: false,
    origin: "The Iron Citadel",
    createdDate: "2023-12-20",
    abilities: ["Military Strategy", "Combat Leadership", "Weapon Mastery", "Tactical Analysis"],
    relationships: [
      { characterId: "3", relationship: "Old Friend" },
      { characterId: "7", relationship: "Nemesis" }
    ],
    popularity: 84,
    characterType: 'protagonist',
    voiceStyle: "Authoritative and measured with military precision",
    backgroundStory: "Forged in battle, Zane carries the weight of countless victories and losses."
  },
  {
    id: "6",
    name: "The Storyteller",
    role: "Narrator of Tales",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1170&auto=format&fit=crop",
    description: "The eternal narrator whose voice weaves all stories together across time and space.",
    personality: ["Wise", "Omniscient", "Compassionate", "Timeless"],
    stories: ["All Stories", "The Beginning", "The End of All Things"],
    totalAppearances: 25,
    fanFavorite: true,
    origin: "Beyond Time",
    createdDate: "2023-01-01",
    abilities: ["Omniscience", "Reality Shaping", "Time Sight", "Universal Knowledge"],
    relationships: [
      { characterId: "4", relationship: "Sister" }
    ],
    popularity: 100,
    characterType: 'narrator',
    voiceStyle: "Ancient and warm, like stories told by firelight",
    backgroundStory: "The first voice in the darkness, bringing light through the power of story."
  }
];

const characterTypes = [
  { key: 'all', label: 'All Characters', icon: Users },
  { key: 'protagonist', label: 'Heroes', icon: Crown },
  { key: 'antagonist', label: 'Villains', icon: Sword },
  { key: 'supporting', label: 'Supporting', icon: Shield },
  { key: 'narrator', label: 'Narrators', icon: Wand2 },
];

export default function PeopleScreen() {
  const { colors } = useTheme();
  
  // State management
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Animation values
  const scrollY = useSharedValue(0);

  // Filter characters
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || character.characterType === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Get featured character (highest popularity)
  const featuredCharacter = characters.reduce((prev, current) => 
    prev.popularity > current.popularity ? prev : current
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Handle character press
  const handleCharacterPress = useCallback((character: Character) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCharacter(character);
    // Here you would navigate to character detail page
    console.log("Character selected:", character.name);
  }, []);

  // Featured Character Section
  const FeaturedCharacterSection = () => (
    <View style={styles.featuredSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Character</Text>
      
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => handleCharacterPress(featuredCharacter)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: featuredCharacter.imageUrl }}
          style={styles.featuredImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredTags}>
              <View style={[styles.featuredTag, { backgroundColor: colors.primary + '40' }]}>
                <Crown size={12} color={colors.primary} />
                <Text style={[styles.featuredTagText, { color: colors.primary }]}>
                  Featured
                </Text>
              </View>
              <View style={styles.popularityBadge}>
                <TrendingUp size={12} color="white" />
                <Text style={styles.popularityText}>{featuredCharacter.popularity}%</Text>
              </View>
            </View>
            
            <Text style={styles.featuredName}>{featuredCharacter.name}</Text>
            <Text style={styles.featuredRole}>{featuredCharacter.role}</Text>
            <Text style={styles.featuredDescription} numberOfLines={3}>
              {featuredCharacter.description}
            </Text>
            
            <View style={styles.featuredStats}>
              <View style={styles.statItem}>
                <BookOpen size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>{featuredCharacter.stories.length} Stories</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>{featuredCharacter.totalAppearances} Appearances</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Character Type Filter
  const CharacterTypeFilter = () => (
    <View style={styles.filterSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {characterTypes.map((type) => {
          const isSelected = selectedType === type.key;
          const IconComponent = type.icon;
          
          return (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterButton,
                { 
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                }
              ]}
              onPress={() => {
                setSelectedType(type.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.8}
            >
              <IconComponent 
                size={16} 
                color={isSelected ? 'white' : colors.mutedText} 
              />
              <Text 
                style={[
                  styles.filterText,
                  { color: isSelected ? 'white' : colors.mutedText }
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Character Card Component
  const CharacterCard = ({ character, index }: { character: Character; index: number }) => {
    const cardScale = useSharedValue(1);
    const cardOpacity = useSharedValue(1);
    const isFanFavorite = character.fanFavorite;

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: cardScale.value }],
        opacity: cardOpacity.value,
      };
    });

    const handlePressIn = () => {
      cardScale.value = withSpring(0.95);
      cardOpacity.value = withTiming(0.8);
    };

    const handlePressOut = () => {
      cardScale.value = withSpring(1);
      cardOpacity.value = withTiming(1);
    };

    const handlePress = () => {
      handleCharacterPress(character);
    };

    return (
      <AnimatedTouchableOpacity
        style={[
          styles.characterCard,
          { backgroundColor: colors.card },
          animatedStyle
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.characterImageContainer}>
          <Image
            source={{ uri: character.imageUrl }}
            style={styles.characterImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.characterGradient}
          />
          
          {/* Character Type Badge */}
          <View style={styles.characterTypeBadge}>
            <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                {character.characterType.charAt(0).toUpperCase() + character.characterType.slice(1)}
              </Text>
            </View>
          </View>

          {/* Popularity indicator */}
          <View style={styles.popularityIndicator}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.popularityNumber}>{character.popularity}%</Text>
          </View>
        </View>

        <View style={styles.characterInfo}>
          <View style={styles.characterHeader}>
            <View style={styles.nameContainer}>
              <Text style={[styles.characterName, { color: colors.text }]} numberOfLines={1}>
                {character.name}
              </Text>
              {isFanFavorite && (
                <Heart size={16} color="#ff6b6b" fill="#ff6b6b" />
              )}
            </View>
            
            <View style={styles.roleRow}>
              <Text style={[styles.characterRole, { color: colors.mutedText }]} numberOfLines={1}>
                {character.role}
              </Text>
            </View>
          </View>

          <Text style={[styles.characterDescription, { color: colors.mutedText }]} numberOfLines={2}>
            {character.description}
          </Text>

          <View style={styles.characterStats}>
            <View style={styles.statItem}>
              <BookOpen size={12} color={colors.mutedText} />
              <Text style={[styles.statText, { color: colors.mutedText }]}>
                {character.stories.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Users size={12} color={colors.mutedText} />
              <Text style={[styles.statText, { color: colors.mutedText }]}>
                {character.totalAppearances}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  // Search Header
  const SearchHeader = () => (
    <View style={styles.searchSection}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.mutedText} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search characters..."
          placeholderTextColor={colors.mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearButton, { color: colors.mutedText }]}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Stats Section
  const StatsSection = () => (
    <View style={styles.statsSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Character Stats</Text>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Users size={20} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {characters.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Characters</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Heart size={20} color="#ff6b6b" />
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {characters.filter(c => c.fanFavorite).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Fan Favorites</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <BookOpen size={20} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {characters.reduce((sum, c) => sum + c.stories.length, 0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Total Stories</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Star size={20} color="#FFD700" />
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {Math.round(characters.reduce((sum, c) => sum + c.popularity, 0) / characters.length)}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Avg Popularity</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <Header title="Characters" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <SearchHeader />
        <CharacterTypeFilter />
        <FeaturedCharacterSection />
        <StatsSection />
        
        <View style={styles.charactersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedType === 'all' ? 'All Characters' : `${characterTypes.find(t => t.key === selectedType)?.label} Characters`}
          </Text>
          
          <View style={styles.charactersGrid}>
            {filteredCharacters.map((character, index) => (
              <CharacterCard key={character.id} character={character} index={index} />
            ))}
          </View>
          
          {filteredCharacters.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color={colors.mutedText} />
              <Text style={[styles.emptyStateText, { color: colors.mutedText }]}>
                No characters found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterContainer: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  featuredCard: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredTags: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredRole: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  charactersSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  characterCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  characterImageContainer: {
    height: 160,
    position: 'relative',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  characterTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  popularityIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  popularityNumber: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  characterInfo: {
    padding: 12,
  },
  characterHeader: {
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  characterDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  characterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
  },
});