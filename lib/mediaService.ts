import { pexelsApi, PexelsPhoto, PexelsVideo } from './pexelsApi';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  author?: string;
  source: 'pexels' | 'unsplash';
  duration?: number; // for videos in seconds
  quality?: 'hd' | 'sd' | 'mobile';
}

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  alt_description?: string;
}

export class MediaService {
  private unsplashAccessKey: string;

  constructor() {
    this.unsplashAccessKey = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';
  }

  // Unsplash Methods
  async searchUnsplashPhotos(query: string, page: number = 1, perPage: number = 15): Promise<UnsplashPhoto[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching Unsplash photos:', error);
      return [];
    }
  }

  // Combined Media Methods
  async getMediaForCategory(category: string, includeVideos: boolean = true): Promise<MediaItem[]> {
    const mediaItems: MediaItem[] = [];

    try {
      // Get Pexels photos
      const pexelsPhotos = await pexelsApi.getStoryImages(category);
      const pexelsPhotoItems: MediaItem[] = pexelsPhotos.map(photo => ({
        id: `pexels-photo-${photo.id}`,
        type: 'image' as const,
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        title: photo.alt,
        author: photo.photographer,
        source: 'pexels' as const,
      }));

      // Get Unsplash photos
      const unsplashPhotos = await this.searchUnsplashPhotos(category, 1, 10);
      const unsplashPhotoItems: MediaItem[] = unsplashPhotos.map(photo => ({
        id: `unsplash-photo-${photo.id}`,
        type: 'image' as const,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        title: photo.alt_description || '',
        author: photo.user.name,
        source: 'unsplash' as const,
      }));

      mediaItems.push(...pexelsPhotoItems, ...unsplashPhotoItems);

      // Get Pexels videos if requested
      if (includeVideos) {
        const pexelsVideos = await pexelsApi.getStoryVideos(category);
        const videoItems: MediaItem[] = pexelsVideos.map(video => ({
          id: `pexels-video-${video.id}`,
          type: 'video' as const,
          url: pexelsApi.getOptimalVideoUrl(video, 'hd'),
          thumbnailUrl: video.image,
          title: video.tags.join(', '),
          author: video.user.name,
          source: 'pexels' as const,
          duration: video.duration,
          quality: 'hd' as const,
        }));

        mediaItems.push(...videoItems);
      }

      // Shuffle the results to mix sources
      return this.shuffleArray(mediaItems);
    } catch (error) {
      console.error('Error fetching media for category:', error);
      return [];
    }
  }

  async getRandomMediaMix(count: number = 20): Promise<MediaItem[]> {
    const categories = [
      'Adventure', 'Mystery', 'Sci-Fi', 'Fantasy', 'Horror', 
      'Romance', 'Drama', 'Comedy', 'Thriller'
    ];

    const allMedia: MediaItem[] = [];

    // Get a few items from each category
    for (const category of categories.slice(0, 3)) {
      const categoryMedia = await this.getMediaForCategory(category, true);
      allMedia.push(...categoryMedia.slice(0, Math.ceil(count / 3)));
    }

    return this.shuffleArray(allMedia).slice(0, count);
  }

  async getVideoPreviewsForStory(storyCategory: string): Promise<MediaItem[]> {
    try {
      const videos = await pexelsApi.getStoryVideos(storyCategory);
      return videos.map(video => ({
        id: `pexels-video-${video.id}`,
        type: 'video' as const,
        url: pexelsApi.getOptimalVideoUrl(video, 'mobile'),
        thumbnailUrl: video.image,
        title: video.tags.join(', '),
        author: video.user.name,
        source: 'pexels' as const,
        duration: video.duration,
        quality: 'mobile' as const,
      }));
    } catch (error) {
      console.error('Error fetching video previews:', error);
      return [];
    }
  }

  // Utility method to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Hash function for consistent story-video mapping
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  // Get a single video preview for a story (unique per story)
  async getUniqueVideoForStory(storyId: string, category: string): Promise<MediaItem | null> {
    try {
      const videos = await this.getVideoPreviewsForStory(category);
      if (videos.length === 0) return null;
      
      // Use story ID to consistently get the same video for the same story
      const storyHash = this.hashCode(storyId);
      const index = Math.abs(storyHash) % videos.length;
      
      return videos[index];
    } catch (error) {
      console.error('Error getting unique video for story:', error);
      return null;
    }
  }

  // Get different videos for different stories in the same category
  async getUniqueVideosForStories(stories: Array<{id: string, category: string}>): Promise<Record<string, MediaItem | null>> {
    const result: Record<string, MediaItem | null> = {};
    
    try {
      for (const story of stories) {
        const videos = await this.getVideoPreviewsForStory(story.category);
        if (videos.length === 0) {
          result[story.id] = null;
          continue;
        }
        
        // Use story ID hash to get consistent but different videos for each story
        const storyHash = this.hashCode(story.id + story.category);
        const index = Math.abs(storyHash) % videos.length;
        result[story.id] = videos[index];
      }
    } catch (error) {
      console.error('Error getting unique videos for stories:', error);
    }
    
    return result;
  }

  // Get optimal media for specific use cases
  async getHeroMedia(category: string): Promise<MediaItem | null> {
    const media = await this.getMediaForCategory(category, true);
    // Prefer videos for hero sections
    const videos = media.filter(item => item.type === 'video');
    if (videos.length > 0) {
      return videos[0];
    }
    return media[0] || null;
  }

  async getThumbnailMedia(category: string): Promise<MediaItem[]> {
    const media = await this.getMediaForCategory(category, false);
    // For thumbnails, prefer images
    return media.filter(item => item.type === 'image').slice(0, 10);
  }
}

export const mediaService = new MediaService();