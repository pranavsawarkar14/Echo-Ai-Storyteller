import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { 
  Play, 
  Star, 
  Clock, 
  Eye, 
  Video,
  Headphones,
  Heart,
  ChevronRight
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { FavoriteButton } from './FavoriteButton';
import { VideoPreview } from './VideoPreview';
import { MediaGallery } from './MediaGallery';
import { Story } from '@/mocks/stories';
import { MediaItem, mediaService } from '@/lib/mediaService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface EnhancedStoryGridProps {
  stories: Story[];
  onStoryPress: (story: Story) => void;
  onPlayStory: (story: Story) => void;
  title?: string;
  showHeader?: boolean;
}

export const EnhancedStoryGrid: React.FC<EnhancedStoryGridProps> = ({
  stories,
  onStoryPress,
  onPlayStory,
  title = "Stories",
  showHeader = true,
}) => {
  const { colors } = useTheme();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [enrichedStories, setEnrichedStories] = useState<Story[]>(stories);

  useEffect(() => {
    enrichStoriesWithMedia();
  }, [stories]);

  const enrichStoriesWithMedia = async () => {
    const enriched = await Promise.all(
      stories.map(async (story) => {
        // Skip if story already has additional media
        if (story.additionalMedia && story.additionalMedia.length > 0) {
          return story;
        }

        try {
          // Get media for the story's category
          const media = await mediaService.getMediaForCategory(story.category, true);
          const limitedMedia = media.slice(0, 5); // Limit to 5 items per story

          // Add video URL if not present and videos are available
          const videos = limitedMedia.filter(item => item.type === 'video');
          const videoUrl = videos.length > 0 && !story.videoUrl ? videos[0].url : story.videoUrl;
          const videoThumbnail = videos.length > 0 && !story.videoThumbnail ? videos[0].thumbnailUrl : story.videoThumbnail;

          return {
            ...story,
            videoUrl,
            videoThumbnail,
            mediaType: videos.length > 0 ? 'mixed' as const : story.mediaType || 'image' as const,
            additionalMedia: limitedMedia.map(item => ({
              type: item.type,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
              title: item.title,
              source: item.source,
            })),
          };
        } catch (error) {
          console.error('Error enriching story with media:', error);
          return story;
        }
      })
    );

    setEnrichedStories(enriched);
  };

  const StoryCard = ({ story, index }: { story: Story; index: number }) => {
    const [showVideo, setShowVideo] = useState(false);
    const cardScale = useSharedValue(1);
    const cardOpacity = useSharedValue(1);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    }));

    const handlePress = () => {
      console.log('Story card pressed:', story.title);
      cardScale.value = withSpring(0.95, {}, () => {
        cardScale.value = withSpring(1);
      });
      onStoryPress(story);
    };

    const handlePlayPress = (e: any) => {
      e.stopPropagation();
      console.log('Play button pressed:', story.title);
      onPlayStory(story);
    };

    const handleVideoToggle = (e: any) => {
      e.stopPropagation();
      setShowVideo(!showVideo);
    };

    const handleMediaGallery = (e: any) => {
      e.stopPropagation();
      setSelectedStory(story);
      setShowMediaGallery(true);
    };

    return (
      <Animated.View style={[styles.storyCard, cardAnimatedStyle]}>
        <TouchableOpacity 
          onPress={handlePress} 
          activeOpacity={0.8}
          style={styles.cardTouchable}
        >
          <View style={styles.imageContainer}>
            {story.videoUrl && showVideo ? (
              <VideoPreview
                videoUrl={story.videoUrl}
                thumbnailUrl={story.videoThumbnail || story.imageUrl}
                title={story.title}
                author={story.author}
                style={styles.cardImage}
                autoPlay={true}
                muted={true}
              />
            ) : (
              <Image
                source={{ uri: story.imageUrl }}
                style={styles.cardImage}
                contentFit="cover"
              />
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            />

            {/* Media Controls */}
            <View style={styles.mediaControls}>
              {story.videoUrl && (
                <TouchableOpacity
                  style={[
                    styles.mediaControlButton,
                    { backgroundColor: showVideo ? colors.primary : 'rgba(0,0,0,0.6)' }
                  ]}
                  onPress={handleVideoToggle}
                  activeOpacity={0.7}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Video size={14} color="white" />
                </TouchableOpacity>
              )}
              
              {story.additionalMedia && story.additionalMedia.length > 0 && (
                <TouchableOpacity
                  style={[styles.mediaControlButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                  onPress={handleMediaGallery}
                  activeOpacity={0.7}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Eye size={14} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Rating */}
            {story.rating && (
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{story.rating}</Text>
              </View>
            )}

            {/* Favorite */}
            <View style={styles.favoriteButton}>
              <FavoriteButton 
                story={story}
                size={16}
                showBackground={false}
                style={{ position: 'relative' }}
              />
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {story.title}
            </Text>
            
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.mutedText} />
                <Text style={[styles.metaText, { color: colors.mutedText }]}>
                  {story.duration}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Headphones size={12} color={colors.mutedText} />
                <Text style={[styles.metaText, { color: colors.mutedText }]}>
                  {story.chapters || 1}ch
                </Text>
              </View>
            </View>

            {story.description && (
              <Text style={[styles.cardDescription, { color: colors.mutedText }]} numberOfLines={2}>
                {story.description}
              </Text>
            )}

            {/* Play Button */}
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayPress}
              activeOpacity={0.8}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Play size={16} color="white" fill="white" />
              <Text style={styles.playButtonText}>Listen</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {enrichedStories.map((story, index) => (
          <StoryCard key={story.id} story={story} index={index} />
        ))}
      </ScrollView>

      {/* Media Gallery Modal */}
      {selectedStory && (
        <MediaGallery
          category={selectedStory.category}
          visible={showMediaGallery}
          onClose={() => {
            setShowMediaGallery(false);
            setSelectedStory(null);
          }}
          title={`${selectedStory.title} - Media`}
          maxItems={20}
          showVideos={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  storyCard: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaControls: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  mediaControlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});