import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import NotificationIcon from "@/components/NotificationIcon";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSearchPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSearchPress,
}) => {
  const { colors } = useTheme();
  const { showPlayer, isPlaying } = useAudioPlayer();
  const lottieRef = useRef<LottieView>(null);

  // Control animation based on audio player state
  useEffect(() => {
    if (lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Initialize animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (lottieRef.current && !isPlaying) {
        // Show static first frame when not playing
        lottieRef.current.pause();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>{title}</Text>
            <Sparkles size={20} color="white" style={styles.sparkle} />
          </LinearGradient>
        </View>
        {subtitle && <Text style={[styles.subtitle, { color: colors.mutedText }]}>{subtitle}</Text>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.soundButton} 
          onPress={showPlayer}
          testID="sound-button"
          activeOpacity={0.7}
        >
          <View style={styles.lottieContainer}>
            <LottieView
              ref={lottieRef}
              source={{ uri: 'https://lottie.host/6257c486-5bf6-495f-957e-492a02404e0f/jGRqNrECuR.lottie' }}
              loop
              style={styles.soundIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        <View style={[styles.iconButton, { backgroundColor: colors.card }]}>
          <NotificationIcon 
            size={22} 
            color={colors.text}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  sparkle: {
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 8,
    marginLeft: 5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },

  lottieContainer: {
    width: Platform.select({
      web: 42,
      default: 44,
    }),
    height: Platform.select({
      web: 42,
      default: 44,
    }),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  soundIcon: {
    width: '100%',
    height: '100%',
    maxWidth: Platform.select({
      web: 42,
      default: 44,
    }),
    maxHeight: Platform.select({
      web: 42,
      default: 44,
    }),
  },
  soundButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
});