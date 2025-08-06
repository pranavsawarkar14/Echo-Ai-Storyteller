import Constants from 'expo-constants';

const PEXELS_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_PEXELS_API_KEY || process.env.EXPO_PUBLIC_PEXELS_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  full_res: string | null;
  tags: string[];
  url: string;
  image: string;
  avg_color: string | null;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    fps: number;
    link: string;
    size: number;
  }[];
  video_pictures: {
    id: number;
    nr: number;
    picture: string;
  }[];
}

export interface PexelsResponse<T> {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
  photos?: T[];
  videos?: T[];
}

export class PexelsAPI {
  private apiKey: string;

  constructor() {
    if (!PEXELS_API_KEY) {
      throw new Error('Pexels API key is not configured');
    }
    this.apiKey = PEXELS_API_KEY;
  }

  private async request<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${PEXELS_BASE_URL}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Photo Methods
  async searchPhotos(
    query: string, 
    page: number = 1, 
    perPage: number = 15, 
    orientation: 'landscape' | 'portrait' | 'square' = 'landscape'
  ): Promise<PexelsResponse<PexelsPhoto>> {
    return this.request('/search', {
      query,
      page,
      per_page: perPage,
      orientation,
    });
  }

  async getCuratedPhotos(page: number = 1, perPage: number = 15): Promise<PexelsResponse<PexelsPhoto>> {
    return this.request('/curated', {
      page,
      per_page: perPage,
    });
  }

  async getPhotoById(id: number): Promise<PexelsPhoto> {
    return this.request(`/photos/${id}`);
  }

  // Video Methods
  async searchVideos(
    query: string, 
    page: number = 1, 
    perPage: number = 15, 
    orientation: 'landscape' | 'portrait' | 'square' = 'landscape'
  ): Promise<PexelsResponse<PexelsVideo>> {
    return this.request('/videos/search', {
      query,
      page,
      per_page: perPage,
      orientation,
    });
  }

  async getPopularVideos(page: number = 1, perPage: number = 15): Promise<PexelsResponse<PexelsVideo>> {
    return this.request('/videos/popular', {
      page,
      per_page: perPage,
    });
  }

  async getVideoById(id: number): Promise<PexelsVideo> {
    return this.request(`/videos/videos/${id}`);
  }

  // Utility Methods
  getOptimalVideoUrl(video: PexelsVideo, quality: 'hd' | 'sd' | 'mobile' = 'hd'): string {
    const qualityMap = {
      hd: ['hd', 'sd'],
      sd: ['sd', 'hd'],
      mobile: ['mobile', 'sd', 'hd']
    };

    const preferredQualities = qualityMap[quality];
    
    for (const preferredQuality of preferredQualities) {
      const videoFile = video.video_files.find(file => 
        file.quality === preferredQuality && file.file_type === 'video/mp4'
      );
      if (videoFile) {
        return videoFile.link;
      }
    }

    // Fallback to the first available video file
    return video.video_files[0]?.link || '';
  }

  getVideoPreviewImage(video: PexelsVideo): string {
    return video.image;
  }

  // Collections for different story categories
  async getStoryImages(category: string): Promise<PexelsPhoto[]> {
    const categoryQueries: Record<string, string> = {
      'Adventure': 'mountain adventure exploration nature',
      'Mystery': 'dark forest mysterious shadows fog',
      'Sci-Fi': 'space technology futuristic galaxy stars',
      'Fantasy': 'magical forest castle fantasy mystical',
      'Horror': 'dark scary haunted gothic shadows',
      'Romance': 'couple love sunset romantic beautiful',
      'Drama': 'emotional portrait city dramatic',
      'Comedy': 'happy cheerful bright colorful fun',
      'Thriller': 'suspense dark city night tension',
      'Historical': 'vintage antique historical architecture',
      'Western': 'desert mountains sunset western landscape',
      'Crime': 'urban city night street detective',
    };

    const query = categoryQueries[category] || 'storytelling books reading';
    const response = await this.searchPhotos(query, 1, 10);
    return response.photos || [];
  }

  async getStoryVideos(category: string): Promise<PexelsVideo[]> {
    const categoryQueries: Record<string, string> = {
      'Adventure': 'mountain climbing hiking nature adventure',
      'Mystery': 'fog mysterious dark forest shadows',
      'Sci-Fi': 'space stars galaxy futuristic technology',
      'Fantasy': 'magical nature forest mystical',
      'Horror': 'dark scary horror mysterious',
      'Romance': 'sunset romantic couple love',
      'Drama': 'emotional cinematic dramatic',
      'Comedy': 'happy fun cheerful bright',
      'Thriller': 'suspense urban night city',
      'Historical': 'vintage historical architecture',
      'Western': 'desert landscape mountains sunset',
      'Crime': 'urban night city street',
    };

    const query = categoryQueries[category] || 'abstract cinematic';
    const response = await this.searchVideos(query, 1, 5);
    return response.videos || [];
  }
}

// Singleton instance
export const pexelsApi = new PexelsAPI();