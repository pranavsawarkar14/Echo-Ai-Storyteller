import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface NotificationOverlayProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const getNotificationIcon = (type: string, color: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle color={color} size={20} />;
    case 'warning':
    case 'error':
      return <AlertCircle color={color} size={20} />;
    default:
      return <Info color={color} size={20} />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return '#10B981';
    case 'warning':
      return '#F59E0B';
    case 'error':
      return '#EF4444';
    default:
      return '#3B82F6';
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function NotificationOverlay({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationOverlayProps) {
  const { colors, theme } = useTheme();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Blur Background */}
        <BlurView
          intensity={20}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Close background tap */}
        <Pressable style={styles.backgroundPress} onPress={onClose} />
        
        {/* Notification Panel */}
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Bell color={colors.text} size={24} />
              <Text style={[styles.title, { color: colors.text }]}>
                Notifications
              </Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.background }]}
            >
              <X color={colors.text} size={20} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <View style={styles.actions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={onMarkAllAsRead}
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                >
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Mark all read
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClearAll}
                style={[styles.actionButton, { backgroundColor: colors.border }]}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell color={colors.textSecondary} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No notifications
                </Text>
                <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                  You're all caught up! We'll notify you when something new happens.
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    { 
                      backgroundColor: notification.read 
                        ? 'transparent' 
                        : colors.primary + '10',
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(
                      notification.type,
                      getNotificationColor(notification.type)
                    )}
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          { 
                            color: colors.text,
                            fontWeight: notification.read ? '500' : '600'
                          }
                        ]}
                        numberOfLines={1}
                      >
                        {notification.title}
                      </Text>
                      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                        {formatTime(notification.timestamp)}
                      </Text>
                    </View>
                    
                    <Text
                      style={[styles.notificationMessage, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {notification.message}
                    </Text>
                  </View>
                  
                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backgroundPress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
});