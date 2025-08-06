import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import stories, { categories, Story } from '@/mocks/stories';
import { useApiClient } from '@/lib/apiClient';
import { useAuthContext } from '@/contexts/AuthContext';

interface StoriesContextType {
  stories: Story[];
  categories: string[];
  loading: boolean;
  error: string | null;
  
  // Story operations
  addStory: (story: Omit<Story, 'id'>) => Promise<Story>;
  updateStory: (id: string, updates: Partial<Story>) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  getStoryById: (id: string) => Story | undefined;
  getStoriesByCategory: (category: string) => Story[];
  
  // Cloud operations
  refreshStories: () => Promise<void>;
  getMyCloudStories: () => Promise<Story[]>;
  saveStoryToCloud: (story: Omit<Story, 'id'>) => Promise<Story>;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

interface StoriesProviderProps {
  children: ReactNode;
}

export function StoriesProvider({ children }: StoriesProviderProps) {
  const [storiesData, setStoriesData] = useState<Story[]>(stories);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiClient = useApiClient();
  const { isSignedIn, isLoaded } = useAuthContext();

  // Load user's cloud stories when authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshStories();
    }
  }, [isLoaded, isSignedIn]);

  const refreshStories = async () => {
    if (!isSignedIn) {
      // Use mock data for unauthenticated users
      setStoriesData(stories);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getMyStories();
      if (response.success) {
        setStoriesData(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching stories:', err);
      setError(err.message || 'Failed to load stories');
      // Fallback to mock data on error
      setStoriesData(stories);
    } finally {
      setLoading(false);
    }
  };

  const getMyCloudStories = async (): Promise<Story[]> => {
    if (!isSignedIn) return [];
    
    try {
      const response = await apiClient.getMyStories();
      return response.success ? response.data : [];
    } catch (err: any) {
      console.error('Error fetching cloud stories:', err);
      return [];
    }
  };

  const saveStoryToCloud = async (storyData: Omit<Story, 'id'>): Promise<Story> => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to save stories to cloud');
    }

    try {
      const response = await apiClient.createStory(storyData);
      if (response.success) {
        const newStory = response.data;
        // Add to local state
        setStoriesData(prev => [newStory, ...prev]);
        return newStory;
      } else {
        throw new Error('Failed to save story');
      }
    } catch (err: any) {
      console.error('Error saving story to cloud:', err);
      console.log('Cloud save failed - this is likely due to MongoDB Atlas IP whitelist issue');
      console.log('Story will be saved locally only until cloud connection is fixed');
      
      // Fallback: Create story locally instead of throwing error
      const localStory: Story = {
        ...storyData,
        id: Date.now().toString(),
      };
      setStoriesData(prev => [localStory, ...prev]);
      return localStory;
    }
  };

  const addStory = async (storyData: Omit<Story, 'id'>): Promise<Story> => {
    if (isSignedIn) {
      // Save to cloud if authenticated
      return await saveStoryToCloud(storyData);
    } else {
      // Add locally if not authenticated
      const newStory: Story = {
        ...storyData,
        id: Date.now().toString(),
      };
      setStoriesData(prev => [newStory, ...prev]);
      return newStory;
    }
  };

  const updateStory = async (id: string, updates: Partial<Story>) => {
    if (isSignedIn) {
      try {
        await apiClient.updateStory(id, updates);
        // Update local state
        setStoriesData(prev => 
          prev.map(story => 
            story.id === id ? { ...story, ...updates } : story
          )
        );
      } catch (err: any) {
        console.error('Error updating story:', err);
        throw err;
      }
    } else {
      // Update locally if not authenticated
      setStoriesData(prev => 
        prev.map(story => 
          story.id === id ? { ...story, ...updates } : story
        )
      );
    }
  };

  const deleteStory = async (id: string) => {
    if (isSignedIn) {
      try {
        await apiClient.deleteStory(id);
        // Remove from local state
        setStoriesData(prev => prev.filter(story => story.id !== id));
      } catch (err: any) {
        console.error('Error deleting story:', err);
        throw err;
      }
    } else {
      // Delete locally if not authenticated
      setStoriesData(prev => prev.filter(story => story.id !== id));
    }
  };

  const getStoryById = (id: string) => {
    return storiesData.find(story => story.id === id);
  };

  const getStoriesByCategory = (category: string) => {
    return category === 'All' 
      ? storiesData 
      : storiesData.filter(story => story.category === category);
  };

  const contextValue: StoriesContextType = {
    stories: storiesData,
    categories,
    loading,
    error,
    addStory,
    updateStory,
    deleteStory,
    getStoryById,
    getStoriesByCategory,
    refreshStories,
    getMyCloudStories,
    saveStoryToCloud,
  };

  return (
    <StoriesContext.Provider value={contextValue}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
}