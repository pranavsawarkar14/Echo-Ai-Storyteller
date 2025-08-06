import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Home, Film, Users, Sparkles, Settings, Search } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useAuthContext } from "@/contexts/AuthContext";
import ModernTabBar from "@/components/ModernTabBar";
import { MiniPlayer } from "@/components/MiniPlayer";
import NotificationTestButton from "@/components/NotificationTestButton";

export default function TabLayout() {
  const { colors } = useTheme();
  const { isMiniPlayerVisible, showPlayer } = useAudioPlayer();
  const { isLoaded, isSignedIn } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to sign-in if not authenticated
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  // Show nothing while loading or if not signed in
  if (!isLoaded || !isSignedIn) {
    return null;
  }
  
  const handleExpandPlayer = () => {
    showPlayer();
  };
  
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
        tabBar={(props) => (
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2000 }}>
            <ModernTabBar 
              {...props}
            />
          </View>
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="episodes"
          options={{
            title: "Episodes",
            tabBarIcon: ({ color, size }) => <Film color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="people"
          options={{
            title: "People",
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="ai-generator"
          options={{
            title: "Create",
            tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="../story-search-demo"
          options={{
            title: "Search Demo",
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          }}
        />
      </Tabs>
      
      {/* Mini Player - positioned above tab bar */}
      {isMiniPlayerVisible && (
        <MiniPlayer onExpand={handleExpandPlayer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});