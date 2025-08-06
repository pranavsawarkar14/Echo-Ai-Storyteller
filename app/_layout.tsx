import { BundleInspector } from '../.rorkai/inspector';
import { RorkErrorBoundary } from '../.rorkai/rork-error-boundary';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { VapourTextEffect } from "@/components/ui/vapour-text-effect";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { StoriesProvider } from "@/contexts/StoriesContext";
import { AudioPlayerProvider, useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { AudioPreferencesProvider } from "@/contexts/AudioPreferencesContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { UserStatsProvider } from "@/contexts/UserStatsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { FullScreenAudioPlayer } from "@/components/FullScreenAudioPlayer";
import { MiniPlayer } from "@/components/MiniPlayer";
import NotificationOverlay from "@/components/NotificationOverlay";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function RootLayoutNav() {
  const { colors, isDark } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors?.background || "#000000" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="story/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="ai-story-generator" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="journey" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="favorites" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="library" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="profile" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

function AudioPlayerComponents() {
  const { 
    isPlayerVisible, 
    isMiniPlayerVisible,
    showPlayer, 
    hidePlayer 
  } = useAudioPlayer();

  const handleExpandPlayer = () => {
    showPlayer();
  };

  const handleClosePlayer = () => {
    hidePlayer();
  };

  return (
    <>
      {/* Mini Player */}
      {isMiniPlayerVisible && (
        <MiniPlayer onExpand={handleExpandPlayer} />
      )}
      
      {/* Full Screen Audio Player */}
      <FullScreenAudioPlayer
        visible={isPlayerVisible}
        onClose={handleClosePlayer}
      />
    </>
  );
}

function NotificationComponents() {
  const { 
    notifications,
    isOverlayVisible,
    hideOverlay,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications();

  return (
    <NotificationOverlay
      visible={isOverlayVisible}
      onClose={hideOverlay}
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClearAll={clearAll}
    />
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      setShowOnboarding(hasCompletedOnboarding !== 'true');
      setIsOnboardingChecked(true);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true);
      setIsOnboardingChecked(true);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  // Early return while theme is loading
  if (!colors || !isOnboardingChecked) {
    return null;
  }

  if (showSplash) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <VapourTextEffect 
          texts={["Echo", "Your Personal", "AI Storyteller"]}
          onComplete={handleSplashComplete}
          fontSize={42}
          color={colors.primary}
        />
      </GestureHandlerRootView>
    );
  }

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light-content" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <BundleInspector>
        <RorkErrorBoundary>
          <RootLayoutNav />
          <AudioPlayerComponents />
          <NotificationComponents />
        </RorkErrorBoundary>
      </BundleInspector>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <UserStatsProvider>
                  <FavoritesProvider>
                    <StoriesProvider>
                      <AudioPreferencesProvider>
                        <AudioPlayerProvider>
                          <AppContent />
                        </AudioPlayerProvider>
                      </AudioPreferencesProvider>
                    </StoriesProvider>
                  </FavoritesProvider>
                </UserStatsProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}