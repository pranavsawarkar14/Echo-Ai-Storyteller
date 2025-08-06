import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story } from '@/mocks/stories';

interface FavoritesContextType {
  favorites: Story[];
  addToFavorites: (story: Story) => void;
  removeFromFavorites: (storyId: string) => void;
  isFavorite: (storyId: string) => boolean;
  toggleFavorite: (story: Story) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@echo_favorites';

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<Story[]>([]);

  // Load favorites from storage on app start
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: Story[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  const addToFavorites = async (story: Story) => {
    const newFavorites = [...favorites, story];
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
  };

  const removeFromFavorites = async (storyId: string) => {
    const newFavorites = favorites.filter(story => story.id !== storyId);
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (storyId: string) => {
    return favorites.some(story => story.id === storyId);
  };

  const toggleFavorite = async (story: Story) => {
    if (isFavorite(story.id)) {
      await removeFromFavorites(story.id);
    } else {
      await addToFavorites(story);
    }
  };

  const contextValue: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}