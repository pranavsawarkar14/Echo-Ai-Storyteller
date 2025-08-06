import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
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
import { X, Play, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { VideoPreview } from './VideoPreview';
import { MediaItem, mediaService } from '@/lib/mediaService';

const { width, height } = Dimensions.get('window');

interface MediaGalleryProps {
  category: string;
  visible: boolean;
  onClose: () => void;
  onMediaSelect?: (media: MediaItem) => void;
  title?: string;
  maxItems?: number;
  showVideos?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  category,
  visible,
  onClose,
  onMediaSelect,
  title = 'Media Gallery',
  maxItems = 50,
  showVideos = true,
}) => {
  const { colors } = useTheme();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Animation values
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, { damping: 20 });
      modalOpacity.value = withTiming(1);
      loadMedia();
    } else {
      modalScale.value = withTiming(0);
      modalOpacity.value = withTiming(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      loadMedia();
    }
  }, [category, visible]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const media = await mediaService.getMediaForCategory(category, showVideos);
      setMediaItems(media.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = mediaItems.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'images') return item.type === 'image';
    if (selectedFilter === 'videos') return item.type === 'video';
    return true;
  });

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const handleMediaPress = (media: MediaItem) => {
    if (onMediaSelect) {
      onMediaSelect(media);
      onClose();
    } else {
      setSelectedMedia(media);
    }
  };

  const MediaCard = ({ item, index }: { item: MediaItem; index: number }) => {
    const cardScale = useSharedValue(1);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    const handlePress = () => {
      cardScale.value = withSpring(0.95, {}, () => {
        cardScale.value = withSpring(1);
      });
      handleMediaPress(item);
    };

    if (item.type === 'video') {
      return (
        <Animated.View style={[styles.mediaCard, cardAnimatedStyle]}>
          <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
            <VideoPreview
              videoUrl={item.url}
              thumbnailUrl={item.thumbnailUrl || item.url}
              title={item.title}
              author={item.author}
              duration={item.duration}
              style={styles.videoPreview}
              autoPlay={true}
              muted={true}
            />
            <View style={styles.mediaTypeIndicator}>
              <VideoIcon size={16} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.mediaCard, cardAnimatedStyle]}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <Image
            source={{ uri: item.thumbnailUrl || item.url }}
            style={styles.mediaImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.mediaGradient}
          >
            <View style={styles.mediaInfo}>
              {item.title && (
                <Text style={styles.mediaTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              )}
              {item.author && (
                <Text style={styles.mediaAuthor} numberOfLines={1}>
                  {item.author}
                </Text>
              )}
            </View>
          </LinearGradient>
          <View style={styles.mediaTypeIndicator}>
            <ImageIcon size={16} color="white" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const FilterButton = ({ 
    filter, 
    label, 
    icon: IconComponent 
  }: { 
    filter: 'all' | 'images' | 'videos'; 
    label: string; 
    icon: any;
  }) => {
    const isSelected = selectedFilter === filter;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          { 
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        onPress={() => setSelectedFilter(filter)}
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
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={20} style={styles.modalBlur}>
          <Animated.View style={[styles.modalContent, { backgroundColor: colors.background }, modalAnimatedStyle]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <FilterButton filter="all" label="All" icon={Play} />
                <FilterButton filter="images" label="Images" icon={ImageIcon} />
                <FilterButton filter="videos" label="Videos" icon={VideoIcon} />
              </ScrollView>
            </View>

            {/* Media Grid */}
            <ScrollView 
              style={styles.mediaContainer}
              contentContainerStyle={styles.mediaGrid}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.mutedText }]}>
                    Loading media...
                  </Text>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {filteredMedia.map((item, index) => (
                    <MediaCard key={item.id} item={item} index={index} />
                  ))}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </BlurView>
      </View>

      {/* Full Screen Media Modal */}
      {selectedMedia && (
        <Modal
          visible={!!selectedMedia}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMedia(null)}
        >
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity 
              style={styles.fullScreenBackground}
              onPress={() => setSelectedMedia(null)}
              activeOpacity={1}
            >
              <BlurView intensity={30} style={styles.fullScreenBlur}>
                <View style={styles.fullScreenContent}>
                  {selectedMedia.type === 'video' ? (
                    <VideoPreview
                      videoUrl={selectedMedia.url}
                      thumbnailUrl={selectedMedia.thumbnailUrl || selectedMedia.url}
                      title={selectedMedia.title}
                      author={selectedMedia.author}
                      duration={selectedMedia.duration}
                      style={styles.fullScreenVideo}
                      autoPlay={true}
                      muted={false}
                    />
                  ) : (
                    <Image
                      source={{ uri: selectedMedia.url }}
                      style={styles.fullScreenImage}
                      contentFit="contain"
                    />
                  )}
                  
                  <TouchableOpacity 
                    style={styles.fullScreenCloseButton}
                    onPress={() => setSelectedMedia(null)}
                  >
                    <BlurView intensity={20} style={styles.closeButtonBlur}>
                      <X size={24} color="white" />
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mediaContainer: {
    flex: 1,
  },
  mediaGrid: {
    padding: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediaCard: {
    width: '48%',
    aspectRatio: 4/3,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  mediaGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  mediaInfo: {
    padding: 12,
  },
  mediaTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  mediaAuthor: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  mediaTypeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenBackground: {
    flex: 1,
  },
  fullScreenBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContent: {
    width: '90%',
    height: '80%',
    position: 'relative',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});