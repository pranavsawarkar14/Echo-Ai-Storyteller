import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/contexts/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuthContext();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (!isLoaded) return;

    // Small delay to prevent flickering
    const timer = setTimeout(() => {
      if (isSignedIn) {
        // User is signed in, redirect to main app
        router.replace('/(tabs)');
      } else {
        // User is not signed in, redirect to sign in
        router.replace('/sign-in');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, router]);

  // Show loading screen while checking auth status
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors?.background || '#000000'
    }}>
      <ActivityIndicator size="large" color={colors?.primary || '#6366F1'} />
      <Text style={{
        marginTop: 16,
        fontSize: 16,
        color: colors?.text || '#FFFFFF',
        opacity: 0.7
      }}>
        Loading...
      </Text>
    </View>
  );
}