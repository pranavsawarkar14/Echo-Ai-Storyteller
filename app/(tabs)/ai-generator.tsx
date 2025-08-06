import React, { useCallback } from "react";
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Sparkles, 
  Wand2, 
  BookOpen,
  Zap,
  Star,
  Brain,
  Lightbulb,
  PenTool,
  Play,
  ChevronRight
} from "lucide-react-native";
import { Header } from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: any;
  color: string;
  gradient: string[];
}

const quickPrompts: QuickPrompt[] = [
  {
    id: '1',
    title: 'Epic Adventure',
    description: 'A thrilling quest in a magical realm',
    prompt: 'Create an epic adventure story where a young hero discovers they have magical powers and must save their kingdom from an ancient evil.',
    icon: Wand2,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A855F7']
  },
  {
    id: '2',
    title: 'Mystery Detective',
    description: 'A puzzling case that needs solving',
    prompt: 'Write a mystery story about a detective investigating a series of strange disappearances in a small town, uncovering supernatural secrets.',
    icon: Brain,
    color: '#6366F1',
    gradient: ['#6366F1', '#8B5CF6']
  },
  {
    id: '3',
    title: 'Sci-Fi Future',
    description: 'Technology meets humanity',
    prompt: 'Create a science fiction story set in 2087 where artificial intelligence has evolved beyond human understanding.',
    icon: Zap,
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0891B2']
  },
  {
    id: '4',
    title: 'Romance Tale',
    description: 'A heartwarming love story',
    prompt: 'Write a romantic story about two people from different worlds who meet by chance and fall in love against all odds.',
    icon: Star,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706']
  },
  {
    id: '5',
    title: 'Horror Story',
    description: 'A spine-chilling tale',
    prompt: 'Create a horror story about a group of friends who discover an abandoned house with a dark secret that should have stayed buried.',
    icon: BookOpen,
    color: '#DC2626',
    gradient: ['#DC2626', '#B91C1C']
  },
  {
    id: '6',
    title: 'Fantasy Quest',
    description: 'Magic and mythical creatures',
    prompt: 'Write a fantasy story about a young mage who must collect three ancient artifacts to prevent the realm from falling into eternal darkness.',
    icon: Sparkles,
    color: '#10B981',
    gradient: ['#10B981', '#059669']
  }
];

export default function AIGeneratorScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleQuickPromptPress = useCallback((prompt: QuickPrompt) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/ai-story-generator",
      params: { prompt: prompt.prompt }
    });
  }, [router]);

  const handleCreateFromScratch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/ai-story-generator");
  }, [router]);

  // Hero Section Component
  const HeroSection = () => (
    <View style={styles.heroSection}>
      <LinearGradient
        colors={[colors.gradientStart || colors.primary, colors.gradientEnd || colors.primaryDark || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Brain size={48} color="white" />
          </View>
          <Text style={styles.heroTitle}>AI Story Generator</Text>
          <Text style={styles.heroSubtitle}>
            Transform your ideas into captivating stories with the power of AI
          </Text>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateFromScratch}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.createButtonGradient}
            >
              <PenTool size={20} color="white" />
              <Text style={styles.createButtonText}>Create from Scratch</Text>
              <ChevronRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  // Quick Prompts Section
  const QuickPromptsSection = () => (
    <View style={styles.quickPromptsSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Start Templates</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedText }]}>
          Choose a template to get started quickly
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.promptsContainer}
      >
        {quickPrompts.map((prompt, index) => (
          <TouchableOpacity
            key={prompt.id}
            style={[styles.promptCard, { 
              backgroundColor: colors.card,
              borderColor: colors.border + '40'
            }]}
            onPress={() => handleQuickPromptPress(prompt)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[prompt.gradient[0] + '15', prompt.gradient[1] + '05']}
              style={styles.promptCardGradient}
            >
              <View style={styles.promptCardContent}>
                <View style={[styles.promptIconContainer, { backgroundColor: prompt.color + '20' }]}>
                  <prompt.icon size={24} color={prompt.color} />
                </View>
                
                <View style={styles.promptTextContainer}>
                  <Text style={[styles.promptTitle, { color: colors.text }]}>
                    {prompt.title}
                  </Text>
                  <Text style={[styles.promptDescription, { color: colors.mutedText }]} numberOfLines={2}>
                    {prompt.description}
                  </Text>
                </View>

                <View style={styles.promptAction}>
                  <View style={[styles.playIconContainer, { backgroundColor: prompt.color + '20' }]}>
                    <Play size={14} color={prompt.color} fill={prompt.color} />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Features Section
  const FeaturesSection = () => (
    <View style={styles.featuresSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Features</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedText }]}>
          Powered by advanced AI technology
        </Text>
      </View>

      <View style={styles.featuresGrid}>
        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border + '40' }]}>
          <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Lightbulb size={28} color={colors.primary} />
          </View>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Ideas</Text>
          <Text style={[styles.featureDescription, { color: colors.mutedText }]}>
            AI suggests creative plot twists and character development
          </Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border + '40' }]}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#10B981' + '20' }]}>
            <BookOpen size={28} color="#10B981" />
          </View>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Multiple Chapters</Text>
          <Text style={[styles.featureDescription, { color: colors.mutedText }]}>
            Generate stories with multiple engaging chapters
          </Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border + '40' }]}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
            <Zap size={28} color="#F59E0B" />
          </View>
          <Text style={[styles.featureTitle, { color: colors.text }]}>Instant Generation</Text>
          <Text style={[styles.featureDescription, { color: colors.mutedText }]}>
            Create compelling stories in seconds, not hours
          </Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border + '40' }]}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
            <Star size={28} color="#8B5CF6" />
          </View>
          <Text style={[styles.featureTitle, { color: colors.text }]}>High Quality</Text>
          <Text style={[styles.featureDescription, { color: colors.mutedText }]}>
            Professional-grade storytelling with rich imagery
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Create Story" subtitle="Unleash Your Imagination with AI"/>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroSection />
        <QuickPromptsSection />
        <FeaturesSection />
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
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  
  // Hero Section
  heroSection: {
    margin: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroGradient: {
    padding: 30,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },

  // Quick Prompts Section
  quickPromptsSection: {
    marginBottom: 30,
  },
  promptsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  promptCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  promptCardGradient: {
    padding: 16,
  },
  promptCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  promptTextContainer: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  promptDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  promptAction: {
    marginLeft: 12,
  },
  playIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Features Section
  featuresSection: {
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    width: (screenWidth - 52) / 2, // Account for padding and gap
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});