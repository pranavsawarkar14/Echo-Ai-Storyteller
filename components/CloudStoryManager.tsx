import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStories } from '@/contexts/StoriesContext';
import { useApiClient } from '@/lib/apiClient';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Cloud, 
  CloudOff, 
  Sync, 
  Download, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface CloudStoryManagerProps {
  visible: boolean;
  onClose: () => void;
}

export const CloudStoryManager: React.FC<CloudStoryManagerProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { isSignedIn, userId } = useAuthContext();
  const { stories, refreshStories, getMyCloudStories } = useStories();
  const apiClient = useApiClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [cloudStories, setCloudStories] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (visible && isSignedIn) {
      loadCloudStories();
    }
  }, [visible, isSignedIn]);

  const loadCloudStories = async () => {
    setIsLoading(true);
    try {
      const cloudData = await getMyCloudStories();
      setCloudStories(cloudData);
      setIsOnline(true);
    } catch (error) {
      console.error('Error loading cloud stories:', error);
      setIsOnline(false);
      Alert.alert('Connection Error', 'Failed to connect to cloud storage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!isSignedIn) {
      Alert.alert('Authentication Required', 'Please sign in to sync your stories.');
      return;
    }

    setSyncStatus('syncing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await refreshStories();
      await loadCloudStories();
      setSyncStatus('success');
      setLastSyncTime(new Date());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sync Failed', 'Unable to sync your stories. Please try again.');
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleHealthCheck = async () => {
    try {
      await apiClient.healthCheck();
      setIsOnline(true);
      Alert.alert('Connection Status', 'Successfully connected to cloud storage!');
    } catch (error) {
      setIsOnline(false);
      Alert.alert('Connection Status', 'Unable to connect to cloud storage.');
    }
  };

  const formatSyncTime = (date: Date) => {
    return date.toLocaleString();
  };

  const getSyncStatusInfo = () => {
    switch (syncStatus) {
      case 'syncing':
        return { text: 'Syncing...', color: colors.primary, icon: <Sync size={16} color={colors.primary} /> };
      case 'success':
        return { text: 'Synced', color: '#10B981', icon: <Check size={16} color="#10B981" /> };
      case 'error':
        return { text: 'Sync Failed', color: '#EF4444', icon: <X size={16} color="#EF4444" /> };
      default:
        return { text: 'Sync', color: colors.text, icon: <Sync size={16} color={colors.text} /> };
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Cloud Storage</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCloudStories} />
        }
      >
        {/* Connection Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIcon}>
              {isOnline ? (
                <Wifi size={20} color="#10B981" />
              ) : (
                <WifiOff size={20} color="#EF4444" />
              )}
            </View>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              {isOnline ? 'Connected' : 'Offline'}
            </Text>
            <TouchableOpacity
              style={styles.testConnectionButton}
              onPress={handleHealthCheck}
            >
              <Text style={[styles.testConnectionText, { color: colors.primary }]}>
                Test
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.statusSubtitle, { color: colors.mutedText }]}>
            {isOnline 
              ? 'Your stories are being synchronized with the cloud'
              : 'Check your internet connection'
            }
          </Text>
        </View>

        {/* Sync Controls */}
        <View style={[styles.syncCard, { backgroundColor: colors.card }]}>
          <View style={styles.syncHeader}>
            <View style={styles.syncInfo}>
              <Text style={[styles.syncTitle, { color: colors.text }]}>Synchronization</Text>
              {lastSyncTime && (
                <Text style={[styles.lastSyncText, { color: colors.mutedText }]}>
                  Last sync: {formatSyncTime(lastSyncTime)}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: colors.primary }]}
            onPress={handleSync}
            disabled={syncStatus === 'syncing' || !isOnline}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || colors.primary]}
              style={styles.syncButtonGradient}
            >
              {syncStatus === 'syncing' ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                getSyncStatusInfo().icon
              )}
              <Text style={styles.syncButtonText}>
                {getSyncStatusInfo().text}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Storage Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                <Cloud size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {cloudStories.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                Cloud Stories
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#10B981' + '20' }]}>
                <Download size={20} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stories.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                Local Stories
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                <Upload size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {userId ? '1' : '0'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>
                Active User
              </Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={[styles.helpCard, { backgroundColor: colors.card }]}>
          <View style={styles.helpHeader}>
            <AlertCircle size={20} color={colors.primary} />
            <Text style={[styles.helpTitle, { color: colors.text }]}>
              How Cloud Sync Works
            </Text>
          </View>
          
          <Text style={[styles.helpText, { color: colors.mutedText }]}>
            • Stories are automatically saved to the cloud when you're signed in{'\n'}
            • Access your stories from any device with your account{'\n'}
            • Offline stories will sync when you reconnect{'\n'}
            • All data is encrypted and secure
          </Text>
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
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  testConnectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testConnectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  syncCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  syncHeader: {
    marginBottom: 16,
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastSyncText: {
    fontSize: 12,
  },
  syncButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  syncButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  helpCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});