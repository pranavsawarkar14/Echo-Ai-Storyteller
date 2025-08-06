import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/colors';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof Colors;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@echo_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('system');
  
  // Determine if we should use dark mode
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  
  // Create dynamic colors object based on theme
  const colors = {
    ...Colors,
    background: isDark ? Colors.dark.background : Colors.background,
    card: isDark ? Colors.dark.card : Colors.card,
    text: isDark ? Colors.dark.text : Colors.text,
    mutedText: isDark ? Colors.dark.mutedText : Colors.mutedText,
    border: isDark ? Colors.dark.border : Colors.border,
    tabIconDefault: isDark ? Colors.dark.tabIconDefault : Colors.tabIconDefault,
    tabIconSelected: isDark ? Colors.dark.tabIconSelected : Colors.tabIconSelected,
    surfaceLight: isDark ? Colors.dark.background : Colors.surfaceLight,
    primaryLight: isDark ? Colors.primary + "40" : Colors.primaryLight,
  };

  // Load saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setTheme(savedTheme as Theme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  // Save theme when it changes
  const handleSetTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
      setTheme(newTheme); // Still update the state even if saving fails
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    colors,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}