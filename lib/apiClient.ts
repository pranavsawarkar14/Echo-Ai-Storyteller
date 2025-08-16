import { useAuth } from '@clerk/clerk-expo';
import { useState, useCallback } from 'react';
import Constants from 'expo-constants';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface StoryData {
  _id?: string;
  title: string;
  content: string;
  category: string;
  duration: string;
  description: string;
  chapters: Array<{
    title: string;
    text: string;
    image?: string;
  }>;
  author: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  playCount?: number;
  isPublic?: boolean;
  generationParams?: any;
}

export const useApiClient = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Use Constants to access environment variables for better compatibility with Expo and Vercel
  const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 
                 (typeof Constants !== 'undefined' && Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL) || 
                 'http://localhost:3001/api';

  const makeRequest = useCallback(async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      setIsLoading(true);
      
      // Get the JWT token from Clerk
      const token = await getToken();
      
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Check if it's a network connectivity issue (likely MongoDB Atlas IP whitelist)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('Network connectivity issue - likely MongoDB Atlas IP whitelist restriction');
        console.log('Stories will be saved locally until backend connection is restored');
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    } finally {
      setIsLoading(false);
    }
  }, [getToken, baseURL]);

  // Story API methods
  const createStory = useCallback(async (storyData: StoryData): Promise<ApiResponse<StoryData>> => {
    return makeRequest<StoryData>('/stories', {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
  }, [makeRequest]);

  const saveStory = useCallback(async (storyData: StoryData): Promise<ApiResponse<StoryData>> => {
    return createStory(storyData);
  }, [createStory]);

  const getMyStories = useCallback(async (): Promise<ApiResponse<StoryData[]>> => {
    return makeRequest<StoryData[]>('/stories');
  }, [makeRequest]);

  const getAllStoriesAdmin = useCallback(async (params?: {
    limit?: number;
    skip?: number;
    moderationStatus?: string;
  }): Promise<ApiResponse<StoryData[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.moderationStatus) queryParams.append('moderationStatus', params.moderationStatus);

    const query = queryParams.toString();
    return makeRequest<StoryData[]>(`/stories/all${query ? `?${query}` : ''}`);
  }, [makeRequest]);

  const deleteStory = useCallback(async (storyId: string): Promise<ApiResponse> => {
    return makeRequest(`/stories/${storyId}`, {
      method: 'DELETE',
    });
  }, [makeRequest]);

  const updateStory = useCallback(async (storyId: string, updates: Partial<StoryData>): Promise<ApiResponse<StoryData>> => {
    return makeRequest<StoryData>(`/stories/${storyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }, [makeRequest]);

  // Admin methods
  const getAnalytics = useCallback(async (): Promise<ApiResponse<any>> => {
    return makeRequest('/admin/analytics');
  }, [makeRequest]);

  const moderateStory = useCallback(async (
    storyId: string, 
    action: 'approve' | 'reject', 
    reason?: string
  ): Promise<ApiResponse> => {
    return makeRequest(`/admin/stories/${storyId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }, [makeRequest]);

  // Health check
  const healthCheck = useCallback(async (): Promise<ApiResponse> => {
    return makeRequest('/health');
  }, [makeRequest]);

  return {
    isLoading,
    createStory,
    saveStory,
    getMyStories,
    getAllStoriesAdmin,
    deleteStory,
    updateStory,
    getAnalytics,
    moderateStory,
    healthCheck,
  };
};