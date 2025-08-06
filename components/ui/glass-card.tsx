import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Instagram, Twitter, Github, ChevronDown } from "lucide-react-native";
import Colors from "@/constants/colors";

export interface GlassCardProps {
  title?: string;
  description?: string;
  onPress?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  title = "AI Stories",
  description = "Create, share, and enjoy beautiful AI-generated stories.",
  onPress
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.socialButtons}>
              {[Instagram, Twitter, Github].map((Icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialButton}
                  activeOpacity={0.7}
                >
                  <Icon size={16} color={Colors.text} />
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
              <Text style={styles.moreText}>View more</Text>
              <ChevronDown size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.decorativeCircles}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.circle,
                  {
                    width: 80 - index * 15,
                    height: 80 - index * 15,
                    top: 10 + index * 5,
                    right: 10 + index * 5,
                  }
                ]}
              />
            ))}
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  background: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  socialButtons: {
    flexDirection: "row",
    gap: 8,
  },
  socialButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    marginRight: 4,
  },
  decorativeCircles: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default GlassCard;