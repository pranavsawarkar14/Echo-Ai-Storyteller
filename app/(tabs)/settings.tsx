import React, { useState } from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert, Modal, FlatList, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, User, BookOpen, Bell, Moon, Volume2, Globe, Lock, HelpCircle, BarChart3, Trophy, LogOut, Mic, X, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserStats } from "@/contexts/UserStatsContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAudioPreferences, VOICE_OPTIONS } from "@/contexts/AudioPreferencesContext";
import { useNotificationHelpers } from "@/contexts/NotificationContext";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );
};

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  rightElement,
  onPress 
}) => {
  const { colors, isDark } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.settingsItem, { borderBottomColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.settingsItemIcon}>
        {icon}
      </View>
      <View style={styles.settingsItemContent}>
        <Text style={[styles.settingsItemTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingsItemSubtitle, { color: colors.mutedText }]}>{subtitle}</Text>}
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement || <ChevronRight size={20} color={colors.mutedText} />}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, colors, isDark } = useTheme();
  const { userStats } = useUserStats();
  const { signOut, user } = useAuthContext();
  const audioPrefs = useAudioPreferences();
  const { selectedVoice, setSelectedVoice } = audioPrefs;
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();
  
  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleLibraryPress = () => {
    router.push("/library");
  };

  const handleJourneyPress = () => {
    router.push("/journey");
  };

  const handleVoiceSelect = (voice: any) => {
    setSelectedVoice(voice);
    setShowVoiceModal(false);
  };
  
  const handleDarkModeToggle = (value: boolean) => {
    if (value) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const handleLogout = () => {
    const userEmail = user?.primaryEmailAddress?.emailAddress || "your account";
    
    // Check if we're running on web
    if (Platform.OS === 'web') {
      // On web, directly call performLogout
      if (confirm(`Are you sure you want to sign out from ${userEmail}?`)) {
        performLogout();
      }
    } else {
      // On mobile, use Alert dialog
      Alert.alert(
        "Sign Out",
        `Are you sure you want to sign out from ${userEmail}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: performLogout
          }
        ]
      );
    }
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // Explicitly navigate to sign-in page after successful logout
      if (Platform.OS === 'web') {
        router.push('/sign-in');
      }
      // On mobile, navigation will be handled automatically by the AuthContext
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS === 'web') {
        // Show a browser alert on web
        window.alert('Failed to sign out. Please try again.');
      } else {
        // Show React Native alert on mobile
        Alert.alert(
          'Logout Failed',
          'Failed to sign out. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Account">
          <SettingsItem 
            icon={<User size={22} color={colors.primary} />}
            title="Profile"
            subtitle="Edit your profile information"
            onPress={handleProfilePress}
          />
          <SettingsItem
            icon={<BookOpen size={20} color={colors.primary} />}
            title="My Library"
            subtitle="Saved stories, Favorites, and Reading History"
            rightElement={<ChevronRight size={20} color={colors.mutedText} />}
            onPress={handleLibraryPress}
          />
          <SettingsItem 
            icon={<Bell size={22} color={colors.primary} />}
            title="Notifications"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#3e3e3e", true: colors.primary }}
                thumbColor={colors.text}
              />
            }
          />
          
        </SettingsSection>

        <SettingsSection title="Your Journey">
          <SettingsItem 
            icon={<BarChart3 size={22} color={colors.primary} />}
            title="Stats & Progress"
            subtitle={`${userStats.totalStoriesRead} stories • ${userStats.readingStreak} day streak`}
            onPress={handleJourneyPress}
          />
          <SettingsItem 
            icon={<Trophy size={22} color={colors.primary} />}
            title="Achievements"
            subtitle="View your milestones and rewards"
            onPress={() => console.log("Achievements pressed")}
          />
        </SettingsSection>
        
        <SettingsSection title="Audio & Voice">
          <SettingsItem 
            icon={<Mic size={22} color={colors.primary} />}
            title="Voice Type"
            subtitle={selectedVoice.name}
            onPress={() => setShowVoiceModal(true)}
          />
          <SettingsItem 
            icon={<Volume2 size={22} color={colors.primary} />}
            title="Sound Effects"
            onPress={() => console.log("Sound Effects pressed")}
          />
        </SettingsSection>
        
        <SettingsSection title="Appearance">
          <SettingsItem 
            icon={<Moon size={22} color={colors.primary} />}
            title="Dark Mode"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: "#3e3e3e", true: colors.primary }}
                thumbColor={colors.text}
              />
            }
          />
        </SettingsSection>
        
        <SettingsSection title="Preferences">
          <SettingsItem 
            icon={<Globe size={22} color={colors.primary} />}
            title="Language"
            subtitle="English (US)"
            onPress={() => console.log("Language pressed")}
          />
        </SettingsSection>
        
        <SettingsSection title="Privacy & Security">
          <SettingsItem 
            icon={<Lock size={22} color={colors.primary} />}
            title="Privacy Settings"
            onPress={() => console.log("Privacy Settings pressed")}
          />
        </SettingsSection>
        
        <SettingsSection title="Support">
          <SettingsItem 
            icon={<HelpCircle size={22} color={colors.primary} />}
            title="Help & Support"
            onPress={() => console.log("Help & Support pressed")}
          />
        </SettingsSection>

        {/* Account Information */}
        {user && (
          <View style={[styles.accountInfo, { backgroundColor: colors.card }]}>
            <Text style={[styles.accountLabel, { color: colors.mutedText }]}>Signed in as:</Text>
            <Text style={[styles.accountEmail, { color: colors.text }]}>
              {user.primaryEmailAddress?.emailAddress || "No email"}
            </Text>
            {(user.firstName || user.lastName) && (
              <Text style={[styles.accountName, { color: colors.mutedText }]}>
                {`${user.firstName || ''} ${user.lastName || ''}`.trim()}
              </Text>
            )}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { opacity: isLoggingOut ? 0.7 : 1 }]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']} // Red gradient for logout
            style={styles.logoutGradient}
          >
            <LogOut size={20} color="white" />
            <Text style={styles.logoutText}>
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.mutedText }]}>Echo v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Voice Selection Modal */}
      <Modal
        visible={showVoiceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Voice Type</Text>
            <TouchableOpacity
              onPress={() => setShowVoiceModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={VOICE_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.voiceOption, { borderBottomColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }]}
                onPress={() => handleVoiceSelect(item)}
              >
                <View style={styles.voiceInfo}>
                  <Text style={[styles.voiceName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.voiceDescription, { color: colors.mutedText }]}>{item.description}</Text>
                  <View style={styles.voiceTags}>
                    <View style={[styles.voiceTag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.voiceTagText, { color: colors.primary }]}>{item.gender}</Text>
                    </View>
                    <View style={[styles.voiceTag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.voiceTagText, { color: colors.primary }]}>{item.accent}</Text>
                    </View>
                  </View>
                </View>
                {selectedVoice.id === item.id && (
                  <Check size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            style={styles.voiceList}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingsItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingsItemRight: {
    marginLeft: 8,
  },
  accountInfo: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  accountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 14,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  voiceList: {
    flex: 1,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voiceDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  voiceTags: {
    flexDirection: 'row',
    gap: 8,
  },
  voiceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voiceTagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});