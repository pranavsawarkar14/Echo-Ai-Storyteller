import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useApiClient } from '@/lib/apiClient';
import { 
  Crown,
  Users,
  BookOpen,
  TrendingUp,
  Shield,
  Eye,
  Ban,
  Check,
  X,
  AlertTriangle,
  BarChart3,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface AdminDashboardProps {
  visible: boolean;
  onClose: () => void;
}

interface StoryData {
  _id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  author: string;
  createdAt: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  playCount: number;
}

interface AnalyticsData {
  overview: {
    totalStories: number;
    publicStories: number;
    pendingModeration: number;
    privateStories: number;
  };
  categories: Array<{ _id: string; count: number }>;
  topAuthors: Array<{ _id: string; count: number }>;
  recentActivity: StoryData[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { isAdmin } = useAuthContext();
  const apiClient = useApiClient();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'moderation'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [allStories, setAllStories] = useState<StoryData[]>([]);
  const [pendingStories, setPendingStories] = useState<StoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryData | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  useEffect(() => {
    if (visible && isAdmin) {
      loadDashboardData();
    }
  }, [visible, isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, storiesResponse, pendingResponse] = await Promise.all([
        apiClient.getAnalytics(),
        apiClient.getAllStoriesAdmin({ limit: 50 }),
        apiClient.getAllStoriesAdmin({ moderationStatus: 'pending', limit: 20 })
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }

      if (storiesResponse.success) {
        setAllStories(storiesResponse.data);
      }

      if (pendingResponse.success) {
        setPendingStories(pendingResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleModerateStory = async (storyId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await apiClient.moderateStory(storyId, action, reason);
      
      // Update local state
      setPendingStories(prev => prev.filter(story => story._id !== storyId));
      setAllStories(prev => 
        prev.map(story => 
          story._id === storyId 
            ? { ...story, moderationStatus: action === 'approve' ? 'approved' : 'rejected' }
            : story
        )
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Story ${action}d successfully`);
      
      // Refresh analytics
      loadDashboardData();
    } catch (error) {
      console.error('Error moderating story:', error);
      Alert.alert('Error', `Failed to ${action} story`);
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Analytics Cards */}
      <View style={styles.analyticsGrid}>
        <View style={[styles.analyticsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.analyticsIcon, { backgroundColor: colors.primary + '20' }]}>
            <BookOpen size={24} color={colors.primary} />
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text }]}>
            {analytics?.overview.totalStories || 0}
          </Text>
          <Text style={[styles.analyticsLabel, { color: colors.mutedText }]}>
            Total Stories
          </Text>
        </View>

        <View style={[styles.analyticsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.analyticsIcon, { backgroundColor: '#10B981' + '20' }]}>
            <Check size={24} color="#10B981" />
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text }]}>
            {analytics?.overview.publicStories || 0}
          </Text>
          <Text style={[styles.analyticsLabel, { color: colors.mutedText }]}>
            Public Stories
          </Text>
        </View>

        <View style={[styles.analyticsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.analyticsIcon, { backgroundColor: '#F59E0B' + '20' }]}>
            <Shield size={24} color="#F59E0B" />
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text }]}>
            {analytics?.overview.pendingModeration || 0}
          </Text>
          <Text style={[styles.analyticsLabel, { color: colors.mutedText }]}>
            Pending Review
          </Text>
        </View>

        <View style={[styles.analyticsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.analyticsIcon, { backgroundColor: '#EF4444' + '20' }]}>
            <Users size={24} color="#EF4444" />
          </View>
          <Text style={[styles.analyticsValue, { color: colors.text }]}>
            {analytics?.topAuthors.length || 0}
          </Text>
          <Text style={[styles.analyticsLabel, { color: colors.mutedText }]}>
            Active Authors
          </Text>
        </View>
      </View>

      {/* Top Categories */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Categories</Text>
        {analytics?.categories.map((category, index) => (
          <View key={category._id} style={styles.categoryItem}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {category._id}
            </Text>
            <Text style={[styles.categoryCount, { color: colors.mutedText }]}>
              {category.count} stories
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderStoriesTab = () => (
    <ScrollView style={styles.tabContent}>
      <FlatList
        data={allStories}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.storyItem, { backgroundColor: colors.card }]}
            onPress={() => {
              setSelectedStory(item);
              setShowStoryModal(true);
            }}
          >
            <View style={styles.storyHeader}>
              <Text style={[styles.storyTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.moderationStatus) + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(item.moderationStatus) }
                ]}>
                  {item.moderationStatus}
                </Text>
              </View>
            </View>
            <Text style={[styles.storyAuthor, { color: colors.mutedText }]}>
              by {item.author} • {item.category}
            </Text>
            <Text style={[styles.storyStats, { color: colors.mutedText }]}>
              {item.playCount} plays • {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  );

  const renderModerationTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.moderationHeader, { backgroundColor: colors.card }]}>
        <AlertTriangle size={20} color="#F59E0B" />
        <Text style={[styles.moderationTitle, { color: colors.text }]}>
          Pending Moderation ({pendingStories.length})
        </Text>
      </View>

      {pendingStories.map((story) => (
        <View key={story._id} style={[styles.moderationItem, { backgroundColor: colors.card }]}>
          <Text style={[styles.storyTitle, { color: colors.text }]}>
            {story.title}
          </Text>
          <Text style={[styles.storyAuthor, { color: colors.mutedText }]}>
            by {story.author} • {story.category}
          </Text>
          <Text style={[styles.storyPreview, { color: colors.mutedText }]} numberOfLines={2}>
            {story.content.substring(0, 100)}...
          </Text>
          
          <View style={styles.moderationActions}>
            <TouchableOpacity
              style={[styles.moderationButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleModerateStory(story._id, 'approve')}
            >
              <Check size={16} color="white" />
              <Text style={styles.moderationButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.moderationButton, { backgroundColor: '#EF4444' }]}
              onPress={() => {
                Alert.prompt(
                  'Reject Story',
                  'Please provide a reason for rejection:',
                  (reason) => {
                    if (reason) {
                      handleModerateStory(story._id, 'reject', reason);
                    }
                  }
                );
              }}
            >
              <X size={16} color="white" />
              <Text style={styles.moderationButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return colors.mutedText;
    }
  };

  if (!visible || !isAdmin) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Crown size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'stories', label: 'Stories', icon: BookOpen },
          { key: 'moderation', label: 'Moderation', icon: Shield },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <tab.icon 
              size={18} 
              color={activeTab === tab.key ? colors.primary : colors.mutedText} 
            />
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.key ? colors.primary : colors.mutedText }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: colors.primary }]}
        onPress={loadDashboardData}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <RefreshCw size={16} color="white" />
        )}
      </TouchableOpacity>

      {/* Tab Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Loading dashboard data...
          </Text>
        </View>
      ) : (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'stories' && renderStoriesTab()}
          {activeTab === 'moderation' && renderModerationTab()}
        </>
      )}

      {/* Story Detail Modal */}
      <Modal
        visible={showStoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Story Details
            </Text>
            <TouchableOpacity onPress={() => setShowStoryModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {selectedStory && (
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.storyTitle, { color: colors.text }]}>
                {selectedStory.title}
              </Text>
              <Text style={[styles.storyMeta, { color: colors.mutedText }]}>
                by {selectedStory.author} • {selectedStory.category} • {new Date(selectedStory.createdAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.storyContent, { color: colors.text }]}>
                {selectedStory.content}
              </Text>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    top: 120,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  analyticsCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    textAlign: 'center',
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
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 14,
  },
  storyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  storyAuthor: {
    fontSize: 14,
    marginBottom: 4,
  },
  storyStats: {
    fontSize: 12,
  },
  moderationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  moderationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  moderationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  storyPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  moderationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  moderationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  moderationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  storyMeta: {
    fontSize: 14,
    marginBottom: 16,
  },
  storyContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});