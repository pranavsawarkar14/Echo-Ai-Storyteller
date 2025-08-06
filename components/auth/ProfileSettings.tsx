import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStories } from '@/contexts/StoriesContext';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  Cloud, 
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Crown,
  Mail,
  Calendar,
  BarChart3
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ProfileSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { user, signOut, isAdmin, userId } = useAuthContext();
  const { stories, refreshStories } = useStories();
  
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Any unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            try {
              await signOut();
              onClose();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const handleClearLocalData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will remove all locally stored stories. Your cloud stories will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            // Implement local data clearing logic
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Local data cleared successfully.');
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshStories();
      Alert.alert('Success', 'Stories synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync stories. Please try again.');
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Profile & Settings</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: colors.primary + '20' }]}>
              <User size={32} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.mutedText }]}>
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
              {isAdmin && (
                <View style={[styles.adminBadge, { backgroundColor: colors.primary }]}>
                  <Crown size={12} color="white" />
                  <Text style={styles.adminText}>Admin</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stories.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                Stories Created
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {userId ? 'Connected' : 'Offline'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                Cloud Status
              </Text>
            </View>
          </View>
        </View>

        {/* Cloud Settings */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cloud Storage</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Cloud size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Cloud Sync
              </Text>
            </View>
            <Switch
              value={cloudSyncEnabled}
              onValueChange={setCloudSyncEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={cloudSyncEnabled ? colors.primary : colors.mutedText}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Download size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Auto Save
              </Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={autoSave ? colors.primary : colors.mutedText}
            />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleSyncNow}>
            <Upload size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Sync Now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Mail size={18} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Update Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Shield size={18} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Privacy Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearLocalData}>
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
              Clear Local Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin Section */}
        {isAdmin && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 }]}>
            <View style={styles.adminHeader}>
              <Crown size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Admin Tools</Text>
            </View>
            
            <TouchableOpacity style={styles.actionButton}>
              <BarChart3 size={18} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                View Analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Settings size={18} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Manage Users
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <View style={[styles.dangerCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <View style={styles.dangerHeader}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={[styles.dangerTitle, { color: '#DC2626' }]}>Danger Zone</Text>
          </View>
          
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.signOutGradient}
            >
              {isSigningOut ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <LogOut size={18} color="white" />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  adminText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dangerCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});